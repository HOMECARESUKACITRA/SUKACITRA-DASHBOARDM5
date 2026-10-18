/**
 * Web App penyedia data untuk dashboard SPG M5.
 * Pasang di Google Sheet: Extensions > Apps Script.
 * Pemakaian: <URL_EXEC>?sheet=FEED_DASH   atau   <URL_EXEC>?sheet=FOTO_SPG   atau   ?sheet=INS_DASH
 *
 * FEED_DASH : baris 1 = header. Yang dikirim ke dashboard hanya kolom yang dipakai
 *             (WEEK_NO, SPG, TOKO, SKU, TARGET_WEEK_RP, AKTUAL_RP, FOTO_SPG),
 *             dan baris yang target & aktualnya sama-sama 0 dibuang (supaya data jauh lebih kecil dan cepat).
 * FOTO_SPG  : tab FOTO_SPG (kalau ada) atau tab FOTO, header SPG | FOTO.
 * INS_DASH  : dikirim apa adanya (semua baris yang tidak kosong).
 */
const ALLOWED = ['FEED_DASH', 'FOTO_SPG', 'INS_DASH'];   // hanya tab ini yang boleh dibaca
const FEED_KEEP = ['WEEK_NO', 'SPG', 'TOKO', 'SKU', 'TARGET_WEEK_RP', 'AKTUAL_RP'];

function doGet(e) {
  const name = (e && e.parameter && e.parameter.sheet) || 'FEED_DASH';
  if (ALLOWED.indexOf(name) < 0) return out_({ error: 'sheet tidak diizinkan' });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh && name === 'FOTO_SPG') sh = ss.getSheetByName('FOTO');   // di spreadsheet baru tabnya bernama FOTO
  if (!sh) return out_({ error: 'sheet tidak ditemukan: ' + name });

  const v = sh.getDataRange().getValues();
  const head = v.shift().map(function (h) { return String(h).trim(); });
  const idx = {};
  head.forEach(function (h, i) { idx[h] = i; });
  const cell = function (x) {
    return x instanceof Date ? Utilities.formatDate(x, 'Asia/Jakarta', 'yyyy-MM-dd') : x;
  };

  let rows;
  if (name === 'FEED_DASH') {
    const iT = idx['TARGET_WEEK_RP'], iA = idx['AKTUAL_RP'], iF = idx['FOTO_SPG'];
    rows = [];
    for (let k = 0; k < v.length; k++) {
      const r = v[k];
      const t = Number(r[iT]) || 0, a = Number(r[iA]) || 0;
      if (!t && !a) continue;                       // baris kosong dibuang
      const o = {};
      FEED_KEEP.forEach(function (h) { if (idx[h] != null) o[h] = cell(r[idx[h]]); });
      o.TARGET_WEEK_RP = Math.round(t);
      o.AKTUAL_RP = Math.round(a);
      if (iF != null && r[iF]) o.FOTO_SPG = r[iF];
      rows.push(o);
    }
  } else {
    rows = v
      .filter(function (r) { return r.some(function (c) { return c !== ''; }); })
      .map(function (r) {
        const o = {};
        head.forEach(function (h, i) { o[h] = cell(r[i]); });
        return o;
      });
  }
  return out_({ rows: rows, updated: new Date().toISOString() });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
