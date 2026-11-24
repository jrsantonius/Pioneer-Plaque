# Imazine album cetak — audit & rebuild

> **STATUS 13 Nov 2026: arah berubah.** Situs sekarang memakai **3 template master dari Dhika/Vier Moments** (Travel, Event, Slice of Life), masing-masing 4 gaya layout 40 halaman A4 (file Canva → JSON). Prototipe v6 sudah dipublikasikan di artifact yang sama. Sumber, skema template, data pesanan, dan daftar pekerjaan sambungan ada di `claude/imazine-site/README.md` (+ `src-bundle.txt`, `tpl-all.json`).
> Yang **tidak berlaku lagi**: aturan 1 foto per halaman, alur "desain dulu di Design canvas lalu implementasi", keluarga template (Catatan Harian, Puisi & Warna, Sinema, dst.), harga Rp150rb/20–40 foto. Kanvas "Template Buku Imazine" tinggal arsip; jangan dilanjutkan tanpa diminta.
> Yang **tetap berlaku**: nada copy hangat ("kami/kamu"), foto harus dominan, jangan sandingkan dua warna jenuh yang kontras.
> **Palet situs diganti (13 Nov, v6)**: Fadhil minta tema bersih: putih di light mode, hitam di dark mode, oranye hanya sebagai aksen. Palet Vinyl & Film tidak dipakai lagi di situs. Di v6 juga: preview membalik seperti lembaran buku, dan langkah sampul punya kolom cari + saringan.

