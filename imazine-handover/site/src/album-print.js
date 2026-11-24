/* ---------- Album cetak (admin) ------------------------------------------------
   Menyusun ulang album pesanan dari data pesanan + template, memakai renderPage()
   yang sama dengan yang dilihat pembeli, satu halaman A4 per lembar, lalu disimpan
   sebagai PDF lewat dialog cetak browser.
   Dibuka dari /imazine/admin/pesanan/{no}/album (wajib login admin).
   Data: {base}/data.json. Foto ukuran cetak: {base}/cetak/{idx}.
--------------------------------------------------------------------------- */
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var NO = (location.pathname.match(/\/pesanan\/(IMZ-[A-Z0-9]{6})\/album/) || [])[1];
var BASE = '/imazine/admin/pesanan/' + NO;
var LOAD_AT_ONCE = 3;   /* foto diproses server satu per satu (diperkecil ke ukuran cetak); jangan banjiri hosting */

var ui = { bar: $('#bar'), title: $('#t'), meta: $('#m'), prog: $('#prog'), warn: $('#warn'), save: $('#save'), cover: $('#with-cover'), book: $('#book') };

function asObj(v) {   /* PHP mengubah {} menjadi [] dan {"0":..} menjadi list; keduanya tetap bisa diindeks angka */
  var o = {};
  if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { if (v[k] != null) o[k] = v[k]; });
  return o;
}

function buildAlbum(order) {
  var tpl = IMZ_TPL[order.template];
  if (!tpl) throw new Error('Template "' + order.template + '" tidak dikenal.');
  var photos = (order.photos || []).map(function (p) {
    return { url: BLANK, w: p.width || 1, h: p.height || 1, date: p.date ? new Date(p.date + 'T00:00:00') : null };
  });
  var pages = tpl.pages.map(function (P, pi) {
    var pg = (order.pages || [])[pi] || {}, caps = asObj(pg.captions), cp = {};
    /* Keterangan tersimpan sudah final (termasuk tanggal otomatis). Yang tidak ada berarti sengaja kosong. */
    P.cp.forEach(function (c, i) { cp[i] = caps[i] != null ? String(caps[i]) : ''; });
    return {
      slots: P.ph.map(function (g, k) {
        var s = (pg.slots || [])[k] || {};
        var ok = s.photo != null && photos[s.photo];
        return { photo: ok ? s.photo : null, fx: s.focusX != null ? +s.focusX : 0.5, fy: s.focusY != null ? +s.focusY : 0.5, z: s.zoom ? +s.zoom : 1, g: Array.isArray(s.box) && s.box.length === 4 ? s.box.map(Number) : undefined };
      }),
      tx: asObj(pg.texts), pa: asObj(pg.paragraphs), cp: cp, mv: asObj(pg.moves), z: asObj(pg.layers), fmt: asObj(pg.styles)
    };
  });
  return { tpl: tpl, photos: photos, pages: pages };
}

function coverEl(order) {
  var cat = catOf(order.category);
  var cv = cat ? coverOf(cat, order.cover) : null;
  if (!cv) return null;
  if (cv.mag) { var mi = new Image(); mi.src = BASE + '/sampul'; mi.alt = ''; return mi; }   /* render Full HD dari server */
  if (cv.img) { var im = new Image(); im.src = IMZ_IMG[cv.img]; im.alt = ''; return im; }
  var t = document.createElement('template');
  t.innerHTML = stampCover(cv.name, (cat.id === 'travel' ? cv.g : cat.name) + ' · 2026', ART[cv.art]);
  return t.content.firstElementChild;
}

function leaf(label, sheet, cls) {
  var l = h('section', 'leaf' + (cls ? ' ' + cls : ''));
  l.appendChild(h('p', 'lb', label));
  l.appendChild(sheet);
  return l;
}

