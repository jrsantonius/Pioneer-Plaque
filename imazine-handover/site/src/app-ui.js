/* ---------- state ---------- */
var S = { view: 'home', step: 'tema', cat: null, cover: null, layout: null, photos: [], album: null, page: 0, sel: null, armed: null, swap: null, tab: 'foto', dirty: false, qty: 1, pv: 0,
  mag: { photo: null, fx: 0.5, fy: 0.3, z: 1, front: true, ed: {}, rev: 0 } };   /* Cover Majalah: satu foto + teks per gaya, dipakai semua gaya majalah */
var wide = window.matchMedia('(min-width: 1000px)');
var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
var SCENE = { home: 'dark', setup: 'desk', studio: 'desk', preview: 'dark', checkout: 'desk', done: 'dark' };
var STEP_ORDER = ['setup', 'studio', 'preview', 'checkout'];
var vt = null, toastTimer = 0;

function go(view, focusId, after) {
  function swap() {
    S.view = view;
    if (S.album) armBackGuard();
    $$('.view').forEach(function (v) { v.hidden = v.dataset.view !== view; });
    document.body.dataset.view = view;
    document.body.dataset.scene = SCENE[view];
    var at = view === 'setup' && S.step === 'foto' ? 1 : STEP_ORDER.indexOf(view);
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

/* ---------- home ---------- */
function drawHome() {
  var box = $('#home-cats');
  CATS.forEach(function (c, i) {
    var b = h('button', 'cat'); b.type = 'button'; b.style.setProperty('--i', i);
    var art = h('span', 'cat-art'), im = new Image();
    im.src = IMZ_IMG[c.cover.img]; im.alt = 'Sampul ' + c.cover.name; im.width = 190; im.height = 269;
    art.appendChild(im);
    var body = h('span', 'cat-body');
    body.appendChild(h('span', 'cat-name', c.name));
    body.appendChild(h('span', 'cat-desc', c.desc));
    var cvs = pickableCovers(c), nMag = cvs.filter(function (x) { return x.mag; }).length, more = h('span', 'cat-soon');
    more.appendChild(h('b', null, cvs.length + ' sampul: '));
    more.appendChild(document.createTextNode(nMag + ' gaya Cover Majalah dengan fotomu sendiri, plus sampul ilustrasi ' + c.cover.name + '.'));
    body.appendChild(more);
    var goEl = h('span', 'cat-go', 'Pakai tema ini'); goEl.appendChild(icon('right'));
    body.appendChild(goEl);
    b.appendChild(art); b.appendChild(body);
    b.addEventListener('click', function () { carry(im); pickCat(c.id); });
    box.appendChild(b);
  });
}
function startFlow() {
  if (S.album) { S.cat = S.album.cat; S.cover = S.album.cover; S.layout = S.album.tpl.id; drawStudio(); return go('studio'); }
  S.step = 'tema'; drawSetup(); go('setup', 'setup-h');
}
function labelStart() { $$('[data-start]').forEach(function (b) { b.textContent = S.album ? 'Lanjutkan album' : 'Buat album'; }); }
function pickCat(id) {
  if (S.cat !== id) { var same = S.album && S.album.cat === id; S.cat = id; S.layout = same ? S.album.tpl.id : null; S.cover = same && S.album.cover ? S.album.cover : catOf(id).cover.id; }
  S.step = 'sampul';
  if (S.view !== 'setup') { drawSetup(); go('setup', 'setup-h'); }
  else vtRun(function () { drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true }); });
}

