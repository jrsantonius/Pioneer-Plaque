# Imazine — prototipe situs (v7, 13 Nov 2026)

Prototipe satu halaman untuk alur pesan album Imazine: **tema → sampul → gaya layout → unggah foto → susun → preview → pesan**.
Artifact: https://claude.ai/artifact/BvpAZBXmi4VAuuXyTmN4cq (judul "Imazine Album Cetak").

## Perubahan v7 (sampul perangko masuk situs)
- **Semua 68 sampul perangko bisa dipilih**, ditambah 3 sampul foto (Bali 2026, Journey to One, Slice of Life). Travel 31, Event 21, Slice of Life 19. Status "Segera hadir" dihapus.
- **Langkah sampul jadi rak seperti toko buku** (`coverShelf` di app-ui.js): sampul tampil langsung tanpa bingkai tombol, satu rak per kelompok yang bisa digeser ke samping (panah di layar dengan mouse, geser jari di HP). Sampul terpilih tampil besar; di layar lebar ia diam di kolom kiri sementara rak di kanan digulir. Ketuk sampul = sampul itu terbang ke tampilan besar (View Transitions, hanya saat tampilan besar terlihat; tanpa animasi bila pengguna minta gerak dikurangi).
- **Cari dan saring**: kolom cari mencocokkan nama, motif ("sakura" → Jepang), dan kelompok. Kontrol segmen (Semua / Indonesia / Mancanegara, dst.) menampilkan satu rak saja. Saat mencari atau menyaring, rak berubah jadi grid.
- **Keyboard**: semua sampul satu radio group; panah kiri/kanan pindah sampul, atas/bawah pindah rak, Home/End ke ujung. Satu tab stop.
- **Sampul terpilih ikut ke mana-mana**: nama studio, sampul depan di preview, sampul belakang (warna bingkai perangko + logo yang kontras), ringkasan checkout, dan data pesanan (`cover` = id seperti `yogyakarta`, `coverName`).
- **Sumber sampul**: `build.py` membaca `../covers/stamp.js` (bingkai), `scene.js` (mesin adegan), `art.js` (68 adegan), `grain.txt` (tekstur), dan `notes.json` (motif tiap sampul). Satu sumber untuk papan sampul dan situs; folder `covers/` wajib ikut di paket handover. Sampul digambar sebagai SVG di halaman (font Bowlby One dari Google Fonts), jadi tajam di semua ukuran. Untuk file cetak, ekspor SVG/PDF dari fungsi yang sama.
- Uji: `tools/v7.js` (rak, cari, saring, keyboard, alur sampai pesanan; light, dark, HP) dan `tools/shelf-audit.js` (audit 20 poin di semua keadaan rak, 4 lebar layar).

## Perubahan v6 (dari komentar Fadhil di artifact)
- **Tema bersih**: putih + teks hitam di light mode, hitam + teks putih di dark mode (ikut `prefers-color-scheme` / `data-theme`), oranye `#e4883a` satu-satunya aksen. Palet Vinyl & Film tidak dipakai lagi. Halaman album dan sampul tetap memakai warna cetaknya sendiri di kedua mode (token `--paper-ink`, `--empty`).
- **Preview seperti lembaran buku**: satu "leaf" 3D membalik di punggung buku (`drawPreview`, `pvSides`, `.pv-leaf` di style.css). Sampul membuka sambil buku bergeser (`data-pos` cover/open/back). Klik beruntun menyelesaikan balikan yang berjalan (`pvFinish`). Belum ada lengkung kertas atau tarik-dengan-jari.
- **Cari sampul**: langkah sampul punya kolom cari + saringan kelompok (`coverFinder`). Sampul yang belum final tampil sebagai "Segera hadir" dan belum bisa dipilih; nanti tinggal diberi `ready: true` + gambar.

## Isi folder `site/`
Gambaran seluruh paket, cara build, dan cara uji ada di `BACA-DULU.md` di akar paket. Folder ini:
- `dist/imazine.html` — halaman jadi (CSS, JS, 12 template, 71 sampul, logo: semua di dalam satu file). `dist/test.html` = versi uji dengan font lokal.
- `src/markup.html`, `src/style.css`, `src/page.css` — markup dan gaya.
- `src/render.js` — menggambar satu halaman album dari data template (mode `edit`, `view`, `thumb`).
- `src/app-core.js` — katalog (tema, kelompok sampul, gaya), `coversOf()`/`coverOf()`, baca tanggal foto (EXIF, lalu nama file), olah foto, model album, isi otomatis.
- `src/app-ui.js` — semua layar dan interaksi (rak sampul: `coverShelf`).
- `tpl/*.json` — 12 template hasil ekstraksi PDF Canva (skema di bawah).
- `img/` — 3 sampul foto (+ sampul belakang Bali) dan logo. `fonts/` — webfont lokal untuk halaman uji.
- `build.py` — merakit `dist/imazine.html` dan `dist/test.html`. Membaca sampul perangko dari `../covers/`, jadi jalankan `python3 covers/build.py` dulu.

