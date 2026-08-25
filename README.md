# Dashboard Klinik Mapel Pilihan

Dashboard terpisah untuk input dan monitoring Klinik Mapel Pilihan BAC Padang - Tarandam 2026/2027.

## Data source
Google Spreadsheet ID yang digunakan di `app.js`:
`1-ghFaPLJCAAgs9mcKXnBxXz9ycf8z5Ja-fVeGU4SNao`

Sheet yang dibaca:
- `MT SISWA MAPEL`
- `DB_KLINIK_PILIHAN`

## Struktur master
`MT SISWA MAPEL`:
- Kolom A: MT
- Kolom B: Mapel
- Kolom C: Siswa Kelas 11
- Kolom D: Siswa Kelas 12

## Input data
Frontend sudah memiliki form input satu sesi untuk banyak siswa. Agar tombol Simpan benar-benar menulis ke Google Sheets, isi `CONFIG.API_URL` di `app.js` dengan URL Web App Google Apps Script yang menangani POST JSON.

Payload POST:
```json
{
  "date":"2026-08-26",
  "kelas":"11",
  "mt":"Nama MT",
  "mapel":"Fisika",
  "students":[{"siswa":"Nama Siswa","kuis":"85","post":"90"}]
}
```

Frontend dapat langsung dipublikasikan melalui GitHub Pages setelah repository aktif.
