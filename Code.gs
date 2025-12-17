/**
 * ระบบหลังบ้านกีฬาสีโรงเรียนเทศบาล ๑ วัดพรหมวิหาร ๒๕๖๘
 * -----------------------------------------------------------
 * วิธีการติดตั้ง:
 * 1. ไปที่ https://script.google.com/
 * 2. สร้างโครงการใหม่
 * 3. นำโค้ดนี้ไปวางทับในไฟล์ Code.gs ทั้งหมด
 * 4. เปลี่ยน SPREADSHEET_ID ด้านล่างให้เป็น ID ของ Google Sheet ของคุณ
 * 5. กด Save (รูปแผ่นดิสก์)
 * 6. กด Deploy > New deployment
 * 7. เลือกประเภทเป็น "Web app"
 * 8. Execute as: "Me" (ตัวคุณเอง)
 * 9. Who has access: "Anyone" (ทุกคน)
 * 10. กด Deploy และคัดลอก "Web app URL" ไปใส่ใน tournamentService.ts
 */

const SPREADSHEET_ID = '10q_mRMZxybLkDcVcnFygLHh3BZIkR9mQtQ7RLUOC1jo'; 
const SHEET_NAME = 'Matches';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Lock ระบบเพื่อป้องกันข้อมูลเขียนทับกันในเสี้ยววินาทีเดียวกัน
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
     return createJSONOutput({ status: 'error', message: 'เซิร์ฟเวอร์ไม่ว่าง กรุณาลองใหม่ในภายหลัง' });
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // โครงสร้างหัวตารางที่แอปพลิเคชันต้องการ
    const HEADERS = ['id', 'sportId', 'round', 'teamAId', 'teamBId', 'scoreA', 'scoreB', 'status', 'winnerId', 'updatedAt'];

    // สร้าง Sheet และหัวตารางหากยังไม่มี
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
    }
    if (sheet.getLastRow() === 0) {
       sheet.appendRow(HEADERS);
    }

    // --- GET Request: อ่านข้อมูลทั้งหมด ---
    if (!e.postData) {
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createJSONOutput({ status: 'success', data: [] });
      }

      const sheetHeaders = data[0];
      const rows = data.slice(1);
      
      const result = rows.map(row => {
        let obj = {};
        sheetHeaders.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });

      return createJSONOutput({ status: 'success', data: result });
    }

    // --- POST Request: บันทึกหรืออัปเดตข้อมูล (Upsert) ---
    const payload = JSON.parse(e.postData.contents);
    const itemsToUpdate = Array.isArray(payload) ? payload : [payload];
    
    const data = sheet.getDataRange().getValues();
    const sheetHeaders = data[0];
    
    // สร้าง Mapping สำหรับอ้างอิงคอลัมน์จากหัวตาราง
    const colMap = {};
    sheetHeaders.forEach((h, i) => colMap[h] = i);
    
    if (colMap['id'] === undefined) {
      throw new Error("ไม่พบคอลัมน์ 'id' ในตาราง");
    }

    // สร้าง Mapping สำหรับหาแถวที่ต้องการอัปเดตตาม ID
    const idToRowMap = {};
    for (let i = 1; i < data.length; i++) {
      const id = data[i][colMap['id']];
      if (id) idToRowMap[id] = i + 1;
    }

    itemsToUpdate.forEach(item => {
      const rowNum = idToRowMap[item.id];
      const existingRow = rowNum ? data[rowNum - 1] : null;

      // จัดเตรียมข้อมูลแถวใหม่ (Partial Update)
      const newRowData = sheetHeaders.map((h, i) => {
          if (h === 'updatedAt') return new Date().toLocaleString('th-TH');
          
          const newVal = item[h];
          if (newVal !== undefined) {
            return newVal === 'undefined' ? '' : newVal;
          } else if (existingRow) {
            return existingRow[i];
          } else {
            return '';
          }
      });

      if (rowNum) {
        // อัปเดตแถวเดิม
        sheet.getRange(rowNum, 1, 1, newRowData.length).setValues([newRowData]);
      } else {
        // เพิ่มแถวใหม่
        sheet.appendRow(newRowData);
      }
    });

    return createJSONOutput({ status: 'success', updatedCount: itemsToUpdate.length });

  } catch (err) {
    return createJSONOutput({ status: 'error', message: err.toString() });
  } finally {
    // ปลดล็อกระบบ
    lock.releaseLock();
  }
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}