## Keputusan produk yang sudah dikunci
- 3 tema master: Travel, Event, Slice of Life, masing-masing 4 gaya layout. Sampul: 3 sampul foto + 68 sampul perangko (draf 3, sudah diaudit; menunggu tanda final dari Fadhil sebelum dicetak).
- Semua bingkai foto wajib terisi sebelum preview. Kalau foto kurang: tombol "Isi dengan foto yang sudah ada" (pakai ulang foto, paling jarang dipakai dulu, sebisanya tidak dobel dalam satu halaman).
- Tanggal foto (EXIF `DateTimeOriginal`; kalau kosong, tanggal di nama file seperti `IMG-20260105-WA0007.jpg`) otomatis mengisi **baris keterangan di samping nomor foto**. Nomor foto tanpa baris keterangan: keterangan kosong, bisa diisi lewat alat foto ("Pakai tanggal foto").
- Semua teks template bisa diubah. Teks yang dibiarkan kosong tidak dicetak (stempel/pil yang membungkus teks kosong juga tidak dicetak).
- Foto di dalam bingkai bisa digeser dan diperbesar (100–300%).
- Harga Rp350.000, A4, 40 halaman, bayar lunas tanpa DP. Pembayaran dan alamat di Mayar (di prototipe ini masih simulasi).

## Skema template (`tpl/<id>.json`)
Satuan: 1000 = lebar halaman, tinggi halaman 1416.
```
{ id, w:1000, h:1416, slot:"#hex warna bingkai kosong", body:"a|s" (font paragraf: Arial|Georgia),
  pages:[{ bg:"#hex",
    ph:[[x,y,w,h,rotasiDerajat], …],            // bingkai foto, urut nomor FOTO di template
    ly:[ indeksFoto | [shape,…], … ],            // urutan tumpukan: angka = bingkai foto, array = lapisan vektor
        shape: { d:"path SVG", f?:fill, fo?:opacity, s?:stroke, sw?:lebar, sd?:dash, cap?:1, t?:indeks teks pemilik lencana }
    tx:[{ x,y(baseline),z(ukuran),f:"a|s",c,b?,i?,r?(rotasi),a?:"c|r"(jangkar), k:"e"(placeholder)|"n"(teks tetap), t?(isi teks tetap), sp?(huruf renggang), up?(kapital), pre?, post? }],
    pa:[{ x,y,w,n(baris),lh(jarak baris),a,c,bh,bars:[[x,y,w],…] | rule:{c,w} }],   // paragraf (batang abu) atau garis surat
    cp:[{ x,y,z,f,c,w, p?:indeksFoto, a?:"r", bar?:[x,y,w,h,c] }]                    // keterangan di samping nomor foto
  }] }
```

## Data pesanan (yang nanti dikirim ke backend)
Lihat layar "Pesanan tercatat" → "Data pesanan untuk developer". Ringkasnya:
```
{ orderNo, createdAt, customer:{name, whatsapp, email, note},
  product:{size:"A4", pages:40, unitPrice, qty, total},
  category, cover, coverName, template,
  photos:[{id, file, width, height, date}],
  pages:[{ page, slots:[{photo:id, focusX:0..1, focusY:0..1, zoom:1..3}], texts:{indeks:isi}, paragraphs:{…}, captions:{…} }] }
```
`cover` = id sampul: `bali-2026`, `journey-to-one`, `slice-of-life` untuk sampul foto, atau slug nama untuk sampul perangko (`yogyakarta`, `umrah-dan-haji`, `natal-dan-tahun-baru`, …). `coverName` = nama yang tampil.
`focusX/focusY` = titik fokus crop (0 = rata kiri/atas, 1 = rata kanan/bawah) setelah foto di-"cover"-kan ke bingkai lalu dikali `zoom`.

## Yang masih simulasi / perlu disambung (untuk Mas Anton)
1. **Unggah foto ke server.** Sekarang foto hanya hidup di browser (diperkecil ke sisi terpanjang 1800 px untuk tampilan). File asli perlu diunggah untuk cetak.
2. **Mayar.** Tombol "Lanjut bayar" belum membuat tagihan. Ganti dengan pembuatan invoice Mayar + redirect.
3. **Simpan draf.** Album hilang kalau halaman ditutup. Perlu penyimpanan draf (akun atau tautan).
4. **Render cetak.** Halaman digambar dari JSON yang sama; untuk cetak perlu render PDF di server (posisi dan ukuran sudah dalam satuan template).
5. HEIC hanya terbaca di Safari. Batas sekali unggah 240 foto.

## Asumsi yang perlu dikonfirmasi ke Dhika
- Halaman 1 berdiri sendiri di kanan (di balik sampul depan), lalu 2–3, 4–5, …, dan halaman 40 sendiri di kiri.
- Sampul belakang Journey to One dan Slice of Life belum ada filenya: sementara warna polos + logo.

## Hasil uji (Chromium headless, v7)
- Rak sampul (`tools/v7.js`): 24 pemeriksaan × light, dark, HP, semua lolos (pilih, cari lewat motif, saring rak, keyboard, panah rak, sampul ikut ke studio/preview/checkout/pesanan).
- Audit UI 20 poin semua keadaan rak (`tools/shelf-audit.js`): 0 temuan di 1440, 820, 400, 360 px. Alur penuh (`tools/drive.js`): 0 temuan di keempat lebar.
- Sampul perangko (`tools/audit-covers.js`): 68 sampul, 0 temuan (angka rusak, benda melayang, benda menutupi nama, kontras, nama muat, potongan tepi).

### Hasil uji v6
- Audit UI 20 poin: 0 temuan di 1440, 820, 400, dan 360 px untuk semua layar alur.
- Uji unggah file asli: 21 pemeriksaan lolos (EXIF, tanggal dari nama file, file rusak, tukar, kosongkan + urungkan, ganti gaya, isi ulang, preview).
- 12 gaya: buka semua halaman di editor dan preview, 0 galat.
- Belum diuji: perangkat sungguhan (safe area iPhone), Safari/Firefox, foto HEIC, unggahan 80+ foto ukuran penuh dari ponsel.
