"""Assemble the single-file page. Usage: python3 build.py"""
import base64, json, glob, os, re
R = os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(os.path.join(R, p), encoding='utf-8').read()
def uri(p): return 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(R, p), 'rb').read()).decode()
IMG = {'bali': uri('img/c-bali.webp'), 'bali_back': uri('img/c-bali-back.webp'), 'sol': uri('img/c-sol.webp'), 'journey': uri('img/c-journey.webp'),
       'logo_white': uri('img/logo_white.webp'), 'logo_black': uri('img/logo_black.webp')}
TPL = {os.path.basename(f)[:-5]: json.load(open(f)) for f in sorted(glob.glob(os.path.join(R, 'tpl', '*.json')))}
markup = rd('src/markup.html')
# Hero beranda: tiga contoh Cover Majalah (foto contoh orang, dibuat AI, dirender dengan magcover.js). Tidak masuk IMG/IMZ_IMG:
# di /imazine disajikan sebagai file terpisah dari public/imazine/img (bisa di-cache, halaman tetap ringan); di build uji
# (imazine.html, test.html) tetap disisipkan sebagai data URI supaya bisa dibuka tanpa server.
HERO = {k: uri('img/c-mag-%s.webp' % k) for k in ('travel', 'event', 'sol')}
for k, v in [('logo_white', IMG['logo_white']), ('logo_black', IMG['logo_black']), ('hero_travel', HERO['travel']), ('hero_event', HERO['event']), ('hero_sol', HERO['sol'])]:
    markup = markup.replace('{{%s}}' % k, v)
FALLBACK = '''@font-face{font-family:"Manrope Fallback";src:local("Arial"),local("Helvetica Neue"),local("Liberation Sans");size-adjust:100.4%;ascent-override:106.2%;descent-override:29.9%;line-gap-override:0%}
@font-face{font-family:"Instrument Serif Fallback";src:local("Georgia"),local("Times New Roman");size-adjust:77.2%;ascent-override:128.2%;descent-override:40.1%;line-gap-override:0%}
'''
css = FALLBACK + rd('src/style.css') + rd('src/page.css') + rd('src/mag.css')
css = css.replace('--font-display: "Instrument Serif",', '--font-display: "Instrument Serif", "Instrument Serif Fallback",').replace('--font-ui: "Manrope",', '--font-ui: "Manrope", "Manrope Fallback",')
# the stamp covers: drawing engine and art live in ../covers (one source for the cover board and this site)
CV = os.path.join(R, '..', 'covers')
def rc(p): return open(os.path.join(CV, p), encoding='utf-8').read()
covers_js = '%s\n%s\n%s\nGRAIN_URI = "%s";\nvar COVER_NOTE = %s;' % (rc('stamp.js'), rc('scene.js'), rc('art.js'), rc('grain.txt').strip(), rc('notes.json').replace('\n', ''))
# Halaman pembeli tidak lagi memuat mesin dan gambar sampul perangko (dihapus dari pilihan, review 18 Nov 2026):
# kira-kira 75 KB terkompresi lebih ringan. Halaman album admin tetap memuat covers_js lengkap untuk pesanan lama.
STAMP_STUB = "var ART = {}, PAL = [], COVER_NOTE = {}, GRAIN_URI = '';\nfunction stampDefs() { return ''; }\nfunction stampCover() { return '<svg></svg>'; }"
js = '(function(){\n"use strict";\nvar IMZ_TPL=%s;\nvar IMZ_IMG=%s;\n%s\n%s\n%s\n%s\n})();' % (
    json.dumps(TPL, separators=(',', ':'), ensure_ascii=False), json.dumps(IMG), STAMP_STUB, rd('src/render.js'), rd('src/app-core.js') + '\n' + rd('src/magcover.js'), rd('src/app-ui.js') + '\n' + rd('src/admin-edit.js'))
# Bahasa (DNA TIS, 20 Nov 2026): kamus Indonesia + mesin terjemahan, sebelum semua kode lain supaya t() sudah ada.
js = js.replace('"use strict";\n', '"use strict";\n' + rd('src/i18n-id.js') + '\n' + rd('src/i18n.js') + '\n', 1)
js = js.replace('</script', '<\\/script')
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Caveat+Brush&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400..800&display=swap">\n'
head = '<title>Imazine — Printed photo albums</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
page = head + FONTS + '<style>\n' + css + '\n</style>\n' + markup + '\n<script>\n' + js + '\n</script>\n'
os.makedirs(os.path.join(R, 'dist'), exist_ok=True)
open(os.path.join(R, 'dist/imazine.html'), 'w', encoding='utf-8').write(page)
# local test wrapper: same skeleton the host adds, plus local copies of the webfonts
local = ''.join('@font-face{font-family:"%s";src:url("/fonts/%s") format("woff2");font-weight:%s;font-style:%s}' % f for f in [
    ('Manrope', 'manrope-latin-wght-normal.woff2', '400 800', 'normal'), ('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'),
    ('Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'), ('DM Mono', 'dm-mono-latin-400-normal.woff2', '400', 'normal'),
    ('DM Mono', 'dm-mono-latin-500-normal.woff2', '500', 'normal'), ('Bowlby One', 'bowlby-one-latin-400-normal.woff2', '400', 'normal')])
