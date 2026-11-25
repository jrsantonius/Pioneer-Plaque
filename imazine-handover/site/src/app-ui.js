/* ---------- state ---------- */
var S = { view: 'home', step: 'sampul', cat: null, cover: null, layout: null, photos: [], album: null, page: 0, sel: null, armed: null, swap: null, tab: 'foto', dirty: false, qty: 1, pv: 0,
  mag: { photo: null, fx: 0.5, fy: 0.3, z: 1, front: true, ed: {}, moves: {}, rev: 0 } };   /* Cover Majalah: satu foto + teks per gaya, dipakai semua gaya majalah */
var wide = window.matchMedia('(min-width: 1000px)');
var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
var SCENE = { home: 'dark', setup: 'desk', studio: 'desk', preview: 'dark', checkout: 'desk', pay: 'desk', done: 'dark' };
var STEP_ORDER = ['setup', 'studio', 'preview', 'checkout'];
var vt = null, toastTimer = 0;

function go(view, focusId, after) {
  function swap() {
    S.view = view;
    if (S.album) armBackGuard();
    $$('.view').forEach(function (v) { v.hidden = v.dataset.view !== view; });
    document.body.dataset.view = view;
    document.body.dataset.scene = SCENE[view];
    var at = view === 'setup' && S.step === 'foto' ? 1 : view === 'pay' ? 3 : STEP_ORDER.indexOf(view);
    $$('.steps li').forEach(function (li, i) {
      li.classList.toggle('is-on', i === at);
      li.classList.toggle('is-done', at > -1 && i < at);
      if (i === at) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    clearTimeout(toastTimer); $('#toast').hidden = true;      /* a message belongs to the screen it was raised on */
    var f = focusId && $('#' + focusId);
    if (f) f.focus({ preventScroll: true });
    if (after) after();
  }
  vtRun(swap);
}
/* (18)(20) a new transition always replaces a running one; plain swap when unsupported or reduced motion.
   The album cover carries one view-transition-name, so it travels from card to cover step to checkout. */
function vtRun(fn) {
  if (vt) { try { vt.skipTransition(); } catch (e) {} vt = null; }
  if (document.startViewTransition && !calm.matches) {
    try { vt = document.startViewTransition(fn); var end = function () { vt = null; $$('[data-vt]').forEach(function (n) { n.style.viewTransitionName = ''; n.removeAttribute('data-vt'); }); }; vt.finished.then(end, end); return; } catch (e) { vt = null; }
  }
  fn();
}
function carry(img) { if (img) { $$('[data-vt]').forEach(function (n) { n.style.viewTransitionName = ''; n.removeAttribute('data-vt'); }); img.style.viewTransitionName = 'album-cover'; img.setAttribute('data-vt', ''); } }

/* ---------- dialog (origin-aware), toast, busy ---------- */
var dlgReturn = null;
function openDialog(o) {
  var wrap = $('#dlg'), box = $('.dlg', wrap), acts = $('#dlg-a');
  $('#dlg-h').textContent = o.title;
  $('#dlg-p').textContent = o.body;
  acts.textContent = '';
  o.actions.forEach(function (a) {
    var b = h('button', 'btn ' + (a.kind === 'primary' ? 'btn-primary' : a.kind === 'quiet' ? 'btn-quiet' : 'btn-line'), a.label);
    b.type = 'button';
    b.addEventListener('click', function () { closeDialog(); if (a.fn) a.fn(b); });
    acts.appendChild(b);
  });
  dlgReturn = o.trigger || document.activeElement;
  wrap.hidden = false;
  /* (10) grow from the control that opened it */
  var r = dlgReturn && dlgReturn.getBoundingClientRect ? dlgReturn.getBoundingClientRect() : null, br = box.getBoundingClientRect();
  box.style.transformOrigin = r && r.width ? (r.left + r.width / 2 - br.left) + 'px ' + (r.top + r.height / 2 - br.top) + 'px' : '50% 50%';
  fixWidows(wrap);
  $('#dlg-h').focus();
}
function closeDialog() {
  var wrap = $('#dlg');
  if (wrap.hidden) return;
  wrap.hidden = true;
  if (dlgReturn && document.contains(dlgReturn)) dlgReturn.focus({ preventScroll: true });
  dlgReturn = null;
}
$('#dlg').addEventListener('click', function (e) { if (e.target.hasAttribute('data-dlg-x')) closeDialog(); });
$('#dlg').addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { e.stopPropagation(); closeDialog(); return; }
  if (e.key !== 'Tab') return;
  var f = $$('#dlg button'), first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#dlg-h'))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
function toast(msg, action) {
  var t = $('#toast'), b = $('#toast-a');
  clearTimeout(toastTimer);
  t.hidden = true; void t.offsetWidth;            /* restart the entrance; a new toast replaces the old one */
  $('#toast-t').textContent = msg;
  b.hidden = !action;
  if (action) { b.textContent = action.label; b.onclick = function () { t.hidden = true; action.fn(); }; }
  t.hidden = false;
  toastTimer = setTimeout(function () { t.hidden = true; }, action ? 9000 : 5200);
}
function busy(on, done, of) {
  $('#busy').hidden = !on;
  if (!on) return;
  $('#busy-n').textContent = done; $('#busy-of').textContent = of;
  $('#busy-fill').style.width = (of ? done / of * 100 : 0) + '%';
}

/* ---------- home: the first question is the theme (review 20 Nov 2026) ----------
   Each card in the markup shows the theme's sample cover; here an open spread of the theme's first layout is added,
   filled with AI sample photos (img/pv-*.webp), so the buyer sees what that kind of album looks like before choosing. */
var HOME_COVER = { travel: 'mag-segar', event: 'mag-noir', sol: 'mag-lukis' };   /* the sample cover each card shows: picking the theme starts on it */
var PV_DIM = {
  travel: [[416, 560], [560, 364], [560, 408], [417, 560], [560, 332], [560, 376]],
  event: [[560, 391], [560, 360], [560, 454], [560, 387], [560, 180], [560, 383]],
  sol: [[440, 560], [560, 397], [560, 376], [560, 385], [560, 375], [560, 180]]
};
function pvPhotos(id) {
  return PV_DIM[id].map(function (d, i) { var u = MAG_SAMPLE_DIR + 'pv-' + id + '-' + (i + 1) + '.webp'; return { url: u, thumb: u, w: d[0], h: d[1], date: null, sample: true }; });
}
/* the first spread (left page odd, as in the preview) where both pages hold photos */
function pvSpread(album) {
  for (var p = 1; p + 1 < album.pages.length; p += 2) { var a = album.pages[p].slots.length, b = album.pages[p + 1].slots.length; if (a && b && a + b >= 3) return [p, p + 1]; }
  return [1, 2];
}
function drawHome() {
  $$('.theme').forEach(function (b) {
    var id = b.dataset.theme, cat = catOf(id), box = $('[data-spread]', b);
    b.addEventListener('click', function () { carry($('.theme-cover', b)); pickCat(id); });
    var paint = function () {
      var album = newAlbum(cat.layouts[0], pvPhotos(id)), sp = pvSpread(album), k = 0;
      sp.forEach(function (pi) { album.pages[pi].slots.forEach(function (s, si) { setSlot(album, pi, si, k++ % album.photos.length); }); });
      box.textContent = '';
      sp.forEach(function (pi) { box.appendChild(renderPage(album, pi, 'thumb')); });
    };
    /* after the first paint: the hero text and covers come first, the 18 small sample photos after */
    if (window.requestIdleCallback) requestIdleCallback(paint, { timeout: 1200 }); else setTimeout(paint, 300);
  });
}
/* "Make an album" with no album yet: the theme question is the first step, so take the buyer to it */
function toThemes(now) {
  var sec = $('#mulai'); if (!sec) return;
  $('#mulai-h').focus({ preventScroll: true });   /* focus first: focusing during a smooth scroll stops it */
  sec.scrollIntoView({ behavior: now || calm.matches ? 'auto' : 'smooth', block: 'start' });
}
function startFlow() {
  if (S.album) { S.cat = S.album.cat; S.cover = S.album.cover; S.layout = S.album.tpl.id; drawStudio(); return go('studio'); }
  if (S.view !== 'home') return go('home', null, function () { requestAnimationFrame(function () { toThemes(true); }); });
  toThemes();
}
function labelStart() { $$('[data-start]').forEach(function (b) { b.textContent = S.album ? 'Continue your album' : 'Make an album'; }); }
function pickCat(id) {
  if (S.cat !== id) { var same = S.album && S.album.cat === id; S.cat = id; S.layout = same ? S.album.tpl.id : null; S.cover = same && S.album.cover ? S.album.cover : HOME_COVER[id] || 'mag-segar'; }
  S.step = 'sampul';
  if (S.view !== 'setup') { drawSetup(); go('setup', 'setup-h'); }
  else vtRun(function () { drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true }); });
}

/* ---------- setup: sampul (sekaligus tema) → gaya → foto ---------- */
var SETUP = {
  sampul: { n: 1, h: 'Choose your cover.', sub: function (cat) { return t('Five magazine-style covers for your {theme} album. The cover uses your own photo; the people in these samples were made with AI.', { theme: cat.name }); }, back: 'Change theme' },
  gaya: { n: 1, h: 'Choose a layout.', sub: 'Every layout has 40 pages. They differ in how photos are arranged and how much room there is to write.', back: 'Cover' },
  foto: { n: 2, h: 'Now, upload your photos.', sub: 'Select them all at once. We’ll place them on each page, oldest first.', back: 'Change layout' }
};
function drawSetup() {
  var st = SETUP[S.step], body = $('#setup-body'), foot = $('#setup-foot'), cat = S.cat && catOf(S.cat);
  $('#setup-eyebrow').textContent = t('Step {n} of 4', { n: st.n });
  $$('.steps li').forEach(function (li, i) { li.classList.toggle('is-on', i === st.n - 1); li.classList.toggle('is-done', i < st.n - 1); });
  $('#setup-h').textContent = noWidow(st.h);
  $('#setup-sub').textContent = noWidow(typeof st.sub === 'function' ? st.sub(cat) : st.sub);
  $('#setup-back-t').textContent = S.step === 'sampul' && S.coverFrom ? 'Back to preview' : S.step === 'sampul' && S.album ? 'Back to your album' : st.back;
  /* Ganti cover dari preview (feedback Huda, 23 Nov 2026): pembeli yang sudah menulis caption takut semuanya hilang. Katakan dengan jelas bahwa album tetap utuh. */
  if (S.step === 'sampul' && (S.coverFrom || S.album)) $('#setup-sub').textContent = noWidow('Pick another cover. Your photos, layout, and captions stay exactly as they are.');
  body.textContent = '';
  foot.hidden = true;
  if (S.step === 'sampul') {
    body.appendChild(coverShelf());
    foot.hidden = false;
    drawCoverPick();
    $('#setup-next').textContent = S.coverFrom ? 'Use this cover' : 'Continue to layouts';
    $('#setup-next').disabled = false;
  } else if (S.step === 'gaya') {
    var grid = h('div', 'styles'); grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-label', 'Layout');
    cat.layouts.forEach(function (id, i) {
      var L = LAYOUTS[id], b = h('button', 'pick'); b.type = 'button'; b.style.setProperty('--i', i);
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', S.layout === id ? 'true' : 'false');
      var prev = h('span', 'style-prev'), demo = newAlbum(id, []);
      [2, 3, 4, 5].forEach(function (p) { prev.appendChild(renderPage(demo, p, 'thumb')); });
      b.appendChild(prev);
      b.appendChild(h('span', 'pick-name', L.name));
      b.appendChild(h('span', 'pick-desc', L.desc));
      b.appendChild(h('span', 'pick-meta', t('Fits {n} photos · 40 pages', { n: slotCount(id) })));
      var tk = h('span', 'pick-tick'); tk.appendChild(icon('check')); b.appendChild(tk);
      b.addEventListener('click', function () {
        S.layout = id;
        $$('.pick', grid).forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
        drawSetupFoot();
      });
      grid.appendChild(b);
    });
    grid.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      var all = $$('.pick', grid), at = all.indexOf(document.activeElement);
      if (at < 0) return;
      e.preventDefault();
      var nx = all[(at + dir + all.length) % all.length]; nx.focus(); nx.click();
    });
    body.appendChild(grid);
    drawSetupFoot();
  } else {
    var need = slotCount(S.layout), have = S.photos.length;
    var drop = h('div', 'drop'); drop.id = 'drop';
    var dic = h('span', 'drop-ic'); dic.appendChild(icon('upload')); drop.appendChild(dic);
    drop.appendChild(h('h2', null, have ? t('You already have {n} photos on the shelf.', { n: have }) : 'Choose photos from your device'));
    drop.appendChild(h('p', null, noWidow(have ? 'Keep arranging with those photos, or add more first.' : t('This layout holds {n} photos. A few more or fewer is fine; you can adjust later.', { n: need }))));
    var pickBtn = h('button', 'btn btn-lg ' + (have ? 'btn-line' : 'btn-warm')); pickBtn.type = 'button'; pickBtn.id = 'pick-files';
    pickBtn.appendChild(icon(have ? 'plus' : 'photo')); pickBtn.appendChild(h('span', null, have ? 'Add photos' : 'Choose photos'));
    pickBtn.addEventListener('click', function () { $('#file-first').click(); });
    if (have) {
      var cont = h('button', 'btn btn-warm btn-lg', 'Keep arranging'); cont.type = 'button';
      cont.addEventListener('click', function () { enterStudio(true); });
      drop.appendChild(cont);
    }
    drop.appendChild(pickBtn);
    drop.appendChild(h('p', 'drop-or', 'JPG, PNG, WEBP, or HEIC. On a computer, you can also drag photos into this box.'));
    if (!have) {
      var demoBtn = h('button', 'linkish', 'No photos yet? Try it with sample photos'); demoBtn.type = 'button'; demoBtn.id = 'use-samples';
      demoBtn.addEventListener('click', useSamples);
      drop.appendChild(demoBtn);
    }
    var msg = h('p', 'msg'); msg.id = 'upl-msg'; msg.hidden = true; msg.setAttribute('role', 'alert');
    body.appendChild(drop); body.appendChild(msg);
    var facts = h('ul', 'upl-facts');
    [['Laid out for you', 'Photos are placed by date, oldest first.'], ['You decide the dates', 'You write the caption next to each photo number, or leave it empty.'], ['Still yours to adjust', 'Move, zoom, swap, or replace photos any time.']].forEach(function (f) {
      var li = h('li'); li.appendChild(h('b', null, f[0])); li.appendChild(document.createTextNode(f[1])); facts.appendChild(li);
    });
    body.appendChild(facts);
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files, true); });
  }
  fixWidows($('[data-view="setup"]'));
}
/* ---------- covers: the chosen one, and any cover drawn as a photo or a stamp ---------- */
function curCover() { return coverOf(catOf(S.cat), S.cover); }
var STAMP = {};
document.body.insertAdjacentHTML('beforeend', stampDefs());
function coverArt(cat, cv, label, size) {
  var el;
  if (cv.mag) return magArt(cat, cv, label, size);
  if (cv.img) { el = new Image(); el.src = IMZ_IMG[cv.img]; el.width = 360; el.height = 509; el.draggable = false; el.alt = label || ''; return el; }
  if (!STAMP[cv.id]) STAMP[cv.id] = stampCover(cv.name, (cat.id === 'travel' ? cv.g : cat.name) + ' · 2026', ART[cv.art]);
  var t = document.createElement('template'); t.innerHTML = STAMP[cv.id]; el = t.content.firstElementChild;
  el.setAttribute('focusable', 'false');
  if (label) el.setAttribute('aria-label', label);
  else { el.removeAttribute('role'); el.removeAttribute('aria-label'); el.setAttribute('aria-hidden', 'true'); }
  return el;
}
function drawCoverPick() { var p = $('#setup-pick'); p.textContent = ''; p.appendChild(document.createTextNode('Cover: ')); p.appendChild(h('b', null, curCover().name)); p.appendChild(document.createTextNode(' · ' + catOf(S.cat).name)); }
function drawHeroCover(hero, cat, cv) {
  hero.textContent = '';
  var art = h('div', 'cvp-art'); art.appendChild(coverArt(cat, cv, 'Cover ' + cv.name, 720)); hero.appendChild(art);
  var tx = h('div', 'cvp-tx');
  tx.appendChild(h('p', 'cvp-k', 'Your cover'));
  tx.appendChild(h('h2', 'cvp-nm', cv.name));
  if (cv.note) tx.appendChild(h('p', 'cvp-d', cv.note));
  tx.appendChild(h('p', 'cvp-m', cv.g + ' · ' + cat.name));
  hero.appendChild(tx);
}
/* Petunjuk singkat di bawah kanvas (24 Nov 2026): apa saja yang bisa digeser, diketuk, dan di-zoom. */
function howTo(items) {
  var ul = h('ul', 'howto'); ul.setAttribute('aria-label', 'How to edit');
  items.forEach(function (it) { var li = h('li', 'howto-' + it[0], it[1]); ul.appendChild(li); });
  return ul;
}
/* Editor Cover Majalah, langsung di sampul (24 Nov 2026, permintaan user: "kayak di Canva", tanpa slider):
   - geser foto dengan jari/mouse, cubit (atau ctrl + scroll / tombol − +) untuk zoom
   - ketuk teks di sampul untuk mengetik di tempat; sampul digambar ulang sambil mengetik
   - ketuk judul untuk menaruhnya di belakang atau di depan orang di foto
   Kotak teks dan foto dicatat oleh magDraw (c.hits, c.photoBox) dalam grid 1000 satuan. */
