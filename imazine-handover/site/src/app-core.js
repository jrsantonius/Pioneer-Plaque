/* ---------- catalogue ---------- */
var PRICE = 250000, PRICE_NORMAL = 350000;   /* nilai asli dari server: /api/imazine/config (harga launching; harga normal dicoret) */
var CATS = [
  { id: 'travel', name: 'Travel', desc: 'Holidays, road trips, and cities you want to remember.',
    cover: { id: 'bali-2026', name: 'Bali 2026', img: 'bali', back: 'bali_back', bg: '#8ad1cd', g: 'Indonesia', note: 'Pantai dan kaki di pasir' },
    layouts: ['travel-1-scattered-street-notes', 'travel-2-staircase-frames', 'travel-3-postage-doodles', 'travel-4-chapter-index'],
    groups: [
      { g: 'Magazine Cover', mag: true, items: [] },
      { g: 'Indonesia', items: ['Yogyakarta', 'Bandung', 'Lombok', 'Labuan Bajo', 'Bromo', 'Raja Ampat', 'Danau Toba', 'Malang', 'Belitung', 'Jakarta', 'Sumba', 'Dieng'] },
      { g: 'Mancanegara', items: ['Jepang', 'Korea Selatan', 'Singapura', 'Thailand', 'Malaysia', 'Vietnam', 'Hong Kong', 'Tiongkok', 'Umrah & Haji', 'Turki', 'Dubai', 'Paris', 'London', 'Swiss', 'Belanda', 'Italia', 'Australia', 'Selandia Baru'] }
    ] },
  { id: 'event', name: 'Event', desc: 'Big days that only come once: birthdays, weddings, graduations.',
    cover: { id: 'journey-to-one', name: 'Journey to One', img: 'journey', back: null, bg: '#f7c8b8', g: 'Keluarga', note: 'Kue dengan lilin angka satu' },
    layouts: ['event-1-classic-frame', 'event-2-gallery-story', 'event-3-monochrome-story', 'event-4-chapter-spread'],
    groups: [
      { g: 'Magazine Cover', mag: true, items: [] },
      { g: 'Keluarga', items: ['Ulang tahun anak', 'Sweet seventeen', 'Kelahiran & aqiqah', 'Maternity', 'Tedak siten', 'Khitanan', 'Ulang tahun orang tua'] },
      { g: 'Pasangan', items: ['Pernikahan', 'Lamaran', 'Prewedding', 'Anniversary', 'Bridal shower'] },
      { g: 'Perayaan', items: ['Wisuda', 'Lebaran', 'Natal & tahun baru', 'Imlek', 'Reuni', 'Perpisahan sekolah', 'Gathering kantor', 'Konser & festival'] }
    ] },
  { id: 'sol', name: 'Slice of Life', desc: 'Ordinary days that turn out to be the ones you miss most.',
    cover: { id: 'slice-of-life', name: 'Slice of Life', img: 'sol', back: null, bg: '#fef9e6', g: 'Keseharian', note: 'Dua kuntum bunga' },
    layouts: ['sol-1-postcard-notes', 'sol-2-editorial-magazine', 'sol-3-pressed-taped', 'sol-4-quiet-letters'],
    groups: [
      { g: 'Magazine Cover', mag: true, items: [] },
      { g: 'Orang terdekat', items: ['Keluarga', 'Tumbuh kembang anak', 'Sahabat', 'Pasangan', 'Kakek & nenek', 'Anabul'] },
      { g: 'Keseharian', items: ['Rumah', 'Kuliner & ngopi', 'Kampus & kost', 'Kantor', 'Akhir pekan', 'Rekap setahun'] },
      { g: 'Hobi', items: ['Lari & sepeda', 'Mendaki', 'Berkebun', 'Masak', 'Musik', 'Jurnal diri'] }
    ] }
];
/* Every cover of a theme, shelf by shelf. The photo cover opens its own shelf; the stamp covers are drawn
   from covers/art.js (ART) by covers/stamp.js + covers/scene.js, and COVER_NOTE holds the motif of each one. */