skeleton = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%%}[hidden]{display:none!important}%s</style></head><body>' % local
open(os.path.join(R, 'dist/test.html'), 'w', encoding='utf-8').write(skeleton + page.replace(FONTS, '') + '</body></html>')
print('page bytes', len(page.encode()), 'css', len(css), 'js', len(js))
# Production: dokumen lengkap untuk /imazine (public/imazine/index.html). Tanpa doctype dan meta viewport, browser
# merender dalam quirks mode selebar 980px dan semua aturan @media untuk HP/tablet tidak pernah terpakai.
SITE_HEAD = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
             '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
             '<meta name="description" content="A printed A4 photo album, 40 pages. Pick a magazine-style cover, upload your photos, and we lay them out into an album. Available in English and Bahasa Indonesia.">'
             '<meta name="theme-color" content="#000000">'
             '<style>:root{color-scheme:light;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>\n')
# Font disajikan dari server sendiri (public/imazine/fonts), bukan Google Fonts: stylesheet Google memblokir tampilan halaman
# sampai termuat, dan di sebagian jaringan Wi-Fi permintaannya menggantung (review 18 Nov 2026). font-display:swap = teks
# langsung tampil dengan font cadangan.
SITE_FONTS = ''.join('@font-face{font-family:"%s";src:url("/public/imazine/fonts/%s") format("woff2");font-weight:%s;font-style:%s;font-display:swap}' % f for f in [
    ('Manrope', 'manrope-latin-wght-normal.woff2', '400 800', 'normal'), ('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'),
    ('Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'), ('DM Mono', 'dm-mono-latin-400-normal.woff2', '400', 'normal'),
    ('DM Mono', 'dm-mono-latin-500-normal.woff2', '500', 'normal'), ('Bowlby One', 'bowlby-one-latin-400-normal.woff2', '400', 'normal'),
    ('Caveat Brush', 'caveat-brush-latin-400-normal.woff2', '400', 'normal')])
SITE_PRELOAD = ''.join('<link rel="preload" href="/public/imazine/fonts/%s" as="font" type="font/woff2" crossorigin>' % f for f in ['manrope-latin-wght-normal.woff2', 'instrument-serif-latin-400-normal.woff2'])
SITE_HEAD = SITE_HEAD.replace('[hidden]{display:none!important}</style>', '[hidden]{display:none!important}' + SITE_FONTS + '</style>' + SITE_PRELOAD)
site = SITE_HEAD + page.replace(FONTS, '').replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '').replace('\n<style>\n', '\n<style>\n', 1)
assert 'fonts.googleapis.com' not in site
site = site.replace('</style>\n' + markup, '</style>\n</head><body>\n' + markup, 1) + '</body></html>\n'
assert '</head><body>' in site
for k in HERO: site = site.replace(HERO[k], '/public/imazine/img/c-mag-%s.webp' % k)
assert 'c-mag-travel.webp' in site
open(os.path.join(R, 'dist/imazine-site.html'), 'w', encoding='utf-8').write(site)
print('site bytes', len(site.encode()))

