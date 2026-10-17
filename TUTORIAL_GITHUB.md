# Tutorial Upload Dashboard ke GitHub Pages (gratis)

Hasil akhir: dashboard bisa dibuka di HP/laptop lewat link
`https://USERNAME.github.io/NAMA-REPO/`

## A. Siapkan akun & repo (sekali saja)
1. Daftar / login di https://github.com
2. Klik **+** (pojok kanan atas) → **New repository**
3. Repository name: `dashboard-spg-m5` (bebas, tanpa spasi)
4. Pilih **Public** (Pages gratis butuh Public) → klik **Create repository**

## B. Upload file (lewat browser, tanpa install apa pun)
1. Ekstrak zip dashboard di laptop. Pastikan isinya: `index.html, app.js, style.css, data.js, config.js, assets/`
2. Di halaman repo klik **uploading an existing file** (atau Add file → Upload files)
3. **Drag semua isi folder `dash`** (bukan folder `dash`-nya) ke halaman itu. Folder `assets` ikut ke-upload.
4. Tunggu selesai → isi *Commit message* "upload dashboard" → **Commit changes**
5. Cek: `index.html` harus ada di halaman depan repo (bukan di dalam subfolder).

## C. Aktifkan GitHub Pages
1. Repo → **Settings** → menu kiri **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/(root)** → **Save**
4. Tunggu 1–2 menit, refresh halaman Pages → muncul link hijau "Your site is live at ...". Itu link dashboard-nya.
5. Buka di HP → Chrome ⋮ → **Tambahkan ke layar utama** supaya jadi ikon seperti aplikasi.

## D. Update data tiap minggu
Ada 2 cara:

**Cara 1 – Manual (paling simpel)**
Ganti file `data.js` di repo: klik file → ikon pensil/Upload file baru → Commit. Link otomatis update 1–2 menit.

**Cara 2 – Live dari Google Sheet (tanpa upload ulang)**
1. Di Google Sheet, buat Apps Script web app yang mengembalikan sheet `FEED_DASH` (kolom: WEEK_NO, SPG, TOKO, SKU, TARGET_WEEK_RP, AKTUAL_RP) sebagai JSON. Deploy → *Anyone* → salin URL `/exec`.
2. Buka `config.js` di repo, isi: `FEED_URL:'https://script.google.com/macros/s/XXXX/exec'`
3. Set `DEMO:false` kalau mau tulisan MODE DEMO hilang. Commit.

## E. Foto SPG
Taruh PNG transparan di folder `assets/foto/` dengan nama **huruf besar persis nama SPG**: `MARSHA.jpg` (atau `.png`), `NADIA.jpg`, dst. (Upload lewat Add file → Upload files, pilih folder `assets/foto`.) Kalau belum ada, tampil siluet abu-abu.

## F. Cara pakai Git (opsional, kalau sudah terbiasa)
```
git init
git add .
git commit -m "dashboard SPG M5"
git branch -M main
git remote add origin https://github.com/USERNAME/dashboard-spg-m5.git
git push -u origin main
```
Update berikutnya: `git add . && git commit -m "update W42" && git push`

## Masalah umum
- **Halaman 404** → `index.html` belum di root repo, atau Pages belum aktif / belum 2 menit.
- **Tampilan lama masih muncul** → hard refresh (Ctrl+Shift+R) atau buka tab incognito.
- **Chart kosong** → butuh internet (Chart.js dari cdnjs) & jangan diblok adblock.
- **Logo/foto tidak muncul** → cek huruf besar/kecil nama file; GitHub membedakan.
- **Jangan upload data rahasia** ke repo Public. Kalau data sensitif, jadikan repo Private (Pages Private butuh GitHub Pro) atau pakai Cara 2 dengan Apps Script yang dibatasi.

---

# Tambahan: Hubungkan Google Sheet (Apps Script) + Foto SPG dari Google Drive

## 1. Pasang Apps Script (sekali saja)
1. Buka Google Sheet dashboard (yang ada tab `FEED_DASH`) → **Extensions → Apps Script**
2. Hapus isi default, **paste isi file `apps-script/Code.gs`** → Save (ikon disket)
3. **Deploy → New deployment** → ikon roda gigi pilih **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Deploy** → izinkan akses (Advanced → Go to ... → Allow) → salin **Web app URL** (berakhiran `/exec`)
5. Tes: tempel `URL/exec?sheet=FEED_DASH` di browser → harus muncul JSON `{"rows":[...]}`
6. Buka `config.js` di repo GitHub, isi:
   ```
   window.CONFIG={ DEMO:false, FEED_URL:'https://script.google.com/macros/s/XXXX/exec' };
   ```
   (tanpa `?sheet=` — itu ditambah otomatis). Commit.

Kalau kamu ubah isi Code.gs: **Deploy → Manage deployments → pensil → Version: New version → Deploy** (URL tetap sama).

Kolom FEED_DASH yang dibaca: `SPG, TOKO, SKU, TARGET_WEEK_RP, AKTUAL_RP` + week (`WEEK_NO` angka 1–52, atau `WEEK_KALENDER` seperti `W40`).
Dashboard cuma baca tab `FEED_DASH` dan `FOTO_SPG`; tab lain aman.

## 2. Foto SPG dari Google Drive
**a. Siapkan fotonya (penting, supaya tidak kepotong & background putih)**
- Hapus background di https://www.remove.bg atau Photoroom/Canva (gratis), lalu **simpan sebagai PNG dengan background putih** (atau transparan, di dashboard tetap tampil di bingkai putih).
- Foto setengah badan/portrait, wajah di tengah. Ukuran sekitar 800 px sudah cukup.
- Dashboard memakai `object-fit: contain` di bingkai putih → foto **tidak pernah dipotong**; paling banyak ada ruang putih di sisi. Dashboard tidak bisa menghapus background otomatis, jadi langkah ini dikerjakan sekali per SPG.

**b. Upload ke Drive & buka aksesnya**
1. Buat folder Drive `FOTO SPG M5`, upload semua foto.
2. Klik kanan folder → **Share → General access → Anyone with the link → Viewer**.

**c. Masukkan link ke spreadsheet**
Cara paling rapi: buat tab baru bernama **`FOTO_SPG`** dengan 2 kolom:

| SPG | FOTO |
|---|---|
| MARSHA | https://drive.google.com/file/d/1AbC.../view?usp=sharing |
| NADIA | https://drive.google.com/file/d/1XyZ.../view?usp=sharing |

- Nama SPG harus sama dengan di dashboard (huruf besar, mis. `MARSHA`).
- Link yang ditempel boleh format "Copy link" biasa dari Drive; dashboard otomatis mengubahnya jadi gambar. Tidak perlu edit manual.
- Alternatif: isi kolom `FOTO_SPG` langsung di tab `FEED_DASH` (sama saja).

**d. Cek**
Refresh dashboard (Ctrl+Shift+R). Foto muncul di kartu SPG dan di ranking. Kalau tidak muncul: (1) folder/file belum "Anyone with the link", (2) nama SPG tidak sama persis, (3) link bukan link file Drive.

## 3. Catatan keamanan
Web app "Anyone" artinya siapa saja yang tahu URL `/exec` bisa baca data tab yang diizinkan. Jangan sebar URL-nya, dan jangan taruh data sensitif (gaji, dll.) di tab `FEED_DASH`/`FOTO_SPG`.