## Keputusan 13 Nov 2026
- Produk: A4, 40 halaman (20 lembar bolak-balik), Rp250.000, DP 50%, bayar + ekspedisi lewat Mayar. Bagi hasil TIS 30% / Dhika 70%, ongkos cetak Rp98rb, MoQ 100.
- Alur situs: tema → sampul → gaya layout → unggah semua foto → auto-isi (urut tanggal) → atur (geser/perbesar foto, ubah semua teks) → preview → pesan.
- Bingkai foto wajib penuh sebelum preview; ada tombol "Isi dengan foto yang sudah ada".
- Tanggal foto (EXIF, lalu nama file) mengisi baris keterangan di samping nomor foto; bisa diubah/dihapus.
- Sampul: 3 sampul foto (Bali 2026, Journey to One, Slice of Life) + 68 sampul perangko, semuanya bisa dipilih di situs sejak v7.
- Sampul turunan: gaya Vector Art seperti perangko, satu motif khas per tempat/momen (Bali = pantai, Jepang = Tokyo Tower, dst.). Dikerjakan di artifact terpisah dari situs (papan kerja "Sampul Perangko Imazine": https://claude.ai/artifact/UxonrHxcFFsZxvLKdRELYt, 71 turunan + usulan motif, sumber di `claude/imazine-site/sampul-perangko.html`); setelah final baru masuk situs dan paket handover ke Mas Anton. Daftar turunan ada di katalog `CATS` di `src/app-core.js`.
- Istilah UI: tema · sampul · gaya layout · bingkai (kotak foto) · rak foto · keterangan · preview.
- Sampul perangko (13 Nov): daftar 71 turunan disetujui Fadhil. Draf gambar pertama untuk 68 sampul sudah dibuat sebagai vektor (Travel = landmark tiap tempat; Event dan Slice of Life = benda/simbol, tanpa figur orang) dan dipublikasikan di papan sampul. Sistemnya: artboard 200×283, bingkai bergerigi, nominal 40, nama huruf Bowlby One, 11 palet senada. Sumber: `claude/imazine-site/covers-src-bundle.txt` (stamp.js = bingkai + bahasa gambar ringkas, art.js = 68 gambar). Belum masuk situs.
- Sampul perangko draf 2 (13 Nov): Fadhil menilai draf 1 "masih kelihatan dibuat bot" karena bentuknya terlalu dasar, dan minta detail, arah cahaya, bayangan tegas dua nada (tanpa midtone), awan, tekstur grain, serta sudut kamera/perspektif. Semua 68 sampul digambar ulang sebagai adegan kecil: benda dimodelkan sebagai bentuk 3D sederhana, dilihat lewat kamera (menara dari bawah, benda dari tiga perempat, isi meja dari atas), satu sumber cahaya di kiri atas, bayangan jatuh ke tanah, awan dua nada, dan butiran di seluruh bidang. Bingkai perangko, nominal 40, nama, dan palet tidak berubah. Sudah dipublikasikan di papan sampul (versi 3). Sumber: `claude/imazine-site/covers-src-bundle.txt` (stamp.js = bingkai, scene.js = mesin adegan, art.js = 68 adegan). Belum masuk situs; menunggu feedback per sampul.
- Sampul perangko draf 3 (13 Nov): Fadhil minta semua diaudit sebelum masuk paket handover, plus tiga komentar (cincin Lamaran harus tertanam di kotak, Pernikahan error, detail Bridal shower). Audit otomatis (`tools/audit-covers.js`): angka rusak, benda melayang, urutan tumpuk, kontras nama dan label, nama muat, hiasan langit tertutup lantai, potongan tepi; semua bersih (yang tersisa hanya balon udara Turki yang memang melayang). Tiga sampul yang dikomentari digambar ulang; 20-an sampul lain dirapikan (pita kado, bunga, telur Masak, apel Malang, tali lampion Imlek, dll.). Papan sampul versi 5.
- Situs v7 (13 Nov): atas permintaan Fadhil sampul perangko langsung dimasukkan ke situs, dengan pemilih bergaya rak Apple Books: sampul tampil tanpa bingkai tombol, rak per kelompok yang digeser ke samping, sampul terpilih tampil besar (di layar lebar diam di kiri), cari + saring kelompok, keyboard. Sampul terpilih ikut ke studio, preview (depan + belakang), checkout, dan data pesanan. Artifact situs versi 7. Sumber: `claude/imazine-site/src-bundle.txt` (situs) + `covers-src-bundle.txt` (sampul; situs membaca folder covers/ saat build).
- Paket handover ke Mas Anton (13 Nov): zip `imazine-handover-2026-11-13.zip` dibuat atas permintaan Fadhil. Isi: situs v7 (dist + sumber + 12 template + gambar + font lokal), sumber sampul perangko draf 3, alat uji Playwright (path relatif, `npm test` dkk.), 17 foto uji, PDF Canva asli (12 layout + sampul foto), screenshot tiap layar, contoh data pesanan, dan `BACA-DULU.md` (cara build/uji, arsitektur, kontrak data pesanan, yang perlu dibangun untuk produksi, hal terbuka). Semua uji lolos dari salinan bersih. Dokumen pengantar `BACA-DULU.md` tersimpan sebagai file pertama di `claude/imazine-site/src-bundle.txt` (project sudah penuh untuk dokumen terpisah).
- Menunggu: feedback Fadhil atas situs v7 dan draf 3 sampul, tanda final sampul, keputusan tahun "2026" di sampul perangko, sampul belakang/punggung untuk sampul perangko, konfirmasi Dhika soal halaman 1 berdiri sendiri di kanan, jadwal pelunasan, dan file sampul belakang Journey to One / Slice of Life.

---

# Arsip (Okt 2026)

Live site audited: https://album-photo-cetak.mochdewana.chatgpt.site/
Optimized prototype (artifact): https://claude.ai/artifact/BvpAZBXmi4VAuuXyTmN4cq (v2 = palet Vinyl & Film, v3 = edisi Perjalanan / Catatan Harian)
Template map (artifact): https://claude.ai/artifact/GzThhoJT3z1ru1kaKndrh8
Template Buku Imazine (Design canvas, user-editable): https://claude.ai/artifact/7Upa6DGkg4DUYMLUj6wVdu
Full audit doc: https://claude.ai/code/artifact/dcc9d328-db5f-40b3-9556-66e01b12eb0d
Drop-in package delivered in chat: imazine-optimized.zip (index.html + assets/imazine/*.webp + source/ incl. travel.js)

## Decisions taken (with the user)
- Deliverable: audit + full rebuild with motion.
- Motion personality: Premium + paper (signature easing cubic-bezier(0.4,0,0.2,1); ~4% overshoot only when paper lands).
- Copy tone: hangat & personal — brand = "kami/tim studio", user = "kamu", "kita" only in emotional headlines.
- Iterasi 2 (15 Oct): palette chosen by user = Vinyl Black #191B0A, Tangerine #E4883A, Turquoise #3E787B, Cherry Tomato #E25A3C, Vintage White #EBEDD5 (+ grainy gradient). Roles: vinyl = collection bg/ink; tangerine = primary CTA on dark + progress; turquoise (#2B5658 for text) = active/selection in studio; tomato = signature moments (wax seal); vintage = studio desk/paper. Film grain overlay + drifting tri-tone aura.
- Templates: keep 1 photo per page; layout auto per edition + buyer can swap per spread; build editions one at a time.
- Workflow (15 Oct): book templates are designed in ONE separate Design canvas ("Template Buku Imazine"), one canvas page per edition, which the user edits by hand. Only when all editions are final do they get implemented into the website.
- Template principle from user feedback (15 Oct): photos must dominate the page — whitespace allowed only as breathing room. Rule of thumb: photo ≥ ~half the page, several full-bleed layouts per edition. Covers must not be basic; user likes "exotic"/editorial covers (ref: Val Chen Collection photobook cover).
- Color rule from user feedback (15 Oct): never put two contrasting saturated hues side by side in one spread (tangerine next to turquoise read as ugly). Pair a color field with paper, or with a tonal partner.

## Template Buku Imazine (Design canvas)
- Drawn at real A5 size: page 559×794 px (148×210 mm @96dpi), spread 1118×794. Margins 40 px sides, 48 top, 72 bottom (page-number zone). Prints keep true photo ratios (3:4, 4:5, 1:1, 4:3, 2.39:1 across the gutter, bleed). The web prototype still uses 3:4 pages → switch to A-ratio on implementation (read px back from the canvas → page fractions).
- Tweaks per spread: warnaKertas, capTanggal (travel only), bayanganLipatan (fold shade is preview only, off for print), plus edition-specific ones (pasanganWarna, warnaNomor, warnaTirai).
- Sample photos uploaded as canvas assets (friends/family/outdoors/anniversary/travel + grain.svg).
- Page "Perjalanan · Catatan Harian" — APPROVED (15 Oct). Cover chosen: B · Paspor (full-bleed photo + tangerine arrival stamp "TIBA · BALI · 12·07·26"; title Instrument Serif; coords in DM Mono). A (Editorial) and C (Negatif film) kept as archive. Spreads v2: Pembuka (bleed + title on photo | 3:4 framed), Kolom (3:4 stair + rotated rail caption), Cermin (photos bleed to outer edges, captions by the gutter), Satu hari besar (huge day numeral + 4:3 | full bleed), Penuh (double bleed), Penutup (3:4 | 4:5 + "5 hari · tanggal" end mark).
- Page "Anniversary · Puisi & Warna" — APPROVED (15 Oct). Cover: peach cloth (#e6a388, woven texture) + tipped-in framed photo + tomato wax seal with initials (k&a sample). Spreads: Pembuka (tomato field + title + 4:5 | bleed + text box), Bidang warna (turquoise field, verse above/below 4:5 | 3:4 framed), Bleed + kotak (double bleed, verse box), Kontras skala (bleed | slim 3:8 strip photo), Dua warna (tonal pair via pasanganWarna enum: Senja tomato+peach = default, Malam tangerine+vinyl, Laut deep turquoise+turquoise; square photo top | square photo bottom), Penutup puisi (3:4 | vinyl field + closing verse). Text: Instrument Serif italic verses, Manrope year labels.
- Page "Persahabatan · Sinema" — drafted 15 Oct, awaiting feedback. Edition "Good People, Brighter Days". Album reads like a film: each photo = a scene, countdown numbering (20 → 01). Cover: movie poster (full-bleed photo, "GOOD PEOPLE," Manrope 800 + "brighter days" Instrument Serif italic tomato, release line, League Gothic billing block with sample cast Dita · Raka · Sekar · Bimo · kamu). Spreads: Pembuka (title card on bleed | countdown page), Layar lebar (two photos joined into one 2.39:1 frame across the gutter, scene meta above, subtitle below), Hitung mundur (huge Manrope 800 number overlapping a 4:5 photo), Photobooth (tomato curtain + paper strip with the same photo cropped wide/medium/close), Still penuh (bleed with cinema bars + subtitles), Kredit penutup (3:4 | 4:3 + credits + "tamat."). Dark vinyl pages, tomato numbers, tangerine years.
- Next editions get their own canvas page in the same artifact.

## Template families (from user's 8 refs)
1 Catatan Harian (#1) → Perjalanan · 2 Puisi & Warna (#4, #2) → Anniversary · 3 Sinema (#3, #2) → Persahabatan · 4 Majalah Fitur (#6) → Alam · 5 Editorial Hangat (#5) → Keluarga · 6 Zine (#7) → Jurnal personal · proposed new edition "Karya" (#8, kids' art / portfolio).
Build order = list order. Approved: 1 Catatan Harian, 2 Puisi & Warna. In review: 3 Sinema. Next: 4 Majalah Fitur.

## Catatan Harian (built in web prototype, v3 — geometry now superseded by the canvas v2)
- Edition "Somewhere, together" uses layout system `travel-log` (src/travel.js, injected into app.js at /*@travel*/).
- 6 spread layouts: Pembuka, Kolom, Cermin, Satu hari besar, Penuh (bleed), Penutup. Auto rhythm: spread 0 Pembuka, last Penutup, middle cycles kolom, kolom, cermin, besar, kolom, bleed, kolom, cermin. Buyer override per spread via picker; icons drawn from the same geometry.
- Per-page label + caption stored on the photo object (follows reorder); edited in a "Teks halaman" panel under the book; clicking a caption on the page focuses its field.
- JPEG EXIF DateTimeOriginal read client-side; photos auto-sorted by time until the buyer reorders manually; "hari NN" computed from first date; "Urutkan sesuai waktu" button in photos sheet.
- Payload additions (backend must accept): copywriting.pageCaptions / pageLabels keyed by page index, layout.spreads[], layout.dateStamp, layout.photoDates[].
- Engine pieces reusable by the next editions: per-page captions panel, layout picker, FLIP layout morph (prints glide via left/top/width/height animation).

## Critical findings
1. Ordering backend not connected: `api/pricing` returns the homepage HTML → orders cannot be sent; customers only find out at checkout.
2. 20/40-photo rule only enforced at checkout.
3. `calculate()` ignores page count → 40-page album priced same as 20 (confirm if intended).
4. Studio used off-brand grey + blue #525de9. Rebuild v2 unifies everything on the Vinyl & Film palette.
5. ~4 MB images (travel.png 2.4 MB), 7 font families → rebuild ~0.6 MB WebP, 3 families + DM Mono (Caveat Brush, Permanent Marker planned per template; League Gothic added for the Sinema cover).

## Glossary adopted
edisi (design/template) · album (product) · halaman (page, not "spread") · sampul (cover) · foto contoh · terunggah · detail cetak.

## Open items
- Activate backend or route checkout to WhatsApp; backend must store new caption/layout fields.
- Confirm 40-page pricing.
- Real product photography of a printed album.
- FAQ: production time + payment method.
- Decide on "Karya" edition.
- Cover data on implementation: coordinates / place / initials / cast names are sample content → derive from photo EXIF (GPS, dates) or let the buyer fill them.
- Implement final templates from the canvas into the web (after all editions are signed off).