function magEditor(cat) {
  var el = h('section', 'mag-ed'); el.setAttribute('aria-labelledby', 'mag-h'); el.hidden = true;
  var hd = h('h3', null, 'Edit your cover'); hd.id = 'mag-h'; el.appendChild(hd);
  var work = h('div', 'mag-work'), stage = h('div', 'mag-stage'), cv = h('canvas', 'mag-cv'), hitsEl = h('div', 'mag-hits'), selEl = h('div', 'mag-sel');
  stage.tabIndex = 0; stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', 'Cover editor. Arrow keys move the photo, plus and minus zoom.');
  cv.setAttribute('aria-hidden', 'true'); selEl.hidden = true;
  stage.appendChild(cv); stage.appendChild(selEl); stage.appendChild(hitsEl);
  var addPh = h('button', 'mag-add'); addPh.type = 'button'; addPh.appendChild(icon('upload')); addPh.appendChild(h('span', null, 'Use your own photo')); stage.appendChild(addPh);
  var pop = h('div', 'mag-pop'); pop.hidden = true; pop.setAttribute('role', 'dialog');
  work.appendChild(stage); work.appendChild(pop); el.appendChild(work);
  /* bilah alat foto, tepat di bawah sampul */
  var bar = h('div', 'mag-bar'), pick = h('button', 'btn btn-sm btn-warm', 'Upload cover photo'); pick.type = 'button'; pick.setAttribute('data-mag-pick', '');
  var zm = h('div', 'mag-zoom'), zOut = h('button', 'btn btn-icon btn-icon-s'), zVal = h('span', 'num mag-zv'), zIn = h('button', 'btn btn-icon btn-icon-s');
  zOut.type = zIn.type = 'button'; zOut.appendChild(icon('minus')); zIn.appendChild(icon('plus')); zOut.setAttribute('aria-label', 'Zoom out'); zIn.setAttribute('aria-label', 'Zoom in');
  zm.appendChild(zOut); zm.appendChild(zVal); zm.appendChild(zIn);
  var fitBtn = h('button', 'btn btn-sm btn-line', 'Automatic position'); fitBtn.type = 'button';
  bar.appendChild(pick); bar.appendChild(zm); bar.appendChild(fitBtn); el.appendChild(bar);
  var inp = h('input'); inp.type = 'file'; inp.accept = 'image/*,.heic,.heif'; inp.hidden = true; inp.setAttribute('aria-label', 'Photo for the magazine cover'); el.appendChild(inp);
  var how = howTo([['photo', 'Drag the photo to move it.'], ['zoom', 'Pinch, use Ctrl + scroll, or press − and + to zoom the photo in or out.'], ['move', 'Drag any text to move it left, right, up, or down.'], ['text', 'Tap or click a text to change what it says.']]);
  var howMast = h('li', null, 'Tap the big title to put it behind or in front of the person.'); how.appendChild(howMast);
  el.appendChild(how);
  var info = h('p', 'mag-info'); info.setAttribute('role', 'status'); info.setAttribute('aria-live', 'polite'); el.appendChild(info);
  var segNote = h('p', 'mag-note'); segNote.setAttribute('role', 'status'); el.appendChild(segNote);
  var note = h('p', 'mag-note'); el.appendChild(note);

  var last = null, sel = null, style = null, fontsOk = false, raf = 0, fast = false, hiT = 0, moving = null;
  /* posisi kelompok teks yang digeser pembeli, per gaya: [dx, dy] dalam satuan grid 1000 */
  function moves() { var m = S.mag.moves || (S.mag.moves = {}); return m[style] || (m[style] = {}); }
  function groupOf(k) { var b = hitOf(k); return b ? b.g : null; }
  function moveGroup(g, nx, ny) {
    var mv = moves(), cur = mv[g] || [0, 0], box = null;
    last.hits.forEach(function (b) { if (b.g !== g) return; var r = [b.x - cur[0], b.y - cur[1], b.x - cur[0] + b.w, b.y - cur[1] + b.h]; box = box ? [Math.min(box[0], r[0]), Math.min(box[1], r[1]), Math.max(box[2], r[2]), Math.max(box[3], r[3])] : r; });
    if (box) {   /* tetap di dalam sampul: paling tidak separuh kotaknya terlihat */
      var cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
      nx = clamp(nx, -cx, 1000 - cx); ny = clamp(ny, -cy, last.HU - cy);
    }
    nx = Math.round(nx * 10) / 10; ny = Math.round(ny * 10) / 10;
    if (Math.abs(nx) < 0.5 && Math.abs(ny) < 0.5) delete mv[g]; else mv[g] = [nx, ny];
    paint(true); magChanged();
  }
  function fields() { return MAG_FIELDS[style] || []; }
  function fieldOf(k) { var f = fields().filter(function (x) { return x[0] === k; })[0]; return f || null; }
  function canMast() { return style !== 'krem' && (S.mag.photo ? !!S.mag.photo.cut : !!magSample(catOf(S.cat).id)); }   /* foto contoh sudah membawa masker subjek */

  /* ---- menggambar: cepat (resolusi rendah) selama digeser/diketik, tajam sesudah berhenti ---- */
  function paint(quick) {
    fast = !!quick;
    if (!raf) raf = requestAnimationFrame(draw);
    clearTimeout(hiT);
    if (quick) hiT = setTimeout(function () { paint(false); }, 220);
  }
  function draw() {
    raf = 0;
    if (!style || el.hidden) return;
    var ready = fontsOk && (S.mag.photo || !MAG_SAMPLE_FIT[catOf(S.cat).id] || magSample(catOf(S.cat).id));
    if (!ready) { Promise.all([magFonts(), magSampleReady(catOf(S.cat).id)]).then(function () { fontsOk = true; paint(false); }); return; }
    var cssW = stage.clientWidth || 360, dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(cssW * dpr * (fast ? 0.6 : 1));
    W = clamp(W, 240, fast ? 640 : 1300);
    var c = magDraw(style, catOf(S.cat).id, W);
    if (cv.width !== c.width || cv.height !== c.height) { cv.width = c.width; cv.height = c.height; }
    cv.getContext('2d').drawImage(c, 0, 0);
    last = c; layoutHits(); place();
  }
  function pctX(v) { return (v / 10).toFixed(3) + '%'; }
  function pctY(v) { return (v / last.HU * 100).toFixed(3) + '%'; }
  function boxCss(b, e) { e.style.left = pctX(b.x); e.style.top = pctY(b.y); e.style.width = pctX(b.w); e.style.height = pctY(b.h); }
  function layoutHits() {
    hitsEl.textContent = '';
    var seen = {};
    last.hits.forEach(function (b) {
      var f = b.k === 'mast' ? [b.k, 'Title'] : b.k === 'logo' ? [b.k, 'Small logo'] : fieldOf(b.k); if (!f) return;
      var bt = h('button', 'mag-hit' + (sel === b.k || moving && moving === b.g ? ' is-sel' : '')); bt.type = 'button'; bt.dataset.k = b.k; if (b.g) bt.dataset.g = b.g;
      bt.setAttribute('aria-label', t(b.k === 'logo' ? 'Move: {what}' : 'Edit: {what}', { what: t(f[1]) }) + (b.g ? t('. Drag or use the arrow keys to move it.') : ''));
      if (seen[b.k]) bt.tabIndex = -1; seen[b.k] = true;
      boxCss(b, bt); hitsEl.appendChild(bt);
    });
    addPh.hidden = !!S.mag.photo; stage.classList.toggle('has-photo', !!S.mag.photo);
    if (sel === 'photo') { boxCss(last.photoBox, selEl); selEl.hidden = false; } else selEl.hidden = true;
  }
  function hitOf(k) { var r = null; if (last) last.hits.forEach(function (b) { if (b.k === k && (!r || b.y > r.y)) r = b; }); return r; }

  /* ---- teks: kotak ketik mengambang tepat di bawah (atau di atas) teks yang diketuk ---- */
  function openText(k) {
    sel = k; drawBar();
    var f = k === 'mast' || k === 'logo' ? null : fieldOf(k);
    pop.textContent = ''; pop.hidden = false;
    if (k === 'mast' || k === 'logo') {
      pop.setAttribute('aria-label', k === 'mast' ? 'Title' : 'Small logo');
      pop.appendChild(h('p', 'mag-pop-l', k === 'mast' ? 'Title' : 'Small logo'));
      if (k === 'logo' || !canMast()) pop.appendChild(h('p', 'mag-pop-t', 'Drag it to move it anywhere on the cover.'));
      var seg = h('div', 'seg mag-seg'); if (k === 'logo' || !canMast()) seg.hidden = true;
      [[true, 'Behind the person'], [false, 'In front of the person']].forEach(function (o) {
        var b = h('button', 'seg-b', o[1]); b.type = 'button'; b.setAttribute('aria-pressed', S.mag.front === o[0] ? 'true' : 'false');
        b.addEventListener('click', function () { S.mag.front = o[0]; magChanged(); paint(false); openText('mast'); });
        seg.appendChild(b);
      });
      pop.appendChild(seg);
    } else {
      pop.setAttribute('aria-label', t(f[1]));
      /* tanpa batas jumlah huruf (permintaan user 24 Nov 2026): teks panjang dibungkus atau dikecilkan saat digambar */
      var row = h('div', 'mag-pop-r'), lb = h('label', 'mag-pop-l', f[1]);
      var long = f[2] > 30, r = h(long ? 'textarea' : 'input', 'in'); if (!long) r.type = 'text'; else r.rows = 2;
      r.id = 'mag-in-' + k; lb.htmlFor = r.id; r.autocomplete = 'off'; r.spellcheck = false;
      r.value = magText(style, catOf(S.cat).id, k);
      r.addEventListener('input', function () {
        (S.mag.ed[style] = S.mag.ed[style] || {})[k] = r.value.replace(/\n/g, ' ');
        magChanged(); paint(true);
      });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); closePop(true); } });
      row.appendChild(lb); pop.appendChild(row); pop.appendChild(r);
    }
    var acts = h('div', 'mag-pop-a'), g = groupOf(k);
    if (g && moves()[g]) {
      var rs = h('button', 'btn btn-sm btn-quiet', 'Back to original position'); rs.type = 'button';
      rs.addEventListener('click', function () { delete moves()[g]; magChanged(); paint(false); openText(k); });
      acts.appendChild(rs);
    }
    var done = h('button', 'btn btn-sm btn-primary mag-pop-ok', 'Done'); done.type = 'button';
    done.addEventListener('click', function () { closePop(true); });
    acts.appendChild(done); pop.appendChild(acts);
    layoutHits(); place();
    var fi = $('.in', pop) || $('.seg-b', pop); if (fi) { fi.focus({ preventScroll: true }); if (fi.select) fi.select(); }
  }
  function place() {
    if (pop.hidden || !last || !sel || sel === 'photo') return;
    var b = hitOf(sel); if (!b) return;
    var sw = stage.clientWidth, sh = stage.clientHeight, pw = Math.min(sw, 320);
    pop.style.width = pw + 'px';
    var x0 = b.x / 1000 * sw, y1 = (b.y + b.h) / last.HU * sh, y0 = b.y / last.HU * sh, ph = pop.offsetHeight;
    pop.style.left = clamp(x0, 0, sw - pw) + 'px';
    pop.style.top = (y1 + 8 + ph <= sh || y0 - ph - 8 < 0 ? y1 + 8 : y0 - ph - 8) + 'px';
  }
  function closePop(focusBack) {
    var k = sel; pop.hidden = true; sel = null; layoutHits(); drawBar();
    if (focusBack && k) { var b = $('.mag-hit[data-k="' + k + '"]', hitsEl); (b || stage).focus({ preventScroll: true }); }
  }

  /* ---- foto: geser dan zoom ---- */
  function crop() {
    var ph = S.mag.photo, b = last.photoBox, ar = b.w / b.h, sw = ph.w, sh = ph.h, cw, ch;
    if (sw / sh > ar) { ch = sh / S.mag.z; cw = ch * ar; } else { cw = sw / S.mag.z; ch = cw / ar; }
    return { sw: sw, sh: sh, cw: cw, ch: ch };
  }
  function moved() { S.mag.touched = true; drawBar(); paint(true); magChanged(); }
  function panBy(dxCss, dyCss) {
    var k = crop(), b = last.photoBox, bw = b.w / 1000 * stage.clientWidth, bh = b.h / last.HU * stage.clientHeight;
    if (k.sw - k.cw > 0.5) S.mag.fx = clamp(S.mag.fx - dxCss / bw * k.cw / (k.sw - k.cw), 0, 1);
    if (k.sh - k.ch > 0.5) S.mag.fy = clamp(S.mag.fy - dyCss / bh * k.ch / (k.sh - k.ch), 0, 1);
  }
  /* zoom dengan titik di bawah jari/kursor tetap di tempat (px, py = posisi dalam kotak foto, 0..1) */
  function zoomTo(z, px, py) {
    if (!S.mag.photo || !last) return;
    px = px == null ? 0.5 : px; py = py == null ? 0.5 : py;
    var a = crop(), sx = (a.sw - a.cw) * S.mag.fx + px * a.cw, sy = (a.sh - a.ch) * S.mag.fy + py * a.ch;
    S.mag.z = clamp(z, 1, 2.5);
    var b2 = crop();
    S.mag.fx = b2.sw - b2.cw > 0.5 ? clamp((sx - px * b2.cw) / (b2.sw - b2.cw), 0, 1) : 0.5;
    S.mag.fy = b2.sh - b2.ch > 0.5 ? clamp((sy - py * b2.ch) / (b2.sh - b2.ch), 0, 1) : 0.5;
    moved();
  }
  function inBox(cx, cy) {
    var r = stage.getBoundingClientRect(), b = last.photoBox;
    return { px: clamp(((cx - r.left) / r.width * 1000 - b.x) / b.w, 0, 1), py: clamp(((cy - r.top) / r.height * last.HU - b.y) / b.h, 0, 1) };
  }
  var pts = {}, drag = null, dragged = false;
  stage.addEventListener('pointerdown', function (e) {
    if (e.button > 0 || !last) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (ids.length === 2 && S.mag.photo) {   /* dua jari: cubit untuk zoom */
      var a = pts[ids[0]], b = pts[ids[1]];
      drag = { pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: S.mag.z };
      dragged = true; try { stage.setPointerCapture(e.pointerId); } catch (er) {}
      return;
    }
    dragged = false;
    var hb = e.target.closest('.mag-hit');
    if (hb && hb.dataset.g) { var m0 = moves()[hb.dataset.g] || [0, 0]; drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, g: hb.dataset.g, m0: m0.slice() }; return; }
    drag = S.mag.photo ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (!drag) return;
    if (drag.pinch) {
      var ids = Object.keys(pts); if (ids.length < 2) return;
      var a = pts[ids[0]], b = pts[ids[1]], m = inBox((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomTo(drag.z0 * Math.hypot(a.x - b.x, a.y - b.y) / drag.d0, m.px, m.py);
      return;
    }
    if (e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.hypot(dx, dy) < 5) return;
    if (!dragged) { dragged = true; stage.classList.add('is-drag'); if (!pop.hidden) closePop(false); sel = drag.g ? null : 'photo'; moving = drag.g || null; try { stage.setPointerCapture(e.pointerId); } catch (er) {} }
    if (drag.g) { moveGroup(drag.g, drag.m0[0] + (e.clientX - drag.x0) / stage.clientWidth * 1000, drag.m0[1] + (e.clientY - drag.y0) / stage.clientHeight * last.HU); return; }
    panBy(dx, dy); drag.x = e.clientX; drag.y = e.clientY; moved();
  });
  function up(e) {
    delete pts[e.pointerId];
    if (!Object.keys(pts).length) { drag = null; stage.classList.remove('is-drag'); if (moving) { moving = null; paint(false); } }
    else if (drag && drag.pinch) drag = null;
  }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('click', function (e) {
    if (dragged) { dragged = false; return; }
    if (e.target.closest('.mag-add')) return inp.click();
    var b = e.target.closest('.mag-hit');
    if (b) return openText(b.dataset.k);
    if (!S.mag.photo) return inp.click();   /* belum ada foto sendiri: ketuk foto contoh = unggah */
    if (!pop.hidden) closePop(false);
    sel = sel === 'photo' ? null : 'photo'; layoutHits(); drawBar();
  });
  stage.addEventListener('wheel', function (e) {   /* cubit di trackpad (ctrlKey) atau ctrl + scroll */
    if (!e.ctrlKey || !S.mag.photo || !last) return;
    e.preventDefault();
    var m = inBox(e.clientX, e.clientY); zoomTo(S.mag.z * Math.exp(-clamp(e.deltaY, -25, 25) * 0.008), m.px, m.py);
  }, { passive: false });
  stage.addEventListener('keydown', function (e) {
    var hb = e.target.closest && e.target.closest('.mag-hit');
    if (hb && hb.dataset.g && last && /^Arrow/.test(e.key)) {   /* teks terpilih + tombol panah: geser teks */
      e.preventDefault();
      var st2 = e.shiftKey ? 20 : 5, m = moves()[hb.dataset.g] || [0, 0], k2 = hb.dataset.k;
      moveGroup(hb.dataset.g, m[0] + (e.key === 'ArrowLeft' ? -st2 : e.key === 'ArrowRight' ? st2 : 0), m[1] + (e.key === 'ArrowUp' ? -st2 : e.key === 'ArrowDown' ? st2 : 0));
      requestAnimationFrame(function () { requestAnimationFrame(function () { var nb = $('.mag-hit[data-k="' + k2 + '"]', hitsEl); if (nb) nb.focus({ preventScroll: true }); }); });
      return;
    }
    if (e.target !== stage || !S.mag.photo || !last) return;
    var st = e.shiftKey ? 30 : 8, k = e.key;
    if (k === 'ArrowLeft') panBy(st, 0); else if (k === 'ArrowRight') panBy(-st, 0); else if (k === 'ArrowUp') panBy(0, st); else if (k === 'ArrowDown') panBy(0, -st);
    else if (k === '+' || k === '=') return e.preventDefault(), zoomTo(S.mag.z + 0.1);
    else if (k === '-') return e.preventDefault(), zoomTo(S.mag.z - 0.1);
    else return;
    e.preventDefault(); moved();
  });
  document.addEventListener('pointerdown', function (e) {   /* ketuk di luar sampul: lepas pilihan */
    if (!el.isConnected || el.hidden || work.contains(e.target) || bar.contains(e.target)) return;
    if (!pop.hidden) closePop(false); else if (sel) { sel = null; layoutHits(); drawBar(); }
  });
  pop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closePop(true); } });
  zOut.addEventListener('click', function () { zoomTo(S.mag.z - 0.15); });
  zIn.addEventListener('click', function () { zoomTo(S.mag.z + 0.15); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (stage.clientWidth && last && Math.abs(stage.clientWidth * (window.devicePixelRatio || 1) - cv.width) > 40) paint(false); place(); }).observe(stage);

  /* Posisi otomatis: begitu subjek terdeteksi, foto langsung dipaskan ke bingkai sampul. */
  function autoFit() {
    var ph = S.mag.photo, f = ph && ph.cut ? magAutoFit(ph.cut, ph.w, ph.h) : null;
    if (!f) return false;
    S.mag.fx = f.fx; S.mag.fy = f.fy; S.mag.z = f.z; S.mag.touched = false;
    return true;
  }
  function drawBar() {
    var has = !!S.mag.photo;
    zm.hidden = !has; zVal.textContent = Math.round(S.mag.z * 100) + '%';
    zOut.disabled = S.mag.z <= 1.001; zIn.disabled = S.mag.z >= 2.499;
    fitBtn.hidden = !(has && S.mag.photo.cut && S.mag.touched);
    pick.textContent = has ? 'Change photo' : 'Upload cover photo';
  }
  fitBtn.addEventListener('click', function () { if (autoFit()) { magChanged(); drawBar(); paint(false); } });
  function drawInfo() {
    var m = S.mag.photo;
    if (!m) { info.textContent = 'No photo yet. The sample above uses an AI-made photo; upload yours to replace it.'; return; }
    info.textContent = m.name + ' · ' + m.ow + '×' + m.oh + ' px' + (m.w > m.ow || m.h > m.oh ? t(' → enlarged to {w}×{h} px (Full HD).', { w: m.w, h: m.h }) : t(' (already large enough, not changed).'));
  }
  function sync() {
    var cvr = curCover(); cat = catOf(S.cat); el.hidden = !cvr.mag;
    if (!cvr.mag) return;
    if (style !== cvr.mag) { style = cvr.mag; sel = null; pop.hidden = true; }
    if (cvr.mag !== 'krem' && typeof magSegmenter === 'function') magSegmenter().catch(function () { });   /* unduh pemisah subjek dari sekarang, sambil pembeli memilih foto */
    drawInfo(); drawBar();
    var ok = !!(S.mag.photo && S.mag.photo.cut);
    segNote.hidden = !S.mag.photo || cvr.mag === 'krem' || ok && !segNote.textContent;
    if (S.mag.photo && !ok && cvr.mag !== 'krem' && !segNote.textContent) { segNote.textContent = 'The title-behind-person effect needs an internet connection and couldn’t load. The title still shows over the photo.'; segNote.hidden = false; }
    howMast.hidden = !canMast();
    note.textContent = cvr.mag === 'lukis' ? 'The painted look is made on your device with an oil-paint filter, not AI. Results depend on the photo.' : '';
    note.hidden = !note.textContent;
    paint(false);
  }
  pick.addEventListener('click', function () { inp.click(); });
  inp.addEventListener('change', async function () {
    var f = inp.files && inp.files[0]; inp.value = '';
    if (!f) return;
    info.textContent = 'Processing photo…'; pick.disabled = true;
    try {
      S.mag.photo = await magLoadFile(f); S.mag.fx = 0.5; S.mag.fy = 0.3; S.mag.z = 1; S.mag.touched = false;
      magChanged(); segNote.textContent = 'Finding the person in your photo…'; sync();
      var ph = S.mag.photo; ph.cut = await magSegment(ph.canvas); segNote.textContent = '';
      if (S.mag.photo === ph) { if (!S.mag.touched) autoFit(); magChanged(); sync(); }
    } catch (e) { if (window.console) console.warn('Cover Majalah:', e); info.textContent = 'We couldn’t open this photo. Try a JPG, PNG, WEBP, or HEIC file.'; }
    finally { pick.disabled = false; }
  });
  sync();
  return { el: el, sync: sync };
}
/* The cover step, first step of the flow: the chosen cover large on top, then one shelf per theme
   (its magazine covers with the theme's sample photo, plus its illustrated cover). Picking a cover also picks the theme.
   All covers are one radio group. */
