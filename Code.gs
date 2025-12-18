
/**
 * ระบบหลังบ้านกีฬาสีโรงเรียนเทศบาล ๑ วัดพรหมวิหาร ๒๕๖๘ (Senior Pro Version)
 * -----------------------------------------------------------------------
 * วัตถุประสงค์: จัดการฐานข้อมูลการแข่งขันกีฬาและกรีฑาแบบ Real-time
 * ฟีเจอร์: 
 * - รองรับการอัปเดตแบบจุดเดียว และแบบกลุ่ม (Batch Update)
 * - ระบบป้องกันข้อมูลซ้ำด้วย LockService
 * - รองรับคำสั่ง Reset ข้อมูลจากหน้าเว็บ
 */

const SPREADSHEET_ID = '10q_mRMZxybLkDcVcnFygLHh3BZIkR9mQtQ7RLUOC1jo';
const SHEET_NAME = 'Matches';
const HEADERS = ['id', 'sportId', 'round', 'teamAId', 'teamBId', 'scoreA', 'scoreB', 'status', 'winnerId', 'updatedAt'];

/**
 * อ่านข้อมูลทั้งหมด (GET)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return createJSONOutput({ status: 'success', data: [] });

    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        if (val === 'undefined' || val === '') val = undefined;
        obj[h] = val;
      });
      return obj;
    });

    return createJSONOutput({ status: 'success', data: result });
  } catch (err) {
    return createJSONOutput({ status: 'error', message: err.toString() });
  }
}

/**
 * บันทึกข้อมูล (POST)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // รอคิวสูงสุด 30 วินาที
    if (!lock.tryLock(30000)) {
      return createJSONOutput({ status: 'error', message: 'Server is busy. Please try again.' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss);
    const contents = JSON.parse(e.postData.contents);
    const items = Array.isArray(contents) ? contents : [contents];
    
    // ดึงข้อมูลเดิมมาทำ Mapping เพื่อความรวดเร็ว
    const fullData = sheet.getDataRange().getValues();
    const idToRowMap = {};
    for (let i = 1; i < fullData.length; i++) {
      const id = fullData[i][0]; // คอลัมน์ id อยู่ที่ 0
      if (id) idToRowMap[id] = i + 1;
    }

    const now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    // กรณีพิเศษ: ถ้าเป็นการ Reset (ส่งมาเยอะและข้อมูลว่าง) ให้พิจารณาล้าง Sheet เพื่อความสะอาด
    const isResetOperation = items.length > 50; 
    if (isResetOperation) {
      sheet.clear();
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      // เมื่อล้างแล้วต้อง Reset map ด้วย
      Object.keys(idToRowMap).forEach(key => delete idToRowMap[key]);
    }

    items.forEach(item => {
      const rowNum = idToRowMap[item.id];
      const rowData = HEADERS.map(h => {
        if (h === 'updatedAt') return now;
        let val = item[h];
        return (val === undefined || val === null || val === 'undefined') ? '' : val;
      });

      if (rowNum && !isResetOperation) {
        sheet.getRange(rowNum, 1, 1, HEADERS.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    });

    return createJSONOutput({ status: 'success', count: items.length });

  } catch (err) {
    console.error(err);
    return createJSONOutput({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ช่วยจัดการเรื่องการหาหรือสร้าง Sheet
 */
function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Helper: สร้าง JSON Output
 */
function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
