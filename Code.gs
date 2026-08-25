const SPREADSHEET_ID = '1-ghFaPLJCAAgs9mcKXnBxXz9ycf8z5Ja-fVeGU4SNao';
const DB_SHEET = 'DB_KLINIK_PILIHAN';
const MASTER_SHEET = 'MT SISWA MAPEL';

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'ping').toLowerCase();
    if (action === 'master') return json_({ ok: true, rows: readSheet_(MASTER_SHEET) });
    if (action === 'db') return json_({ ok: true, rows: readSheet_(DB_SHEET) });
    return json_({ ok: true, service: 'Klinik Mapel Pilihan API' });
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const date = String(payload.date || '').trim();
    const kelas = String(payload.kelas || '').trim();
    const mt = String(payload.mt || '').trim();
    const mapel = String(payload.mapel || '').trim();
    const students = Array.isArray(payload.students) ? payload.students : [];

    if (!date || !kelas || !mt || !mapel || !students.length) {
      throw new Error('Data sesi belum lengkap.');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(DB_SHEET);
    if (!sheet) throw new Error('Sheet DB_KLINIK_PILIHAN tidak ditemukan.');

    const rows = students.map(s => {
      const siswa = String(s.siswa || '').trim();
      const kuis = normalizeScore_(s.kuis);
      const post = normalizeScore_(s.post);
      if (!siswa) throw new Error('Ada nama siswa yang kosong.');
      return [nextId_(sheet), date, kelas, siswa, mapel, mt, kuis, post];
    });

    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
    return json_({ ok: true, count: rows.length });
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

function readSheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet ' + name + ' tidak ditemukan.');
  const values = sheet.getDataRange().getDisplayValues();
  return values;
}

function normalizeScore_(value) {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error('Nilai harus berupa angka 0–100.');
  }
  return n;
}

function nextId_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'KP0001';
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  let max = 0;
  values.forEach(v => {
    const m = String(v).match(/^KP(\d+)$/i);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'KP' + String(max + 1).padStart(4, '0');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