function coverShelf() {
  if (!curCover().mag) S.cover = 'mag-segar';   /* album lama dengan sampul ilustrasi: pindah ke Cover Majalah */
  var wrap = h('div', 'cvs'), hero = h('div', 'cvp'); hero.id = 'cover-hero';
  drawHeroCover(hero, catOf(S.cat), curCover()); wrap.appendChild(hero);
  var magEd = magEditor(catOf(S.cat));
  var shelves = h('div', 'shelves'); shelves.setAttribute('role', 'radiogroup'); shelves.setAttribute('aria-label', 'Album cover');
  function book(cat, cv) {
    var b = h('button', 'book'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.id = cv.id; b.dataset.cat = cat.id; b.setAttribute('data-nowidow', ''); b.setAttribute('aria-label', t('{cover}, {theme} theme', { cover: t(cv.name), theme: cat.name }));
    var art = h('span', 'book-art'); art.appendChild(coverArt(cat, cv)); b.appendChild(art);
    b.appendChild(h('span', 'book-nm', cv.name)); b.appendChild(h('span', 'book-st'));
    return b;
  }
  var secs = [catOf(S.cat)].map(function (cat) {   /* the theme was chosen on the home page: only its covers */
    var sec = h('section', 'shelf'), hd = h('div', 'shelf-h'), tw = h('div', 'shelf-tw'), t = h('h3', null, cat.name), nav = h('div', 'shelf-nav'), row = h('div', 'shelf-row');
    t.id = 'shelf-' + cat.id; sec.setAttribute('aria-labelledby', t.id);
    tw.appendChild(t); tw.appendChild(h('p', 'shelf-d', cat.desc)); hd.appendChild(tw);
    [['left', -1, 'Scroll the {theme} shelf left'], ['right', 1, 'Scroll the {theme} shelf right']].forEach(function (d) {
      var b = h('button', 'btn btn-icon btn-icon-s shelf-go'); b.type = 'button'; b.dataset.d = d[1]; b.setAttribute('aria-label', _t(d[2], { theme: cat.name })); b.appendChild(icon(d[0])); nav.appendChild(b);
    });
    hd.appendChild(nav); sec.appendChild(hd);
    pickableCovers(cat).forEach(function (cv) { row.appendChild(book(cat, cv)); });
    row.addEventListener('scroll', function () { nav_(); }, { passive: true });
    sec.appendChild(row); shelves.appendChild(sec);
    return sec;
  });
  wrap.appendChild(shelves); wrap.appendChild(magEd.el);   /* pilihan cover dulu, editor foto di bawahnya */
  function isOn(b) { return b.dataset.cat === S.cat && b.dataset.id === S.cover; }
  function mark() {
    $$('.book', shelves).forEach(function (b) {
      var on = isOn(b), st = $('.book-st', b);
      b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; st.textContent = '';
      if (on) { st.appendChild(icon('check')); st.appendChild(document.createTextNode('Selected')); } else st.textContent = coverOf(catOf(b.dataset.cat), b.dataset.id).note;
    });
  }
  function nav_() {
    secs.forEach(function (sec) {
      var row = $('.shelf-row', sec), max = row.scrollWidth - row.clientWidth, x = row.scrollLeft, bs = $$('.shelf-go', sec);
      $('.shelf-nav', sec).hidden = max < 4;
      bs[0].disabled = x < 4; bs[1].disabled = x > max - 4;
      row.classList.toggle('fade-l', x > 4); row.classList.toggle('fade-r', x < max - 4);
    });
  }
  function choose(b, animate) {
    if (isOn(b)) return;
    var catId = b.dataset.cat, id = b.dataset.id, cat = catOf(catId), cv = coverOf(cat, id), src = $('.book-art > *', b), old = $('.cvp-art > *', hero), r = hero.getBoundingClientRect();
    var fly = animate && document.startViewTransition && !calm.matches && r.bottom > 80 && r.top < innerHeight - 120;   /* fly only when the big cover is on screen */
    /* pilihan disimpan langsung, bukan sesudah animasi: tombol lanjut yang ditekan cepat harus memakai cover yang baru diklik */
    if (S.cat !== catId) { var same = S.album && S.album.cat === catId; S.cat = catId; S.layout = same ? S.album.tpl.id : null; }
    S.cover = id;
    var run = function () {
      if (src) src.style.viewTransitionName = ''; drawHeroCover(hero, cat, cv); mark(); drawCoverPick(); magEd.sync();
    };
    if (!fly) return run();
    if (old) old.style.viewTransitionName = 'none';
    if (src) src.style.viewTransitionName = 'album-cover';
    vtRun(run);
  }
  shelves.addEventListener('click', function (e) { var b = e.target.closest('.book'); if (b) choose(b, true); });
  shelves.addEventListener('keydown', function (e) {
    var b = e.target.closest('.book'); if (!b) return;
    var rows = secs.map(function (s) { return $$('.book', s); }), flat = [].concat.apply([], rows), k = flat.indexOf(b), r = -1, i = 0, to = null;
    rows.forEach(function (l, ri) { if (l.indexOf(b) > -1) { r = ri; i = l.indexOf(b); } });
    if (e.key === 'ArrowRight') to = flat[k + 1]; else if (e.key === 'ArrowLeft') to = flat[k - 1];
    else if (e.key === 'ArrowDown') to = rows[r + 1] && rows[r + 1][Math.min(i, rows[r + 1].length - 1)];
    else if (e.key === 'ArrowUp') to = rows[r - 1] && rows[r - 1][Math.min(i, rows[r - 1].length - 1)];
    else if (e.key === 'Home') to = flat[0]; else if (e.key === 'End') to = flat[flat.length - 1];
    else return;
    e.preventDefault(); if (!to) return;
    to.focus({ preventScroll: true }); to.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' }); choose(to, false);
  });
  wrap.addEventListener('click', function (e) {
    var b = e.target.closest('.shelf-go'); if (!b) return;
    var row = $('.shelf-row', b.closest('.shelf')); row.scrollBy({ left: row.clientWidth * 0.8 * +b.dataset.d, behavior: calm.matches ? 'auto' : 'smooth' });
  });
  mark();
  /* the step is drawn before its view is shown, so sizes are only known once the shelves get a width:
     then scroll the chosen cover into its shelf, and keep the arrows right on every resize */
  var opened = false;
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () {
      if (!shelves.isConnected) return ro.disconnect();
      if (!shelves.clientWidth) return;
      if (!opened) { opened = true; var b = $('.book[aria-checked="true"]', shelves); if (b) { var row = b.parentNode; row.scrollLeft = Math.max(0, b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2); } }
      nav_();
    });
    ro.observe(shelves);
  }
  return wrap;
}
function drawSetupFoot() {
  setTimeout(function () { fixWidows($('[data-view="setup"]')); }, 0);
  var foot = $('#setup-foot'), pick = $('#setup-pick');
  foot.hidden = false;
  pick.textContent = '';
  if (S.layout) {
    pick.appendChild(document.createTextNode(t('Layout: ')));
    pick.appendChild(h('b', null, LAYOUTS[S.layout].name));
    pick.appendChild(document.createTextNode(t(' · fits {n} photos', { n: slotCount(S.layout) })));
  } else pick.textContent = 'Choose a layout to continue.';
  $('#setup-next').textContent = S.album ? 'Use this layout' : 'Continue to photos';
  $('#setup-next').disabled = !S.layout;
}
$('#setup-back').addEventListener('click', function () {
  if (S.step === 'sampul' && S.coverFrom) { S.cover = S.coverFrom.cover; S.coverFrom = null; return backToPreview(); }   /* batal: cover lama tetap */
  if (S.step === 'sampul' && S.album) { S.cat = S.album.cat; S.cover = S.album.cover; S.layout = S.album.tpl.id; return go('studio'); }
  if (S.step === 'sampul') return go('home', null, function () { requestAnimationFrame(function () { toThemes(true); }); });
  S.step = S.step === 'gaya' ? 'sampul' : 'gaya';
  drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true });
});
$('#setup-next').addEventListener('click', function (e) {
  if (S.step === 'sampul' && curCover().mag && !S.mag.photo && !(ALLOW_SAMPLE && magSample(S.cat))) { toast('Upload a photo for the magazine cover first.'); var pk = $('[data-mag-pick]'); if (pk) { pk.scrollIntoView({ block: 'center' }); pk.focus({ preventScroll: true }); } return; }
  if (S.step === 'sampul' && S.coverFrom) { S.album.cover = curCover().id; S.coverFrom = null; S.dirty = true; backToPreview(true); return; }
  if (S.step === 'sampul') { S.step = 'gaya'; drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true }); return; }
  if (S.step !== 'gaya' || !S.layout) return;
  if (S.album && S.album.tpl.id === S.layout && S.album.cat === S.cat) { S.album.cover = curCover().id; return go('studio'); }
  if (S.album && S.dirty) {
    return openDialog({ trigger: e.currentTarget, title: t('Switch to the {name} layout?', { name: LAYOUTS[S.layout].name }),
      body: 'Your photos stay on the shelf. But the photo arrangement and text you’ve set up will start over with the new layout.',
      actions: [{ label: 'Switch and start over', kind: 'primary', fn: function () { enterStudio(true); } }, { label: 'Keep the current layout', fn: function () { S.layout = S.album.tpl.id; S.cat = S.album.cat; go('studio'); } }] });
  }
  if (S.photos.length) return enterStudio(true);
  S.step = 'foto'; drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true });
});

/* ---------- photos in ---------- */
async function addFiles(files, first) {
  if (!files || !files.length) return;
  if (ADMIN_NO) { toast('New photos can’t be added to a submitted order. Use the photos already on the shelf.'); return; }
  var room = MAX_PHOTOS - S.photos.length;
  if (room <= 0) { toast(t('Your photo shelf is full: one album holds up to {n} photos.', { n: MAX_PHOTOS })); return; }
  INTAKE_LIMIT = room;
  busy(true, 0, Math.min(files.length, INTAKE_LIMIT));
  var res;
  try { res = await intake(files, function (d, of) { busy(true, d, of); }); }
  finally { busy(false); }
  if (!res.photos.length) {
    var m = 'We couldn’t open this photo. Try a JPG, PNG, WEBP, or HEIC file.';
    if (first && $('#upl-msg')) { $('#upl-msg').textContent = m; $('#upl-msg').hidden = false; } else toast(m);
    return;
  }
  var from = S.photos.length;
  res.photos.forEach(function (p) { S.photos.push(p); });
  var fresh = res.photos.map(function (p, i) { return from + i; });
  var tail = (res.failed ? t(' {n} other photos couldn’t be opened.', { n: res.failed }) : '') + (res.skipped ? t(' The last {n} photos weren’t added because an album holds at most {max} photos.', { n: res.skipped, max: MAX_PHOTOS }) : '') + (S.photos.length < MIN_PHOTOS ? t(' You need at least {min} photos to order this album; you have {n}.', { min: MIN_PHOTOS, n: S.photos.length }) : '');
  if (first || !S.album) { enterStudio(true, tail); return; }
  var placed = pourPhotos(S.album, fresh);
  S.dirty = true;
  drawStudio();
  toast((placed ? t('{n} photos added, {m} empty frames filled right away.', { n: fresh.length, m: placed }) : t('{n} photos added to the shelf.', { n: fresh.length })) + tail);
}
async function useSamples() {
  var n = slotCount(S.layout) - 9;
  busy(true, 0, n);
  var ph = await samplePhotos(n);
  busy(false);
  ph.forEach(function (p) { S.photos.push(p); });
  enterStudio(true);
}
$('#file-first').addEventListener('change', function (e) { var f = e.target.files; addFiles(f, S.view === 'setup'); e.target.value = ''; });
$('#file-more').addEventListener('change', function (e) { addFiles(e.target.files, false); e.target.value = ''; });
document.addEventListener('click', function (e) {
  if (e.target.closest('[data-start]')) startFlow();
  else if (e.target.closest('[data-add-photos]')) $('#file-more').click();
  else if (e.target.closest('[data-go="home"]')) leaveToHome(e.target.closest('[data-go]'));
});
function leaveToHome(trigger) {
  if (ADMIN_NO) {   /* admin: the logo leads back to the order, not to the shop */
    if (!S.dirty) { allowUnload = true; return location.assign(ADMIN_BASE); }
    return openDialog({ trigger: trigger, title: 'Leave without saving?', body: 'Your changes to this album haven’t been saved yet.',
      actions: [{ label: 'Stay here', kind: 'primary' }, { label: 'Leave without saving', fn: function () { allowUnload = true; location.assign(ADMIN_BASE); } }] });
  }
  if (S.view === 'home') return window.scrollTo(0, 0);
  if (!S.album || S.view === 'done') return go('home');
  openDialog({ trigger: trigger, title: 'Go back to the home page?', body: 'Your album is safe as long as this page stays open. To keep arranging, choose Continue your album on the home page.',
    actions: [{ label: 'Go home', kind: 'primary', fn: function () { labelStart(); go('home'); } }, { label: 'Stay here' }] });
}