# Admin: album cetak. Menyusun ulang album pesanan dengan renderer yang sama (render.js), satu halaman A4 per lembar,
# lalu disimpan sebagai PDF lewat dialog cetak. Disalin ke pages/imazine-album.html dan disajikan di
# /imazine/admin/pesanan/{no}/album (wajib login admin; datanya diambil dari data.json dan foto dari /cetak/{idx}).
ALBUM_CSS = FALLBACK + rd('src/page.css') + '''
:root{--font-ui:"Manrope","Manrope Fallback",Arial,sans-serif;color-scheme:light}
*{box-sizing:border-box}
html,body{margin:0}
body{background:#2b2724;color:#f4ede4;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.cv{display:block}
.st-d{font-family:"Bowlby One","Arial Black",Impact,sans-serif}
.st-s{font-family:var(--font-ui);font-weight:800;letter-spacing:.2em}
.bar{position:sticky;top:0;z-index:5;background:#13100e;border-bottom:1px solid #3a322c;padding:12px 16px}
.bar-in{max-width:1000px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between}
.bar a{color:#cf7a3c}
.bar h1{margin:0;font:400 22px Georgia,serif}
.bar .m,.bar .prog{margin:2px 0 0;color:#b9ada0;font-size:13px}
.act{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}
.act label{display:flex;gap:6px;align-items:center;color:#d8cfc5;font-size:13px}
.btn{padding:10px 18px;border-radius:999px;border:0;background:#cf7a3c;color:#1a0f06;font-weight:700;font-size:14px;cursor:pointer}
.btn:disabled{opacity:.45;cursor:progress}
.how{max-width:1000px;margin:8px auto 0;color:#b9ada0;font-size:12.5px}
.how summary{cursor:pointer;color:#d8cfc5;width:max-content;max-width:100%}
.how p{margin:4px 0 0}
.warn{max-width:1000px;margin:8px auto 0;color:#ffb09f;font-size:13px}
.safari{max-width:1000px;margin:10px auto 0;padding:12px 14px;border-radius:10px;background:#4a1f14;border:1px solid #a8452c;color:#ffe3d8;font-size:14px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}
.safari p{margin:0;flex:1 1 420px}
.btn-line{background:none;border:1.5px solid #ffb09f;color:#ffe3d8}
.book{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 16px 80px}
.leaf{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:18px}
.lb{margin:0;color:#b9ada0;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.sheet{width:210mm;height:297mm;max-width:calc(100vw - 32px);max-height:calc((100vw - 32px) * 297 / 210);background:#fff;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.sheet .pg{width:100%;height:100%;aspect-ratio:auto}
.sheet .cv,.sheet.cover img{width:100%;height:100%;display:block;object-fit:cover}
/* tablet: bar tetap di atas, tapi lebih ringkas */
@media (max-width:1024px){
  .bar{padding:10px 20px}
  .book{padding:20px 20px 80px}
  .sheet{max-width:calc(100vw - 40px);max-height:calc((100vw - 40px) * 297 / 210)}
}
/* ponsel (dan ponsel mendatar): bar ikut tergulung, tombol simpan mengambang di bawah */
@media (max-width:760px),(max-height:600px){
  .bar{position:static;padding:12px 16px}
  .bar h1{font-size:20px}
  .act{width:100%}
  .book{padding:16px 16px calc(96px + env(safe-area-inset-bottom))}
  .sheet{max-width:calc(100vw - 32px);max-height:calc((100vw - 32px) * 297 / 210)}
  .leaf{margin-bottom:10px}
  #save{position:fixed;z-index:6;left:16px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom));padding:14px 18px;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.55)}
}
@media (max-height:600px) and (min-width:761px){
  .sheet{max-height:none}
  #save{left:auto;width:320px}
}
@page{size:210mm 297mm;margin:0}
@media print{
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{background:#fff}
  .bar,.lb{display:none!important}
  .book{display:block;padding:0}
  .leaf{display:block;margin:0}
  .leaf+.leaf{break-before:page;page-break-before:always}
  /* Bingkai foto yang mepet tepi atas/bawah halaman (y < 0 atau y + h > 1416, ada di 10 dari 12 layout) membuat Chrome
     memecah bingkai itu di batas halaman cetak, lalu foto di dalamnya tidak terpotong dan meluber (PDF IMZ-BL39KY, 23 Nov 2026).
     contain:strict menjadikan tiap lembar satu kesatuan yang tidak dipecah, jadi hasil cetak sama dengan layar. */
  .sheet{width:210mm;height:297mm;max-width:none;max-height:none;box-shadow:none;contain:strict}
}
'''
ALBUM_MARKUP = '''<header class="bar" id="bar"><div class="bar-in">
  <div><a id="back" href="/imazine/admin">&larr; Kembali ke pesanan</a><h1 id="t">Album</h1><p class="m" id="m"></p><p class="prog" id="prog" role="status" aria-live="polite">Menyiapkan album...</p></div>
  <div class="act"><label><input type="checkbox" id="with-cover" checked> Sertakan sampul di halaman pertama</label><button class="btn" id="save" type="button" disabled>Simpan sebagai PDF</button></div>
</div>
<details class="how" id="how"><summary>Cara menyimpan PDF</summary><p id="how-t">Di dialog cetak: pilih tujuan <b>Simpan sebagai PDF</b> (Save as PDF), ukuran kertas <b>A4</b>, margin <b>Tidak ada</b> (None), skala <b>100%</b>. Paling rapi di Chrome atau Edge di komputer.</p></details>
<p class="warn" id="warn" hidden></p>
</header>
<main class="book" id="book"></main>'''
album_js = '(function(){\n"use strict";\nvar IMZ_TPL=%s;\nvar IMZ_IMG=%s;\n%s\n%s\n%s\n%s\n})();' % (
    json.dumps(TPL, separators=(',', ':'), ensure_ascii=False), json.dumps({k: IMG[k] for k in ('bali', 'sol', 'journey')}), covers_js, rd('src/render.js'), rd('src/app-core.js'), rd('src/album-print.js'))
album_js = album_js.replace('</script', '<\\/script')
# render.js memakai t(); halaman album admin hanya berbahasa Inggris untuk teks bantuannya.
album_js = album_js.replace('"use strict";\n', '"use strict";\nfunction t(s, p) { return p ? s.replace(/\\{(\\w+)\\}/g, function (m, k) { return p[k] != null ? p[k] : m; }) : s; }\n', 1)
ALBUM_FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Manrope:wght@800&display=block">\n'
album = ('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">\n'
         '<title>Album cetak Imazine</title>\n' + ALBUM_FONTS + '<style>\n' + ALBUM_CSS + '\n</style></head><body>\n' + ALBUM_MARKUP + '\n<script>\n' + album_js + '\n</script>\n</body></html>\n')
open(os.path.join(R, 'dist/album-cetak.html'), 'w', encoding='utf-8').write(album)
print('album bytes', len(album.encode()))
