# Dashboard Sales Performance SPG M5 Sukacitra

Isi folder:
- index.html  : dashboard (3 halaman: Performance, Detail SKU & Insentif, Ranking SPG terbawah)
- style.css, app.js : tampilan & logika
- data.js     : data dari DASHBOARD_SPG_2026_W1-52.xlsx (struktur SPG-toko-SKU, harga karton, skema insentif, feed)
- config.js   : pengaturan (DEMO, FEED_URL)
- assets/     : logo Mayora, Gentle Gen, Kilau Nipis (diambil dari SKETSA_DASBOARD.pptx)

Cara lihat: buka index.html (butuh internet untuk Chart.js dari cdnjs).
Mode DEMO: selama aktual di data.js masih kosong, dashboard isi data contoh (ada tulisan MODE DEMO). Set DEMO:false di config.js untuk matikan.
Data live: deploy Apps Script web app (?sheet=FEED_DASH) lalu isi FEED_URL di config.js. Kolom dipakai: WEEK_NO, SPG, TOKO, SKU, TARGET_WEEK_RP, AKTUAL_RP.
Foto SPG: taruh di assets/foto/NAMA.jpg (atau .png), huruf besar persis nama SPG, contoh MARSHA.jpg. Foto sudah diproses (background putih) ada di assets/foto_siap/01-16.jpg: ganti nama sesuai SPG lalu pindah ke assets/foto/. Atau pakai link Google Drive (lihat TUTORIAL_GITHUB.md).
Mode gelap/terang: tombol di pojok kanan header (tersimpan di browser).
Hosting: lihat TUTORIAL_GITHUB.md