/* ---------- setup: tema → sampul → gaya → foto ---------- */
var SETUP = {
  tema: { n: 1, h: 'Mau cerita tentang apa?', sub: 'Pilih satu tema. Sampul dan gaya layoutnya mengikuti.', back: 'Beranda' },
  sampul: { n: 1, h: 'Pilih sampul albummu.', sub: 'Jadikan fotomu sampul bergaya majalah, atau pakai sampul ilustrasi bawaan tema. Ketuk salah satu untuk memilihnya.', back: 'Ganti tema' },
  gaya: { n: 1, h: 'Pilih gaya layout.', sub: 'Semua gaya berisi 40 halaman. Bedanya ada di susunan foto dan banyaknya ruang untuk menulis.', back: 'Sampul' },
  foto: { n: 2, h: 'Sekarang, masukkan fotomu.', sub: 'Pilih semuanya sekaligus. Kami pasang ke tiap halaman, urut dari foto yang paling lama.', back: 'Ganti gaya' }
};
function drawSetup() {
  var st = SETUP[S.step], body = $('#setup-body'), foot = $('#setup-foot'), cat = S.cat && catOf(S.cat);
  $('#setup-eyebrow').textContent = 'Langkah ' + st.n + ' dari 4';
  $$('.steps li').forEach(function (li, i) { li.classList.toggle('is-on', i === st.n - 1); li.classList.toggle('is-done', i < st.n - 1); });
  $('#setup-h').textContent = noWidow(st.h);
  $('#setup-sub').textContent = noWidow(st.sub);
  $('#setup-back-t').textContent = st.back;
  body.textContent = '';
  foot.hidden = true;
  if (S.step === 'tema') {
    var g = h('div', 'picks');
    CATS.forEach(function (c, i) {
      var b = h('button', 'pick pick-cat'); b.type = 'button'; b.style.setProperty('--i', i);
      b.setAttribute('aria-pressed', S.cat === c.id ? 'true' : 'false');
      var art = h('span', 'pick-art'), im = new Image(); im.src = IMZ_IMG[c.cover.img]; im.alt = 'Sampul ' + c.cover.name; im.width = 170; im.height = 241; art.appendChild(im);
      var tx = h('span'); tx.style.display = 'grid'; tx.style.gap = '8px';
      tx.appendChild(h('span', 'pick-name', c.name));
      tx.appendChild(h('span', 'pick-desc', c.desc));
      tx.appendChild(h('span', 'pick-meta', pickableCovers(c).length + ' sampul · 4 gaya layout'));
      var tick = h('span', 'pick-tick'); tick.appendChild(icon('check'));
      b.appendChild(art); b.appendChild(tx); b.appendChild(tick);
      b.addEventListener('click', function () { carry(im); pickCat(c.id); });
      g.appendChild(b);
    });
    body.appendChild(g);
  } else if (S.step === 'sampul') {
    body.appendChild(coverShelf(cat));
    foot.hidden = false;
    drawCoverPick();
    $('#setup-next').textContent = 'Lanjut pilih gaya';
    $('#setup-next').disabled = false;
  } else if (S.step === 'gaya') {
    var grid = h('div', 'styles'); grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-label', 'Gaya layout');
    cat.layouts.forEach(function (id, i) {
      var L = LAYOUTS[id], b = h('button', 'pick'); b.type = 'button'; b.style.setProperty('--i', i);
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', S.layout === id ? 'true' : 'false');
      var prev = h('span', 'style-prev'), demo = newAlbum(id, []);
      [2, 3, 4, 5].forEach(function (p) { prev.appendChild(renderPage(demo, p, 'thumb')); });
      b.appendChild(prev);
      b.appendChild(h('span', 'pick-name', L.name));
      b.appendChild(h('span', 'pick-desc', L.desc));
      b.appendChild(h('span', 'pick-meta', 'Muat ' + slotCount(id) + ' foto · 40 halaman'));
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
    drop.appendChild(h('h2', null, have ? 'Kamu sudah punya ' + have + ' foto di rak.' : 'Pilih foto dari perangkatmu'));
    drop.appendChild(h('p', null, noWidow(have ? 'Lanjut menyusun dengan foto itu, atau tambah foto lain dulu.' : 'Gaya ini memuat ' + need + ' foto. Kurang atau lebih dari itu juga boleh, nanti bisa diatur.')));
    var pickBtn = h('button', 'btn btn-lg ' + (have ? 'btn-line' : 'btn-warm')); pickBtn.type = 'button'; pickBtn.id = 'pick-files';
    pickBtn.appendChild(icon(have ? 'plus' : 'photo')); pickBtn.appendChild(h('span', null, have ? 'Tambah foto' : 'Pilih foto'));
    pickBtn.addEventListener('click', function () { $('#file-first').click(); });
    if (have) {
      var cont = h('button', 'btn btn-warm btn-lg', 'Lanjut menyusun'); cont.type = 'button';
      cont.addEventListener('click', function () { enterStudio(true); });
      drop.appendChild(cont);
    }
    drop.appendChild(pickBtn);
    drop.appendChild(h('p', 'drop-or', 'JPG, PNG, atau WEBP. Di komputer, fotonya juga bisa ditarik ke kotak ini.'));
    if (!have) {
      var demoBtn = h('button', 'linkish', 'Belum ada fotonya? Coba dulu pakai foto contoh'); demoBtn.type = 'button'; demoBtn.id = 'use-samples';
      demoBtn.addEventListener('click', useSamples);
      drop.appendChild(demoBtn);
    }
    var msg = h('p', 'msg'); msg.id = 'upl-msg'; msg.hidden = true; msg.setAttribute('role', 'alert');
    body.appendChild(drop); body.appendChild(msg);
    var facts = h('ul', 'upl-facts');
    [['Tersusun otomatis', 'Foto dipasang urut tanggal, dari yang paling lama.'], ['Tanggal kamu yang tentukan', 'Keterangan di samping nomor foto kamu isi sendiri, atau biarkan kosong.'], ['Tetap bisa diatur', 'Geser, perbesar, tukar, atau ganti fotonya kapan saja.']].forEach(function (f) {
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
function drawCoverPick() { var p = $('#setup-pick'); p.textContent = ''; p.appendChild(document.createTextNode('Sampul: ')); p.appendChild(h('b', null, curCover().name)); }
function drawHeroCover(hero, cat, cv) {
  hero.textContent = '';
  var art = h('div', 'cvp-art'); art.appendChild(coverArt(cat, cv, 'Sampul ' + cv.name, 720)); hero.appendChild(art);
  var tx = h('div', 'cvp-tx');
  tx.appendChild(h('p', 'cvp-k', 'Sampul terpilih'));
  tx.appendChild(h('h2', 'cvp-nm', cv.name));
  if (cv.note) tx.appendChild(h('p', 'cvp-d', cv.note));
  tx.appendChild(h('p', 'cvp-m', cv.g + ' · ' + cat.name));
  hero.appendChild(tx);
}
/* Editor Cover Majalah: unggah foto sampul (otomatis dinaikkan ke Full HD), atur posisi, ubah teks. Muncul hanya saat sampul majalah dipilih. */
function magEditor(cat) {
  var el = h('section', 'mag-ed'); el.setAttribute('aria-labelledby', 'mag-h'); el.hidden = true;
  var hd = h('h3', null, 'Fotomu di sampul majalah'); hd.id = 'mag-h'; el.appendChild(hd);
  el.appendChild(h('p', 'mag-sub', 'Satu foto dipakai untuk kelima gaya majalah, jadi kamu bisa ganti gaya tanpa mengunggah lagi. Foto otomatis dinaikkan ke Full HD (1920 px) supaya tajam.'));
  var up = h('div', 'mag-up'), pick = h('button', 'btn btn-warm', 'Unggah foto sampul'); pick.type = 'button'; pick.setAttribute('data-mag-pick', '');
  var inp = h('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true; inp.setAttribute('aria-label', 'Foto untuk sampul majalah');
  var info = h('p', 'mag-info'); info.setAttribute('role', 'status'); info.setAttribute('aria-live', 'polite');
  up.appendChild(pick); up.appendChild(inp); up.appendChild(info); el.appendChild(up);
  var ctl = h('div', 'mag-ctl');
  var fitTip = h('p', 'mag-note mag-fit'); fitTip.setAttribute('role', 'status'); ctl.appendChild(fitTip);
  var sl = {};
  [['z', 'Perbesar', 1, 2.5], ['fx', 'Geser kiri–kanan', 0, 1], ['fy', 'Geser atas–bawah', 0, 1]].forEach(function (d) {
    var lb = h('label', 'mag-sl'), t = h('span', null, d[1]), r = h('input'); r.type = 'range'; r.min = d[2]; r.max = d[3]; r.step = 0.01; r.value = S.mag[d[0]];
    r.addEventListener('input', function () { S.mag[d[0]] = +r.value; S.mag.touched = true; magChanged(); drawFit(); });
    lb.appendChild(t); lb.appendChild(r); ctl.appendChild(lb); sl[d[0]] = r;
  });
  var fitBtn = h('button', 'btn btn-sm btn-line', 'Kembalikan ke posisi otomatis'); fitBtn.type = 'button'; ctl.appendChild(fitBtn);
  el.appendChild(ctl);
  /* Posisi otomatis: begitu subjek terdeteksi, foto langsung dipaskan ke bingkai sampul. Slider tetap ada untuk penyesuaian. */
  function autoFit() {
    var ph = S.mag.photo, f = ph && ph.cut ? magAutoFit(ph.cut, ph.w, ph.h) : null;
    if (!f) return false;
    S.mag.fx = f.fx; S.mag.fy = f.fy; S.mag.z = f.z; S.mag.touched = false;
    sl.z.value = f.z; sl.fx.value = f.fx; sl.fy.value = f.fy;
    return true;
  }
  function drawFit() {
    var auto = !!(S.mag.photo && S.mag.photo.cut);
    fitBtn.hidden = !auto || !S.mag.touched;
    fitTip.textContent = auto ? (S.mag.touched ? 'Posisi foto sudah kamu atur sendiri.' : 'Posisi foto sudah diatur otomatis mengikuti orang di foto. Geser slider di bawah hanya kalau perlu.') : 'Atur bagian foto yang tampil di sampul dengan slider di bawah.';
  }
  fitBtn.addEventListener('click', function () { if (autoFit()) { magChanged(); drawFit(); } });
  function check(label, get, set) {
    var lb = h('label', 'mag-co'), cb = h('input'); cb.type = 'checkbox'; cb.checked = get();
    lb.appendChild(cb); lb.appendChild(h('span', null, label));
    cb.addEventListener('change', function () { set(cb.checked); magChanged(); });
    return { el: lb, cb: cb };
  }
  var cFront = check('Foto di depan judul (teks di belakang subjek)', function () { return S.mag.front; }, function (v) { S.mag.front = v; });
  el.appendChild(cFront.el);
  var segNote = h('p', 'mag-note'); segNote.setAttribute('role', 'status'); el.appendChild(segNote);
  var tx = h('div', 'mag-tx'); el.appendChild(tx);
  var note = h('p', 'mag-note'); el.appendChild(note);
  function drawInfo() {
    var m = S.mag.photo;
    if (!m) { info.textContent = 'Belum ada foto. Contoh di atas memakai siluet.'; return; }
    info.textContent = m.name + ' · ' + m.ow + '×' + m.oh + ' px' + (m.w > m.ow || m.h > m.oh ? ' → dinaikkan ke ' + m.w + '×' + m.h + ' px (Full HD).' : ' (sudah cukup besar, tidak diubah).');
  }
  function sync() {
    var cv = curCover(); el.hidden = !cv.mag;
    if (!cv.mag) return;
    if (cv.mag !== 'krem' && typeof magSegmenter === 'function') magSegmenter().catch(function () { });   /* unduh pemisah subjek dari sekarang, sambil pembeli memilih foto */
    drawInfo(); ctl.hidden = !S.mag.photo; drawFit();
    var ok = !!(S.mag.photo && S.mag.photo.cut), none = cv.mag === 'krem' || !S.mag.photo;
    cFront.el.hidden = !ok || none;
    cFront.cb.checked = S.mag.front;
    segNote.hidden = !S.mag.photo || cv.mag === 'krem' || ok && !segNote.textContent;
    if (S.mag.photo && !ok && cv.mag !== 'krem' && !segNote.textContent) { segNote.textContent = 'Pemisah subjek tidak bisa dimuat (perlu internet). Judul tetap di atas foto.'; segNote.hidden = false; }
    tx.textContent = '';
    MAG_FIELDS[cv.mag].forEach(function (f, i) {
      var lb = h('label', 'mag-f'), t = h('span', null, f[1]), r = h('input', 'in'); r.type = 'text'; r.maxLength = f[2]; r.autocomplete = 'off'; r.spellcheck = false;
      r.value = magText(cv.mag, cat.id, f[0]);
      r.addEventListener('input', function () { (S.mag.ed[cv.mag] = S.mag.ed[cv.mag] || {})[f[0]] = r.value; magChanged(); });
      lb.appendChild(t); lb.appendChild(r); tx.appendChild(lb);
    });
    note.textContent = cv.mag === 'lukis' ? 'Efek lukisan dibuat di perangkatmu dengan filter cat minyak, bukan AI. Hasilnya bergantung pada foto.' : '';
    note.hidden = !note.textContent;
  }
  pick.addEventListener('click', function () { inp.click(); });
  inp.addEventListener('change', async function () {
    var f = inp.files && inp.files[0]; inp.value = '';
    if (!f) return;
    info.textContent = 'Memproses foto…'; pick.disabled = true;
    try {
      S.mag.photo = await magLoadFile(f); S.mag.fx = 0.5; S.mag.fy = 0.3; S.mag.z = 1; S.mag.touched = false;
      sl.z.value = 1; sl.fx.value = 0.5; sl.fy.value = 0.3;
      magChanged(); segNote.textContent = 'Memisahkan subjek dari latar…'; sync(); pick.textContent = 'Ganti foto sampul';
      var ph = S.mag.photo; ph.cut = await magSegment(ph.canvas); segNote.textContent = '';
      if (S.mag.photo === ph) { if (!S.mag.touched) autoFit(); magChanged(); sync(); }
    } catch (e) { if (window.console) console.warn('Cover Majalah:', e); info.textContent = 'Fotonya belum bisa dibuka. Pilih file JPG, PNG, atau WEBP.'; }
    finally { pick.disabled = false; }
  });
  sync();
  return { el: el, sync: sync };
}
/* The cover step: the chosen cover large on top, every cover of the theme on shelves below, like a bookstore app.
   A shelf scrolls sideways; searching or picking one shelf lays the covers out as a grid. The covers are one radio group. */
function coverShelf(cat) {
  var all = pickableCovers(cat), groups = [], q = '', grp = '';
  all.forEach(function (cv) { if (groups.indexOf(cv.g) < 0) groups.push(cv.g); });
  var wrap = h('div', 'cvs'), hero = h('div', 'cvp'); hero.id = 'cover-hero';
  drawHeroCover(hero, cat, curCover()); wrap.appendChild(hero);
  var magEd = magEditor(cat); wrap.appendChild(magEd.el);
  var tools = h('div', 'cvs-tools');
  var qw = h('div', 'find-q'), lab = h('label', 'sr', 'Cari sampul ' + cat.name), inp = h('input', 'in');
  inp.type = 'search'; inp.id = 'cover-q'; lab.htmlFor = 'cover-q'; inp.autocomplete = 'off'; inp.enterKeyHint = 'search'; inp.spellcheck = false;
  inp.placeholder = cat.id === 'travel' ? 'Cari kota atau negara' : cat.id === 'event' ? 'Cari acara, misalnya Wisuda' : 'Cari tema, misalnya Keluarga';
  qw.appendChild(lab); qw.appendChild(icon('search')); qw.appendChild(inp); tools.appendChild(qw);
  var seg = h('div', 'seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Tampilkan rak');
  [''].concat(groups).forEach(function (g) { var b = h('button', 'seg-b', g || 'Semua'); b.type = 'button'; b.dataset.g = g; b.setAttribute('aria-pressed', g ? 'false' : 'true'); seg.appendChild(b); });
  tools.appendChild(seg); wrap.appendChild(tools);
  tools.hidden = all.length <= 8;   /* pencarian dan filter rak hanya berguna kalau sampulnya banyak */
  var count = h('p', 'find-n cvs-n'); count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite'); wrap.appendChild(count);
  var shelves = h('div', 'shelves'); shelves.setAttribute('role', 'radiogroup'); shelves.setAttribute('aria-label', 'Sampul ' + cat.name);
  function book(cv) {
    var b = h('button', 'book'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.id = cv.id; b.setAttribute('data-nowidow', ''); b.setAttribute('aria-label', cv.name);
    var art = h('span', 'book-art'); art.appendChild(coverArt(cat, cv)); b.appendChild(art);
    b.appendChild(h('span', 'book-nm', cv.name)); b.appendChild(h('span', 'book-st'));
    return b;
  }
  var secs = groups.map(function (g, gi) {
    var sec = h('section', 'shelf'), hd = h('div', 'shelf-h'), t = h('h3', null, g + ' '), nav = h('div', 'shelf-nav'), row = h('div', 'shelf-row');
    sec.dataset.g = g; t.id = 'shelf-' + cat.id + '-' + gi; sec.setAttribute('aria-labelledby', t.id);
    t.appendChild(h('span', 'shelf-n')); hd.appendChild(t);
    [['left', -1, 'kiri'], ['right', 1, 'kanan']].forEach(function (d) {
      var b = h('button', 'btn btn-icon btn-icon-s shelf-go'); b.type = 'button'; b.dataset.d = d[1]; b.setAttribute('aria-label', 'Geser rak ' + g + ' ke ' + d[2]); b.appendChild(icon(d[0])); nav.appendChild(b);
    });
    hd.appendChild(nav); sec.appendChild(hd);
    all.filter(function (cv) { return cv.g === g; }).forEach(function (cv) { row.appendChild(book(cv)); });
    row.addEventListener('scroll', function () { nav_(); }, { passive: true });
    sec.appendChild(row); shelves.appendChild(sec);
    return sec;
  });
  wrap.appendChild(shelves);
  var empty = h('div', 'find-empty cvs-empty'); empty.hidden = true; wrap.appendChild(empty);
  function visible() { return $$('.book', shelves).filter(function (b) { return !b.hidden && !b.closest('.shelf').hidden; }); }
  function rove() {                      /* one tab stop: the chosen cover, or the first one shown when it is filtered out */
    var vis = visible(), on = vis.filter(function (b) { return b.dataset.id === S.cover; })[0] || vis[0];
    $$('.book', shelves).forEach(function (b) { b.tabIndex = b === on ? 0 : -1; });
  }
  function mark() {
    $$('.book', shelves).forEach(function (b) {
      var on = b.dataset.id === S.cover, st = $('.book-st', b);
      b.setAttribute('aria-checked', on ? 'true' : 'false'); st.textContent = '';
      if (on) { st.appendChild(icon('check')); st.appendChild(document.createTextNode('Terpilih')); } else st.textContent = coverOf(cat, b.dataset.id).note;
    });
    rove();
  }
  function nav_() {
    var grid = wrap.classList.contains('is-grid');
    secs.forEach(function (sec) {
      var row = $('.shelf-row', sec), max = row.scrollWidth - row.clientWidth, x = row.scrollLeft, bs = $$('.shelf-go', sec);
      $('.shelf-nav', sec).hidden = grid || max < 4;
      bs[0].disabled = x < 4; bs[1].disabled = x > max - 4;
      row.classList.toggle('fade-l', !grid && x > 4); row.classList.toggle('fade-r', !grid && x < max - 4);
    });
  }
  function choose(b, animate) {
    var id = b.dataset.id; if (id === S.cover) return;
    var cv = coverOf(cat, id), src = $('.book-art > *', b), old = $('.cvp-art > *', hero), r = hero.getBoundingClientRect();
    var fly = animate && document.startViewTransition && !calm.matches && r.bottom > 80 && r.top < innerHeight - 120;   /* fly only when the big cover is on screen */
    var run = function () { S.cover = id; if (src) src.style.viewTransitionName = ''; drawHeroCover(hero, cat, cv); mark(); drawCoverPick(); magEd.sync(); };
    if (!fly) return run();
    if (old) old.style.viewTransitionName = 'none';
    if (src) src.style.viewTransitionName = 'album-cover';
    vtRun(run);
  }
  function apply() {
    var f = fold(q.trim()), total = 0;
    wrap.classList.toggle('is-grid', !!(f || grp));
    secs.forEach(function (sec) {
      var n = 0;
      $$('.book', sec).forEach(function (b) {
        var cv = coverOf(cat, b.dataset.id), ok = (!grp || sec.dataset.g === grp) && (!f || [cv.name, cv.note, cv.g].some(function (x) { return x && fold(x).indexOf(f) > -1; }));
        b.hidden = !ok; if (ok) n++;
      });
      sec.hidden = !n; total += n; $('.shelf-n', sec).textContent = n;
    });
    count.textContent = f && total ? total + ' sampul cocok dengan “' + q.trim() + '”.' : '';
    empty.hidden = !!total; empty.textContent = '';
    if (!total) {
      empty.appendChild(h('b', null, 'Belum ada sampul untuk “' + q.trim() + '”.'));
      empty.appendChild(h('p', null, cat.id === 'travel' ? 'Coba nama kota atau negara lain.' : 'Coba nama acara atau momen lain.'));
      var clr = h('button', 'btn btn-line', 'Hapus pencarian'); clr.type = 'button';
      clr.addEventListener('click', function () { inp.value = ''; q = ''; apply(); inp.focus(); });
      empty.appendChild(clr);
    }
    rove(); nav_();
  }
  shelves.addEventListener('click', function (e) { var b = e.target.closest('.book'); if (b) choose(b, true); });
  shelves.addEventListener('keydown', function (e) {
    var b = e.target.closest('.book'); if (!b) return;
    var rows = secs.filter(function (s) { return !s.hidden; }).map(function (s) { return $$('.book', s).filter(function (x) { return !x.hidden; }); });
    var flat = [].concat.apply([], rows), k = flat.indexOf(b), r = -1, i = 0, to = null;
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
  inp.addEventListener('input', function () { q = inp.value; apply(); });
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('.seg-b'); if (!b) return;
    grp = b.dataset.g; $$('.seg-b', seg).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); apply();
  });
  mark(); apply();
  /* the step is drawn before its view is shown, so sizes are only known once the shelves get a width:
     then open the shelf where the chosen cover sits, and keep the arrows right on every resize */
  var opened = false;
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () {
      if (!shelves.isConnected) return ro.disconnect();
      if (!shelves.clientWidth) return;
      if (!opened) { opened = true; var b = $('.book[aria-checked="true"]', shelves); if (b && !b.hidden) { var row = b.parentNode; row.scrollLeft = Math.max(0, b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2); } }
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
    pick.appendChild(document.createTextNode('Gaya: '));
    pick.appendChild(h('b', null, LAYOUTS[S.layout].name));
    pick.appendChild(document.createTextNode(' · muat ' + slotCount(S.layout) + ' foto'));
  } else pick.textContent = 'Pilih satu gaya untuk lanjut.';
  $('#setup-next').textContent = S.album ? 'Pakai gaya ini' : 'Lanjut masukkan foto';
  $('#setup-next').disabled = !S.layout;
}
$('#setup-back').addEventListener('click', function () {
  if (S.step === 'tema') return go('home');
  S.step = S.step === 'sampul' ? 'tema' : S.step === 'gaya' ? 'sampul' : 'gaya';
  drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true });
});
$('#setup-next').addEventListener('click', function (e) {
  if (S.step === 'sampul' && curCover().mag && !S.mag.photo) { toast('Unggah foto untuk sampul majalah dulu.'); var pk = $('[data-mag-pick]'); if (pk) { pk.scrollIntoView({ block: 'center' }); pk.focus({ preventScroll: true }); } return; }
  if (S.step === 'sampul') { S.step = 'gaya'; drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true }); return; }
  if (S.step !== 'gaya' || !S.layout) return;
  if (S.album && S.album.tpl.id === S.layout && S.album.cat === S.cat) return go('studio');
  if (S.album && S.dirty) {
    return openDialog({ trigger: e.currentTarget, title: 'Ganti ke gaya ' + LAYOUTS[S.layout].name + '?',
      body: 'Fotomu tetap ada di rak. Tapi susunan foto dan teks yang sudah kamu atur akan dimulai ulang mengikuti gaya baru.',
      actions: [{ label: 'Ganti gaya', kind: 'primary', fn: function () { enterStudio(true); } }, { label: 'Tetap pakai gaya sekarang', fn: function () { S.layout = S.album.tpl.id; S.cat = S.album.cat; go('studio'); } }] });
  }
  if (S.photos.length) return enterStudio(true);
  S.step = 'foto'; drawSetup(); window.scrollTo(0, 0); $('#setup-h').focus({ preventScroll: true });
});

/* ---------- photos in ---------- */
async function addFiles(files, first) {
  if (!files || !files.length) return;
  var room = MAX_PHOTOS - S.photos.length;
  if (room <= 0) { toast('Satu album maksimal ' + MAX_PHOTOS + ' foto.'); return; }
  INTAKE_LIMIT = room;
  busy(true, 0, Math.min(files.length, INTAKE_LIMIT));
  var res;
  try { res = await intake(files, function (d, of) { busy(true, d, of); }); }
  finally { busy(false); }
  if (!res.photos.length) {
    var m = 'Fotonya belum bisa dibuka. Pilih file JPG, PNG, atau WEBP, lalu coba lagi.';
    if (first && $('#upl-msg')) { $('#upl-msg').textContent = m; $('#upl-msg').hidden = false; } else toast(m);
    return;
  }
  var from = S.photos.length;
  res.photos.forEach(function (p) { S.photos.push(p); });
  var fresh = res.photos.map(function (p, i) { return from + i; });
  var tail = (res.failed ? ' ' + res.failed + ' foto lain tidak bisa dibuka.' : '') + (res.skipped ? ' ' + res.skipped + ' foto terakhir tidak ikut karena satu album maksimal ' + MAX_PHOTOS + ' foto.' : '') + (S.photos.length < MIN_PHOTOS ? ' Minimal ' + MIN_PHOTOS + ' foto supaya albumnya bisa dipesan, baru ada ' + S.photos.length + '.' : '');
  if (first || !S.album) { enterStudio(true, tail); return; }
  var placed = pourPhotos(S.album, fresh);
  S.dirty = true;
  drawStudio();
  toast((placed ? fresh.length + ' foto ditambahkan, ' + placed + ' bingkai kosong langsung terisi.' : fresh.length + ' foto masuk ke rak foto.') + tail);
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
  if (S.view === 'home') return window.scrollTo(0, 0);
  if (!S.album || S.view === 'done') return go('home');
  openDialog({ trigger: trigger, title: 'Kembali ke beranda?', body: 'Albummu aman selama halaman ini tidak ditutup. Untuk kembali menyusun, pilih Lanjutkan album di beranda.',
    actions: [{ label: 'Ke beranda', kind: 'primary', fn: function () { labelStart(); go('home'); } }, { label: 'Tetap di sini' }] });
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
  var t = totals(S.album), extra = S.photos.length - t.filled;
  go('studio', null, !rebuild ? null : function () { toast((t.empty ? t.filled + ' foto terpasang. ' + t.empty + ' bingkai masih kosong.' : extra > 0 ? t.filled + ' foto terpasang. ' + extra + ' foto lainnya ada di rak foto.' : 'Semua ' + t.filled + ' bingkai terisi. Tinggal dirapikan.') + (tail || '')); });
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
  return 'Halaman ' + real.join('–') + ' dari ' + S.album.pages.length;
}
function drawStudio() {
  var cat = catOf(S.cat);
  $('#st-name').textContent = curCover().name;
  $('#st-meta').textContent = 'Gaya ' + LAYOUTS[S.layout].name + ' · A4 · 40 halaman';
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
  if (t.empty) $('#st-note-t').textContent = t.empty + ' bingkai foto masih kosong.';
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
    b.setAttribute('aria-label', pageLabel(v) + (miss ? ', ' + miss + ' bingkai kosong' : ''));
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
  b.setAttribute('aria-label', pageLabel(v) + (miss ? ', ' + miss + ' bingkai kosong' : ''));
}
function drawStage() {
  var sp = $('#spread'), v = viewPages(S.page);
  sp.textContent = '';
  sp.classList.toggle('is-single', v.length === 1);
  v.forEach(function (p, i) {
    if (p == null) { sp.appendChild(h('div', 'spread-blank', i === 0 ? 'Bagian dalam sampul depan' : 'Bagian dalam sampul belakang')); return; }
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
  $$('.slot', pg).forEach(function (el) { var g = P.ph[+el.dataset.s]; if (g[2] < 150 || g[3] < 150) el.classList.add('is-tiny'); });
  var s = S.sel;
  if (s && s.p === p) {
    if (s.t === 'slot') {
      var g2 = P.ph[s.i], fr = h('div', 'sel-frame');
      fr.style.cssText = 'left:' + pct(g2[0], 1000) + ';top:' + pct(g2[1], PAGE_H) + ';width:' + pct(g2[2], 1000) + ';height:' + pct(g2[3], PAGE_H) + (g2[4] ? ';transform:rotate(' + g2[4] + 'deg)' : '');
      pg.appendChild(fr);
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
  if (!keepSel) S.sel = null;
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
    if (p.date) b.appendChild(h('span', 'th-date num', p.date.getDate() + ' ' + MONTHS[p.date.getMonth()]));
    if (u[i]) b.appendChild(h('span', 'th-used num', u[i] > 1 ? u[i] + '×' : '✓'));
    b.setAttribute('aria-label', 'Foto' + (p.date ? ' ' + fmtDate(p.date) : '') + (u[i] ? ', dipakai ' + u[i] + ' kali' : ', belum dipakai') + '. Pilih untuk memasang');
    tray.appendChild(b);
  });
  $('#tray-tip').textContent = S.sel && S.sel.t === 'slot' ? 'Pilih foto di bawah untuk memasangnya di bingkai yang sedang dipilih.' : 'Pilih bingkai di halaman, lalu pilih fotonya di sini. Urutannya dari foto paling lama.';
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
  var tool = $('#slot-tool'), s = selSlot();
  tool.hidden = !s;
  $('.studio').classList.toggle('has-sel', !!s);
  if (!s) { $('#tray-tip').textContent = 'Pilih bingkai di halaman, lalu pilih fotonya di sini. Urutannya dari foto paling lama.'; return; }
  var filled = s.photo != null;
  $('#slot-tool-h').textContent = 'Foto ' + (S.sel.i + 1) + ' di halaman ' + (S.sel.p + 1) + (filled ? '' : ' · kosong');
  $('#slot-tool-filled').hidden = !filled;
  $('#slot-tool-empty').hidden = filled;
  if (filled) { $('#zoom').value = Math.round(s.z * 100); $('#zoom-o').textContent = Math.round(s.z * 100) + '%'; }
  var ci = capOfSlot(S.sel.p, S.sel.i), capBox = $('#slot-cap');
  capBox.hidden = ci < 0 || !filled;
  if (ci > -1 && filled) {
    var inp = $('#slot-cap-in'), val = captionValue(S.album, S.sel.p, ci), ph = S.photos[s.photo];
    if (document.activeElement !== inp) inp.value = val;
    inp.maxLength = capLimit(S.album.tpl.pages[S.sel.p].cp[ci]);
    var chip = $('#slot-cap-date'), dateStr = ph.date ? fmtDate(ph.date) : '';
    chip.hidden = !dateStr || val === dateStr;
    chip.textContent = 'Pakai tanggal di file foto: ' + dateStr;
    $('#slot-cap-x').hidden = !val;
  }
  $('#tray-tip').textContent = 'Pilih foto di bawah untuk memasangnya di bingkai yang sedang dipilih.';
}
$('#zoom').addEventListener('input', function (e) {
  var s = selSlot(); if (!s || s.photo == null) return;
  s.z = +e.target.value / 100; S.dirty = true;
  $('#zoom-o').textContent = Math.round(s.z * 100) + '%';
  var el = $('.slot[data-s="' + S.sel.i + '"] img', pageNode(S.sel.p)), g = S.album.tpl.pages[S.sel.p].ph[S.sel.i];
  if (el) placeImg(el, S.photos[s.photo], g[2], g[3], s);
});
$('#zoom').addEventListener('change', function () { if (S.sel) refreshNavFor(S.sel.p); });
$('#slot-clear').addEventListener('click', function () {
  if (!S.sel) return;
  var p = S.sel.p, i = S.sel.i, prev = Object.assign({}, S.album.pages[p].slots[i]);
  setSlot(S.album, p, i, null); S.dirty = true;
  redrawPage(p); refreshNavFor(p); drawProgress(); drawTray(); drawSlotTool();
  toast('Bingkai dikosongkan.', { label: 'Urungkan', fn: function () { Object.assign(S.album.pages[p].slots[i], prev); redrawPage(p); refreshNavFor(p); drawProgress(); drawTray(); drawSlotTool(); } });
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
  if (on) $('#st-hint-t').textContent = S.swap ? 'Pilih bingkai lain untuk menukar fotonya' : 'Pilih bingkai untuk foto ini';
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
      if (t.k === 'e') { it.label = t.pre ? 'Teks setelah “' + t.pre.trim() + '”' : t.z >= 40 ? 'Judul' : 'Teks pendek'; it.val = st.tx[i] || ''; it.max = 60; it.ph = t.z >= 40 ? 'Tulis judulnya' : 'Tulis teksnya'; items.push(it); }
      else { it.label = 'Label “' + t.t + '”'; it.val = st.tx[i] != null ? st.tx[i] : t.t; it.max = 24; it.ph = 'Kosong'; minor.push(it); }
    });
    P.pa.forEach(function (pa, i) { items.push({ t: 'pa', i: i, y: pa.y, x: pa.x, label: 'Paragraf', val: st.pa[i] || '', max: paraLimit(pa), area: true, ph: 'Ceritakan momennya' }); });
    P.cp.forEach(function (cp, i) {
      if (!cp.bar && !captionValue(S.album, p, i) && cp.p != null && st.slots[cp.p].photo == null) return;
      items.push({ t: 'cp', i: i, y: cp.y, x: cp.x, label: cp.p != null ? 'Keterangan foto ' + (cp.p + 1) : 'Keterangan', val: captionValue(S.album, p, i), max: capLimit(cp), ph: CAP_HINT });
    });
    if (!items.length && !minor.length) return;
    any = true;
    var grp = h('section', 'tf-g'); grp.appendChild(h('h3', 'tf-h', 'Halaman ' + (p + 1)));
    items.sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (it) { grp.appendChild(fieldNode(p, it)); });
    if (minor.length) {
      var more = h('details', 'tf-more'); more.appendChild(h('summary', null, 'Nomor dan label kecil (' + minor.length + ')'));
      var list = h('div', 'tf-list'); minor.sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (it) { list.appendChild(fieldNode(p, it)); });
      more.appendChild(list);
      if (S.sel && S.sel.p === p && S.sel.t === 'tx' && P.tx[S.sel.i] && P.tx[S.sel.i].k !== 'e') more.open = true;
      grp.appendChild(more);
    }
    box.appendChild(grp);
  });
  if (!any) { var em = h('div', 'empty'); em.appendChild(h('b', null, 'Halaman ini tanpa teks.')); em.appendChild(document.createTextNode('Buka halaman lain untuk menulis judul, paragraf, atau keterangan foto.')); box.appendChild(em); }
}
function fieldNode(p, it) {
  var wrap = h('div', 'tf' + (S.sel && S.sel.p === p && S.sel.t === it.t && S.sel.i === it.i ? ' is-sel' : ''));
  var id = fieldId(p, it.t, it.i), row = h('div', 'tf-row'), lb = h('label', 'fld-l', it.label);
  lb.htmlFor = id; row.appendChild(lb);
  var inp = h(it.area ? 'textarea' : 'input', 'in');
  inp.id = id; if (!it.area) inp.type = 'text'; else inp.rows = 3;
  inp.value = it.val; inp.maxLength = it.max; inp.placeholder = it.ph; inp.autocomplete = 'off';
  var cnt = null;
  if (it.area) { cnt = h('span', 'tf-c num', it.val.length + '/' + it.max); row.appendChild(cnt); }
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
function selectText(p, t, i) {
  S.sel = { t: t, p: p, i: i }; S.armed = null; S.swap = null;
  setTab('teks'); drawTextFields(); drawSlotTool(); drawHint();
  $$('#spread .is-sel').forEach(function (n) { n.classList.remove('is-sel'); }); $$('#spread .sel-frame').forEach(function (n) { n.remove(); });
  var el = $('[data-' + t + '="' + i + '"]', pageNode(p)); if (el) el.classList.add('is-sel');
  var f = $('#' + fieldId(p, t, i));
  if (f) { f.focus({ preventScroll: true }); f.scrollIntoView({ block: 'nearest' }); }
}
function selectSlot(p, i) {
  S.sel = { t: 'slot', p: p, i: i };
  if (S.tab !== 'foto') setTab('foto');
  viewPages(S.page).forEach(function (q) { if (q != null) { var pg = pageNode(q); $$('.sel-frame', pg).forEach(function (n) { n.remove(); }); $$('.is-sel', pg).forEach(function (n) { n.classList.remove('is-sel'); }); } });
  var pg2 = pageNode(p), g = S.album.tpl.pages[p].ph[i], fr = h('div', 'sel-frame');
  fr.style.cssText = 'left:' + pct(g[0], 1000) + ';top:' + pct(g[1], PAGE_H) + ';width:' + pct(g[2], 1000) + ';height:' + pct(g[3], PAGE_H) + (g[4] ? ';transform:rotate(' + g[4] + 'deg)' : '');
  pg2.appendChild(fr);
  drawSlotTool(); drawTray();
}
function deselect() {
  if (!S.sel) return;
  S.sel = null;
  $$('#spread .sel-frame').forEach(function (n) { n.remove(); }); $$('#spread .is-sel').forEach(function (n) { n.classList.remove('is-sel'); });
  $$('.tf.is-sel').forEach(function (n) { n.classList.remove('is-sel'); });
  drawSlotTool(); drawTray();
}

/* pointer work on the page: tap to select, drag a photo to choose what stays in frame */
var pan = null, panned = false;
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
$('#spread').addEventListener('pointerdown', function (e) {
  var el = e.target.closest('.slot'); if (!el || e.button > 0) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s, s = S.album.pages[p].slots[i];
  panned = false;
  if (s.photo == null || S.swap || S.armed != null) return;
  var g = S.album.tpl.pages[p].ph[i], b = imgBox(S.photos[s.photo], g[2], g[3], s);
  pan = { el: el, img: $('img', el), p: p, i: i, s: s, g: g, x: e.clientX, y: e.clientY, fx: s.fx, fy: s.fy,
    ox: (b.W - 100) / 100 * el.offsetWidth, oy: (b.H - 100) / 100 * el.offsetHeight, rot: (g[4] || 0) * Math.PI / 180, id: e.pointerId };
  try { el.setPointerCapture(e.pointerId); } catch (err) {}
});
$('#spread').addEventListener('pointermove', function (e) {
  if (!pan || e.pointerId !== pan.id) return;
  var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
  if (!panned && Math.hypot(dx, dy) < 5) return;
  if (!panned) { panned = true; if (!S.sel || S.sel.t !== 'slot' || S.sel.p !== pan.p || S.sel.i !== pan.i) selectSlot(pan.p, pan.i); }
  var c = Math.cos(-pan.rot), sn = Math.sin(-pan.rot), rx = dx * c - dy * sn, ry = dx * sn + dy * c;
  if (pan.ox > 0.5) pan.s.fx = clamp(pan.fx - rx / pan.ox, 0, 1);
  if (pan.oy > 0.5) pan.s.fy = clamp(pan.fy - ry / pan.oy, 0, 1);
  placeImg(pan.img, S.photos[pan.s.photo], pan.g[2], pan.g[3], pan.s);
});
function endPan(e) {
  if (!pan || (e && e.pointerId !== pan.id)) return;
  if (panned) { S.dirty = true; refreshNavFor(pan.p); }
  pan = null;
}
$('#spread').addEventListener('pointerup', endPan);
$('#spread').addEventListener('pointercancel', endPan);
$('#spread').addEventListener('click', function (e) {
  if (panned) { panned = false; return; }
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
    return selectText(p, t, +txt.dataset[t]);
  }
  if (slot) return slotClick(p, +slot.dataset.s);
  deselect();
});
$('#spread').addEventListener('keydown', function (e) {
  var el = e.target.closest('.slot'); if (!el) return;
  var p = +el.closest('.pg').dataset.p, i = +el.dataset.s, s = S.album.pages[p].slots[i];
  if (s.photo == null) return;
  var k = e.key, step = e.shiftKey ? 0.12 : 0.04, hit = true;
  if (k === 'ArrowLeft') s.fx = clamp(s.fx - step, 0, 1); else if (k === 'ArrowRight') s.fx = clamp(s.fx + step, 0, 1);
  else if (k === 'ArrowUp') s.fy = clamp(s.fy - step, 0, 1); else if (k === 'ArrowDown') s.fy = clamp(s.fy + step, 0, 1);
  else if (k === '+' || k === '=') s.z = clamp(s.z + 0.1, 1, 3); else if (k === '-') s.z = clamp(s.z - 0.1, 1, 3);
  else hit = false;
  if (!hit) return;
  e.preventDefault(); S.dirty = true;
  placeImg($('img', el), S.photos[s.photo], S.album.tpl.pages[p].ph[i][2], S.album.tpl.pages[p].ph[i][3], s);
  if (S.sel && S.sel.t === 'slot' && S.sel.p === p && S.sel.i === i) drawSlotTool();
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
  toast(changed.length + ' bingkai terisi dengan foto yang sudah ada. Kamu bisa menggantinya kapan saja.', { label: 'Urungkan', fn: function () {
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
    return openDialog({ trigger: e.currentTarget, title: 'Minimal ' + MIN_PHOTOS + ' foto',
      body: 'Albummu baru punya ' + S.photos.length + ' foto. Tambah ' + (MIN_PHOTOS - S.photos.length) + ' foto lagi supaya albumnya bisa dipesan.',
      actions: [{ label: 'Tambah foto', kind: 'primary', fn: function () { $('#file-more').click(); } }, { label: 'Tutup' }] });
  }
  var t = totals(S.album);
  if (!t.empty) return enterPreview();
  openDialog({ trigger: e.currentTarget, title: t.empty + ' bingkai foto masih kosong',
    body: 'Supaya tidak ada halaman yang bolong saat dicetak, semua bingkai perlu terisi dulu. Kamu bisa menambah foto, atau mengisi sisanya dengan foto yang sudah ada.',
    actions: [{ label: 'Isi dengan foto yang sudah ada', kind: 'primary', fn: fillWithExisting }, { label: 'Tambah foto', fn: function () { $('#file-more').click(); } }, { label: 'Lihat bingkai yang kosong', kind: 'quiet', fn: gotoFirstEmpty }] });
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
  if (what === 'cover') { var f = coverArt(cat, cv, 'Sampul depan ' + cv.name, 960); f.classList.add('pv-cover', 'is-front'); return f; }
  if (what === 'back' && cv.back) { var im = new Image(); im.className = 'pv-cover'; im.draggable = false; im.src = IMZ_IMG[cv.back]; im.alt = 'Sampul belakang'; return im; }
  if (what === 'back') {
    var d = h('div', 'pv-backc'); d.style.background = cv.bg; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Sampul belakang');
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
  $('#pv-label').textContent = v[0] === 'cover' ? 'Sampul depan' : v[0] === 'back' ? 'Sampul belakang' : 'Halaman ' + real.join('–') + ' dari ' + S.album.pages.length;
  $('#pv-prev').disabled = S.pv === 0; $('#pv-fwd').disabled = S.pv === views.length - 1;
  var t = totals(S.album), notes = $('#pv-notes'); notes.textContent = '';
  var a = h('span'); a.appendChild(icon('check')); a.appendChild(document.createTextNode(t.filled + ' foto terpasang di 40 halaman')); notes.appendChild(a);
  if (t.blankText) {
    notes.appendChild(h('span', null, t.blankText + ' kotak teks masih kosong dan tidak ikut dicetak.'));
    var fix = h('button', 'linkish', 'Isi teks'); fix.type = 'button';
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
$('#pv-next').addEventListener('click', function () { pvFinish(); drawCheckout(); go('checkout', 'co-h'); });
var swipe = null;
$('#pv-book').addEventListener('pointerdown', function (e) { swipe = { x: e.clientX, y: e.clientY }; });
$('#pv-book').addEventListener('pointerup', function (e) {
  if (!swipe) return;
  var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, r = e.currentTarget.getBoundingClientRect(); swipe = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) pvStep(dx < 0 ? 1 : -1);
  else if (Math.abs(dx) < 6 && Math.abs(dy) < 6) pvStep(e.clientX > r.left + r.width / 2 ? 1 : -1);   /* tap a side to turn, like a book reader */
});

/* ---------- checkout ---------- */
var PAY = false;   /* pembayaran Mayar; bawaan mati (album langsung dikirim ke tim), nilai asli dari /api/imazine/config */
function applyPay() {
  document.documentElement.classList.toggle('pay', PAY);
  $('#h-mail').textContent = PAY ? 'Pakai email yang sama saat membayar di Mayar. Dari email ini kami tahu pembayaran itu milik albummu.' : 'Untuk mengirim kabar tentang albummu.';
  if (S.view === 'checkout' && S.album) drawCheckout();
}
var cfgLoaded = false, MIN_PHOTOS = 20, MAX_PHOTOS = 240, PAY_MIN = 120;   /* nilai asli dari server: /api/imazine/config */
function loadConfig() {
  if (cfgLoaded) return; cfgLoaded = true;
  fetch('/api/imazine/config', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (!c) return;
    if (c.price > 0) PRICE = c.price;
    if (typeof c.payment === 'boolean' && c.payment !== PAY) { PAY = c.payment; applyPay(); }
    if (c.minPhotos > 0) MIN_PHOTOS = c.minPhotos;
    if (c.maxPhotos >= MIN_PHOTOS) MAX_PHOTOS = c.maxPhotos;
    if (c.payMinutes > 0) { PAY_MIN = c.payMinutes; var pm = $('#pay-min'); if (pm) pm.textContent = PAY_MIN % 60 ? PAY_MIN + ' menit' : (PAY_MIN / 60) + ' jam'; }
    if (S.view === 'checkout' && S.album) drawCheckout();
  }).catch(function () { /* tanpa server: pakai angka bawaan */ });
}
function drawCheckout() {
  loadConfig();
  var cat = catOf(S.cat), t = totals(S.album), total = PRICE * S.qty;
  var cv = curCover(), co = $('#co-cover'); co.textContent = ''; co.appendChild(coverArt(cat, cv, 'Sampul ' + cv.name));
  $('#co-name').textContent = cv.name;
  $('#co-spec-a').textContent = 'Gaya ' + LAYOUTS[S.layout].name;
  $('#co-spec-b').textContent = 'A4 · 40 halaman · Art Paper 260 gsm · Softcover · ' + t.filled + ' foto';
  $('#qty-n').textContent = S.qty; $('#qty-dn').disabled = S.qty <= 1; $('#qty-up').disabled = S.qty >= 20;
  $('#sum-total').textContent = rupiah(total);
  $('#co-pay').textContent = PAY ? 'Lanjut bayar' : 'Kirim album';
}
/* Mengubah isian setelah percobaan gagal berarti pesanan di server sudah tidak sesuai: mulai pesanan baru. */
$('#co-form').addEventListener('input', function () { subState = null; });
$('#qty-dn').addEventListener('click', function () { S.qty = clamp(S.qty - 1, 1, 20); subState = null; drawCheckout(); });
$('#qty-up').addEventListener('click', function () { S.qty = clamp(S.qty + 1, 1, 20); subState = null; drawCheckout(); });
$('#co-back').addEventListener('click', function () { subState = null; go('preview', 'pv-h'); });
var RULES = {
  name: function (v) { return v.trim().length >= 2 ? '' : 'Nama belum diisi.'; },
  whatsapp: function (v) { return v.replace(/\D/g, '').length >= 9 ? '' : 'Nomor WhatsApp belum benar. Contoh: 081234567890.'; },
  email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Email belum benar. Contoh: nama@email.com.'; }
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
      if (r.status < 500) { var er = new Error((p.name || ('Foto ' + (i + 1))) + ': ' + (j.error || 'ditolak.')); er.final = true; throw er; }
    } catch (e) { if (e.final || a === 3) throw e; }
    await new Promise(function (res) { setTimeout(res, 1500 * (a + 1)); });
  }
  throw new Error('Foto ' + (i + 1) + ' gagal terunggah.');
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
      if (r.status < 500) { var er = new Error('Sampul: ' + (j.error || 'ditolak.')); er.final = true; throw er; }
    } catch (e) { if (e.final || a === 3) throw e; }
    await new Promise(function (res) { setTimeout(res, 1500 * (a + 1)); });
  }
  throw new Error('Sampul gagal terunggah.');
}
async function putCover() {
  var cv = curCover(), blob = await magBlob(cv.mag, S.cat, MAG_W, 0.93);
  if (!blob) throw new Error('Sampul majalah belum bisa dibuat. Coba lagi.');
  await putCoverFile('render', blob, 'sampul-majalah.jpg');
  await putCoverFile('photo', S.mag.photo.file, S.mag.photo.name);
  subState.coverUp = 1;
}
function magOrderInfo(cat) {
  var cv = curCover(), m = S.mag, texts = {};
  MAG_FIELDS[cv.mag].forEach(function (f) { texts[f[0]] = magText(cv.mag, cat.id, f[0]); });
  return { style: cv.mag, photoName: m.photo ? m.photo.name : null, original: m.photo ? { width: m.photo.ow, height: m.photo.oh } : null, enhanced: m.photo ? { width: m.photo.w, height: m.photo.h } : null,
           focusX: +m.fx.toFixed(3), focusY: +m.fy.toFixed(3), zoom: +m.z.toFixed(2), texts: texts, render: { width: MAG_W, height: Math.round(MAG_W * MAG_RATIO) } };
}
async function sendOrder(order, used) {
  var title = $('#busy-t'), old = title.textContent, leaving = false;
  try {
    title.textContent = 'Mengirim pesanan…'; busy(true, 0, 0);
    if (!subState) {
      var r = await fetch('/api/imazine/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      var j = await apiJson(r);
      if (!r.ok) throw new Error(j.error || 'Pesanan belum bisa dikirim.');
      subState = { orderNo: j.orderNo, token: j.token, up: {}, used: used };
    }
    var n = subState.used ? subState.used.length : S.photos.length, done = Object.keys(subState.up).length, next = 0, fail = null;
    title.textContent = 'Mengunggah foto asli…'; busy(true, done, n);
    async function worker() {
      while (!fail && next < n) {
        var i = next++;
        if (subState.up[i]) continue;
        try { await putPhoto(i); done++; busy(true, done, n); } catch (e) { fail = e; }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (fail) throw fail;
    if (curCover().mag && !subState.coverUp) { title.textContent = 'Mengunggah sampul majalah…'; await putCover(); }
    title.textContent = PAY ? 'Menyiapkan pembayaran…' : 'Mengirim album ke tim…'; busy(true, n, n);
    var r2 = await fetch('/api/imazine/orders/' + subState.orderNo + '/checkout?t=' + subState.token, { method: 'POST' });
    var j2 = await apiJson(r2);
    if (r2.ok && j2.submitted && j2.next) {   /* tanpa pembayaran: album sudah masuk ke tim */
      try { localStorage.setItem('imz_last', JSON.stringify({ no: subState.orderNo, t: subState.token })); } catch (e) { /* tanpa localStorage */ }
      leaving = true; allowUnload = true; title.textContent = 'Album terkirim…';
      window.location.assign(j2.next); return;
    }
    if (!r2.ok || !j2.payUrl) throw new Error(j2.missing ? 'Beberapa foto belum terunggah. Coba kirim lagi.' : (j2.error || 'Pembayaran belum bisa dibuat.'));
    try { localStorage.setItem('imz_last', JSON.stringify({ no: subState.orderNo, t: subState.token })); } catch (e) { /* tanpa localStorage */ }
    leaving = true; allowUnload = true;
    title.textContent = 'Mengarahkan ke Mayar…'; busy(true, n, n);
    window.location.assign(j2.payUrl);
  } catch (e) {
    toast((e && e.message && !/Failed to fetch|NetworkError|Load failed/i.test(e.message)) ? e.message : 'Koneksi terputus. Fotomu belum hilang, coba kirim lagi.');
  } finally {
    if (!leaving) { title.textContent = old; busy(false); }
    $('#co-pay').disabled = leaving;
  }
}
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
  if (used.length < MIN_PHOTOS) { toast('Minimal ' + MIN_PHOTOS + ' foto berbeda di album. Albummu baru memakai ' + used.length + '.'); return; }
  /* Foto contoh hanya untuk mencoba. Pesanan sungguhan harus memakai foto pembeli (kecuali uji di localhost). */
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && used.some(function (i) { return S.photos[i].sample; })) {
    openDialog({ trigger: $('#co-pay'), title: 'Albummu masih memakai foto contoh', body: 'Foto contoh hanya untuk mencoba. Ganti dengan fotomu sendiri di langkah menyusun, lalu pesan.',
      actions: [{ label: 'Kembali ke preview', kind: 'primary', fn: function () { go('preview', 'pv-h'); } }, { label: 'Tutup' }] });
    return;
  }
  $('#co-pay').disabled = true;
  var cat = catOf(S.cat);
  var order = {
    customer: {
      email: $('#f-mail').value.trim(), note: $('#f-note').value.trim(),
      name: PAY ? undefined : $('#f-name').value.trim(), whatsapp: PAY ? undefined : $('#f-wa').value.trim()
    },
    product: { size: 'A4', pages: 40, paper: 'Art Paper 260 gsm', cover: 'Softcover', binding: 'Binding', qty: S.qty },
    category: cat.id, cover: curCover().id, coverName: curCover().name, template: S.layout,
    magCover: curCover().mag ? magOrderInfo(cat) : undefined,
    photos: used.map(function (old, i) { var p = S.photos[old]; return { id: i, file: p.name, width: p.w, height: p.h, date: p.date ? p.date.toISOString().slice(0, 10) : null }; }),
    pages: S.album.pages.map(function (pg, pi) {
      var P = S.album.tpl.pages[pi], cps = {};
      P.cp.forEach(function (c, i) { var v = captionValue(S.album, pi, i); if (v) cps[i] = v; });
      return { page: pi + 1, slots: pg.slots.map(function (s) { return { photo: s.photo != null ? remap[s.photo] : null, focusX: +s.fx.toFixed(3), focusY: +s.fy.toFixed(3), zoom: +s.z.toFixed(2) }; }), texts: pg.tx, paragraphs: pg.pa, captions: cps };
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
    openDialog({ trigger: null, title: 'Tinggalkan Imazine?', body: 'Albummu belum tersimpan dan akan hilang kalau kamu keluar dari halaman ini.',
      actions: [{ label: 'Tetap di sini', kind: 'primary' }, { label: 'Keluar', fn: function () { allowUnload = true; history.go(-2); } }] });
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