function render(order, album) {
  var coverLeaf = null, cv = coverEl(order);
  if (cv) {
    var cs = h('div', 'sheet cover'); cs.appendChild(cv);
    coverLeaf = leaf('Sampul (pratinjau, bukan file cetak sampul)', cs, 'leaf-cover');
  }
  var frag = document.createDocumentFragment();
  album.pages.forEach(function (st, pi) {
    var P = album.tpl.pages[pi];
    var pg = renderPage(album, pi, 'view');
    /* tandai tiap gambar dengan nomor fotonya; urutan .slot = urutan layer angka di template */
    var ks = P.ly.filter(function (l) { return typeof l === 'number'; });
    Array.prototype.forEach.call(pg.querySelectorAll('.slot'), function (slot, j) {
      var im = slot.querySelector('img'), s = st.slots[ks[j]];
      if (im && s && s.photo != null) { im.dataset.ph = s.photo; im.decoding = 'sync'; }
    });
    var sh = h('div', 'sheet'); sh.appendChild(pg);
    frag.appendChild(leaf('Halaman ' + (pi + 1), sh));
  });
  ui.book.textContent = '';
  ui.book.appendChild(frag);
  function syncCover() {
    if (!coverLeaf) return;
    /* dilepas dari DOM (bukan display:none) supaya tidak ada halaman kosong di awal PDF */
    if (ui.cover.checked) ui.book.insertBefore(coverLeaf, ui.book.firstChild);
    else if (coverLeaf.parentNode) coverLeaf.parentNode.removeChild(coverLeaf);
  }
  if (!coverLeaf) { ui.cover.checked = false; ui.cover.disabled = true; }
  ui.cover.addEventListener('change', syncCover);
  syncCover();
}

function loadOne(idx, tries) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error('gagal')); };
    im.src = BASE + '/cetak/' + idx + (tries ? '?r=' + tries : '');
  }).catch(function (e) {
    if (tries >= 2) throw e;
    return new Promise(function (r) { setTimeout(r, 1500 * (tries + 1)); }).then(function () { return loadOne(idx, tries + 1); });
  });
}

function loadPhotos(album) {
  var used = [], seen = {};
  album.pages.forEach(function (pg) { pg.slots.forEach(function (s) { if (s.photo != null && !seen[s.photo]) { seen[s.photo] = 1; used.push(s.photo); } }); });
  var done = 0, failed = [], odd = [], next = 0;
  function show() { ui.prog.textContent = 'Memuat foto ukuran cetak: ' + done + ' dari ' + used.length + (failed.length ? ' (' + failed.length + ' gagal)' : ''); }
  show();
  function worker() {
    if (next >= used.length) return Promise.resolve();
    var idx = used[next++];
    return loadOne(idx, 0).then(function (im) {
      var p = album.photos[idx];
      p.url = im.src;
      /* rasio harus sama dengan yang dilihat pembeli, kalau tidak crop-nya bergeser (mis. orientasi EXIF tidak terbaca) */
      var a = im.naturalWidth / im.naturalHeight, b = p.w / p.h;
      if (Math.abs(Math.log(a / b)) > 0.03) odd.push(idx + 1);
      Array.prototype.forEach.call(ui.book.querySelectorAll('img[data-ph="' + idx + '"]'), function (el) { el.src = im.src; });
    }, function () { failed.push(idx + 1); }).then(function () { done++; show(); return worker(); });
  }
  var workers = [];
  for (var i = 0; i < LOAD_AT_ONCE; i++) workers.push(worker());
  return Promise.all(workers).then(function () { return { used: used.length, failed: failed.sort(function (a, b) { return a - b; }), odd: odd.sort(function (a, b) { return a - b; }) }; });
}

function fail(msg) {
  ui.prog.textContent = '';
  ui.warn.hidden = false;
  ui.warn.textContent = msg;
}

