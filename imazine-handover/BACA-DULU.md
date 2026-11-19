# Imazine: paket handover prototipe

Untuk Mas Anton, dari Fadhil (The Innovators Studio). Versi situs v7 dan sampul perangko draf 3, per 13 November 2026.

Paket ini berisi prototipe front-end lengkap untuk alur pesan album cetak Imazine (A4, 40 halaman, Rp350.000, bayar lunas tanpa DP). Semua layar, data, dan logikanya sudah jalan di browser. Yang belum ada adalah bagian server: unggah foto, simpan draf, pembayaran Mayar, dan pembuatan file cetak. Anggap prototipe ini spesifikasi hidup: kalau ragu soal perilaku, ikuti perilaku prototipe.

## Mulai dari sini

1. Buka `site/dist/imazine.html` di Chrome atau Safari. Semuanya ada di satu file dan jalan tanpa server; font diambil dari Google Fonts kalau sedang online. Tautan "Coba dulu pakai foto contoh" di langkah unggah mengisi album tanpa perlu foto sendiri.
2. Versi online yang sama: https://claude.ai/artifact/BvpAZBXmi4VAuuXyTmN4cq
3. Papan semua sampul perangko: buka `covers/sampul-perangko.html`.
4. Gambaran cepat tanpa membuka apa pun: `contoh/screenshots/` dan contoh data pesanan di `contoh/pesanan-contoh.json`.

## Isi paket

```
BACA-DULU.md             dokumen ini
package.json             perintah build dan uji (npm run …)
site/                    situs
  dist/imazine.html      halaman jadi, satu file (yang dibuka di browser)
  src/                   sumber: markup.html, style.css, page.css, render.js, app-core.js, app-ui.js
  tpl/                   12 template halaman (JSON, hasil ekstraksi PDF Canva)
  img/                   3 sampul foto, sampul belakang Bali, logo
  fonts/                 webfont lokal untuk halaman uji (OFL)
  build.py               merakit dist/imazine.html dan dist/test.html
  README.md              catatan perubahan, skema template, data pesanan, keputusan produk
covers/                  sampul perangko
  stamp.js               bingkai perangko + bentuk datar
  scene.js               mesin adegan: bentuk 3D sederhana, kamera, satu matahari, bayangan, awan, pohon
  art.js                 68 adegan (data, bukan gambar)
  notes.json             motif tiap sampul (dipakai situs untuk teks dan pencarian)
  grain.txt              tekstur butiran (data URI)
  build.py               merakit papan sampul + notes.json
  board.src.html         sumber papan sampul; board-v1.html = data daftar sampul + 3 sampul foto
  sampul-perangko.html   papan sampul jadi
tools/                   uji Playwright dan alat bantu (lihat "Build dan uji")
  testphotos/            17 foto uji (EXIF, tanggal di nama file, satu file rusak, satu PNG tanpa tanggal)
sumber-desain/           PDF Canva asli: 12 layout halaman, sampul foto (depan, belakang, punggung)
contoh/                  screenshot tiap layar + contoh data pesanan
```

## Alur pengguna

Beranda → pilih tema (Travel, Event, Slice of Life) → pilih sampul dari rak → pilih gaya layout (4 per tema) → unggah semua foto → foto dipasang otomatis urut tanggal → susun di studio (geser dan perbesar foto, ubah semua teks, tukar foto) → preview yang membalik seperti buku → isi kontak dan ringkasan pesanan → layar "Pesanan tercatat" yang menampilkan data pesanan.

## Build dan uji

Kebutuhan: Python 3.10+ (cukup library bawaan), Node 18+ (dicoba di Node 22), dan Chromium dari Playwright untuk uji saja.

```
python3 covers/build.py     # papan sampul, covers/notes.json, site/dist/covers-test.html
python3 site/build.py       # site/dist/imazine.html dan site/dist/test.html
                            # (atau keduanya sekaligus: npm run build; urutannya harus covers dulu)

npm install
npx playwright install chromium
npm run serve               # di terminal lain; menyajikan folder site/ di http://localhost:8765

npm test                    # rak sampul + alur sampai pesanan, light / dark / HP
npm run test:ui             # audit UI 20 poin di seluruh alur, 4 lebar layar
npm run test:shelf          # audit UI semua keadaan rak sampul
npm run test:upload         # unggah file asli: EXIF, tanggal dari nama file, file rusak
npm run test:layouts        # buka semua halaman dari 12 gaya, cari galat
npm run test:covers         # audit 68 sampul perangko + uji papan sampul
```

Screenshot dan laporan uji masuk ke folder `out/`. Kalau port 8765 terpakai, sajikan di port lain lalu jalankan uji dengan `BASE_URL=http://localhost:9000 npm test`. `tools/extract.py` (PDF Canva → template JSON) butuh `pip install pymupdf`.

## Arsitektur singkat

Tanpa framework dan tanpa dependency saat runtime: HTML, CSS, dan JavaScript biasa di satu file. `site/build.py` menyusun JavaScript-nya dalam urutan ini: kode sampul (`stamp.js`, `scene.js`, `art.js`, tekstur, `COVER_NOTE`) → `render.js` → `app-core.js` → `app-ui.js`.

