"""Build the stamp-cover board. Usage: python3 build.py"""
import re, json, os
R = os.path.dirname(os.path.abspath(__file__))
old = open(os.path.join(R, 'board-v1.html'), encoding='utf-8').read()
IMG = re.search(r'var IMG = (\{.*?\}), DATA = ', old, re.S).group(1)
DATA = re.search(r', DATA = (\[.*\]);\n  var papers', old, re.S).group(1)
# motif text follows what was actually drawn
MOTIF = {"Yogyakarta": "Tugu Jogja dan Gunung Merapi", "Labuan Bajo": "Kapal pinisi di perairan Komodo", "Bromo": "Kawah Bromo dan lautan pasir", "Sumba": "Rumah menara Sumba",
 "Korea Selatan": "N Seoul Tower di Bukit Namsan", "Singapura": "Marina Bay dan tiga menaranya", "Thailand": "Wat Arun", "Hong Kong": "Trem tingkat dan gedung malam",
 "Umrah & Haji": "Ka'bah dan menara masjid", "Italia": "Colosseum", "Kelahiran & aqiqah": "Baju bayi dan bulan sabit", "Lamaran": "Kotak cincin", "Prewedding": "Sepeda dan balon hati",
 "Anniversary": "Dua gelas bersulang", "Bridal shower": "Buket bunga", "Lebaran": "Ketupat dan bulan sabit", "Reuni": "Foto kenangan dan bendera almamater", "Konser & festival": "Tiket dan lampu panggung",
 "Kakek & nenek": "Kursi goyang dan benang rajut", "Kuliner & ngopi": "Mangkuk bakso", "Kantor": "Laptop dan kartu identitas", "Akhir pekan": "Tikar dan keranjang piknik",
 "Mendaki": "Puncak gunung dan tenda", "Masak": "Wajan dan telur mata sapi", "Musik": "Gitar dan ampli",
 "Bridal shower": "Vas bunga, kue mangkuk, dan kado", "Kampus & kost": "Ransel, buku, dan mi gelas"}
data = json.loads(DATA)
seen = set()
for c in data:
    for g in c['groups']:
        for it in g['items']:
            if it[0] in MOTIF: it[1] = MOTIF[it[0]]; seen.add(it[0])
assert seen == set(MOTIF), set(MOTIF) - seen
DATA = json.dumps(data, ensure_ascii=False)
# the motif of every cover, for the album site (site/build.py reads it)
notes = {it[0]: it[1] for c in data for g in c['groups'] for it in g['items']}
open(os.path.join(R, 'notes.json'), 'w', encoding='utf-8').write(json.dumps(notes, ensure_ascii=False, indent=0))
stamp = open(os.path.join(R, 'stamp.js'), encoding='utf-8').read()
art = open(os.path.join(R, 'art.js'), encoding='utf-8').read()
scene = open(os.path.join(R, 'scene.js'), encoding='utf-8').read()
grain = open(os.path.join(R, 'grain.txt')).read().strip()
page = open(os.path.join(R, 'board.src.html'), encoding='utf-8').read()
page = page.replace('/*__JS__*/', 'var IMG = %s, DATA = %s;\n%s\n%s\n%s\nGRAIN_URI = "%s";' % (IMG, DATA, stamp, scene, art, grain))
open(os.path.join(R, 'sampul-perangko.html'), 'w', encoding='utf-8').write(page)
local = ''.join('@font-face{font-family:"%s";src:url("/fonts/%s") format("woff2");font-weight:%s}' % f for f in [
    ('Manrope', 'manrope-latin-wght-normal.woff2', '400 800'), ('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400'),
    ('DM Mono', 'dm-mono-latin-400-normal.woff2', '400'), ('DM Mono', 'dm-mono-latin-500-normal.woff2', '500'), ('Bowlby One', 'bowlby-one-latin-400-normal.woff2', '400')])
skel = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%%}[hidden]{display:none!important}%s</style></head><body>' % local
test = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis[^>]*>\n', '', page)
open(os.path.join(R, '..', 'site', 'dist', 'covers-test.html'), 'w', encoding='utf-8').write(skel + test + '</body></html>')
print('bytes', len(page.encode()))