/* ---------- studio ---------- */
function enterStudio(rebuild, tail) {
  if (rebuild || !S.album) {
    S.album = newAlbum(S.layout, S.photos);
    S.album.cat = S.cat;
    pourPhotos(S.album, S.photos.map(function (p, i) { return i; }));
    S.page = 0; S.sel = null; S.armed = null; S.swap = null; S.dirty = false; S.tab = 'foto';
  }
  S.album.cover = curCover().id;
  drawStudio();
  var tt = totals(S.album), extra = S.photos.length - tt.filled;
  go('studio', null, !rebuild ? null : function () { toast((tt.empty ? t('{n} photos placed. {m} frames still empty.', { n: tt.filled, m: tt.empty }) : extra > 0 ? t('{n} photos placed. {m} more photos are on the shelf.', { n: tt.filled, m: extra }) : t('All {n} frames filled. Just tidy up.', { n: tt.filled })) + (tail || '')); });
}
function viewPages(p) {                       /* which pages share the screen with page p */
  if (!wide.matches) return [p];
  if (p === 0) return [null, 0];
  var l = p % 2 ? p : p - 1;
  return [l, l + 1 < S.album.pages.length ? l + 1 : null];
}
function viewList() {
  var out = [], n = S.album.pages.length, seen = {};
  for (var p = 0; p < n; p++) { var v = viewPages(p), k = v.join(); if (!seen[k]) { seen[k] = 1; out.push(v); } }
  return out;
}
function pageLabel(v) {
  var real = v.filter(function (x) { return x != null; }).map(function (x) { return x + 1; });
  return t('Page {p} of {n}', { p: real.join('–'), n: S.album.pages.length });
}
function drawStudio() {
  var cat = catOf(S.cat);
  $('#st-name').textContent = curCover().name;
  $('#st-meta').textContent = t('{name} layout · A4 · 40 pages', { name: LAYOUTS[S.layout].name });
  $('.studio').dataset.tab = S.tab;
  drawProgress(); drawPages(); drawStage(); drawTabs(); drawTray(); drawSlotTool(); drawTextFields(); drawHint();
  fixWidows($('#st-panel'));
}
function drawProgress() {
  var t = totals(S.album);
  $('#st-filled').textContent = t.filled; $('#st-total').textContent = t.total;
  $('#st-prog-fill').style.width = (t.filled / t.total * 100) + '%';
  $('#st-prog').classList.toggle('is-full', !t.empty);
  var note = $('#st-note');
  note.hidden = !t.empty;
  if (t.empty) $('#st-note-t').textContent = _t('{n} photo frames still empty.', { n: t.empty });
}
function emptyOnPage(p) { return S.album.pages[p].slots.filter(function (s) { return s.photo == null; }).length; }
function drawPages() {
  var nav = $('#st-pages'); nav.textContent = '';
  viewList().forEach(function (v) {
    var b = h('button', 'pt'); b.type = 'button'; b.dataset.v = v.join();
    var sp = h('span', 'pt-s'), miss = 0;
    v.forEach(function (p) {
      if (p == null) { sp.appendChild(h('span', 'pt-blank')); return; }
      sp.appendChild(renderPage(S.album, p, 'thumb')); miss += emptyOnPage(p);
    });
    b.appendChild(sp);
    var real = v.filter(function (x) { return x != null; }).map(function (x) { return x + 1; });
    b.appendChild(h('span', 'pt-n num', real.join('–')));
    if (miss) { var bd = h('span', 'pt-badge num', String(miss)); b.appendChild(bd); }
    b.setAttribute('aria-label', pageLabel(v) + (miss ? t(', {n} empty frames', { n: miss }) : ''));
    if (v.indexOf(S.page) > -1) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', function () { gotoPage(v[0] != null ? v[0] : v[1]); });
    nav.appendChild(b);
  });
}
function refreshNavFor(p) {
  var v = viewPages(p), b = $('.pt[data-v="' + v.join() + '"]');
  if (!b) return;
  var sp = $('.pt-s', b), miss = 0; sp.textContent = '';
  v.forEach(function (q) { if (q == null) { sp.appendChild(h('span', 'pt-blank')); return; } sp.appendChild(renderPage(S.album, q, 'thumb')); miss += emptyOnPage(q); });
  var bd = $('.pt-badge', b);
  if (miss) { if (!bd) { bd = h('span', 'pt-badge num'); b.appendChild(bd); } bd.textContent = miss; } else if (bd) bd.remove();
  b.setAttribute('aria-label', pageLabel(v) + (miss ? t(', {n} empty frames', { n: miss }) : ''));
}
function drawStage() {
  var sp = $('#spread'), v = viewPages(S.page);
  sp.textContent = '';
  sp.classList.toggle('is-single', v.length === 1);
  v.forEach(function (p, i) {
    if (p == null) { sp.appendChild(h('div', 'spread-blank', i === 0 ? 'Inside front cover' : 'Inside back cover')); return; }
    sp.appendChild(decorate(renderPage(S.album, p, 'edit'), p));
  });
  $('#pg-label').textContent = pageLabel(v);
  var list = viewList(), at = list.map(function (x) { return x.join(); }).indexOf(v.join());
  $('#pg-prev').disabled = at <= 0; $('#pg-next').disabled = at >= list.length - 1;
  $$('.pt').forEach(function (b) { if (b.dataset.v === v.join()) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
}
/* post-process an edit page: small slots, selection frame, selected text */
function decorate(pg, p) {
  var P = S.album.tpl.pages[p];
  $$('.slot', pg).forEach(function (el) { var g = slotGeo(S.album, p, +el.dataset.s); if (g[2] < 150 || g[3] < 150) el.classList.add('is-tiny'); if (isCrop(p, +el.dataset.s)) el.classList.add('is-crop'); });
  var s = S.sel;
  if (s && s.p === p) {
    if (s.t === 'slot') {
      pg.appendChild(selFrame(p, s.i));
    } else { var el2 = $('[data-' + s.t + '="' + s.i + '"]', pg); if (el2) el2.classList.add('is-sel'); }
  }
  return pg;
}
function pageNode(p) { return $('#spread .pg[data-p="' + p + '"]'); }
function redrawPage(p) { var old = pageNode(p); if (old) old.replaceWith(decorate(renderPage(S.album, p, 'edit'), p)); }
/* swap only the text layer, so photos do not flash while typing */
function redrawTexts(p) {
  var old = pageNode(p); if (!old) return;
  var fresh = decorate(renderPage(S.album, p, 'edit'), p);
  $$('.tx,.pa,.cp-bar', old).forEach(function (n) { n.remove(); });
  var anchor = $('.sel-frame', old);
  $$('.tx,.pa,.cp-bar', fresh).forEach(function (n) { old.insertBefore(n, anchor); });
}
function gotoPage(p, keepSel) {
  S.page = clamp(p, 0, S.album.pages.length - 1);
  if (!keepSel) { S.sel = null; S.crop = null; }
  drawStage(); drawSlotTool(); drawTextFields();
  var cur = $('.pt[aria-current="true"]');
  if (cur && cur.offsetParent) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function stepPage(d) {
  var list = viewList(), at = list.map(function (x) { return x.join(); }).indexOf(viewPages(S.page).join()), nx = list[clamp(at + d, 0, list.length - 1)];
  gotoPage(nx[0] != null ? nx[0] : nx[1]);
}
$('#pg-prev').addEventListener('click', function () { stepPage(-1); });
$('#pg-next').addEventListener('click', function () { stepPage(1); });

/* tabs (foto / teks / halaman) */
function drawTabs() {
  $('.studio').dataset.tab = S.tab;
  $$('.tabs [role="tab"]').forEach(function (t) {
    var on = t.dataset.tab === S.tab;
    t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
  });
  $('#pane-foto').hidden = S.tab !== 'foto';
  $('#pane-teks').hidden = S.tab !== 'teks';
}
function setTab(tab) { if (tab === 'hal' && wide.matches) tab = 'foto'; S.tab = tab; drawTabs(); }
$('.tabs').addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t) setTab(t.dataset.tab); });
$('.tabs').addEventListener('keydown', function (e) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  var tabs = $$('.tabs [role="tab"]').filter(function (t) { return t.offsetParent; }), at = tabs.indexOf(document.activeElement);
  if (at < 0) return;
  var nx = tabs[(at + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  setTab(nx.dataset.tab); nx.focus();
});

/* tray */
function drawTray() {
  var tray = $('#tray'), u = usage(S.album);
  tray.textContent = '';
  $('#tray-n').textContent = S.photos.length;
  byDate(S.photos, S.photos.map(function (p, i) { return i; })).forEach(function (i) {
    var p = S.photos[i], b = h('button', 'th' + (S.armed === i ? ' is-armed' : '')); b.type = 'button'; b.dataset.ph = i; b.draggable = true;
    var im = new Image(); im.src = p.thumb; im.alt = ''; im.loading = 'lazy'; im.draggable = false; b.appendChild(im);
    if (p.date) b.appendChild(h('span', 'th-date num', p.date.getDate() + ' ' + months()[p.date.getMonth()]));
    if (u[i]) b.appendChild(h('span', 'th-used num', u[i] > 1 ? u[i] + '×' : '✓'));
    b.setAttribute('aria-label', t('Photo') + (p.date ? ' ' + fmtDate(p.date) : '') + (u[i] ? t(', used {n} times', { n: u[i] }) : t(', not used yet')) + t('. Pick to place it'));
    tray.appendChild(b);
  });
  $('#tray-tip').textContent = S.sel && S.sel.t === 'slot' ? 'Pick a photo below to put it in the selected frame.' : 'Pick a frame on the page, then pick its photo here. Photos are sorted oldest first.';
}
$('#tray').addEventListener('click', function (e) {
  var b = e.target.closest('.th'); if (!b) return;
  var i = +b.dataset.ph;
  if (S.sel && S.sel.t === 'slot') { placePhoto(S.sel.p, S.sel.i, i, true); return; }
  S.armed = S.armed === i ? null : i; S.swap = null;
  drawTray(); drawHint();
});
$('#tray').addEventListener('dragstart', function (e) {
  var b = e.target.closest('.th'); if (!b) return;
  e.dataTransfer.setData('text/plain', 'imz:' + b.dataset.ph); e.dataTransfer.effectAllowed = 'copy';
});
function placePhoto(p, si, photoIdx, advance) {
  setSlot(S.album, p, si, photoIdx);
  S.dirty = true; S.armed = null;
  if (advance) {                                   /* jump to the next empty slot in view, to fill several in a row */
    var nxt = null;
    viewPages(S.page).forEach(function (q) { if (q != null && !nxt) S.album.pages[q].slots.forEach(function (s, k) { if (!nxt && s.photo == null) nxt = { t: 'slot', p: q, i: k }; }); });
    S.sel = nxt || { t: 'slot', p: p, i: si };
  }
  viewPages(S.page).forEach(function (q) { if (q != null) redrawPage(q); });
  refreshNavFor(p); drawProgress(); drawTray(); drawSlotTool(); drawHint();
}

/* slot tool */
function selSlot() { return S.sel && S.sel.t === 'slot' ? S.album.pages[S.sel.p].slots[S.sel.i] : null; }
function capOfSlot(p, si) { var cps = S.album.tpl.pages[p].cp; for (var i = 0; i < cps.length; i++) if (cps[i].p === si) return i; return -1; }
function drawSlotTool() {
  drawTxBar();
  var tool = $('#slot-tool'), s = selSlot();
  tool.hidden = !s;
  $('.studio').classList.toggle('has-sel', !!s);
  drawPhBar();
  if (!s) { $('#tray-tip').textContent = 'Pick a frame on the page, then pick its photo here. Photos are sorted oldest first.'; return; }
  var filled = s.photo != null;
  $('#slot-tool-h').textContent = t('Photo {i} on page {p}', { i: S.sel.i + 1, p: S.sel.p + 1 }) + (filled ? '' : t(' · empty'));
  $('#slot-tool-filled').hidden = !filled;
  $('#slot-tool-empty').hidden = filled;
  var ci = capOfSlot(S.sel.p, S.sel.i), capBox = $('#slot-cap');
  capBox.hidden = ci < 0 || !filled;
  if (ci > -1 && filled) {
    var inp = $('#slot-cap-in'), val = captionValue(S.album, S.sel.p, ci), ph = S.photos[s.photo];
    if (document.activeElement !== inp) inp.value = val;
    var chip = $('#slot-cap-date'), dateStr = ph.date ? fmtDate(ph.date) : '';
    chip.hidden = !dateStr || val === dateStr;
    chip.textContent = t('Use the date from the photo file: {d}', { d: dateStr });
    $('#slot-cap-x').hidden = !val;
  }
  $('#tray-tip').textContent = 'Pick a photo below to put it in the selected frame.';
}
/* Bilah alat foto yang mengambang di atas bingkai terpilih, langsung di halaman (24 Nov 2026, ganti slider zoom di panel). */
function drawPhBar() {
  var bar = $('#ph-bar'), s = selSlot(), fr = s && s.photo != null ? $('#spread .sel-frame') : null;
  if (!fr || pan && panned) { bar.hidden = true; return; }
  bar.hidden = false;
  $('#zoom-o').textContent = Math.round(s.z * 100) + '%';
  $('#ph-zout').disabled = s.z <= 1.001; $('#ph-zin').disabled = s.z >= 2.999;
  $('#slot-size').hidden = !s.g;
  var cb = $('#slot-crop'), on = isCrop(S.sel.p, S.sel.i); cb.setAttribute('aria-pressed', on ? 'true' : 'false');
  $('span', cb).textContent = on ? 'Done adjusting' : 'Adjust photo'; cb.setAttribute('aria-label', on ? 'Done adjusting' : 'Adjust photo');
  var st = $('#st-stage').getBoundingClientRect(), r = fr.getBoundingClientRect(), bw = bar.offsetWidth, bh = bar.offsetHeight;
  var top = r.top - st.top - bh - 10;
  if (top < 4) top = r.bottom - st.top + 10;
  if (top + bh > st.height - 4) top = Math.max(4, r.top - st.top + 10);   /* bingkai setinggi halaman: bilah di dalam bingkai, di atas */
  bar.style.left = clamp(r.left - st.left + r.width / 2 - bw / 2, 4, st.width - bw - 4) + 'px';
  bar.style.top = top + 'px';
}
window.addEventListener('resize', function () { if (S.view === 'studio') drawPhBar(); });
var zoomNav = 0;
function zoomSlot(p, i, z, px, py) {
  var s = S.album.pages[p].slots[i]; if (s.photo == null) return;
  var g = slotGeo(S.album, p, i), ph = S.photos[s.photo], a = imgBox(ph, g[2], g[3], s);
  px = px == null ? 0.5 : px; py = py == null ? 0.5 : py;
  var ix = (px * 100 - a.L) / a.W, iy = (py * 100 - a.T) / a.H;   /* titik foto di bawah jari/kursor tetap di tempat */
  s.z = clamp(z, 1, 3);
  var b = imgBox(ph, g[2], g[3], s);
  if (b.W - 100 > 0.01) s.fx = clamp((ix * b.W - px * 100) / (b.W - 100), 0, 1);
  if (b.H - 100 > 0.01) s.fy = clamp((iy * b.H - py * 100) / (b.H - 100), 0, 1);
  S.dirty = true;
  var el = $('.slot[data-s="' + i + '"] img', pageNode(p)); if (el) placeImg(el, ph, g[2], g[3], s);
  drawPhBar();
  clearTimeout(zoomNav); zoomNav = setTimeout(function () { refreshNavFor(p); }, 300);
}
$('#slot-crop').addEventListener('click', function () { if (!S.sel || S.sel.t !== 'slot') return; setCrop(isCrop(S.sel.p, S.sel.i) ? null : S.sel.p, S.sel.i); });
$('#ph-zout').addEventListener('click', function () { var s = selSlot(); if (s) zoomSlot(S.sel.p, S.sel.i, s.z - 0.15); });
$('#ph-zin').addEventListener('click', function () { var s = selSlot(); if (s) zoomSlot(S.sel.p, S.sel.i, s.z + 0.15); });
$('#slot-clear').addEventListener('click', function () {
  if (!S.sel) return;
  var p = S.sel.p, i = S.sel.i, prev = Object.assign({}, S.album.pages[p].slots[i]);
  setSlot(S.album, p, i, null); S.dirty = true;
  redrawPage(p); refreshNavFor(p); drawProgress(); drawTray(); drawSlotTool();
  toast('Frame cleared.', { label: 'Undo', fn: function () { Object.assign(S.album.pages[p].slots[i], prev); redrawPage(p); refreshNavFor(p); drawProgress(); drawTray(); drawSlotTool(); } });
});
$('#slot-swap').addEventListener('click', function () { if (!S.sel) return; S.swap = { p: S.sel.p, i: S.sel.i }; S.armed = null; drawHint(); });
function setCaption(p, ci, val) { S.album.pages[p].cp[ci] = val; S.dirty = true; redrawTexts(p); }
$('#slot-cap-in').addEventListener('input', function (e) {
  if (!S.sel) return; var ci = capOfSlot(S.sel.p, S.sel.i); if (ci < 0) return;
  setCaption(S.sel.p, ci, e.target.value); drawSlotTool(); syncField(S.sel.p, 'cp', ci, e.target.value);
});
$('#slot-cap-date').addEventListener('click', function () {
  var s = selSlot(), ci = capOfSlot(S.sel.p, S.sel.i); if (!s || ci < 0) return;
  var d = fmtDate(S.photos[s.photo].date);
  setCaption(S.sel.p, ci, d); $('#slot-cap-in').value = d; drawSlotTool(); syncField(S.sel.p, 'cp', ci, d);
});
$('#slot-cap-x').addEventListener('click', function () {
  var ci = S.sel ? capOfSlot(S.sel.p, S.sel.i) : -1; if (ci < 0) return;
  setCaption(S.sel.p, ci, ''); $('#slot-cap-in').value = ''; drawSlotTool(); syncField(S.sel.p, 'cp', ci, '');
  $('#slot-cap-in').focus();
});
function drawHint() {
  var hint = $('#st-hint'), on = S.swap || S.armed != null;
  hint.hidden = !on;
  if (on) $('#st-hint-t').textContent = S.swap ? 'Pick another frame to swap photos' : 'Pick a frame for this photo';
}
$('#st-hint-x').addEventListener('click', function () { S.swap = null; S.armed = null; drawHint(); drawTray(); });

/* text fields for the pages in view */
function fieldId(p, t, i) { return 'tf-' + p + '-' + t + '-' + i; }
function syncField(p, t, i, val) { var f = $('#' + fieldId(p, t, i)); if (f && document.activeElement !== f) f.value = val; }
function drawTextFields() {
  var box = $('#text-fields'); box.textContent = '';
  var any = false;
  viewPages(S.page).forEach(function (p) {
    if (p == null) return;
    var P = S.album.tpl.pages[p], st = S.album.pages[p], items = [], minor = [];
    P.tx.forEach(function (t, i) {
      var it = { t: 'tx', i: i, y: t.y, x: t.x };
      if (t.k === 'e') { it.label = t.pre ? _t('Text after “{s}”', { s: t.pre.trim() }) : t.z >= 40 ? 'Title' : 'Short text'; it.val = st.tx[i] || ''; it.max = 60; it.ph = t.z >= 40 ? 'Write the title' : 'Write the text'; items.push(it); }
      else { it.label = _t('Label “{s}”', { s: t.t }); it.val = st.tx[i] != null ? st.tx[i] : t.t; it.max = 24; it.ph = 'Empty'; minor.push(it); }
    });
    P.pa.forEach(function (pa, i) { items.push({ t: 'pa', i: i, y: pa.y, x: pa.x, label: 'Paragraph', val: st.pa[i] || '', max: paraLimit(pa), area: true, ph: 'Tell the story of this moment' }); });
    P.cp.forEach(function (cp, i) {
      if (!cp.bar && !captionValue(S.album, p, i) && cp.p != null && st.slots[cp.p].photo == null) return;
      items.push({ t: 'cp', i: i, y: cp.y, x: cp.x, label: cp.p != null ? t('Photo caption {n}', { n: cp.p + 1 }) : 'Caption', val: captionValue(S.album, p, i), max: capLimit(cp), ph: CAP_HINT });
    });
    if (!items.length && !minor.length) return;
    any = true;
    var grp = h('section', 'tf-g'); grp.appendChild(h('h3', 'tf-h', t('Page {n}', { n: p + 1 })));
    items.sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (it) { grp.appendChild(fieldNode(p, it)); });
    if (minor.length) {
      var more = h('details', 'tf-more'); more.appendChild(h('summary', null, t('Numbers and small labels ({n})', { n: minor.length })));
      var list = h('div', 'tf-list'); minor.sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (it) { list.appendChild(fieldNode(p, it)); });
      more.appendChild(list);
      if (S.sel && S.sel.p === p && S.sel.t === 'tx' && P.tx[S.sel.i] && P.tx[S.sel.i].k !== 'e') more.open = true;
      grp.appendChild(more);
    }
    box.appendChild(grp);
  });
  if (!any) { var em = h('div', 'empty'); em.appendChild(h('b', null, 'This page has no text.')); em.appendChild(document.createTextNode('Open another page to write a title, a paragraph, or photo captions.')); box.appendChild(em); }
}
function fieldNode(p, it) {
  var wrap = h('div', 'tf' + (S.sel && S.sel.p === p && S.sel.t === it.t && S.sel.i === it.i ? ' is-sel' : ''));
  var id = fieldId(p, it.t, it.i), row = h('div', 'tf-row'), lb = h('label', 'fld-l', it.label);
  lb.htmlFor = id; row.appendChild(lb);
  var inp = h(it.area ? 'textarea' : 'input', 'in');
  inp.id = id; if (!it.area) inp.type = 'text'; else inp.rows = 3;
  inp.value = it.val; inp.placeholder = it.ph; inp.autocomplete = 'off';   /* tanpa batas jumlah huruf */
  var cnt = null;
  inp.addEventListener('focus', function () {
    S.sel = { t: it.t, p: p, i: it.i };
    $$('.tf.is-sel').forEach(function (n) { n.classList.remove('is-sel'); }); wrap.classList.add('is-sel');
    $$('#spread .is-sel').forEach(function (n) { n.classList.remove('is-sel'); }); $$('#spread .sel-frame').forEach(function (n) { n.remove(); });
    var el = $('[data-' + it.t + '="' + it.i + '"]', pageNode(p)); if (el) el.classList.add('is-sel');
    $('#slot-tool').hidden = true;
  });
  inp.addEventListener('input', function () {
    var st = S.album.pages[p];
    if (it.t === 'tx') st.tx[it.i] = inp.value; else if (it.t === 'pa') st.pa[it.i] = inp.value; else st.cp[it.i] = inp.value;
    S.dirty = true;
    if (cnt) cnt.textContent = inp.value.length + '/' + it.max;
    redrawTexts(p);
  });
  wrap.appendChild(row); wrap.appendChild(inp);
  return wrap;
}
/* Teks diketik langsung di halaman (24 Nov 2026): ketuk teks, kursor muncul di tempatnya. Tab Teks tetap ada sebagai daftar. */
var editing = null;
function caretEnd(n) { var r = document.createRange(), sl = window.getSelection(); r.selectNodeContents(n); r.collapse(false); sl.removeAllRanges(); sl.addRange(r); }
function editText(p, t, i) {
  if (editing && editing.p === p && editing.t === t && editing.i === i) return;
  endEdit();
  S.sel = { t: t, p: p, i: i }; S.armed = null; S.swap = null;
  $$('#spread .is-sel').forEach(function (n) { n.classList.remove('is-sel'); }); $$('#spread .sel-frame').forEach(function (n) { n.remove(); });
  drawSlotTool(); drawHint();
  if (S.tab === 'teks') drawTextFields();
  var box = $('[data-' + t + '="' + i + '"]', pageNode(p)); if (!box) return;
  var node = $(t === 'pa' ? '.pa-t' : '.tx-v', box); if (!node) return;
  var st = S.album.pages[p], cur = t === 'tx' ? (st.tx[i] != null ? st.tx[i] : (S.album.tpl.pages[p].tx[i].k === 'e' ? '' : S.album.tpl.pages[p].tx[i].t)) : t === 'pa' ? st.pa[i] || '' : captionValue(S.album, p, i);
  box.classList.add('is-sel', 'is-editing');
  if (box.classList.contains('is-empty')) { box.classList.remove('is-empty'); node.textContent = cur; }
  try { node.contentEditable = 'plaintext-only'; } catch (e) { }
  if (node.contentEditable !== 'plaintext-only') node.contentEditable = 'true';
  node.spellcheck = false; node.setAttribute('role', 'textbox'); node.setAttribute('aria-label', t === 'pa' ? 'Paragraph' : t === 'cp' ? 'Photo caption' : 'Text');
  if (t === 'pa') node.setAttribute('aria-multiline', 'true');
  editing = { p: p, t: t, i: i, node: node, nav: 0 };
  node.focus({ preventScroll: true }); caretEnd(node);
}
/* Teks apa adanya dari elemen yang diketik. Bukan innerText: innerText mengikuti CSS (text-transform: uppercase),
   sehingga teks yang tampil kapital tersimpan kapital dan tidak bisa dikembalikan lewat tombol AA. */