Semua state ada di objek `S` di `app-ui.js`. Pindah layar lewat `go(view)`, dengan transisi View Transitions API kalau browser mendukung dan tanpa animasi kalau pengguna minta gerak dikurangi. Halaman album digambar oleh `render.js` dari template JSON (satuan: lebar 1000, tinggi 1416), dalam tiga mode: `edit`, `view`, `thumb`.

Katalog ada di `CATS` (`app-core.js`): tema → kelompok sampul → nama sampul, plus 4 gaya layout per tema. `coversOf(cat)` menggabungkan sampul foto (gambar di `img/`) dengan sampul perangko. Sampul perangko tidak punya file gambar: `stampCover(nama, subjudul, ART[nama])` menggambarnya sebagai SVG dari data di `art.js`. Id sampul perangko = slug nama (`yogyakarta`, `umrah-dan-haji`). Rak sampulnya ada di `coverShelf()` (`app-ui.js`).

## Data pesanan

Saat pesanan dikirim, prototipe menyusun satu objek JSON (sekarang hanya ditampilkan di layar akhir). Contoh lengkap: `contoh/pesanan-contoh.json`.

```
{ orderNo, createdAt,
  customer: { name, whatsapp, email, note },
  product:  { size: "A4", pages: 40, unitPrice, qty, total },
  category, cover, coverName, template,
  photos:   [{ id, file, width, height, date }],
  pages:    [{ page, slots: [{ photo, focusX, focusY, zoom }], texts, paragraphs, captions }] }
```

`focusX` dan `focusY` (0 sampai 1) adalah titik fokus crop setelah foto dibuat menutupi bingkai lalu dikali `zoom` (1 sampai 3). Posisi dan ukuran bingkai serta teks ada di template, jadi file cetak bisa disusun ulang persis dari template + data ini. Penjelasan field lebih rinci ada di `site/README.md`.

## Yang perlu dibangun untuk produksi

1. **Unggah foto asli.** Sekarang foto hanya ada di browser, diperkecil ke sisi terpanjang 1800 px untuk tampilan. File aslinya perlu diunggah ke penyimpanan untuk dicetak. Batas sekarang 240 foto per unggahan; HEIC hanya terbaca di Safari.
2. **Simpan draf.** Album hilang kalau halaman ditutup. Perlu penyimpanan draf, lewat akun atau tautan.
3. **Pembayaran Mayar.** Tombol "Lanjut bayar" belum membuat tagihan. Ganti handler `submit` pada `#co-form` di `app-ui.js` dengan pembuatan invoice Mayar lalu redirect. Alamat dan ongkir diisi di Mayar.
4. **File cetak halaman.** Render PDF di server dari template JSON + data pesanan.
5. **File cetak sampul.**
   - Sampul foto: PDF Canva siap cetak ada di `sumber-desain/sampul/` (Bali: depan, belakang, punggung; Slice of Life: depan, punggung; Journey to One: depan).
   - Sampul perangko keluar sebagai SVG dari `stampCover()`. Untuk cetak masih perlu:
     - ukuran akhir, bleed, dan lebar punggung dari percetakan;
     - tekstur butiran resolusi tinggi, karena tile sekarang 192 px dan akan pecah di cetak;
     - font Bowlby One di-embed atau diubah jadi outline.
   - Sampul belakang dan punggung untuk sampul perangko belum didesain. Sementara: warna bingkai + logo.
6. **Sisi operasional** (menerima dan memproses pesanan, status, notifikasi) berada di luar prototipe ini.

## Status dan hal yang masih terbuka

- **Sampul perangko masih draf 3.** Sudah diaudit dan sudah bisa dipilih di situs, tapi belum ditandai final oleh Fadhil. Revisi nanti cukup di `covers/art.js` (data saja, kodenya tetap). Setelah mengubahnya, jalankan `npm run test:covers`, lalu build ulang.
- **Tahun di sampul perangko** tercetak "2026" (subjudul di `coverArt()` di `app-ui.js`). Perlu diputuskan: tetap, ikut tahun pesanan, atau bisa diubah pembeli.
- **Perlu dikonfirmasi ke Dhika:**
  - halaman 1 berdiri sendiri di kanan;
  - kapan sisa 50% dilunasi;
  - file sampul belakang Journey to One dan Slice of Life.
- **Belum diputuskan Fadhil:** apakah tanggal foto juga otomatis muncul di foto yang hanya punya nomor tanpa baris keterangan. Sekarang tidak; bisa diisi lewat tombol "Pakai tanggal foto".

## Batas pengujian

Semua uji jalan di Chromium headless dan lolos tanpa temuan (detail di `site/README.md`). Yang belum diuji: HP sungguhan (termasuk safe area iPhone), Safari dan Firefox, foto HEIC, dan unggahan 80+ foto ukuran penuh dari ponsel.

## Merawat sampul perangko

Bahasa gambarnya dijelaskan di kepala `covers/scene.js` dan `covers/stamp.js`. Alat bantunya:

- `tools/art-edit.js` untuk mengubah adegan dengan aman;
- `tools/audit-covers.js` untuk audit otomatis;
- `tools/where.js` untuk tahu di mana sebuah titik adegan jatuh di sampul;
- `tools/sheet.js` untuk lembar kontak hasil render.

Pertanyaan soal desain dan produk ke Fadhil.