function fold(t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function slug(t) { return fold(t).replace(/&/g, ' dan ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
/* Cover Majalah: the buyer's own photo becomes a magazine cover. Four looks; the renderer lives in magcover.js
   (the print album page only needs this data, so the order of a magazine cover can still be found by id). */
var MAG_ORDER = ['noir', 'biru', 'krem', 'lukis', 'segar'];
var MAG_STYLES = {
  noir:  { name: 'Noir Magazine',   note: 'Black and white, crayon title', bg: '#ebebe7', ink: '#111111' },
  biru:  { name: 'Blue Magazine',   note: 'Blue with a bold title', bg: '#5c7aa6', ink: '#ffffff' },
  krem:  { name: 'Cream Magazine',   note: 'Cream paper, framed photo', bg: '#ece7dc', ink: '#141414' },
  lukis: { name: 'Painted Magazine',  note: 'Painted look on green', bg: '#128037', ink: '#ffffff' },
  segar: { name: 'Fresh Magazine',  note: 'Bright green, title behind the head', bg: '#9ede45', ink: '#ffffff' }
};
var ILLU_G = 'Cover ilustrasi';   /* rak untuk sampul gambar bawaan tema (Bali 2026, Journey to One, Slice of Life) */
function coversOf(cat) {
  if (cat.covers) return cat.covers;
  var list = [];
  cat.groups.forEach(function (gr) {
    if (gr.mag) {
      MAG_ORDER.forEach(function (k) { var m = MAG_STYLES[k]; list.push({ id: 'mag-' + k, name: m.name, g: gr.g, mag: k, note: m.note, bg: m.bg }); });
      return;
    }
    if (gr.g === cat.cover.g) list.push({ id: cat.cover.id, name: cat.cover.name, g: ILLU_G, img: cat.cover.img, back: cat.cover.back, bg: cat.cover.bg, note: cat.cover.note });
    gr.items.forEach(function (n) {
      var art = ART[n], pal = art && PAL[art.p];
      if (!art) return;
      list.push({ id: slug(n), name: n, g: gr.g, art: n, note: COVER_NOTE[n] || '', bg: pal.out });
    });
  });
  return (cat.covers = list);
}
/* Sampul yang bisa dipilih pembeli. Sampul perangko (art) dihapus dari pilihan per review 18 Nov 2026, tapi datanya tetap
   ada di coversOf supaya halaman album admin masih bisa menampilkan pesanan lama yang memakai sampul perangko. */
function pickableCovers(cat) { return coversOf(cat).filter(function (c) { return c.mag; }); }   /* review 20 Nov 2026: hanya Cover Majalah; sampul ilustrasi (Bali 2026 dll.) tetap ada di data untuk pesanan lama */
function coverOf(cat, id) { var l = coversOf(cat); return l.filter(function (c) { return c.id === id; })[0] || l.filter(function (c) { return c.id === cat.cover.id; })[0]; }
var LAYOUTS = {
  'travel-1-scattered-street-notes': { name: 'Scattered Street Notes', desc: 'Photos scattered like travel notes, with a big title for each section.' },
  'travel-2-staircase-frames': { name: 'Staircase Frames', desc: 'Frames that step down like stairs. Holds the most photos.' },
  'travel-3-postage-doodles': { name: 'Postage Doodles', desc: 'Stamps, tilted polaroids, and lively red doodles.' },
  'travel-4-chapter-index': { name: 'Chapter Index', desc: 'Split into chapters with big numbers, neat like a travel magazine.' },
  'sol-1-postcard-notes': { name: 'Postcard Notes', desc: 'Postcards and short notes for ordinary days.' },
  'sol-2-editorial-magazine': { name: 'Editorial Magazine', desc: 'A magazine layout with warm colors and italic titles.' },
  'sol-3-pressed-taped': { name: 'Pressed & Taped', desc: 'Photos taped down, like a handmade scrapbook.' },
  'sol-4-quiet-letters': { name: 'Quiet Letters', desc: 'Lots of lines to write on, good if you like telling stories.' },
  'event-1-classic-frame': { name: 'Classic Frame', desc: 'Classic frames and serif titles for formal moments.' },
  'event-2-gallery-story': { name: 'Gallery Story', desc: 'Like a gallery catalog: numbered photos with captions.' },
  'event-3-monochrome-story': { name: 'Monochrome Story', desc: 'A soft gray background with calm, dark frames.' },
  'event-4-chapter-spread': { name: 'Chapter Spread', desc: 'A story in chapters with big numbers and full-width photos.' }
};
function catOf(id) { return CATS.filter(function (c) { return c.id === id; })[0]; }
function slotCount(tplId) { return IMZ_TPL[tplId].pages.reduce(function (n, p) { return n + p.ph.length; }, 0); }

/* ---------- small utilities ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
var MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function months() { return typeof LANG !== 'undefined' && LANG === 'id' ? MONTHS_ID : MONTHS_EN; }
function fmtDate(d) { return d.getDate() + ' ' + months()[d.getMonth()] + ' ' + d.getFullYear(); }
function rupiah(n) { return 'Rp' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
/* (12) bind the closing words (about 18 characters of them) so a line never ends on a lone short word */
function noWidow(s) {
  var w = s.split(' ');
  if (w.length < 4) return s;
  var tail = w.pop(), n = 1;
  while (w.length > 2 && n < 4 && tail.length < 18) { tail = w.pop() + '\u00a0' + tail; n++; }
  return w.join(' ') + ' ' + tail;
}
var WIDOW_SEL = 'p, li, dd, summary, h1, h2, h3, .theme-desc, .pick-desc, .pick-meta, .tip, .hint, .err, .dlg-p, .dlg-h, .drop-or, .setup-pick, .st-note p, .tf-h';
function fixWidows(root) {
  $$(WIDOW_SEL, root || document).forEach(function (el) {
    if (el.closest('.pg, pre, [data-nowidow]')) return;
    var last = null, walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) last = walk.currentNode;
    if (!last || el.textContent.trim().split(/ +/).length < 4) return;
    var v = last.nodeValue, trail = v.match(/\s*$/)[0], core = v.slice(0, v.length - trail.length);
    if (core.indexOf('\u00a0') > -1 && core.lastIndexOf('\u00a0') > core.lastIndexOf(' ')) return;
    var lead = core.match(/^\s*/)[0];
    var fixed = noWidow(core.trim());
    if (fixed !== core.trim()) last.nodeValue = lead + fixed + trail;
  });
}
function icon(name) {
  var s = document.createElementNS(SVGNS, 'svg'), u = document.createElementNS(SVGNS, 'use');
  s.setAttribute('class', 'ic'); s.setAttribute('aria-hidden', 'true');
  u.setAttribute('href', '#i-' + name); s.appendChild(u);
  return s;
}

/* ---------- photo dates: EXIF first, then the file name ---------- */
function readExifDate(buf) {
  try {
    var v = new DataView(buf);
    if (v.getUint16(0) !== 0xFFD8) return null;
    var off = 2;
    while (off + 4 < v.byteLength) {
      var marker = v.getUint16(off), size = v.getUint16(off + 2);
      if ((marker & 0xFF00) !== 0xFF00) return null;
      if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return tiffDate(v, off + 10);
      off += 2 + size;
    }
  } catch (e) { /* truncated or odd file: fall through */ }
  return null;
}
function tiffDate(v, t) {
  var le = v.getUint16(t) === 0x4949;
  function u16(o) { return v.getUint16(o, le); }
  function u32(o) { return v.getUint32(o, le); }
  function find(o, tags) {
    var n = u16(o), out = {};
    for (var i = 0; i < n; i++) { var e = o + 2 + i * 12, tag = u16(e); if (tags.indexOf(tag) > -1) out[tag] = e; }
    return out;
  }
  function str(e) {
    var cnt = u32(e + 4), p = cnt > 4 ? t + u32(e + 8) : e + 8, s = '';
    for (var i = 0; i < cnt; i++) { var ch = v.getUint8(p + i); if (ch) s += String.fromCharCode(ch); }
    return s;
  }
  var a = find(t + u32(t + 4), [0x8769, 0x0132]), raw = null;
  if (a[0x8769]) {
    var b = find(t + u32(a[0x8769] + 8), [0x9003, 0x9004]);
    raw = b[0x9003] ? str(b[0x9003]) : b[0x9004] ? str(b[0x9004]) : null;
  }
  if (!raw && a[0x0132]) raw = str(a[0x0132]);
  var m = raw && raw.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m || +m[1] < 1990) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
}
function dateFromName(name) {
  var m = name.match(/(20\d{2})[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])(?!\d)/);
  if (!m) return null;
  var d = new Date(+m[1], +m[2] - 1, +m[3], 12);
  return d.getFullYear() <= new Date().getFullYear() + 1 ? d : null;
}