function nodeText(n) {
  var out = '';
  n.childNodes.forEach(function (c, k) {
    if (c.nodeType === 3) out += c.data;
    else if (c.nodeName === 'BR') out += '\n';
    else if (c.nodeType === 1) { if (k > 0 && /^(DIV|P)$/.test(c.nodeName)) out += '\n'; out += nodeText(c); }
  });
  return out;
}
function readEdit() {
  var e = editing, v = nodeText(e.node).replace(/\u00a0/g, ' ');
  if (e.t !== 'pa') v = v.replace(/\n+/g, ' ');
  else v = v.replace(/\n$/, '');
  var st = S.album.pages[e.p];
  if (e.t === 'tx') st.tx[e.i] = v; else if (e.t === 'pa') st.pa[e.i] = v; else st.cp[e.i] = v;
  S.dirty = true; syncField(e.p, e.t, e.i, v);
  if (e.t === 'cp' && S.sel && S.sel.t === 'slot') drawSlotTool();
  clearTimeout(e.nav); e.nav = setTimeout(function () { refreshNavFor(e.p); }, 400);
}
function endEdit() {
  var e = editing; if (!e) return;
  editing = null; clearTimeout(e.nav);
  e.node.removeAttribute('contenteditable');
  redrawTexts(e.p); refreshNavFor(e.p); drawTxBar();
}
$('#spread').addEventListener('input', function (e) { if (editing && e.target === editing.node) readEdit(); });
$('#spread').addEventListener('keydown', function (e) {
  if (!editing || e.target !== editing.node) return;
  if (e.key === 'Escape' || e.key === 'Enter' && (editing.t !== 'pa' || e.metaKey || e.ctrlKey)) { e.preventDefault(); endEdit(); }
}, true);
/* Selesai mengetik saat fokus pindah. Bila fokus pindah karena jari/mouse sedang menekan, teks baru digambar ulang sesudah
   klik itu sampai, supaya klik langsung ke teks atau foto lain tidak hilang karena elemennya diganti di tengah klik. */
var ptrDown = false, endLater = false;
document.addEventListener('pointerdown', function () { ptrDown = true; }, true);
['pointerup', 'pointercancel'].forEach(function (ev) {
  document.addEventListener(ev, function () {
    ptrDown = false;
    if (endLater) { endLater = false; setTimeout(function () { if (editing && document.activeElement !== editing.node) endEdit(); }, 0); }
  }, true);
});
$('#spread').addEventListener('focusout', function (e) { if (!editing || e.target !== editing.node) return; if (ptrDown) endLater = true; else endEdit(); });
$('#spread').addEventListener('paste', function (e) {   /* tempel sebagai teks biasa, juga di browser tanpa plaintext-only */
  if (!editing || e.target !== editing.node || editing.node.contentEditable === 'plaintext-only') return;
  e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
});
function selectSlot(p, i) {
  endEdit();
  if (S.crop && !isCrop(p, i)) S.crop = null;
  S.sel = { t: 'slot', p: p, i: i };
  if (S.tab !== 'foto') setTab('foto');
  viewPages(S.page).forEach(function (q) { if (q != null) { var pg = pageNode(q); $$('.sel-frame', pg).forEach(function (n) { n.remove(); }); $$('.is-sel', pg).forEach(function (n) { n.classList.remove('is-sel'); }); } });
  pageNode(p).appendChild(selFrame(p, i));
  drawSlotTool(); drawTray();
}
function deselect() {
  endEdit(); S.crop = null;
  if (!S.sel) return;
  S.sel = null;
  $$('#spread .sel-frame').forEach(function (n) { n.remove(); }); $$('#spread .is-sel').forEach(function (n) { n.classList.remove('is-sel'); });
  $$('.tf.is-sel').forEach(function (n) { n.classList.remove('is-sel'); });
  drawSlotTool(); drawTray();
}

/* pointer work on the page (24 Nov 2026, seperti Canva): geser foto = memindahkan bingkainya di halaman.
   Mode "atur isi foto" (klik dua kali, atau tombol di bilah foto): geser = memilih bagian foto yang tampil di bingkai. */
var pan = null, panned = false;
function isCrop(p, i) { return !!(S.crop && S.crop.p === p && S.crop.i === i); }
function setCrop(p, i) {
  S.crop = p == null ? null : { p: p, i: i };
  $$('#spread .slot.is-crop').forEach(function (n) { n.classList.toggle('is-crop', false); });
  $$('#spread .sel-frame').forEach(function (n) { n.classList.toggle('is-crop', !!S.crop); });
  if (S.crop) { var el = $('.slot[data-s="' + i + '"]', pageNode(p)); if (el) el.classList.add('is-crop'); }
  drawPhBar();
}
function slotClick(p, i) {
  var s = S.album.pages[p].slots[i];
  if (S.swap) {
    var a = S.album.pages[S.swap.p].slots[S.swap.i], pa = a.photo, pb = s.photo;
    if (S.swap.p !== p || S.swap.i !== i) {
      setSlot(S.album, S.swap.p, S.swap.i, pb); setSlot(S.album, p, i, pa); S.dirty = true;
      refreshNavFor(S.swap.p); refreshNavFor(p);
    }
    S.swap = null; S.sel = { t: 'slot', p: p, i: i };
    viewPages(S.page).forEach(function (q) { if (q != null) redrawPage(q); });
    drawProgress(); drawTray(); drawSlotTool(); drawHint();
    return;
  }
  if (S.armed != null) { var ph = S.armed; S.sel = { t: 'slot', p: p, i: i }; placePhoto(p, i, ph, false); return; }
  selectSlot(p, i);
}
/* Bingkai foto bisa di-resize di kanvas (24 Nov 2026, "kayak di Canva"): bingkai terpilih punya 8 pegangan.
   Sudut = ukuran ikut proporsi (Shift = bebas), sisi = lebar atau tinggi saja. Foto di dalamnya tetap memenuhi bingkai. */
var RS_H = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
function frameCss(el, g) {
  el.style.left = pct(g[0], 1000); el.style.top = pct(g[1], PAGE_H); el.style.width = pct(g[2], 1000); el.style.height = pct(g[3], PAGE_H);
  el.style.transform = g[4] ? 'rotate(' + g[4] + 'deg)' : '';
}
function selFrame(p, i) {
  var fr = h('div', 'sel-frame' + (isCrop(p, i) ? ' is-crop' : '')); frameCss(fr, slotGeo(S.album, p, i));
  RS_H.forEach(function (k) { var b = h('span', 'rs-h rs-' + k); b.dataset.h = k; b.setAttribute('aria-hidden', 'true'); fr.appendChild(b); });
  return fr;
}
var rs = null, dragEnd = 0;
$('#spread').addEventListener('pointerdown', function (e) {
  var hd = e.target.closest('.rs-h'); if (!hd || e.button > 0 || !S.sel || S.sel.t !== 'slot') return;
  e.preventDefault(); e.stopImmediatePropagation();
  var p = S.sel.p, i = S.sel.i, pg = pageNode(p), g = slotGeo(S.album, p, i), s = S.album.pages[p].slots[i];
  rs = { p: p, i: i, k: hd.dataset.h, id: e.pointerId, x0: e.clientX, y0: e.clientY, g0: g.slice(), prev: s.g ? s.g.slice() : null, w: pg.offsetWidth, hh: pg.offsetHeight, rot: (g[4] || 0) * Math.PI / 180, slot: $('.slot[data-s="' + i + '"]', pg), fr: $('.sel-frame', pg) };
  try { $('#spread').setPointerCapture(e.pointerId); } catch (er) {}
  $('#ph-bar').hidden = true; $('#spread').classList.add('is-resizing');
}, true);
$('#spread').addEventListener('pointermove', function (e) {
  if (!rs || e.pointerId !== rs.id) return;
  e.stopImmediatePropagation();
  var dx = e.clientX - rs.x0, dy = e.clientY - rs.y0, c = Math.cos(-rs.rot), sn = Math.sin(-rs.rot);
  var du = (dx * c - dy * sn) / rs.w * 1000, dv = (dx * sn + dy * c) / rs.hh * PAGE_H;   /* geser dalam arah bingkai (bingkai miring ikut) */
  var g0 = rs.g0, k = rs.k, MIN = 40, x = g0[0], y = g0[1], w = g0[2], hh = g0[3];
  var E = k.indexOf('e') > -1, W = k.indexOf('w') > -1, N = k.indexOf('n') > -1, Sx = k.indexOf('s') > -1;
  if (E) w = g0[2] + du; if (W) w = g0[2] - du;
  if (Sx) hh = g0[3] + dv; if (N) hh = g0[3] - dv;
  if (k.length === 2 && !e.shiftKey) {   /* sudut: proporsi tetap */
    var f = Math.abs(w / g0[2] - 1) > Math.abs(hh / g0[3] - 1) ? w / g0[2] : hh / g0[3];
    f = Math.max(f, MIN / Math.min(g0[2], g0[3])); w = g0[2] * f; hh = g0[3] * f;
  }
  w = clamp(w, MIN, 1000); hh = clamp(hh, MIN, PAGE_H);
  if (W) x = g0[0] + g0[2] - w; if (N) y = g0[1] + g0[3] - hh;
  if (x < 0) { if (W) w += x; x = 0; } if (y < 0) { if (N) hh += y; y = 0; }
  if (x + w > 1000) w = 1000 - x; if (y + hh > PAGE_H) hh = PAGE_H - y;
  var s = S.album.pages[rs.p].slots[rs.i], ng = [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(w * 10) / 10, Math.round(hh * 10) / 10];
  s.g = ng; rs.moved = true;
  var full = ng.concat([g0[4] || 0]);
  frameCss(rs.slot, full); if (rs.fr) frameCss(rs.fr, full);
  var im = $('img', rs.slot); if (im && s.photo != null) placeImg(im, S.photos[s.photo], ng[2], ng[3], s);
}, true);
function endResize(e) {
  if (!rs || e.pointerId !== rs.id) return;
  var r = rs; rs = null; $('#spread').classList.remove('is-resizing');
  if (!r.moved) { drawPhBar(); return; }
  var s = S.album.pages[r.p].slots[r.i], t0 = S.album.tpl.pages[r.p].ph[r.i];
  if (Math.abs(s.g[0] - t0[0]) < 0.5 && Math.abs(s.g[1] - t0[1]) < 0.5 && Math.abs(s.g[2] - t0[2]) < 0.5 && Math.abs(s.g[3] - t0[3]) < 0.5) delete s.g;
  S.dirty = true; redrawPage(r.p); refreshNavFor(r.p); drawPhBar(); dragEnd = Date.now();   /* klik yang ikut sesudah resize tidak dihitung */
  toast('Photo resized.', { label: 'Undo', fn: function () { if (r.prev) s.g = r.prev; else delete s.g; redrawPage(r.p); refreshNavFor(r.p); drawPhBar(); } });
}
$('#spread').addEventListener('pointerup', endResize, true);
$('#spread').addEventListener('pointercancel', endResize, true);
$('#slot-size').addEventListener('click', function () {
  var s = selSlot(); if (!s || !s.g) return;
  var p = S.sel.p, prev = s.g.slice(); delete s.g; S.dirty = true;
  redrawPage(p); refreshNavFor(p); drawPhBar();
  toast('Back to the original size.', { label: 'Undo', fn: function () { s.g = prev; redrawPage(p); refreshNavFor(p); drawPhBar(); } });
});

