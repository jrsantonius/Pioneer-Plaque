/* ---------- Admin: edit a submitted order (23 Nov 2026) ----------
   /imazine/admin/pesanan/{no}/edit serves this same page (admin login required). It loads the order (data.json),
   the buyer's photos in print size (/cetak/{idx}) and the original cover photo, rebuilds the album exactly as the
   buyer left it and opens the editor. The team can move and crop photos, fix any text or caption, and change the
   cover style, position and text. Saving writes the order back (the buyer's first version is kept on the server)
   and, for a magazine cover, a fresh Full HD cover render. New photos can't be added here: the order only has the
   photos the buyer uploaded. */
var ADMIN_NO = (location.pathname.match(/^\/imazine\/admin\/pesanan\/(IMZ-[A-Z0-9]{6})\/edit\/?$/) || [])[1] || null;
var ADMIN_BASE = ADMIN_NO ? '/imazine/admin/pesanan/' + ADMIN_NO : '';

function adminObj(v) {   /* PHP turns {} into [] and {"0":..} into a list; both still index by number */
  var o = {};
  if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { if (v[k] != null) o[k] = v[k]; });
  return o;
}
async function adminFetchBlob(url, tries) {
  for (var a = 0; a < (tries || 3); a++) {
    try { var r = await fetch(url + (a ? (url.indexOf('?') > -1 ? '&' : '?') + 'r=' + a : ''), { credentials: 'same-origin' }); if (r.ok) return await r.blob(); if (r.status === 401) throw new Error('login'); }
    catch (e) { if (e.message === 'login') throw e; }
    await new Promise(function (res) { setTimeout(res, 1200 * (a + 1)); });
  }
  throw new Error('gagal');
}
/* One photo for the editor: the print-size file from the server, plus a small thumbnail made here (the shelf and page list stay light). */
async function adminPhoto(i, meta) {
  var blob = await adminFetchBlob(ADMIN_BASE + '/cetak/' + i), url = URL.createObjectURL(blob), im = await loadImg(url);
  var k = THUMB_MAX / Math.max(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.naturalWidth * Math.min(1, k))); c.height = Math.max(1, Math.round(im.naturalHeight * Math.min(1, k)));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  var tb = await new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.8); });
  /* the buyer's crop was set against the shape they saw; keep that shape (the album PDF page does the same) */
  var w = meta.width || im.naturalWidth, hh = meta.height || im.naturalHeight;
  return { url: url, thumb: tb ? URL.createObjectURL(tb) : url, w: w, h: hh, date: meta.date ? new Date(meta.date + 'T00:00:00') : null,
           name: meta.file || ('foto-' + (i + 1) + '.jpg'), dated: meta.date ? 'file' : null, server: i };
}