/* ---------- photo intake ---------- */
/* Foto album di browser hanya untuk menyusun dan preview: cukup 1600 px, tanpa dinaikkan atau dipertajam (itu berat di HP).
   File cetak tetap dibuat dari foto asli yang dikirim ke server. */
var PHOTO_MAX = 1600, THUMB_MAX = 320, INTAKE_LIMIT = 240;
function canvasBlob(img, max, q, up) {
  return new Promise(function (res) {
    var c;
    if (up && typeof magScale === 'function') c = magScale(img, max);   /* Full HD: naik atau turun ke 'max', dengan penajaman bila dinaikkan */
    else {
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.min(1, max / Math.max(iw, ih));
      c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(iw * k));
      c.height = Math.max(1, Math.round(ih * k));
      var x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
    }
    c.toBlob(function (b) { res({ blob: b, w: c.width, h: c.height, canvas: c }); }, 'image/jpeg', q);
  });
}
function loadImg(url) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = rej;
    im.src = url;
  });
}
/* ---------- HEIC / HEIF (iPhone photos) ----------
   Only Safari opens HEIC by itself. Every other browser gets libheif (heic-to 1.6.7, self-hosted in
   public/imazine/vendor/heic, ~3 MB, ~0.8 MB over the wire), loaded only when the first HEIC photo arrives.
   Every HEIC photo, in every browser, becomes a JPEG (quality .92, long side at most 4032 px, which is more than A4 at 300 dpi)
   and THAT file goes to the server: the print team and the admin album page can always open it, HEIC or not.
   One photo at a time: a 12 MP decode takes a lot of memory on a phone. */