/* Teks di halaman bisa digeser bebas dengan mouse/jari (24 Nov 2026). Ketuk tanpa menggeser = mengetik. */
var tmove = null, tmoved = false;
function textBase(p, t, i) {
  var P = S.album.tpl.pages[p], sz = t === 'pa' ? 0 : textStyle(S.album, p, t, i).s;   /* garis dasar ikut ukuran huruf yang dipilih */
  if (t === 'tx') return [P.tx[i].x, P.tx[i].y - 0.847 * sz];
  if (t === 'pa') return [P.pa[i].x, P.pa[i].y];
  return [P.cp[i].x, P.cp[i].y - 0.847 * sz];
}
function unselectAll() {
  $$('#spread .is-sel').forEach(function (n) { n.classList.toggle('is-sel', false); });
  $$('#spread .sel-frame').forEach(function (n) { n.parentNode.removeChild(n); });
}
$('#spread').addEventListener('pointerdown', function (e) {
  if (e.button > 0 || pan) return;
  var el = e.target.closest('[data-tx],[data-pa],[data-cp]'); if (!el) return;
  if (editing && editing.node.contains(e.target)) return;   /* sedang mengetik di teks ini: geser = pilih huruf */
  var pg = el.closest('.pg'), t = el.dataset.tx != null ? 'tx' : el.dataset.pa != null ? 'pa' : 'cp', i = +el.dataset[t], p = +pg.dataset.p;
  var st = S.album.pages[p], key = t + i;
  tmoved = false;
  tmove = { el: el, p: p, t: t, i: i, key: key, id: e.pointerId, x0: e.clientX, y0: e.clientY, m0: textMove(st, key), base: textBase(p, t, i), w: pg.offsetWidth, h: pg.offsetHeight, on: false };
}, true);
$('#spread').addEventListener('pointermove', function (e) {
  if (!tmove || e.pointerId !== tmove.id) return;
  var dx = e.clientX - tmove.x0, dy = e.clientY - tmove.y0;
  if (!tmove.on) {
    if (Math.hypot(dx, dy) < 5) return;
    tmove.on = true; endEdit();
    tmove.el = $('[data-' + tmove.t + '="' + tmove.i + '"]', pageNode(tmove.p)) || tmove.el;   /* endEdit menggambar ulang teks */
    unselectAll(); S.sel = null; drawSlotTool();
    tmove.el.classList.add('is-sel', 'is-moving');
    try { $('#spread').setPointerCapture(e.pointerId); } catch (er) {}
  }
  var b = tmove.base, nx = clamp(tmove.m0[0] + dx / tmove.w * 1000, -b[0], 1000 - b[0] - 8), ny = clamp(tmove.m0[1] + dy / tmove.h * PAGE_H, -b[1], PAGE_H - b[1] - 12);
  tmove.now = [Math.round(nx * 10) / 10, Math.round(ny * 10) / 10];
  tmove.el.style.left = pct(b[0] + tmove.now[0], 1000); tmove.el.style.top = pct(b[1] + tmove.now[1], PAGE_H);
  e.stopImmediatePropagation();
}, true);
function endTextMove(e) {
  if (!tmove || e.pointerId !== tmove.id) return;
  var m = tmove; tmove = null;
  if (!m.on || !m.now) return;
  dragEnd = Date.now();
  var st = S.album.pages[m.p], prev = st.mv && st.mv[m.key] ? st.mv[m.key].slice() : null;
  st.mv = st.mv || {};
  if (Math.abs(m.now[0]) < 0.5 && Math.abs(m.now[1]) < 0.5) delete st.mv[m.key]; else st.mv[m.key] = m.now;
  S.dirty = true; redrawTexts(m.p); refreshNavFor(m.p);
  var el = $('[data-' + m.t + '="' + m.i + '"]', pageNode(m.p)); if (el) el.classList.add('is-sel');
  S.sel = { t: m.t, p: m.p, i: m.i }; drawTxBar();
  toast('Text moved.', { label: 'Undo', fn: function () { if (prev) st.mv[m.key] = prev; else delete st.mv[m.key]; redrawTexts(m.p); refreshNavFor(m.p); } });
}
$('#spread').addEventListener('pointerup', endTextMove, true);
$('#spread').addEventListener('pointercancel', endTextMove, true);
$('#spread').addEventListener('pointerdown', function (e) {
  if (pan && e.pointerId !== pan.id && e.pointerType === 'touch' && pan.s.photo != null) {   /* jari kedua di foto yang sedang digeser: cubit untuk zoom */
    pan.f2 = { id: e.pointerId, x: e.clientX, y: e.clientY }; pan.d0 = Math.hypot(e.clientX - pan.cx, e.clientY - pan.cy) || 1; pan.z0 = pan.s.z;
    if (!panned) { panned = true; if (!S.sel || S.sel.t !== 'slot' || S.sel.p !== pan.p || S.sel.i !== pan.i) selectSlot(pan.p, pan.i); }
    return;
  }
  var el = e.target.closest('.slot'); if (!el || e.button > 0) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s, s = S.album.pages[p].slots[i];
  panned = false;
  if (S.swap || S.armed != null) return;
  var g = slotGeo(S.album, p, i), crop = s.photo != null && isCrop(p, i), b = s.photo != null ? imgBox(S.photos[s.photo], g[2], g[3], s) : { W: 100, H: 100 };
  var pg = el.closest('.pg');
  pan = { el: el, img: $('img', el), p: p, i: i, s: s, g: g, x: e.clientX, y: e.clientY, fx: s.fx, fy: s.fy, mode: crop ? 'crop' : 'move',
    g0: g.slice(), prev: s.g ? s.g.slice() : null, pw: pg.offsetWidth, ph: pg.offsetHeight,
    ox: (b.W - 100) / 100 * el.offsetWidth, oy: (b.H - 100) / 100 * el.offsetHeight, rot: (g[4] || 0) * Math.PI / 180, id: e.pointerId, cx: e.clientX, cy: e.clientY };
  try { el.setPointerCapture(e.pointerId); } catch (err) {}
});
$('#spread').addEventListener('pointermove', function (e) {
  if (!pan) return;
  if (pan.f2) {
    if (e.pointerId === pan.id) { pan.cx = e.clientX; pan.cy = e.clientY; } else if (e.pointerId === pan.f2.id) { pan.f2.x = e.clientX; pan.f2.y = e.clientY; } else return;
    var r = pan.el.getBoundingClientRect();
    zoomSlot(pan.p, pan.i, pan.z0 * Math.hypot(pan.f2.x - pan.cx, pan.f2.y - pan.cy) / pan.d0, clamp(((pan.cx + pan.f2.x) / 2 - r.left) / r.width, 0, 1), clamp(((pan.cy + pan.f2.y) / 2 - r.top) / r.height, 0, 1));
    return;
  }
  if (e.pointerId !== pan.id) return;
  var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
  if (!panned && Math.hypot(dx, dy) < 5) return;
  if (!panned) { panned = true; if (!S.sel || S.sel.t !== 'slot' || S.sel.p !== pan.p || S.sel.i !== pan.i) selectSlot(pan.p, pan.i); $('#ph-bar').hidden = true; }
  if (pan.mode === 'move') { moveFrame(pan, dx, dy); return; }
  var c = Math.cos(-pan.rot), sn = Math.sin(-pan.rot), rx = dx * c - dy * sn, ry = dx * sn + dy * c;
  pan.cx = e.clientX; pan.cy = e.clientY;
  if (pan.ox > 0.5) pan.s.fx = clamp(pan.fx - rx / pan.ox, 0, 1);
  if (pan.oy > 0.5) pan.s.fy = clamp(pan.fy - ry / pan.oy, 0, 1);
  placeImg(pan.img, S.photos[pan.s.photo], pan.g[2], pan.g[3], pan.s);
});
function endPan(e) {
  if (!pan) return;
  if (e && pan.f2 && e.pointerId === pan.f2.id) { pan.f2 = null; pan.x = pan.cx; pan.y = pan.cy; pan.fx = pan.s.fx; pan.fy = pan.s.fy; recalcPan(); return; }
  if (e && e.pointerId !== pan.id) return;
  var m = pan; pan = null;
  var did = panned;
  if (did) { panned = false; dragEnd = Date.now(); }   /* klik yang ikut sesudah menggeser diabaikan lewat dragEnd; flag tidak boleh tertinggal */
  if (did && m.mode === 'move' && m.moved) { endMoveFrame(m); return; }
  if (did) { S.dirty = true; refreshNavFor(m.p); }
  drawPhBar();
}
/* Memindahkan bingkai: posisi baru di slots[k].g (ukuran tetap). Hanya foto itu yang pindah; teks dan foto lain tetap di tempatnya
   (permintaan user 24 Nov 2026, sebelumnya caption dan nomor foto ikut). */
function moveFrame(m, dx, dy) {
  var g0 = m.g0, nx = clamp(g0[0] + dx / m.pw * 1000, -g0[2] / 2, 1000 - g0[2] / 2), ny = clamp(g0[1] + dy / m.ph * PAGE_H, -g0[3] / 2, PAGE_H - g0[3] / 2);
  nx = Math.round(nx * 10) / 10; ny = Math.round(ny * 10) / 10;
  m.s.g = [nx, ny, g0[2], g0[3]]; m.moved = true;
  var full = m.s.g.concat([g0[4] || 0]), pgEl = pageNode(m.p), fr = $('.sel-frame', pgEl);
  frameCss(m.el, full); if (fr) frameCss(fr, full);
}
function endMoveFrame(m) {
  var s = m.s, t0 = S.album.tpl.pages[m.p].ph[m.i];
  if (s.g && Math.abs(s.g[0] - t0[0]) < 0.5 && Math.abs(s.g[1] - t0[1]) < 0.5 && Math.abs(s.g[2] - t0[2]) < 0.5 && Math.abs(s.g[3] - t0[3]) < 0.5) delete s.g;
  S.dirty = true; redrawPage(m.p); refreshNavFor(m.p); drawPhBar();
  toast('Photo moved.', { label: 'Undo', fn: function () {
    if (m.prev) s.g = m.prev; else delete s.g;
    redrawPage(m.p); refreshNavFor(m.p); drawPhBar();
  } });
}
/* Urutan tumpukan: foto dan teks bisa saling menimpa; "Ke depan" / "Ke belakang" memindahkan elemen terpilih ke
   paling atas / paling bawah tumpukan di halamannya. Disimpan di album.pages[p].z. */
