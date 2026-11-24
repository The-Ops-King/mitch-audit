// Google Apps Script: lets the EOC code step add rows to the two Google Sheets.
// Setup (once): go to script.google.com > New project, paste this, change SECRET,
// then Deploy > New deployment > type "Web app" > Execute as: Me > Who has access: Anyone > Deploy.
// Copy the Web app URL into SHEETS_URL in the EOC code, and the SECRET into SHEETS_SECRET.
// The Google account that deploys it must be able to edit both sheets.

const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_TEXT';
const SHEETS = {
  eoc: { id: '1EcZSAea0qqa6cEqBKXSohCpCx_DwA8SAbbxOLqESoyA', tab: 1460116217 },  // EOC log
  cash: { id: '1mejS31FABDQN7yCzw61pZA_eqGn6plZvCikbkBp3pUI', tab: 524530582 },   // cash sheet
};

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.secret !== SECRET) return reply({ ok: false, error: 'wrong secret' });
    const target = SHEETS[b.sheet];
    if (!target) return reply({ ok: false, error: 'unknown sheet "' + b.sheet + '"' });
    const props = PropertiesService.getScriptProperties();
    if (b.key && props.getProperty(b.key)) return reply({ ok: true, skipped: true }); // already added on an earlier run
    const tab = SpreadsheetApp.openById(target.id).getSheets().filter(function (s) { return s.getSheetId() === target.tab; })[0];
    if (!tab) return reply({ ok: false, error: 'tab ' + target.tab + ' not found in sheet ' + target.id });
    tab.appendRow(b.row);
    if (b.key) props.setProperty(b.key, new Date().toISOString());
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