var HEIC_SRC = ['/public/imazine/vendor/heic/heic-to.js', 'https://cdn.jsdelivr.net/npm/heic-to@1.6.7/dist/iife/heic-to.js'];
var HEIC_MAX = 4032, HEIC_Q = 0.92, heicLib = null, heicQueue = Promise.resolve();
function isHeic(head, file) {
  var b = new Uint8Array(head, 0, Math.min(12, head.byteLength)), s = String.fromCharCode.apply(null, b);
  if (s.slice(4, 8) === 'ftyp') return /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1|heif)/.test(s.slice(8, 12));
  return /\.(heic|heif)$/i.test(file.name || '') || /^image\/hei[cf]/i.test(file.type || '');
}
/* EXIF inside a HEIC: find the "Exif\0\0" block and its TIFF header in the first bytes, read the date the same way as a JPEG */
function heicExifDate(buf) {
  try {
    var u = new Uint8Array(buf), v = new DataView(buf);
    for (var i = 0; i + 10 < u.length; i++) {
      if (u[i] === 0x45 && u[i + 1] === 0x78 && u[i + 2] === 0x69 && u[i + 3] === 0x66 && u[i + 4] === 0 && u[i + 5] === 0 &&
          ((u[i + 6] === 0x4D && u[i + 7] === 0x4D) || (u[i + 6] === 0x49 && u[i + 7] === 0x49))) return tiffDate(v, i + 6);
    }
  } catch (e) { /* no date */ }
  return null;
}
function loadScript(src) {
  return new Promise(function (res, rej) {
    var s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = res; s.onerror = function () { s.remove(); rej(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
}
function heicReady() {
  if (!heicLib) heicLib = HEIC_SRC.reduce(function (p, src) {
    return p.catch(function () { return loadScript(src).then(function () { if (typeof window.HeicTo !== 'function') throw new Error('HeicTo missing'); return window.HeicTo; }); });
  }, Promise.reject()).catch(function (e) { heicLib = null; throw e; });   /* failed: try again on the next photo */
  return heicLib;
}
function jpegOf(src, w, h) {
  var k = Math.min(1, HEIC_MAX / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
  var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
  return new Promise(function (res, rej) { c.toBlob(function (b) { c.width = c.height = 0; if (b) res(b); else rej(new Error('JPEG failed')); }, 'image/jpeg', HEIC_Q); });
}
function heicToJpeg(file) {
  var run = heicQueue.then(async function () {
    var blob, u = URL.createObjectURL(file);
    try { var img = await loadImg(u); blob = await jpegOf(img, img.naturalWidth, img.naturalHeight); }   /* Safari */
    catch (e) {
      var bmp = await (await heicReady())({ blob: file, type: 'bitmap' });
      try { blob = await jpegOf(bmp, bmp.width, bmp.height); } finally { if (bmp.close) bmp.close(); }
    } finally { URL.revokeObjectURL(u); }
    var name = (file.name || 'foto').replace(/\.(heic|heif)$/i, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified || Date.now() });
  });
  heicQueue = run.catch(function () {});
  return run;
}
async function intakeOne(file) {
  var head = await file.slice(0, 262144).arrayBuffer(), heic = isHeic(head, file);
  var date = (heic ? heicExifDate(head) : readExifDate(head)) || dateFromName(file.name || '');
  if (heic) file = await heicToJpeg(file);
  var src = URL.createObjectURL(file);
  try {
    var img = await loadImg(src);
    var big = await canvasBlob(img, PHOTO_MAX, 0.85);
    var small = await canvasBlob(big.canvas, THUMB_MAX, 0.8);   /* dari versi kecil: jauh lebih cepat daripada dari foto asli */
    big.canvas.width = big.canvas.height = 0;   /* lepaskan memori kanvas segera (penting di HP) */
    return { url: URL.createObjectURL(big.blob), thumb: URL.createObjectURL(small.blob), w: big.w, h: big.h, date: date, name: file.name || 'foto', dated: date ? 'file' : null, file: file };
  } finally { URL.revokeObjectURL(src); }
}
async function intake(files, onStep) {
  var list = Array.prototype.slice.call(files).slice(0, INTAKE_LIMIT), out = [], failed = 0, done = 0, next = 0;
  async function worker() {
    while (next < list.length) {
      var i = next++;
      try { out[i] = await intakeOne(list[i]); } catch (e) { failed++; }
      onStep(++done, list.length);
    }
  }
  var nw = (navigator.hardwareConcurrency || 4) <= 4 ? 2 : 3;   /* HP murah: dua sekaligus supaya tidak macet */
  var ws = []; for (var w = 0; w < nw; w++) ws.push(worker());
  await Promise.all(ws);
  return { photos: out.filter(Boolean), failed: failed, skipped: Math.max(0, files.length - list.length) };
}
/* Sample pictures drawn on a canvas, so the flow can be tried without real photos. */
function samplePhotos(n) {
  var skies = [['#f7c59f', '#e4883a'], ['#bfe3df', '#3e787b'], ['#f9e2b6', '#e25a3c'], ['#d9e8c5', '#5f8f6b'], ['#f3d1dc', '#b65a7a'], ['#cfd9f0', '#51649c']];
  var shapes = [[4, 3], [3, 4], [1, 1], [3, 2], [4, 5], [16, 9], [2, 3]];
  var jobs = [];
  for (var i = 0; i < n; i++) (function (i) {
    var sh = shapes[i % shapes.length], w = sh[0] >= sh[1] ? 1200 : Math.round(1200 * sh[0] / sh[1]), hh = sh[0] >= sh[1] ? Math.round(1200 * sh[1] / sh[0]) : 1200;
    var c = document.createElement('canvas'); c.width = w; c.height = hh;
    var x = c.getContext('2d'), sk = skies[(i * 5 + 2) % skies.length];
    var g = x.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]);
    x.fillStyle = g; x.fillRect(0, 0, w, hh);
    x.fillStyle = 'rgba(255,250,235,.85)'; x.beginPath(); x.arc(w * (0.2 + (i * 37 % 60) / 100), hh * (0.22 + (i * 13 % 20) / 100), Math.min(w, hh) * 0.09, 0, 7); x.fill();
    for (var k = 0; k < 3; k++) {
      x.fillStyle = 'rgba(25,27,10,' + (0.16 + k * 0.14) + ')';
      x.beginPath(); x.moveTo(0, hh);
      for (var px = 0; px <= w; px += w / 24) x.lineTo(px, hh * (0.58 + k * 0.12) + Math.sin(px / w * (5 + k * 2) + i * 1.7 + k) * hh * 0.06);
      x.lineTo(w, hh); x.closePath(); x.fill();
    }
    jobs.push(new Promise(function (res) {
      c.toBlob(function (b) {
        var t = document.createElement('canvas'), kk = THUMB_MAX / Math.max(w, hh);
        t.width = Math.round(w * kk); t.height = Math.round(hh * kk);
        t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
        t.toBlob(function (tb) {
          var d = new Date(2026, 6, 12 + Math.floor(i / Math.max(1, Math.ceil(n / 7))), 8 + (i % 9), (i * 7) % 60);
          res({ url: URL.createObjectURL(b), thumb: URL.createObjectURL(tb), w: w, h: hh, date: d, name: 'contoh-' + (i + 1) + '.jpg', sample: true, file: b });
        }, 'image/jpeg', 0.8);
      }, 'image/jpeg', 0.86);
    }));
  })(i);
  return Promise.all(jobs);
}

/* ---------- album model ---------- */
/* Elemen tambahan pembeli (26 Nov 2026, tombol "Add a text" / "Add a photo"): album.pages[pi].add = { tx: [teks], ph: [bingkai] }.
   Halaman template milik album ini = halaman dasar + tambahan di belakangnya, jadi renderer, geser, resize, gaya teks,
   tumpukan, pratinjau, PDF admin, dan edit admin bekerja tanpa jalur khusus. Indeks elemen dasar tidak pernah bergeser. */
var ADD_HINT = 'Edit here';
function normAdd(a) {
  if (!a || typeof a !== 'object') return null;
  var num = function (v, d) { v = +v; return isFinite(v) ? v : d; };
  var tx = (Array.isArray(a.tx) ? a.tx : []).filter(function (d) { return d && typeof d === 'object'; }).map(function (d) {
    return { x: num(d.x, 100), y: num(d.y, 700), z: Math.min(Math.max(num(d.z, 36), 8), 400), f: typeof d.f === 'string' ? d.f : 'm', c: typeof d.c === 'string' ? d.c : '#2b2b2b', a: d.a === 'c' || d.a === 'r' ? d.a : 'l' };
  });
  var ph = (Array.isArray(a.ph) ? a.ph : []).filter(function (g) { return Array.isArray(g) && g.length >= 4; }).map(function (g) {
    return [num(g[0], 300), num(g[1], 500), Math.max(num(g[2], 360), 40), Math.max(num(g[3], 270), 40), 0];
  });
  return tx.length || ph.length ? { tx: tx, ph: ph } : null;
}
function composePage(base, add) {
  if (!add) return base;
  var n = base.ph.length;
  return { bg: base.bg, pa: base.pa, cp: base.cp, base: n, baseTx: base.tx.length,
    ph: base.ph.concat(add.ph),
    tx: base.tx.concat(add.tx.map(function (d) { return { x: d.x, y: d.y, z: d.z, f: d.f, c: d.c, a: d.a, k: 'e', add: 1, hint: ADD_HINT }; })),
    ly: base.ly.concat(add.ph.map(function (g, j) { return n + j; })) };
}
function albumTpl(id) { var b = IMZ_TPL[id], o = {}; for (var k in b) o[k] = b[k]; o.key = id; o.pages = b.pages.slice(); return o; }
function applyAdds(album, pi) { album.tpl.pages[pi] = composePage(IMZ_TPL[album.tpl.key].pages[pi], album.pages[pi].add || null); }
/* dari data pesanan (admin, PDF): pasang tambahan halaman dan siapkan slot kosong untuk bingkainya */
function restoreAdds(album, pi, raw) {
  var add = normAdd(raw), st = album.pages[pi];
  st.add = add || undefined;
  if (add) add.ph.forEach(function () { st.slots.push({ photo: null, fx: 0.5, fy: 0.5, z: 1 }); });
  applyAdds(album, pi);
}
function newAlbum(tplId, photos) {
  var tpl = albumTpl(tplId);
  return { tpl: tpl, photos: photos, pages: tpl.pages.map(function (p) {
    return { slots: p.ph.map(function () { return { photo: null, fx: 0.5, fy: 0.5, z: 1 }; }), tx: {}, pa: {}, cp: {}, mv: {}, z: {}, fmt: {} };
  }) };
}
function defaultFocus(photo, g) { return { fx: 0.5, fy: photo.w / photo.h < g[2] / g[3] ? 0.38 : 0.5, z: 1 }; }
function setSlot(album, pi, si, photoIdx) {
  var s = album.pages[pi].slots[si];
  s.photo = photoIdx;
  if (photoIdx != null) { var f = defaultFocus(album.photos[photoIdx], slotGeo(album, pi, si)); s.fx = f.fx; s.fy = f.fy; s.z = 1; }
}
function byDate(photos, idxs) {
  return idxs.slice().sort(function (a, b) {
    var da = photos[a].date, db = photos[b].date;
    if (da && db) return da - db || a - b;
    if (da) return -1;
    if (db) return 1;
    return a - b;
  });
}
/* Pour photos into empty slots in page order. Inside one page, pair each slot
   with the photo whose shape fits it best, so less of the picture is cropped. */
function pourPhotos(album, idxs) {
  var queue = byDate(album.photos, idxs), placed = 0;
  album.pages.forEach(function (pg, pi) {
    var empties = [];
    pg.slots.forEach(function (s, si) { if (s.photo == null) empties.push(si); });
    if (!empties.length || !queue.length) return;
    var take = queue.splice(0, empties.length), P = album.tpl.pages[pi];
    empties.slice(0, take.length)
      .sort(function (a, b) { return Math.abs(Math.log(P.ph[b][2] / P.ph[b][3])) - Math.abs(Math.log(P.ph[a][2] / P.ph[a][3])); })
      .forEach(function (si) {
        var want = Math.log(P.ph[si][2] / P.ph[si][3]), best = 0, bd = Infinity;
        take.forEach(function (pi2, k) { var d = Math.abs(Math.log(album.photos[pi2].w / album.photos[pi2].h) - want); if (d < bd) { bd = d; best = k; } });
        setSlot(album, pi, si, take.splice(best, 1)[0]);
        placed++;
      });
  });
  return placed;
}
function usage(album) {
  var u = album.photos.map(function () { return 0; });
  album.pages.forEach(function (pg) { pg.slots.forEach(function (s) { if (s.photo != null) u[s.photo]++; }); });
  return u;
}
function emptySlots(album) {
  var out = [];
  album.pages.forEach(function (pg, pi) { pg.slots.forEach(function (s, si) { if (s.photo == null) out.push([pi, si]); }); });
  return out;
}
/* Fill what is still empty by reusing photos: least-used first, never twice on one page when avoidable. */
function refill(album) {
  var u = usage(album), changed = [];
  emptySlots(album).forEach(function (e) {
    var onPage = album.pages[e[0]].slots.map(function (s) { return s.photo; });
    var best = -1;
    album.photos.forEach(function (p, i) {
      var clash = onPage.indexOf(i) > -1;
      if (best < 0) { best = i; return; }
      var bClash = onPage.indexOf(best) > -1;
      if (clash !== bClash ? !clash : u[i] < u[best]) best = i;
    });
    if (best < 0) return;
    setSlot(album, e[0], e[1], best);
    u[best]++;
    changed.push(e);
  });
  return changed;
}
function totals(album) {
  var total = 0, filled = 0, blankText = 0;
  album.pages.forEach(function (pg, pi) {
    var P = album.tpl.pages[pi];
    pg.slots.forEach(function (s) { total++; if (s.photo != null) filled++; });
    P.tx.forEach(function (t, i) { if (t.k === 'e' && !t.add && !pg.tx[i]) blankText++; });   /* teks tambahan yang kosong tidak dicetak, bukan kekurangan */
    P.pa.forEach(function (p, i) { if (!pg.pa[i]) blankText++; });
    P.cp.forEach(function (c, i) { if (c.bar && !captionValue(album, pi, i)) blankText++; });
  });
  return { total: total, filled: filled, empty: total - filled, blankText: blankText };
}
function paraLimit(pa) { var fs = Math.min(pa.lh * 0.52, 46); return Math.max(20, Math.floor(pa.w / (fs * 0.5)) * pa.n); }
function capLimit(cp) { return clamp(Math.floor(cp.w / (cp.z * 0.5)), 12, 60); }