function selKey() { return !S.sel ? null : S.sel.t === 'slot' ? 's' + S.sel.i : S.sel.t + S.sel.i; }
function layerTo(front) {
  var key = selKey(); if (!key) return;
  endEdit();
  var p = S.sel.p, st = S.album.pages[p], zs = $$('.pg > *', pageNode(p)).map(function (n) { return parseInt(n.style.zIndex, 10); }).filter(function (v) { return !isNaN(v); });
  if (!zs.length) return;
  var prev = st.z && st.z[key] != null ? st.z[key] : null, hi = Math.max.apply(null, zs), lo = Math.min.apply(null, zs);
  st.z = st.z || {}; st.z[key] = front ? hi + 1 : lo - 1;
  S.dirty = true; redrawPage(p); refreshNavFor(p); drawPhBar(); drawTxBar();
  toast(front ? 'Brought to front.' : 'Sent to back.', { label: 'Undo', fn: function () { if (prev != null) st.z[key] = prev; else delete st.z[key]; redrawPage(p); refreshNavFor(p); drawPhBar(); drawTxBar(); } });
}
/* bilah kecil di atas teks terpilih: urutan tumpukan */
function drawTxBar() {
  var bar = $('#tx-bar'), s = S.sel, el = s && s.t !== 'slot' && pageNode(s.p) ? $('[data-' + s.t + '="' + s.i + '"]', pageNode(s.p)) : null;
  if (!el || tmove && tmove.on) { bar.hidden = true; $('#tx-pal').hidden = true; return; }
  bar.hidden = false;
  var TS = textStyle(S.album, s.p, s.t, s.i), fmt0 = S.album.pages[s.p].fmt && S.album.pages[s.p].fmt[s.t + s.i];
  $('#tx-font').value = TS.f; $('#tx-size').textContent = Math.round(TS.s * 0.595);   /* 1000 satuan = 210 mm: satuan x 0,595 = pt */
  $('#tx-sw').style.background = TS.c; $('#tx-cc').value = /^#[0-9a-f]{6}$/i.test(TS.c) ? TS.c : '#000000';
  [['tx-b', TS.b], ['tx-i', TS.i], ['tx-u', TS.u], ['tx-up', TS.up]].forEach(function (x) { $('#' + x[0]).setAttribute('aria-pressed', x[1] ? 'true' : 'false'); });
  $('#tx-al').hidden = s.t !== 'pa';
  $$('#tx-al button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.a === TS.a ? 'true' : 'false'); });
  $('#tx-reset').hidden = !(fmt0 && Object.keys(fmt0).length);
  var st = $('#st-stage').getBoundingClientRect(), r = el.getBoundingClientRect(), bw = bar.offsetWidth, bh = bar.offsetHeight;
  var top = r.top - st.top - bh - 12; if (top < 4) top = r.bottom - st.top + 12;
  bar.style.left = clamp(r.left - st.left + r.width / 2 - bw / 2, 4, st.width - bw - 4) + 'px'; bar.style.top = top + 'px';
}
/* gaya teks dari bilah teks: font, ukuran, warna, tebal/miring/garis bawah, kapital, rata */
function setFmt(prop, val) {
  var key = selKey(); if (!key || S.sel.t === 'slot') return;
  endEdit();
  var p = S.sel.p, st = S.album.pages[p];
  st.fmt = st.fmt || {}; var f = st.fmt[key] = st.fmt[key] || {};
  if (val == null) delete f[prop]; else f[prop] = val;
  if (!Object.keys(f).length) delete st.fmt[key];
  S.dirty = true; redrawTexts(p); drawTxBar();
  clearTimeout(zoomNav); zoomNav = setTimeout(function () { refreshNavFor(p); }, 300);
}
function curStyle() { return textStyle(S.album, S.sel.p, S.sel.t, S.sel.i); }
(function () {
  var sel = $('#tx-font');
  FONT_NAMES.forEach(function (f) { var o = h('option', null, f[1]); o.value = f[0]; o.style.fontFamily = FONT[f[0]]; sel.appendChild(o); });
  sel.addEventListener('change', function () { setFmt('f', sel.value); });
  $('#tx-sm').addEventListener('click', function () { setFmt('s', Math.max(8, Math.round(curStyle().s / 1.12 * 2) / 2)); });
  $('#tx-lg').addEventListener('click', function () { setFmt('s', Math.min(400, Math.round(curStyle().s * 1.12 * 2) / 2)); });
  ['b', 'i', 'u', 'up'].forEach(function (k) { $('#tx-' + k).addEventListener('click', function () { setFmt(k, !curStyle()[k]); }); });
  $$('#tx-al button').forEach(function (b) { b.addEventListener('click', function () { setFmt('a', b.dataset.a); }); });
  $('#tx-color').addEventListener('click', function () { var pal = $('#tx-pal'); pal.hidden = !pal.hidden; $('#tx-color').setAttribute('aria-expanded', pal.hidden ? 'false' : 'true'); drawTxBar(); });
  ['#111111', '#ffffff', '#6b6b6b', '#b23a2e', '#cf7a3c', '#e2b13c', '#2e7d4f', '#2f5d8a', '#7a3e9d', '#d96c94'].forEach(function (c) {
    var b = h('button', 'tx-c'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', t('Color {c}', { c: c })); b.dataset.c = c;
    b.addEventListener('click', function () { setFmt('c', c); });
    $('#tx-pal-sw').appendChild(b);
  });
  $('#tx-cc').addEventListener('input', function (e) { setFmt('c', e.target.value); });
  $('#tx-reset').addEventListener('click', function () {
    var key = selKey(); if (!key) return; endEdit();
    var p = S.sel.p, st = S.album.pages[p], prev = st.fmt && st.fmt[key]; if (!prev) return;
    delete st.fmt[key]; S.dirty = true; redrawTexts(p); refreshNavFor(p); drawTxBar();
    toast('Back to the original text style.', { label: 'Undo', fn: function () { st.fmt[key] = prev; redrawTexts(p); refreshNavFor(p); drawTxBar(); } });
  });
})();
['lay-front', 'tx-front'].forEach(function (id) { $('#' + id).addEventListener('click', function () { layerTo(true); }); });
['lay-back', 'tx-back'].forEach(function (id) { $('#' + id).addEventListener('click', function () { layerTo(false); }); });
/* tombol di bilah teks tidak boleh mengambil fokus dari teks yang sedang diketik */
$('#tx-bar').addEventListener('mousedown', function (e) { if (!e.target.closest('select, input')) e.preventDefault(); });
window.addEventListener('resize', function () { if (S.view === 'studio') drawTxBar(); });

/* klik dua kali pada foto = masuk/keluar mode atur isi foto */
$('#spread').addEventListener('dblclick', function (e) {
  var el = e.target.closest('.slot'); if (!el) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s; if (S.album.pages[p].slots[i].photo == null) return;
  e.preventDefault();
  if (!S.sel || S.sel.t !== 'slot' || S.sel.p !== p || S.sel.i !== i) selectSlot(p, i);
  setCrop(isCrop(p, i) ? null : p, i);
});
function recalcPan() { var b = imgBox(S.photos[pan.s.photo], pan.g[2], pan.g[3], pan.s); pan.ox = (b.W - 100) / 100 * pan.el.offsetWidth; pan.oy = (b.H - 100) / 100 * pan.el.offsetHeight; }
$('#spread').addEventListener('wheel', function (e) {   /* cubit di trackpad (ctrlKey) atau ctrl + scroll di atas foto */
  if (!e.ctrlKey) return;
  var el = e.target.closest('.slot'); if (!el) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s, s = S.album.pages[p].slots[i]; if (s.photo == null) return;
  e.preventDefault();
  if (!S.sel || S.sel.t !== 'slot' || S.sel.p !== p || S.sel.i !== i) selectSlot(p, i);
  var r = el.getBoundingClientRect();
  zoomSlot(p, i, s.z * Math.exp(-clamp(e.deltaY, -25, 25) * 0.008), clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
}, { passive: false });
$('#spread').addEventListener('pointerup', endPan);
$('#spread').addEventListener('pointercancel', endPan);
$('#spread').addEventListener('click', function (e) {
  if (panned) { panned = false; return; }
  if (Date.now() - dragEnd < 400) return;   /* klik yang ikut sesudah menggeser foto/teks atau me-resize */   /* klik yang ikut sesudah menggeser teks atau me-resize foto */
  if (editing && editing.node.contains(e.target)) return;
  var pg = e.target.closest('.pg'); if (!pg) { deselect(); return; }
  var p = +pg.dataset.p, slot = e.target.closest('.slot'), txt = e.target.closest('[data-tx],[data-pa],[data-cp]');
  if (!txt && !slot) {                               /* (8) tiny frames and small texts get a forgiving hit area: nearest one within 22px */
    var near = null, nd = 22;
    $$('.slot.is-tiny', pg).forEach(function (n) {
      var r = n.getBoundingClientRect(), d = Math.hypot(Math.max(r.left - e.clientX, 0, e.clientX - r.right), Math.max(r.top - e.clientY, 0, e.clientY - r.bottom));
      if (d < nd) { nd = d; near = n; }
    });
    if (near) return slotClick(p, +near.dataset.s);
    var best = null, bd = 22;
    $$('[data-tx],[data-pa],[data-cp]', pg).forEach(function (n) {
      var r = n.getBoundingClientRect(), dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom), d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = n; }
    });
    txt = best;
  }
  if (txt && !(slot && slot.contains(e.target))) {
    var t = txt.dataset.tx != null ? 'tx' : txt.dataset.pa != null ? 'pa' : 'cp';
    return editText(p, t, +txt.dataset[t]);
  }
  if (slot) return slotClick(p, +slot.dataset.s);
  deselect();
});
$('#spread').addEventListener('keydown', function (e) {
  var el = e.target.closest('.slot'); if (!el) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s, s = S.album.pages[p].slots[i];
  if (s.photo == null) return;
  var k = e.key, step = e.shiftKey ? 0.12 : 0.04, hit = true;
  if (/^Arrow/.test(k) && !isCrop(p, i)) {   /* di luar mode atur isi: panah memindahkan bingkai */
    e.preventDefault();
    var g = slotGeo(S.album, p, i), d = e.shiftKey ? 20 : 5;
    s.g = [clamp(g[0] + (k === 'ArrowLeft' ? -d : k === 'ArrowRight' ? d : 0), -g[2] / 2, 1000 - g[2] / 2), clamp(g[1] + (k === 'ArrowUp' ? -d : k === 'ArrowDown' ? d : 0), -g[3] / 2, PAGE_H - g[3] / 2), g[2], g[3]];
    S.dirty = true; frameCss(el, s.g.concat([g[4] || 0])); var fr = $('.sel-frame', pageNode(p)); if (fr) frameCss(fr, s.g.concat([g[4] || 0]));
    clearTimeout(zoomNav); zoomNav = setTimeout(function () { refreshNavFor(p); drawPhBar(); }, 300);
    return;
  }
  if (k === 'ArrowLeft') s.fx = clamp(s.fx - step, 0, 1); else if (k === 'ArrowRight') s.fx = clamp(s.fx + step, 0, 1);
  else if (k === 'ArrowUp') s.fy = clamp(s.fy - step, 0, 1); else if (k === 'ArrowDown') s.fy = clamp(s.fy + step, 0, 1);
  else if (k === '+' || k === '=') s.z = clamp(s.z + 0.1, 1, 3); else if (k === '-') s.z = clamp(s.z - 0.1, 1, 3);
  else hit = false;
  if (!hit) return;
  e.preventDefault(); S.dirty = true;
  var gk = slotGeo(S.album, p, i); placeImg($('img', el), S.photos[s.photo], gk[2], gk[3], s);
  if (S.sel && S.sel.t === 'slot' && S.sel.p === p && S.sel.i === i) drawPhBar();
});
['dragover', 'drop', 'dragleave'].forEach(function (ev) {
  $('#spread').addEventListener(ev, function (e) {
    var el = e.target.closest ? e.target.closest('.slot') : null;
    $$('#spread .is-drop').forEach(function (n) { if (n !== el || ev !== 'dragover') n.classList.remove('is-drop'); });
    if (!el) return;
    e.preventDefault();
    if (ev === 'dragover') { el.classList.add('is-drop'); return; }
    if (ev !== 'drop') return;
    var d = e.dataTransfer.getData('text/plain');
    if (d.indexOf('imz:') !== 0) return;
    var p = +el.closest('.pg').dataset.p, i = +el.dataset.s;
    S.sel = { t: 'slot', p: p, i: i }; placePhoto(p, i, +d.slice(4), false);
  });
});
$('#st-stage').addEventListener('click', function (e) { if (e.target === e.currentTarget) deselect(); });

/* filling what is still empty, and the gate before preview */
function fillWithExisting() {
  var before = emptySlots(S.album), changed = refill(S.album);
  S.dirty = true; drawStudio();
  toast(t('{n} frames filled with photos you’ve added. You can change them any time.', { n: changed.length }), { label: 'Undo', fn: function () {
    before.forEach(function (e) { setSlot(S.album, e[0], e[1], null); }); drawStudio();
  } });
}
$('#st-note-fill').addEventListener('click', fillWithExisting);
function gotoFirstEmpty() {
  var e = emptySlots(S.album)[0]; if (!e) return;
  gotoPage(e[0]); selectSlot(e[0], e[1]);
}
$('#st-preview').addEventListener('click', function (e) {
  if (S.photos.length < MIN_PHOTOS) {
    return openDialog({ trigger: e.currentTarget, title: t('At least {n} photos', { n: MIN_PHOTOS }),
      body: t('Your album has {n} photos so far. Add {m} more so it can be ordered.', { n: S.photos.length, m: MIN_PHOTOS - S.photos.length }),
      actions: [{ label: 'Add photos', kind: 'primary', fn: function () { $('#file-more').click(); } }, { label: 'Close' }] });
  }
  var t = totals(S.album);
  if (!t.empty) return enterPreview();
  openDialog({ trigger: e.currentTarget, title: _t('{n} photo frames still empty', { n: t.empty }),
    body: 'So no page prints with gaps, every frame needs a photo first. You can add photos, or fill the rest with photos you’ve already added.',
    actions: [{ label: 'Fill with photos you’ve added', kind: 'primary', fn: fillWithExisting }, { label: 'Add photos', fn: function () { $('#file-more').click(); } }, { label: 'Show empty frames', kind: 'quiet', fn: gotoFirstEmpty }] });
});
$('#st-back').addEventListener('click', function () { S.cat = S.album.cat; S.cover = S.album.cover; S.layout = S.album.tpl.id; S.step = 'gaya'; drawSetup(); go('setup', 'setup-h'); });

/* ---------- preview: the album opens and its leaves turn over the spine ---------- */
var PV_MS = 700, pvTurn = null, pvNow = null;
function pvViews() {
  var n = S.album.pages.length, out = [['cover']];
  if (wide.matches) { out.push(['in', 0]); for (var p = 1; p + 1 < n; p += 2) out.push([p, p + 1]); out.push([n - 1, 'in']); }
  else for (var q = 0; q < n; q++) out.push([q]);
  out.push(['back']);
  return out;
}
/* what lies on the left and right half for a view, and where the book sits (closed front, open, closed back) */
function pvSides(v) {
  if (!wide.matches) return { L: null, R: v[0], pos: 'open' };
  if (v[0] === 'cover') return { L: null, R: 'cover', pos: 'cover' };
  if (v[0] === 'back') return { L: 'back', R: null, pos: 'back' };
  return { L: v[0], R: v[1], pos: 'open' };
}
function pvNode(what) {
  var cat = catOf(S.cat), cv = curCover();
  if (what === 'cover') { var f = coverArt(cat, cv, t('Front cover {name}', { name: t(cv.name) }), 960); f.classList.add('pv-cover', 'is-front'); return f; }
  if (what === 'back' && cv.back) { var im = new Image(); im.className = 'pv-cover'; im.draggable = false; im.src = IMZ_IMG[cv.back]; im.alt = 'Back cover'; return im; }
  if (what === 'back') {
    var d = h('div', 'pv-backc'); d.style.background = cv.bg; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Back cover');
    var lg = new Image(); lg.src = relLum(cv.bg) < 0.3 ? IMZ_IMG.logo_white : IMZ_IMG.logo_black; lg.alt = ''; d.appendChild(lg); return d;
  }
  if (what === 'in' || what == null) { var blank = h('div', 'pv-blank'); blank.setAttribute('aria-hidden', 'true'); return blank; }
  return renderPage(S.album, what, 'view');
}
function pvSet(side, what) { var el = $('#pv-book .pv-' + side); el.textContent = ''; if (what != null) el.appendChild(pvNode(what)); }
function pvFinish() { if (pvTurn) { clearTimeout(pvTurn.t); pvTurn.end(); pvTurn = null; } }
function enterPreview() { S.pv = 0; S.sel = null; pvNow = null; drawPreview(null); go('preview', 'pv-h'); }
function drawPreview(dir) {
  var cat = catOf(S.cat), views = pvViews(), v = views[S.pv], to = pvSides(v), book = $('#pv-book'), single = !wide.matches;
  pvFinish();
  if (!$('.pv-l', book)) { book.textContent = ''; book.appendChild(h('div', 'pv-half pv-l')); book.appendChild(h('div', 'pv-half pv-r')); }
  $('#pv-title').textContent = curCover().name;
  var from = pvNow && pvNow.single === single ? pvNow.sides : null;
  book.classList.toggle('is-single', single);
  if (!dir || !from || calm.matches) { pvSet('l', to.L); pvSet('r', to.R); }
  else {
    /* one leaf carries the page that leaves on its front and the page that arrives on its back */
    var fwd = dir === 'fwd', leaf = h('div', 'pv-leaf' + (fwd ? '' : ' is-back')), front = h('div', 'pv-face pv-face-f'), back = h('div', 'pv-face pv-face-b');
    if (single) {
      front.appendChild(pvNode(fwd ? from.R : to.R)); back.appendChild(pvNode(null));
      if (fwd) pvSet('r', to.R);
    } else if (fwd) { front.appendChild(pvNode(from.R)); back.appendChild(pvNode(to.L)); pvSet('r', to.R); }
    else { front.appendChild(pvNode(from.L)); back.appendChild(pvNode(to.R)); pvSet('l', to.L); }
    leaf.appendChild(front); leaf.appendChild(back); book.appendChild(leaf);
    pvTurn = { end: function () { leaf.remove(); pvSet('l', to.L); pvSet('r', to.R); }, t: setTimeout(function () { pvFinish(); }, PV_MS) };
  }
  book.dataset.pos = to.pos;
  pvNow = { sides: to, single: single };
  var real = v.filter(function (x) { return typeof x === 'number'; }).map(function (x) { return x + 1; });
  $('#pv-label').textContent = v[0] === 'cover' ? 'Front cover' : v[0] === 'back' ? 'Back cover' : _t('Page {p} of {n}', { p: real.join('–'), n: S.album.pages.length });   /* _t: t is a local variable below */
  $('#pv-prev').disabled = S.pv === 0; $('#pv-fwd').disabled = S.pv === views.length - 1;
  var t = totals(S.album), notes = $('#pv-notes'); notes.textContent = '';
  var a = h('span'); a.appendChild(icon('check')); a.appendChild(document.createTextNode(_t('{n} photos placed across 40 pages', { n: t.filled }))); notes.appendChild(a);
  if (t.blankText) {
    notes.appendChild(h('span', null, _t('{n} text boxes are still empty and won’t be printed.', { n: t.blankText })));
    var fix = h('button', 'linkish', 'Fill in text'); fix.type = 'button';
    fix.addEventListener('click', function () { var p = firstBlankTextPage(); pvFinish(); go('studio'); gotoPage(p); setTab('teks'); drawTextFields(); });
    notes.appendChild(fix);
  }
}
function firstBlankTextPage() {
  for (var p = 0; p < S.album.pages.length; p++) {
    var P = S.album.tpl.pages[p], st = S.album.pages[p];
    if (P.tx.some(function (t, i) { return t.k === 'e' && !st.tx[i]; }) || P.pa.some(function (x, i) { return !st.pa[i]; })) return p;
  }
  return 0;
}
function pvStep(d) {
  var n = pvViews().length, nx = clamp(S.pv + d, 0, n - 1);
  if (nx === S.pv) return;
  S.pv = nx; drawPreview(d > 0 ? 'fwd' : 'back');
}
$('#pv-prev').addEventListener('click', function () { pvStep(-1); });
$('#pv-fwd').addEventListener('click', function () { pvStep(1); });
$('#pv-back').addEventListener('click', function () { pvFinish(); go('studio'); });
/* Ganti cover langsung dari preview: album (foto, layout, caption) tidak disentuh, lalu kembali ke preview di halaman cover. */
$('#pv-cover').addEventListener('click', function () {
  pvFinish();
  S.cat = S.album.cat; S.layout = S.album.tpl.id; S.coverFrom = { cover: S.album.cover };
  S.step = 'sampul'; drawSetup(); go('setup', 'setup-h');
});
/* Edit halaman dari preview: kembali ke editor di halaman yang sedang dilihat (sampul/sampul belakang: halaman 1/terakhir). */
$('#pv-edit').addEventListener('click', function () {
  var v = pvViews()[S.pv] || [0], n = S.album.pages.length, p = v.filter(function (x) { return typeof x === 'number'; })[0];
  if (p == null) p = v[0] === 'back' ? n - 1 : 0;
  pvFinish(); go('studio'); gotoPage(p);
});
function backToPreview(changed) {
  S.pv = 0; pvNow = null; drawPreview(null); go('preview', 'pv-h');
  if (changed) toast('Cover changed. Your photos and captions are still there.');
}
$('#pv-next').addEventListener('click', function () { pvFinish(); if (ADMIN_NO) return adminSave(); drawCheckout(); go('checkout', 'co-h'); });
var swipe = null;
$('#pv-book').addEventListener('pointerdown', function (e) { swipe = { x: e.clientX, y: e.clientY }; });
$('#pv-book').addEventListener('pointerup', function (e) {
  if (!swipe) return;
  var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, r = e.currentTarget.getBoundingClientRect(); swipe = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) pvStep(dx < 0 ? 1 : -1);
  else if (Math.abs(dx) < 6 && Math.abs(dy) < 6) pvStep(e.clientX > r.left + r.width / 2 ? 1 : -1);   /* tap a side to turn, like a book reader */
});

/* ---------- checkout ---------- */
/* Foto contoh boleh dipesan? Selalu di localhost; di situs asli hanya saat server mengizinkan (IMAZINE_ALLOW_SAMPLES, untuk uji).
   Pesanan seperti itu ditandai UJI di admin. */
