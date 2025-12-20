
/**
 * ระบบหลังบ้านกีฬาสีโรงเรียนเทศบาล ๑ วัดพรหมวิหาร ๒๕๖๘ (Official Production Version)
 * -----------------------------------------------------------------------
 */

const SPREADSHEET_ID = '10q_mRMZxybLkDcVcnFygLHh3BZIkR9mQtQ7RLUOC1jo';
const SHEET_NAME = 'Matches';
const HEADERS = ['id', 'sportId', 'round', 'teamAId', 'teamBId', 'scoreA', 'scoreB', 'status', 'winnerId', 'updatedAt'];

/**
 * อ่านข้อมูล (GET)
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
        if (val === 'undefined' || val === '' || val === null) val = undefined;
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
    if (!lock.tryLock(30000)) {
      return createJSONOutput({ status: 'error', message: 'Server busy' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss);
    const contents = JSON.parse(e.postData.contents);
    const items = Array.isArray(contents) ? contents : [contents];
    
    const fullData = sheet.getDataRange().getValues();
    const idToRowMap = {};
    for (let i = 1; i < fullData.length; i++) {
      const id = fullData[i][0];
      if (id) idToRowMap[id] = i + 1;
    }

    const now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    items.forEach(item => {
      const rowNum = idToRowMap[item.id];
      const rowData = HEADERS.map(h => {
        if (h === 'updatedAt') return now;
        let val = item[h];
        return (val === undefined || val === null || val === 'undefined') ? '' : val;
      });

      if (rowNum) {
        sheet.getRange(rowNum, 1, 1, HEADERS.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    });

    return createJSONOutput({ status: 'success', count: items.length });
  } catch (err) {
    return createJSONOutput({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