async function adminBoot() {
  document.documentElement.classList.add('admin-edit');
  document.title = ADMIN_NO + ' · edit album';
  var bar = h('div', 'adm-bar'); bar.setAttribute('role', 'note');
  var back = h('a', null, '← ' + ADMIN_NO); back.href = ADMIN_BASE;
  bar.appendChild(h('b', null, 'Admin mode')); bar.appendChild(document.createTextNode(' · editing a submitted order · ')); bar.appendChild(back);
  document.body.insertBefore(bar, document.body.firstChild);
  var title = $('#busy-t');
  try {
    title.textContent = 'Opening the order…'; busy(true, 0, 0);
    var r = await fetch(ADMIN_BASE + '/data.json', { credentials: 'same-origin', cache: 'no-store' });
    if (r.status === 401) throw new Error('Your admin session has ended. Log in again at /imazine/admin, then open this page again.');
    if (!r.ok) throw new Error('This order couldn’t be opened (HTTP ' + r.status + ').');
    var order = await r.json(), tpl = IMZ_TPL[order.template], cat = catOf(order.category);
    if (!tpl || !cat) throw new Error('This order uses a layout or theme this page doesn’t know.');

    /* photos: three at a time, the server makes each print-size file on first request */
    var metas = order.photos || [], n = metas.length, done = 0, next = 0, out = new Array(n), failed = [];
    title.textContent = 'Loading the buyer’s photos…'; busy(true, 0, n);
    async function worker() {
      while (next < n) {
        var i = next++;
        try { out[i] = await adminPhoto(i, metas[i] || {}); } catch (e) { if (e.message === 'login') throw new Error('Your admin session has ended. Log in again, then open this page again.'); failed.push(i + 1); }
        done++; busy(true, done, n);
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (failed.length) throw new Error('Photos ' + failed.join(', ') + ' couldn’t be loaded. Reload the page to try again.');
    S.photos = out;

    /* the album as the buyer left it */
    S.cat = cat.id; S.layout = order.template; S.cover = order.cover;
    var album = newAlbum(order.template, S.photos);
    album.pages.forEach(function (pg, pi) {
      var src = (order.pages || [])[pi] || {};
      pg.slots.forEach(function (s, k) {
        var o = (src.slots || [])[k] || {}, ok = o.photo != null && S.photos[o.photo];
        s.photo = ok ? o.photo : null; s.fx = o.focusX != null ? +o.focusX : 0.5; s.fy = o.focusY != null ? +o.focusY : 0.5; s.z = o.zoom ? +o.zoom : 1;
        if (Array.isArray(o.box) && o.box.length === 4) s.g = o.box.map(Number);
      });
      pg.tx = adminObj(src.texts); pg.pa = adminObj(src.paragraphs); pg.cp = adminObj(src.captions); pg.mv = adminObj(src.moves); pg.z = adminObj(src.layers); pg.fmt = adminObj(src.styles);
    });
    album.cat = cat.id; album.cover = order.cover;
    S.album = album; S.page = 0; S.sel = null; S.dirty = false; S.tab = 'foto';

    /* magazine cover: the buyer's original photo, position, style and text */
    var mc = order.magCover;
    if (mc && curCover().mag) {
      title.textContent = 'Loading the cover photo…'; busy(true, 0, 0);
      var cb = await adminFetchBlob(ADMIN_BASE + '/sampul/foto');
      var ph = await magLoadFile(new File([cb], mc.photoName || 'sampul.jpg', { type: cb.type || 'image/jpeg' }));
      S.mag.photo = ph; S.mag.fx = mc.focusX != null ? +mc.focusX : 0.5; S.mag.fy = mc.focusY != null ? +mc.focusY : 0.3; S.mag.z = mc.zoom ? +mc.zoom : 1;
      S.mag.touched = true;   /* keep the buyer's position: no auto-fit */
      S.mag.ed = {}; S.mag.ed[mc.style] = adminObj(mc.texts);
      S.mag.moves = {}; S.mag.moves[mc.style] = adminObj(mc.moves);
      title.textContent = 'Finding the person on the cover…';
      try { ph.cut = await magSegment(ph.canvas); } catch (e) { /* text stays in front of the photo */ }
      magChanged();
    }
    busy(false);
    drawStudio();
    go('studio', null, function () { toast(t('Album {no} is open. Changes are saved only when you press Save changes in the preview.', { no: ADMIN_NO })); });
  } catch (e) {
    busy(false);
    openDialog({ trigger: null, title: 'The order couldn’t be opened', body: e.message || String(e),
      actions: [{ label: 'Back to the order', kind: 'primary', fn: function () { allowUnload = true; location.assign(ADMIN_BASE || '/imazine/admin'); } }] });
  }
}

async function adminSave() {
  var title = $('#busy-t'), old = title.textContent;
  try {
    var cat = catOf(S.cat), cv = curCover();
    if (cv.mag && !S.mag.photo) throw new Error('The magazine cover has no photo.');
    var body = {
      category: cat.id, cover: cv.id, coverName: cv.name, template: S.album.tpl.id,
      magCover: cv.mag ? magOrderInfo(cat) : null,
      pages: S.album.pages.map(function (pg, pi) {
        var P = S.album.tpl.pages[pi], cps = {};
        P.cp.forEach(function (c, i) { var v = captionValue(S.album, pi, i); if (v) cps[i] = v; });
        return { page: pi + 1, slots: pg.slots.map(function (s) { return { photo: s.photo, focusX: +s.fx.toFixed(3), focusY: +s.fy.toFixed(3), zoom: +s.z.toFixed(2), box: s.g || undefined }; }), texts: pg.tx, paragraphs: pg.pa, captions: cps, moves: pg.mv || {}, layers: pg.z || {}, styles: pg.fmt || {} };
      })
    };
    title.textContent = 'Saving the album…'; busy(true, 0, 0);
    var r = await fetch(ADMIN_BASE + '/simpan', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    var j = await apiJson(r);
    if (!r.ok) throw new Error(j.error || 'The album wasn’t saved (HTTP ' + r.status + ').');
    if (cv.mag) {
      title.textContent = 'Saving the magazine cover…';
      var blob = await magBlob(cv.mag, S.cat, MAG_W, 0.93);
      if (!blob) throw new Error('The cover couldn’t be drawn. Try again.');
      var r2 = await fetch(ADMIN_BASE + '/simpan-sampul', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      var j2 = await apiJson(r2);
      if (!r2.ok) throw new Error(j2.error || 'The cover wasn’t saved (HTTP ' + r2.status + ').');
    }
    S.dirty = false;
    busy(false); title.textContent = old;
    openDialog({ trigger: $('#pv-next'), title: 'Changes saved', body: 'The album PDF page now uses this version. The buyer’s first version is kept on the server.',
      actions: [{ label: 'Open album & save PDF', kind: 'primary', fn: function () { allowUnload = true; location.assign(ADMIN_BASE + '/album'); } },
                { label: 'Back to the order', fn: function () { allowUnload = true; location.assign(ADMIN_BASE); } },
                { label: 'Keep editing', kind: 'quiet' }] });
  } catch (e) {
    busy(false); title.textContent = old;
    toast(e && e.message ? e.message : 'The album wasn’t saved. Try again.');
  }
}

/* boot (this file comes after app-ui.js, so ADMIN_NO is set by now) */
if (ADMIN_NO) { $('#pv-next span').textContent = 'Save changes'; adminBoot(); }