var ALLOW_SAMPLE = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
var PAY = false;   /* pembayaran Mayar; bawaan mati (album langsung dikirim ke tim), nilai asli dari /api/imazine/config */
function applyPay() {
  document.documentElement.classList.toggle('pay', PAY);
  $('#h-mail').textContent = PAY ? 'Use the same email when you pay on Mayar. That’s how we know the payment is for your album.' : 'So we can send you updates about your album.';
  if (S.view === 'checkout' && S.album) drawCheckout();
}
var cfgLoaded = false, MIN_PHOTOS = 20, MAX_PHOTOS = 240, PAY_MIN = 120;   /* nilai asli dari server: /api/imazine/config */
function payMinText() { return PAY_MIN % 60 ? t('{n} minutes', { n: PAY_MIN }) : t('{n} hours', { n: PAY_MIN / 60 }); }
/* Bahasa diganti (tombol EN/ID di beranda): teks yang dirakit dengan t() digambar ulang; teks biasa sudah diurus i18n.js. */
function onLang() {
  labelStart(); applyPay();
  var pm = $('#pay-min'); if (pm) pm.textContent = payMinText();
  if (S.view === 'setup') drawSetup();
}
function loadConfig() {
  if (cfgLoaded) return; cfgLoaded = true;
  fetch('/api/imazine/config', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (!c) return;
    if (c.price > 0) PRICE = c.price;
    if (typeof c.payment === 'boolean' && c.payment !== PAY) { PAY = c.payment; applyPay(); }
    if (c.samples === true) ALLOW_SAMPLE = true;
    if (c.minPhotos > 0) MIN_PHOTOS = c.minPhotos;
    if (c.maxPhotos >= MIN_PHOTOS) MAX_PHOTOS = c.maxPhotos;
    if (c.payMinutes > 0) { PAY_MIN = c.payMinutes; var pm = $('#pay-min'); if (pm) pm.textContent = payMinText(); }
    if (S.view === 'checkout' && S.album) drawCheckout();
  }).catch(function () { /* tanpa server: pakai angka bawaan */ });
}
function drawCheckout() {
  loadConfig();
  var cat = catOf(S.cat), t = totals(S.album), total = PRICE * S.qty;
  var cv = curCover(), co = $('#co-cover'); co.textContent = ''; co.appendChild(coverArt(cat, cv, 'Cover ' + cv.name));
  $('#co-name').textContent = cv.name;
  $('#co-spec-a').textContent = _t('{name} layout', { name: LAYOUTS[S.layout].name });
  $('#co-spec-b').textContent = _t('A4 · 20 sheets, 40 pages · Art Paper 260 gsm · Soft cover · Binding · {n} photos', { n: t.filled });
  $('#qty-n').textContent = S.qty; $('#qty-dn').disabled = S.qty <= 1; $('#qty-up').disabled = S.qty >= 20;
  $('#sum-total').textContent = rupiah(total);
  $('#co-pay').textContent = PAY ? 'Continue to payment' : 'Send album';
}
/* Mengubah isian setelah percobaan gagal berarti pesanan di server sudah tidak sesuai: mulai pesanan baru. */
$('#co-form').addEventListener('input', function () { subState = null; });
$('#qty-dn').addEventListener('click', function () { S.qty = clamp(S.qty - 1, 1, 20); subState = null; drawCheckout(); });
$('#qty-up').addEventListener('click', function () { S.qty = clamp(S.qty + 1, 1, 20); subState = null; drawCheckout(); });
$('#co-back').addEventListener('click', function () { subState = null; go('preview', 'pv-h'); });
var RULES = {
  name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name first.'; },
  whatsapp: function (v) { return v.replace(/\D/g, '').length >= 9 ? '' : 'That WhatsApp number looks incomplete. Example: 081234567890.'; },
  email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email looks incomplete. Example: name@email.com.'; }
};
var FIELD = { name: 'f-name', whatsapp: 'f-wa', email: 'f-mail' }, ERR = { name: 'e-name', whatsapp: 'e-wa', email: 'e-mail' }, HINT = { name: 'h-name', whatsapp: 'h-wa', email: 'h-mail' };
function activeFields() { return PAY ? ['email'] : ['name', 'whatsapp', 'email']; }
function checkField(k) {
  var inp = $('#' + FIELD[k]), msg = RULES[k](inp.value), er = $('#' + ERR[k]);
  er.textContent = msg; er.hidden = !msg; $('#' + HINT[k]).hidden = !!msg;
  if (msg) { inp.setAttribute('aria-invalid', 'true'); fixWidows(er.parentNode); } else inp.removeAttribute('aria-invalid');
  return !msg;
}
Object.keys(FIELD).forEach(function (k) {
  $('#' + FIELD[k]).addEventListener('blur', function (e) { if (e.target.value) checkField(k); });
  $('#' + FIELD[k]).addEventListener('input', function (e) { if (e.target.hasAttribute('aria-invalid')) checkField(k); });
});
/* Kirim pesanan ke server: buat pesanan, unggah foto asli, lalu buka halaman bayar Mayar. */
var subState = null;   /* { orderNo, token, up } pesanan yang sudah dibuat di server untuk percobaan ini */
async function apiJson(r) { try { return await r.json(); } catch (e) { return {}; } }
var photoMethod = 'PUT';   /* turun ke POST kalau hosting memblokir PUT */
/* fetch dengan batas waktu sesuai ukuran file (anggap internet minimal ~15 KB/detik), supaya unggahan yang macet di
   koneksi lambat dicoba ulang, bukan menggantung selamanya. */
function fetchT(url, opt, bytes) {
  if (!window.AbortController) return fetch(url, opt);
  var ac = new AbortController(), tm = setTimeout(function () { ac.abort(); }, 60000 + (bytes || 0) / 15);
  opt.signal = ac.signal;
  return fetch(url, opt).finally(function () { clearTimeout(tm); });
}
async function putPhoto(i) {
  var p = S.photos[subState.used ? subState.used[i] : i];
  for (var a = 0; a < 4; a++) {
    try {
      var r = await fetchT('/api/imazine/orders/' + subState.orderNo + '/photos/' + i + '?t=' + subState.token, {
        method: photoMethod, headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent(p.name || 'foto') }, body: p.file
      }, p.file && p.file.size);
      if (r.ok) { subState.up[i] = 1; return; }
      if (photoMethod === 'PUT' && (r.status === 403 || r.status === 405 || r.status === 501)) { photoMethod = 'POST'; a--; continue; }
      var j = await apiJson(r);
      if (r.status < 500) { var er = new Error((p.name || t('Photo {n}', { n: i + 1 })) + ': ' + (j.error || 'rejected.')); er.final = true; throw er; }
    } catch (e) { if (e.final || a === 3) throw e; }
    await new Promise(function (res) { setTimeout(res, 1500 * (a + 1)); });
  }
  throw new Error(t('Photo {n} didn’t upload. Your photos are still safe here, so please try sending again.', { n: i + 1 }));
}
/* Sampul majalah: file jadi Full HD (JPEG) dan foto aslinya ikut dikirim, supaya tim bisa mencetak dari sumber, bukan dari pratinjau. */
async function putCoverFile(kind, body, name) {
  for (var a = 0; a < 4; a++) {
    try {
      var r = await fetchT('/api/imazine/orders/' + subState.orderNo + '/cover/' + kind + '?t=' + subState.token, {
        method: photoMethod, headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent(name) }, body: body
      }, body && body.size);
      if (r.ok) return;
      if (photoMethod === 'PUT' && (r.status === 403 || r.status === 405 || r.status === 501)) { photoMethod = 'POST'; a--; continue; }
      var j = await apiJson(r);
      if (r.status < 500) { var er = new Error('Cover: ' + (j.error || 'we couldn’t accept it.')); er.final = true; throw er; }
    } catch (e) { if (e.final || a === 3) throw e; }
    await new Promise(function (res) { setTimeout(res, 1500 * (a + 1)); });
  }
  throw new Error('The cover didn’t upload. Please try sending again.');
}
async function putCover() {
  var cv = curCover(), blob = await magBlob(cv.mag, S.cat, MAG_W, 0.93);
  if (!blob) throw new Error('We couldn’t create the magazine cover. Please try sending again.');
  await putCoverFile('render', blob, 'sampul-majalah.jpg');
  if (S.mag.photo) await putCoverFile('photo', S.mag.photo.file, S.mag.photo.name);
  else {   /* pesanan uji: cover masih memakai foto contoh tema */
    var sr = await fetch(MAG_SAMPLE_DIR + 'sample-' + S.cat + '.webp');
    if (!sr.ok) throw new Error('The sample cover photo didn’t load. Please try sending again.');
    await putCoverFile('photo', await sr.blob(), 'contoh-sampul.webp');
  }
  subState.coverUp = 1;
}
function magOrderInfo(cat) {
  var cv = curCover(), m = S.mag, texts = {};
  MAG_FIELDS[cv.mag].forEach(function (f) { texts[f[0]] = magText(cv.mag, cat.id, f[0]); });
  return { style: cv.mag, photoName: m.photo ? m.photo.name : null, original: m.photo ? { width: m.photo.ow, height: m.photo.oh } : null, enhanced: m.photo ? { width: m.photo.w, height: m.photo.h } : null,
           focusX: +m.fx.toFixed(3), focusY: +m.fy.toFixed(3), zoom: +m.z.toFixed(2), texts: texts, moves: (m.moves && m.moves[cv.mag]) || {}, render: { width: MAG_W, height: Math.round(MAG_W * MAG_RATIO) }, sample: m.photo ? undefined : true };
}
async function sendOrder(order, used) {
  var title = $('#busy-t'), old = title.textContent, leaving = false;
  try {
    title.textContent = 'Sending your order…'; busy(true, 0, 0);
    if (!subState) {
      var r = await fetch('/api/imazine/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      var j = await apiJson(r);
      if (!r.ok) throw new Error(j.error || 'Your album wasn’t sent. Your photos are still safe here, so please try again.');
      subState = { orderNo: j.orderNo, token: j.token, up: {}, used: used };
    }
    var n = subState.used ? subState.used.length : S.photos.length, done = Object.keys(subState.up).length, next = 0, fail = null;
    title.textContent = 'Uploading original photos…'; busy(true, done, n);
    async function worker() {
      while (!fail && next < n) {
        var i = next++;
        if (subState.up[i]) continue;
        try { await putPhoto(i); done++; busy(true, done, n); } catch (e) { fail = e; }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (fail) throw fail;
    if (curCover().mag && !subState.coverUp) { title.textContent = 'Uploading magazine cover…'; await putCover(); }
    title.textContent = PAY ? 'Preparing payment…' : 'Sending your album to our team…'; busy(true, n, n);
    var r2 = await fetch('/api/imazine/orders/' + subState.orderNo + '/checkout?t=' + subState.token, { method: 'POST' });
    var j2 = await apiJson(r2);
    if (r2.ok && j2.submitted && j2.next) {   /* tanpa pembayaran: album sudah masuk ke tim */
      try { localStorage.setItem('imz_last', JSON.stringify({ no: subState.orderNo, t: subState.token })); } catch (e) { /* tanpa localStorage */ }
      leaving = true; allowUnload = true; title.textContent = 'Album sent!';
      window.location.assign(j2.next); return;
    }
    if (!r2.ok || !j2.payUrl) throw new Error(j2.missing ? 'Some photos didn’t upload. Please try sending again.' : (j2.error || 'We couldn’t create the payment link. Please try again in a moment.'));
    try { localStorage.setItem('imz_last', JSON.stringify({ no: subState.orderNo, t: subState.token })); } catch (e) { /* tanpa localStorage */ }
    leaving = true; allowUnload = true;
    title.textContent = 'Opening the payment form…'; busy(true, n, n);
    openPay(subState.orderNo, subState.token, j2.payUrl, order.customer.email);
    busy(false); title.textContent = old;
  } catch (e) {
    toast((e && e.message && !/Failed to fetch|NetworkError|Load failed/i.test(e.message)) ? e.message : 'The connection dropped. Your photos aren’t lost, so please try sending again.');
  } finally {
    if (!leaving) { title.textContent = old; busy(false); }
    $('#co-pay').disabled = leaving;
  }
}
/* ---------- bayar di dalam Imazine (25 Nov 2026) ----------
   Form checkout produk fisik Mayar (nama, HP, alamat, ongkir JNE, metode bayar) dibuka di iframe pada langkah ini.
   Halaman kita tidak bisa membaca isi form itu (beda domain): tanda lunas tetap datang dari webhook Mayar, jadi status
   pesanan ditanya ke server tiap beberapa detik. Tautan cadangan membuka Mayar di tab baru (e-wallet / iframe macet). */
var payPoll = null;
function openPay(no, tok, url, email) {
  $('#pay-no').textContent = no;
  $('#pay-mail').textContent = email;
  $('#pay-out').href = url;
  $('#pay-min2').textContent = payMinText();
  $('#pay-wait-t').textContent = 'Waiting for your payment. This page moves on by itself once Mayar confirms it.';
  $('#pay-wait').classList.remove('is-ok');
  var fr = $('#pay-if'), ld = $('#pay-load');
  ld.hidden = false; fr.classList.remove('is-in');
  fr.onload = function () { ld.hidden = true; fr.classList.add('is-in'); };
  if (fr.getAttribute('src') !== url) fr.src = url;
  go('pay', 'pay-h');
  clearInterval(payPoll);
  var statusUrl = '/api/imazine/orders/' + no + '/status?t=' + tok, busyPoll = false;
  function check() {
    if (busyPoll) return; busyPoll = true;
    fetch(statusUrl, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : (r.status === 404 ? { gone: true } : null); }).then(function (j) {
      if (!j) return;
      if (j.gone) { clearInterval(payPoll); $('#pay-wait-t').textContent = 'This order was deleted because it wasn’t paid in time. Please make your album again.'; return; }
      if (j.checking && j.status !== 'lunas') { $('#pay-wait').classList.add('is-ok'); $('#pay-wait-t').textContent = 'We’ve received your payment. Our team is confirming it and will update you by email or WhatsApp.'; }
      if (j.status === 'lunas') {
        clearInterval(payPoll);
        $('#pay-wait').classList.add('is-ok'); $('#pay-wait-t').textContent = 'Payment received. Opening your order…';
        allowUnload = true;
        setTimeout(function () { window.location.assign('/imazine/pesanan/' + no + '?t=' + tok); }, 900);
      }
    }).catch(function () { /* jaringan putus sebentar: coba lagi di putaran berikutnya */ }).then(function () { busyPoll = false; });
  }
  payPoll = setInterval(check, 5000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S.view === 'pay') check(); });
}
$('#pay-copy').addEventListener('click', function () {
  var b = this, v = $('#pay-mail').textContent;
  function done() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () {});
  else { var r = document.createRange(); r.selectNodeContents($('#pay-mail')); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); try { document.execCommand('copy'); done(); } catch (e) {} }
});
$('#co-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var bad = activeFields().filter(function (k) { return !checkField(k); });
  if (bad.length) { $('#' + FIELD[bad[0]]).focus(); return; }
  if ($('#co-pay').disabled) return;
  /* Hanya foto yang benar-benar dipakai di album yang dikirim: foto lebih di rak tidak ikut, hemat kuota dan waktu. */
  var used = [];
  S.album.pages.forEach(function (pg) { pg.slots.forEach(function (sl) { if (sl.photo != null && used.indexOf(sl.photo) < 0) used.push(sl.photo); }); });
  used.sort(function (a, b) { return a - b; });
  var remap = {}; used.forEach(function (old, k) { remap[old] = k; });
  if (used.length < MIN_PHOTOS) { toast(t('Your album needs at least {min} different photos. You have {n} now, so add {m} more.', { min: MIN_PHOTOS, n: used.length, m: MIN_PHOTOS - used.length })); return; }
  /* Foto contoh hanya untuk mencoba. Pesanan sungguhan harus memakai foto pembeli (kecuali uji di localhost). */
  if (!ALLOW_SAMPLE && (used.some(function (i) { return S.photos[i].sample; }) || (curCover().mag && !S.mag.photo))) {
    openDialog({ trigger: $('#co-pay'), title: 'Your album still uses sample photos', body: 'Sample photos are just for trying things out. Replace them with your own photos, then order again.',
      actions: [{ label: 'Replace sample photos', kind: 'primary', fn: function () { go('studio'); } }, { label: 'Close' }] });
    return;
  }
  $('#co-pay').disabled = true;
  var cat = catOf(S.cat);
  var order = {
    customer: {
      email: $('#f-mail').value.trim(), note: $('#f-note').value.trim(),
      name: PAY ? undefined : $('#f-name').value.trim(), whatsapp: PAY ? undefined : $('#f-wa').value.trim()
    },
    product: { size: 'A4', pages: 40, paper: 'Art Paper 260 gsm', cover: 'Soft Cover', binding: 'Jilid binding', qty: S.qty },
    category: cat.id, cover: curCover().id, coverName: curCover().name, template: S.layout,
    magCover: curCover().mag ? magOrderInfo(cat) : undefined,
    photos: used.map(function (old, i) { var p = S.photos[old]; return { id: i, file: p.name, width: p.w, height: p.h, date: p.date ? p.date.toISOString().slice(0, 10) : null, sample: p.sample ? true : undefined }; }),
    pages: S.album.pages.map(function (pg, pi) {
      var P = S.album.tpl.pages[pi], cps = {};
      P.cp.forEach(function (c, i) { var v = captionValue(S.album, pi, i); if (v) cps[i] = v; });
      return { page: pi + 1, slots: pg.slots.map(function (s) { return { photo: s.photo != null ? remap[s.photo] : null, focusX: +s.fx.toFixed(3), focusY: +s.fy.toFixed(3), zoom: +s.z.toFixed(2), box: s.g || undefined }; }), texts: pg.tx, paragraphs: pg.pa, captions: cps, moves: pg.mv || {}, layers: pg.z || {}, styles: pg.fmt || {} };
    })
  };
  sendOrder(order, used);
});
var allowUnload = false;   /* true saat kita sendiri yang meninggalkan halaman (ke Mayar, atau Keluar dari dialog) */
/* Album hanya ada di memori halaman ini (belum ada draf tersimpan). Dua penahan:
   1) tutup tab atau muat ulang: peringatan bawaan browser
   2) tombol Back: tetap di Imazine dan tanya dulu (lebih andal di HP daripada peringatan browser) */
window.addEventListener('beforeunload', function (e) {
  if (S.album && !allowUnload) { e.preventDefault(); e.returnValue = ''; }
});
var guardOn = false;
function armBackGuard() {
  if (guardOn) return; guardOn = true;
  try { history.pushState({ imz: 1 }, ''); } catch (e) { /* tanpa riwayat */ }
}
window.addEventListener('popstate', function () {
  if (allowUnload || !S.album) return;
  try { history.pushState({ imz: 1 }, ''); } catch (e) { /* tanpa riwayat */ }
  if (!$('#dlg').hidden) return;
  if (S.view === 'home') {
    openDialog({ trigger: null, title: 'Leave Imazine?', body: 'Your album isn’t saved and will be lost if you leave this page.',
      actions: [{ label: 'Stay here', kind: 'primary' }, { label: 'Leave and delete album', fn: function () { allowUnload = true; history.go(-2); } }] });
  } else leaveToHome(null);
});

/* ---------- global keys and resize ---------- */
document.addEventListener('keydown', function (e) {
  if (!$('#dlg').hidden) return;
  var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select';
  if (e.key === 'Escape' && S.view === 'studio') { if (S.swap || S.armed != null) { S.swap = null; S.armed = null; drawHint(); drawTray(); } else if (!typing) deselect(); return; }
  if (typing || e.target.closest('.slot,.tabs,[role="radiogroup"]')) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (S.view === 'studio') stepPage(e.key === 'ArrowRight' ? 1 : -1);
  else if (S.view === 'preview') pvStep(e.key === 'ArrowRight' ? 1 : -1);
});
function onBreak() {
  if (!S.album) return;
  if (S.tab === 'hal' && wide.matches) S.tab = 'foto';
  if (S.view === 'studio' || S.album) drawStudio();
  if (S.view === 'preview') { S.pv = 0; pvNow = null; drawPreview(null); }
}
if (wide.addEventListener) wide.addEventListener('change', onBreak); else wide.addListener(onBreak);

/* ---------- boot ---------- */
document.body.dataset.view = 'home'; document.body.dataset.scene = 'dark';
drawHome();
fixWidows(document);
loadConfig();