function boot() {
  if (!NO) return fail('Alamat halaman tidak dikenal.');
  document.title = NO + ' album';
  $('#back').href = BASE;
  fetch(BASE + '/data.json', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
    if (r.status === 401) throw new Error('Sesi admin habis. Masuk lagi di /imazine/admin, lalu buka halaman ini lagi.');
    if (!r.ok) throw new Error('Data pesanan tidak bisa dibuka (HTTP ' + r.status + ').');
    return r.json();
  }).then(function (order) {
    var album = buildAlbum(order);
    var cat = catOf(order.category), lay = LAYOUTS[order.template];
    ui.title.textContent = 'Album ' + NO;
    ui.meta.textContent = [order.coverName ? 'Sampul ' + order.coverName : '', lay ? lay.name : order.template, album.pages.length + ' halaman A4', cat ? cat.name : '', order.status === 'lunas' ? 'lunas' : 'BELUM LUNAS'].filter(Boolean).join(' · ');
    render(order, album);
    return loadPhotos(album).then(function (r) {
      return (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { return r; });
    });
  }).then(function (r) {
    var notes = [];
    if (r.failed.length) notes.push('Foto nomor ' + r.failed.join(', ') + ' gagal dimuat dan akan kosong di PDF. Muat ulang halaman untuk mencoba lagi.');
    if (r.odd.length) notes.push('Foto nomor ' + r.odd.join(', ') + ' rasionya berbeda dari yang dilihat pembeli (mungkin orientasi foto). Periksa halamannya sebelum dicetak.');
    ui.prog.textContent = r.used + ' foto dimuat. Siap disimpan.';
    if (notes.length) { ui.warn.hidden = false; ui.warn.textContent = notes.join(' '); }
    ui.save.disabled = false;
  }).catch(function (e) { fail(e.message || String(e)); });
}

/* Petunjuk simpan PDF sesuai perangkat. iPadOS mengaku Mac, jadi dikenali dari layar sentuhnya. */
function setupHow() {
  var ua = navigator.userAgent, how = $('#how'), t = $('#how-t');
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  /* Safari di Mac: halaman dan foto tampil benar di layar, tapi "Simpan sebagai PDF" di Safari membuat sebagian halaman
     kosong secara acak (IMZ-BL39KY, 24 Nov 2026; Chrome mencetak data yang sama lengkap). Arahkan ke Chrome/Edge. */
  SAFARI_MAC = !ios && /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Firefox/.test(ua);
  var heavy = ' Album ini berisi banyak foto ukuran cetak, jadi HP atau tablet bisa kehabisan memori saat membuat PDF. Kalau gagal atau ada halaman kosong, buat PDF-nya dari komputer.';
  if (ios) t.innerHTML = 'Ketuk <b>Simpan sebagai PDF</b>. Di layar <b>Opsi Cetak</b>, ketuk ikon <b>Bagikan</b> (kotak dengan panah ke atas) lalu pilih <b>Simpan ke File</b>. Kalau ada pilihan ukuran kertas, pilih <b>A4</b>.' + heavy;
  else if (android) t.innerHTML = 'Ketuk <b>Simpan sebagai PDF</b>. Di layar cetak, pilih printer <b>Simpan sebagai PDF</b> di bagian atas, ukuran kertas <b>A4</b>, lalu ketuk tombol <b>PDF</b>.' + heavy;
  /* di layar lebar petunjuknya langsung terbuka; di layar kecil dilipat supaya halaman album cepat terlihat */
  how.open = !ios && !android && matchMedia('(min-width: 1025px) and (min-height: 601px)').matches;
  if (SAFARI_MAC) {
    var w = document.createElement('div'); w.className = 'safari';
    w.innerHTML = '<p><b>Jangan simpan PDF dari Safari.</b> Safari sering membuat sebagian halaman album ini kosong di PDF, walaupun di layar terlihat lengkap. Buka halaman ini di <b>Google Chrome</b> atau <b>Microsoft Edge</b>, lalu simpan PDF dari sana.</p>';
    var cp = document.createElement('button'); cp.type = 'button'; cp.className = 'btn btn-line'; cp.textContent = 'Salin link halaman ini';
    cp.addEventListener('click', function () {
      var done = function () { cp.textContent = 'Link tersalin. Tempel di Chrome atau Edge.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () { prompt('Salin link ini:', location.href); });
      else prompt('Salin link ini:', location.href);
    });
    w.appendChild(cp);
    $('#bar').appendChild(w);
    ui.save.textContent = 'Simpan PDF di Safari (tidak disarankan)';
  }
}
var SAFARI_MAC = false;

setupHow();
ui.save.addEventListener('click', function () {
  if (SAFARI_MAC && !confirm('Di Safari, sebagian halaman PDF bisa kosong. Sebaiknya simpan dari Chrome atau Edge. Tetap lanjut di Safari?')) return;
  window.print();
});
document.body.insertAdjacentHTML('beforeend', stampDefs());
boot();
