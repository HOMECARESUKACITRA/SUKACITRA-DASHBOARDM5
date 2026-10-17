/**
 * Web App penyedia data untuk dashboard SPG M5.
 * Pasang di Google Sheet: Extensions > Apps Script.
 * Pemakaian: <URL_EXEC>?sheet=FEED_DASH   atau   <URL_EXEC>?sheet=FOTO_SPG
 *
 * FEED_DASH : baris 1 = header (WEEK_KE/WEEK_NO, WEEK_KALENDER, SPG, TOKO, SKU, TARGET_WEEK_RP, AKTUAL_RP, FOTO_SPG, ...)
 * FOTO_SPG  : (opsional) tab kecil dengan header SPG | FOTO  -> isi link foto Google Drive
 */
const ALLOWED = ['FEED_DASH', 'FOTO_SPG', 'INS_DASH'];   // hanya tab ini yang boleh dibaca

function doGet(e) {
  const name = (e && e.parameter && e.parameter.sheet) || 'FEED_DASH';
  if (ALLOWED.indexOf(name) < 0) return out_({ error: 'sheet tidak diizinkan' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) return out_({ error: 'sheet tidak ditemukan: ' + name });
  const v = sh.getDataRange().getValues();
  const head = v.shift().map(function (h) { return String(h).trim(); });
  const rows = v
    .filter(function (r) { return r.some(function (c) { return c !== ''; }); })
    .map(function (r) {
      const o = {};
      head.forEach(function (h, i) { o[h] = r[i] instanceof Date ? Utilities.formatDate(r[i], 'Asia/Jakarta', 'yyyy-MM-dd') : r[i]; });
      return o;
    });
  return out_({ rows: rows, updated: new Date().toISOString() });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
