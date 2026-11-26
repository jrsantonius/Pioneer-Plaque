/* ---------- Page renderer -------------------------------------------------
   Draws one template page from tpl JSON (units: 1000 = page width, 1416 = height).
   mode: 'edit' (interactive, placeholders visible) | 'view' (print look) | 'thumb'
--------------------------------------------------------------------------- */
var PAGE_H = 1416;
var SVGNS = 'http://www.w3.org/2000/svg';
var FONT = { a: 'Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif', s: 'Georgia, "Times New Roman", "Liberation Serif", serif',
  /* pilihan font pembeli (24 Nov 2026): semuanya disajikan sendiri dari /public/imazine/fonts, juga di halaman PDF admin */
  m: '"Manrope", "Manrope Fallback", Arial, sans-serif', is: '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif', mono: '"DM Mono", Menlo, Consolas, monospace',
  bw: '"Bowlby One", "Arial Black", Impact, sans-serif', cv: '"Caveat Brush", "Marker Felt", "Segoe Print", cursive' };
var FONT_NAMES = [['a', 'Arial'], ['s', 'Georgia'], ['m', 'Manrope'], ['is', 'Instrument Serif'], ['mono', 'DM Mono'], ['bw', 'Bowlby One'], ['cv', 'Caveat Brush']];
/* Gaya teks (24 Nov 2026, "font, ukuran, warna, tebal..."): album.pages[pi].fmt['tx3'|'pa0'|'cp2'] menimpa gaya template.
   f = kunci FONT, s = ukuran (satuan halaman, 1000 = lebar), c = warna, b/i/u/up = tebal/miring/garis bawah/kapital, a = rata (paragraf). */
function textStyle(album, pi, kind, i) {
  var tpl = album.tpl, P = tpl.pages[pi], st = album.pages[pi], d;
  if (kind === 'tx') { var t = P.tx[i]; d = { f: t.f, s: t.z, c: t.c, b: !!t.b, i: !!t.i, u: false, up: !!t.up }; }
  else if (kind === 'pa') { var pa = P.pa[i]; d = { f: tpl.body, s: Math.min(pa.lh * 0.52, 46), c: '#2b2b2b', b: false, i: false, u: false, up: false, a: pa.a || 'l' }; }
  else { var cp = P.cp[i]; d = { f: cp.f, s: cp.z, c: cp.c, b: false, i: false, u: false, up: false }; }
  var o = st.fmt && st.fmt[kind + i];
  if (o) Object.keys(o).forEach(function (k) { if (o[k] != null) d[k] = o[k]; });
  if (!FONT[d.f]) d.f = 'a';
  d.s = +d.s;
  return d;
}
function styleCss(S) {
  return 'font-family:' + FONT[S.f] + ';font-size:' + (S.s / 10).toFixed(3) + 'cqw;color:' + S.c + ';font-weight:' + (S.b ? 700 : 400) + ';font-style:' + (S.i ? 'italic' : 'normal') +
    (S.u ? ';text-decoration:underline;text-underline-offset:.14em;text-decoration-thickness:.06em' : '');
}

function h(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function pct(v, base) { return (v / base * 100).toFixed(3) + '%'; }

/* Placeholder wording follows the casing the template asked for. */
function tokenHint(tk) { return tk.hint ? t(tk.hint) : t(tk.up ? 'TEXT' : 'text'); }

/* Keterangan foto hanya berisi apa yang ditulis pembeli. Tanggal dari file foto TIDAK diisikan otomatis (review 18 Nov 2026):
   tanggal di file bisa saja tanggal unduh, edit, atau pindah, bukan tanggal foto diambil. Pembeli bisa memakainya lewat tombol. */
var CAP_HINT = 'Write a date here';   /* placeholder; t(CAP_HINT) where it is shown */
function captionValue(album, pi, ci) {
  var v = album.pages[pi].cp[ci];
  return v != null ? v : '';
}

/* Teks yang digeser pembeli (24 Nov 2026): album.pages[pi].mv['tx3'|'pa0'|'cp2'] = [dx, dy] dalam satuan halaman (1000 x 1416). */
function textMove(st, key) { var m = st.mv && st.mv[key]; return m ? [+m[0] || 0, +m[1] || 0] : [0, 0]; }

/* Bingkai foto yang di-resize pembeli (24 Nov 2026): slots[k].g = [x, y, w, h] dalam satuan halaman; rotasi tetap dari template. */
function slotGeo(album, pi, k) {
  var g = album.tpl.pages[pi].ph[k], b = album.pages[pi].slots[k] && album.pages[pi].slots[k].g;
  return b ? [+b[0], +b[1], +b[2], +b[3], g[4] || 0] : g;
}

function imgBox(photo, slotW, slotH, s) {
  var ai = photo.w / photo.h, as = slotW / slotH, W, H;
  if (ai > as) { H = 100 * s.z; W = ai / as * 100 * s.z; }
  else { W = 100 * s.z; H = as / ai * 100 * s.z; }
  return { W: W, H: H, L: -(W - 100) * s.fx, T: -(H - 100) * s.fy };
}
function placeImg(img, photo, slotW, slotH, s) {
  var b = imgBox(photo, slotW, slotH, s);
  img.style.width = b.W.toFixed(3) + '%';
  img.style.height = b.H.toFixed(3) + '%';
  img.style.left = b.L.toFixed(3) + '%';
  img.style.top = b.T.toFixed(3) + '%';
}

function renderPage(album, pi, mode) {
  var tpl = album.tpl, P = tpl.pages[pi], st = album.pages[pi];
  var edit = mode === 'edit', thumb = mode === 'thumb';
  var pg = h('div', 'pg pg-' + mode);
  pg.style.background = P.bg;
  pg.dataset.p = pi;
  pg.dataset.tnum = '';
  var bodyFont = FONT[tpl.body];
  /* Urutan tumpukan (24 Nov 2026, "bisa ditumpuk kayak Canva"): tiap elemen mendapat z-index sesuai urutan gambarnya,
     kecuali yang diatur pembeli di album.pages[pi].z['s0'|'tx3'|'pa0'|'cp2'] (Ke depan / Ke belakang). */
  var zc = 0;
  function put(el, key) { zc++; var v = key && st.z ? st.z[key] : null; el.style.zIndex = v != null ? +v : zc; pg.appendChild(el); }

  P.ly.forEach(function (layer) {
    if (typeof layer === 'number') {
      var k = layer, g = slotGeo(album, pi, k), s = st.slots[k];
      var photo = s.photo != null ? album.photos[s.photo] : null;
      var d = h(edit ? 'button' : 'div', 'slot' + (photo ? '' : ' is-empty'));
      if (edit) { d.type = 'button'; d.dataset.s = k; }
      d.style.cssText = 'left:' + pct(g[0], 1000) + ';top:' + pct(g[1], PAGE_H) + ';width:' + pct(g[2], 1000) + ';height:' + pct(g[3], PAGE_H) + (g[4] ? ';transform:rotate(' + g[4] + 'deg)' : '');
      if (!photo) d.style.backgroundColor = tpl.slot;
      if (photo) {
        var im = new Image();
        im.alt = '';
        im.draggable = false;
        im.decoding = 'async';
        im.src = thumb ? photo.thumb : photo.url;
        placeImg(im, photo, g[2], g[3], s);
        d.appendChild(im);
      } else if (!thumb) {
        var lb = h('span', 'slot-lb');
        lb.appendChild(h('span', 'slot-plus', '+'));
        lb.appendChild(h('span', null, t('Photo {n}', { n: k + 1 })));
        d.appendChild(lb);
      }
      if (edit) d.setAttribute('aria-label', t(photo ? 'Photo {n}, filled. Pick to adjust' : 'Photo {n}, empty. Pick to fill', { n: k + 1 }));
      put(d, 's' + k);
    } else {
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('viewBox', '0 0 1000 ' + PAGE_H);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('class', 'pg-l');
      svg.setAttribute('aria-hidden', 'true');
      layer.forEach(function (sh) {
        if (sh.t != null && mode === 'view' && !st.tx[sh.t]) return;   /* a badge without its text is not printed */
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', sh.d);
        p.setAttribute('fill', sh.f || 'none');
        if (sh.fo != null) p.setAttribute('fill-opacity', sh.fo);
        if (sh.s) {
          p.setAttribute('stroke', sh.s);
          p.setAttribute('stroke-width', sh.sw);
          if (sh.sd) p.setAttribute('stroke-dasharray', sh.sd);
          if (sh.cap) { p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); }
        }
        svg.appendChild(p);
      });
      put(svg, null);
    }
  });
  if (thumb) {
    P.pa.forEach(function (pa, pi2) {
      if (pa.rule) return;
      pa.bars.forEach(function (b) {
        var bar = h('span', 'cp-bar');
        bar.style.cssText = 'left:' + pct(b[0], 1000) + ';top:' + pct(b[1], PAGE_H) + ';width:' + pct(b[2], 1000) + ';height:' + pct(pa.bh, PAGE_H) + ';background:' + pa.c;
        put(bar, 'pa' + pi2);
      });
    });
    return pg;
  }

  /* paragraphs: placeholder bars until the user writes something */
  P.pa.forEach(function (pa, i) {
    var val = st.pa[i] || '';
    if (!edit && !val && !pa.rule) return;
    var box = h('div', 'pa' + (val ? '' : ' is-empty') + (pa.rule ? ' pa-ruled' : ''));
    if (edit) box.dataset.pa = i;
    var boxH = pa.n * pa.lh, mp = textMove(st, 'pa' + i);
    box.style.cssText = 'left:' + pct(pa.x + mp[0], 1000) + ';top:' + pct(pa.y + mp[1], PAGE_H) + ';width:' + pct(pa.w, 1000) + ';height:' + pct(boxH, PAGE_H);
    if (pa.rule) {
      for (var r = 0; r < pa.n; r++) {
        var ln = h('span', 'pa-rule');
        ln.style.cssText = 'top:' + pct((r + 1) * pa.lh, boxH) + ';border-top:' + Math.max(pa.rule.w / 10, 0.12).toFixed(2) + 'cqw solid ' + pa.rule.c;
        box.appendChild(ln);
      }
    } else if (!val && edit) {
      pa.bars.forEach(function (b) {
        var bar = h('span', 'pa-bar');
        bar.style.cssText = 'left:' + pct(b[0] - pa.x, pa.w) + ';top:' + pct(b[1] - pa.y, boxH) + ';width:' + pct(b[2], pa.w) + ';height:' + pct(pa.bh, boxH) + ';background:' + pa.c;
        box.appendChild(bar);
      });
    }
    if (val || edit) {   /* in edit mode an empty paragraph still gets its text node, so it can be typed into on the page */
      var t = h('span', 'pa-t', val);
      var fs = Math.min(pa.lh * 0.52, 46), SP = textStyle(album, pi, 'pa', i);
      t.style.cssText = styleCss(SP) + ';line-height:' + (pa.lh / fs).toFixed(3) + ';text-align:' + (SP.a === 'r' ? 'right' : SP.a === 'c' ? 'center' : 'left') + ';text-transform:' + (SP.up ? 'uppercase' : 'none') + (pa.rule ? ';padding-top:' + pct(pa.lh * 0.16, pa.w) : '');
      box.appendChild(t);
    }
    put(box, 'pa' + i);
  });

  /* captions beside photo numbers: written by the buyer (a date or a short note); empty ones show a hint while editing */
  P.cp.forEach(function (cp, i) {
    var val = captionValue(album, pi, i);
    var hasPhoto = cp.p != null && st.slots[cp.p] && st.slots[cp.p].photo != null, mc = textMove(st, 'cp' + i);
    if (cp.bar && !val && edit) {
      var bar = h('span', 'cp-bar');
      bar.style.cssText = 'left:' + pct(cp.bar[0] + mc[0], 1000) + ';top:' + pct(cp.bar[1] + mc[1], PAGE_H) + ';width:' + pct(cp.bar[2], 1000) + ';height:' + pct(cp.bar[3], PAGE_H) + ';background:' + cp.bar[4];
      put(bar, 'cp' + i);
    }
    var hint = !val && edit && (cp.bar || hasPhoto);
    if (!val && !hint) return;
    var c = h('div', 'tx cp' + (val ? '' : ' is-empty') + (cp.a === 'r' ? ' tx-r' : ''));
    c.appendChild(h('span', 'tx-v', val || t(CAP_HINT)));
    if (edit) c.dataset.cp = i;
    var SC = textStyle(album, pi, 'cp', i);
    c.style.cssText = 'left:' + pct(cp.x + mc[0], 1000) + ';top:' + pct(cp.y - 0.847 * SC.s + mc[1], PAGE_H) + ';' + styleCss(SC) + ';text-transform:' + (SC.up ? 'uppercase' : 'none') + (val || !cp.bar ? '' : ';width:' + pct(cp.bar[2], 1000));   /* tanpa max-width: caption panjang tidak terpotong */
    put(c, 'cp' + i);
  });

  /* template texts */
  P.tx.forEach(function (t, i) {
    var val = st.tx[i];
    var isToken = t.k === 'e';
    var shown = val != null ? val : (isToken ? '' : t.t);
    if (!edit && !shown && !(isToken && t.post && !t.pre)) return;
    if (!edit && !shown && !t.post) return;
    var ST = textStyle(album, pi, 'tx', i);
    var e = h('div', 'tx' + (t.a === 'c' ? ' tx-c' : t.a === 'r' ? ' tx-r' : '') + (t.sp ? ' tx-sp' : '') + (ST.up ? ' tx-up' : '') + (shown ? '' : ' is-empty'));
    if (edit) e.dataset.tx = i;
    var mt = textMove(st, 'tx' + i);
    var css = 'left:' + pct(t.x + mt[0], 1000) + ';top:' + pct(t.y - 0.847 * ST.s + mt[1], PAGE_H) + ';' + styleCss(ST);
    if (t.r) css += ';transform:rotate(' + t.r + 'deg)';
    e.style.cssText = css;
    if (t.pre && (shown || edit)) e.appendChild(h('span', 'tx-fix', t.pre));
    e.appendChild(h('span', 'tx-v', shown || (edit ? tokenHint(t) : '')));
    if (t.post) e.appendChild(h('span', 'tx-fix', t.post));
    put(e, 'tx' + i);
  });
  return pg;
}

/* ---------- sampul belakang dan punggung (template tetap, file "Imazine_template-belakang-punggung_punggung-5mm") ----------
   Bentuk statis (END, garis, logo punggung) diambil sebagai vektor langsung dari PDF template supaya sama persis;
   baris judul dan alamat ditulis dengan Manrope 500 supaya bulan dan tahunnya mengikuti tanggal album.
   Ukuran dalam milimeter template (sampul A4 210 x 297, punggung 5 mm), diskalakan lewat container units. */
var BACK_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"8.50 9.30 595.27 841.89\"><g fill=\"#111\"><path transform=\"translate(250.86 459.89)\" d=\"M 25.40 -117.76 L 13.85 -117.76 L 13.85 -69.26 L 23.09 -69.26 L 23.09 -62.34 L 13.85 -62.34 L 13.85 -6.92 L 25.40 -6.92 L 25.40 0 L 4.62 0 L 4.62 -124.68 L 25.40 -124.68 Z M 25.40 -117.76 \"/><path transform=\"translate(250.86 459.89)\" d=\"M 25.40 -116.14 L 13.85 -116.14 L 13.85 -117.76 L 15.48 -117.76 L 15.48 -69.27 L 13.85 -69.27 L 13.85 -70.89 L 23.08 -70.89 C 23.30 -70.89 23.51 -70.85 23.71 -70.77 C 23.91 -70.69 24.08 -70.57 24.24 -70.42 C 24.39 -70.26 24.51 -70.09 24.59 -69.89 C 24.67 -69.69 24.71 -69.48 24.71 -69.27 L 24.71 -62.34 C 24.71 -62.13 24.67 -61.92 24.59 -61.72 C 24.51 -61.52 24.39 -61.35 24.24 -61.19 C 24.08 -61.04 23.91 -60.92 23.71 -60.84 C 23.51 -60.76 23.30 -60.72 23.08 -60.72 L 13.85 -60.72 L 13.85 -62.34 L 15.48 -62.34 L 15.48 -6.92 L 13.85 -6.92 L 13.85 -8.55 L 25.40 -8.55 C 25.61 -8.55 25.82 -8.51 26.02 -8.42 C 26.22 -8.34 26.39 -8.23 26.55 -8.07 C 26.70 -7.92 26.82 -7.75 26.90 -7.55 C 26.98 -7.35 27.02 -7.14 27.02 -6.92 L 27.02 0 C 27.02 0.21 26.98 0.42 26.90 0.62 C 26.82 0.82 26.70 0.99 26.55 1.14 C 26.39 1.30 26.22 1.41 26.02 1.5 C 25.82 1.58 25.61 1.62 25.40 1.62 L 4.61 1.62 C 4.40 1.62 4.19 1.58 3.99 1.5 C 3.79 1.41 3.62 1.30 3.46 1.14 C 3.31 0.99 3.19 0.82 3.11 0.62 C 3.03 0.42 2.99 0.21 2.99 0 L 2.99 -124.69 C 2.99 -124.91 3.03 -125.11 3.11 -125.31 C 3.19 -125.51 3.31 -125.69 3.46 -125.84 C 3.62 -125.99 3.79 -126.11 3.99 -126.19 C 4.19 -126.27 4.40 -126.32 4.61 -126.32 L 25.40 -126.32 C 25.61 -126.32 25.82 -126.27 26.02 -126.19 C 26.22 -126.11 26.39 -125.99 26.55 -125.84 C 26.70 -125.69 26.82 -125.51 26.90 -125.31 C 26.98 -125.11 27.02 -124.91 27.02 -124.69 L 27.02 -117.76 C 27.02 -117.55 26.98 -117.34 26.90 -117.14 C 26.82 -116.94 26.70 -116.76 26.55 -116.61 C 26.39 -116.46 26.22 -116.34 26.02 -116.26 C 25.82 -116.18 25.61 -116.14 25.40 -116.14 Z M 25.40 -119.39 L 25.40 -117.76 L 23.77 -117.76 L 23.77 -124.69 L 25.40 -124.69 L 25.40 -123.07 L 4.61 -123.07 L 4.61 -124.69 L 6.24 -124.69 L 6.24 0 L 4.61 0 L 4.61 -1.62 L 25.40 -1.62 L 25.40 0 L 23.77 0 L 23.77 -6.92 L 25.40 -6.92 L 25.40 -5.30 L 13.85 -5.30 C 13.64 -5.30 13.43 -5.34 13.23 -5.42 C 13.03 -5.50 12.85 -5.62 12.70 -5.77 C 12.55 -5.92 12.43 -6.10 12.35 -6.30 C 12.26 -6.50 12.23 -6.71 12.23 -6.92 L 12.23 -62.34 C 12.23 -62.56 12.26 -62.76 12.35 -62.96 C 12.43 -63.16 12.55 -63.34 12.70 -63.49 C 12.85 -63.64 13.03 -63.76 13.23 -63.84 C 13.43 -63.92 13.64 -63.97 13.85 -63.97 L 23.08 -63.97 L 23.08 -62.34 L 21.46 -62.34 L 21.46 -69.27 L 23.08 -69.27 L 23.08 -67.64 L 13.85 -67.64 C 13.64 -67.64 13.43 -67.69 13.23 -67.77 C 13.03 -67.85 12.85 -67.97 12.70 -68.12 C 12.55 -68.27 12.43 -68.45 12.35 -68.65 C 12.26 -68.85 12.23 -69.05 12.23 -69.27 L 12.23 -117.76 C 12.23 -117.98 12.26 -118.18 12.35 -118.38 C 12.43 -118.58 12.55 -118.76 12.70 -118.91 C 12.85 -119.06 13.03 -119.18 13.23 -119.26 C 13.43 -119.35 13.64 -119.39 13.85 -119.39 Z M 25.40 -119.39 \"/><path transform=\"translate(282.97 459.89)\" d=\"M 32.32 0 L 23.09 0 L 11.54 -92.35 L 11.54 0 L 4.62 0 L 4.62 -124.68 L 13.85 -124.68 L 25.40 -32.32 L 25.40 -124.68 L 32.32 -124.68 Z M 32.32 0 \"/><path transform=\"translate(282.97 459.89)\" d=\"M 32.32 1.62 L 23.08 1.62 C 22.67 1.62 22.32 1.48 22.01 1.21 C 21.70 0.94 21.53 0.60 21.48 0.20 L 9.93 -92.16 L 11.54 -92.36 L 13.17 -92.36 L 13.17 0 C 13.17 0.21 13.12 0.42 13.04 0.62 C 12.96 0.82 12.84 0.99 12.69 1.14 C 12.54 1.30 12.36 1.41 12.16 1.5 C 11.96 1.58 11.76 1.62 11.54 1.62 L 4.61 1.62 C 4.40 1.62 4.19 1.58 3.99 1.5 C 3.79 1.41 3.62 1.30 3.46 1.14 C 3.31 0.99 3.19 0.82 3.11 0.62 C 3.03 0.42 2.99 0.21 2.99 0 L 2.99 -124.69 C 2.99 -124.91 3.03 -125.11 3.11 -125.31 C 3.19 -125.51 3.31 -125.69 3.46 -125.84 C 3.62 -125.99 3.79 -126.11 3.99 -126.19 C 4.19 -126.27 4.40 -126.32 4.61 -126.32 L 13.85 -126.32 C 14.26 -126.32 14.62 -126.18 14.92 -125.91 C 15.23 -125.64 15.41 -125.30 15.46 -124.89 L 27.01 -32.53 L 25.40 -32.32 L 23.77 -32.32 L 23.77 -124.69 C 23.77 -124.91 23.81 -125.11 23.89 -125.31 C 23.98 -125.51 24.09 -125.69 24.25 -125.84 C 24.40 -125.99 24.57 -126.11 24.77 -126.19 C 24.97 -126.27 25.18 -126.32 25.40 -126.32 L 32.32 -126.32 C 32.54 -126.32 32.75 -126.27 32.94 -126.19 C 33.14 -126.11 33.32 -125.99 33.47 -125.84 C 33.62 -125.69 33.74 -125.51 33.82 -125.31 C 33.91 -125.11 33.95 -124.91 33.95 -124.69 L 33.95 0 C 33.95 0.21 33.91 0.42 33.82 0.62 C 33.74 0.82 33.62 0.99 33.47 1.14 C 33.32 1.30 33.14 1.41 32.94 1.5 C 32.75 1.58 32.54 1.62 32.32 1.62 Z M 32.32 -1.62 L 32.32 0 L 30.70 0 L 30.70 -124.69 L 32.32 -124.69 L 32.32 -123.07 L 25.40 -123.07 L 25.40 -124.69 L 27.02 -124.69 L 27.02 -32.32 C 27.02 -31.91 26.89 -31.55 26.61 -31.25 C 26.34 -30.94 26.00 -30.76 25.60 -30.71 C 25.38 -30.68 25.17 -30.70 24.96 -30.76 C 24.76 -30.81 24.57 -30.91 24.40 -31.04 C 24.23 -31.17 24.09 -31.33 23.98 -31.52 C 23.88 -31.71 23.81 -31.91 23.78 -32.12 L 12.24 -124.49 L 13.85 -124.69 L 13.85 -123.07 L 4.61 -123.07 L 4.61 -124.69 L 6.24 -124.69 L 6.24 0 L 4.61 0 L 4.61 -1.62 L 11.54 -1.62 L 11.54 0 L 9.92 0 L 9.92 -92.36 C 9.92 -92.77 10.05 -93.13 10.32 -93.44 C 10.59 -93.75 10.93 -93.92 11.34 -93.97 C 11.55 -94.00 11.76 -93.98 11.97 -93.93 C 12.18 -93.87 12.37 -93.78 12.54 -93.64 C 12.71 -93.51 12.85 -93.35 12.95 -93.16 C 13.06 -92.98 13.13 -92.78 13.16 -92.56 L 24.70 -0.20 L 23.08 0 L 23.08 -1.62 Z M 32.32 -1.62 \"/><path transform=\"translate(324.32 459.89)\" d=\"M 23.09 -113.14 C 23.09 -114.29 22.93 -115.18 22.62 -115.81 C 22.31 -116.43 21.78 -116.89 21.06 -117.18 C 20.34 -117.47 19.39 -117.64 18.21 -117.68 C 17.03 -117.73 15.58 -117.76 13.85 -117.76 L 13.85 -6.92 C 15.58 -6.92 17.03 -6.94 18.21 -7 C 19.39 -7.05 20.34 -7.21 21.06 -7.5 C 21.78 -7.78 22.31 -8.25 22.62 -8.87 C 22.93 -9.5 23.09 -10.39 23.09 -11.54 Z M 32.32 -11.54 C 32.32 -8.66 31.79 -6.43 30.73 -4.87 C 29.67 -3.31 28.28 -2.16 26.54 -1.43 C 24.81 -0.71 22.84 -0.29 20.62 -0.17 C 18.41 -0.05 16.16 0 13.85 0 L 4.62 0 L 4.62 -124.68 L 13.85 -124.68 C 16.16 -124.68 18.41 -124.62 20.62 -124.5 C 22.84 -124.38 24.81 -123.96 26.54 -123.25 C 28.28 -122.53 29.67 -121.38 30.73 -119.81 C 31.79 -118.25 32.32 -116.02 32.32 -113.14 Z M 32.32 -11.54 \"/><path transform=\"translate(324.32 459.89)\" d=\"M 21.46 -113.14 C 21.46 -114.04 21.36 -114.69 21.16 -115.08 C 21.03 -115.34 20.80 -115.54 20.46 -115.67 C 19.91 -115.89 19.14 -116.03 18.15 -116.07 C 16.99 -116.11 15.56 -116.14 13.85 -116.14 L 13.85 -117.76 L 15.48 -117.76 L 15.48 -6.92 L 13.85 -6.92 L 13.85 -8.55 C 15.56 -8.55 16.99 -8.57 18.15 -8.62 C 19.14 -8.66 19.91 -8.79 20.46 -9.01 C 20.80 -9.14 21.03 -9.34 21.16 -9.60 C 21.36 -10 21.46 -10.64 21.46 -11.54 Z M 24.71 -113.14 L 24.71 -11.54 C 24.71 -10.13 24.50 -9.00 24.07 -8.14 C 23.57 -7.15 22.77 -6.43 21.67 -5.99 C 20.78 -5.63 19.65 -5.42 18.28 -5.37 C 17.08 -5.32 15.60 -5.30 13.85 -5.30 C 13.64 -5.30 13.43 -5.34 13.23 -5.42 C 13.03 -5.50 12.85 -5.62 12.70 -5.77 C 12.55 -5.92 12.43 -6.10 12.35 -6.30 C 12.26 -6.50 12.23 -6.71 12.23 -6.92 L 12.23 -117.76 C 12.23 -117.98 12.26 -118.18 12.35 -118.38 C 12.43 -118.58 12.55 -118.76 12.70 -118.91 C 12.85 -119.06 13.03 -119.18 13.23 -119.26 C 13.43 -119.35 13.64 -119.39 13.85 -119.39 C 15.60 -119.39 17.08 -119.36 18.28 -119.31 C 19.65 -119.26 20.78 -119.05 21.67 -118.69 C 22.77 -118.25 23.57 -117.53 24.07 -116.54 C 24.50 -115.69 24.71 -114.55 24.71 -113.14 Z M 33.95 -11.54 C 33.95 -8.32 33.33 -5.79 32.08 -3.96 C 30.84 -2.12 29.21 -0.78 27.17 0.05 C 25.27 0.85 23.12 1.31 20.72 1.44 C 18.48 1.56 16.19 1.62 13.85 1.62 L 4.61 1.62 C 4.40 1.62 4.19 1.58 3.99 1.5 C 3.79 1.41 3.62 1.30 3.46 1.14 C 3.31 0.99 3.19 0.82 3.11 0.62 C 3.03 0.42 2.99 0.21 2.99 0 L 2.99 -124.69 C 2.99 -124.91 3.03 -125.11 3.11 -125.31 C 3.19 -125.51 3.31 -125.69 3.46 -125.84 C 3.62 -125.99 3.79 -126.11 3.99 -126.19 C 4.19 -126.27 4.40 -126.32 4.61 -126.32 L 13.85 -126.32 C 16.19 -126.32 18.48 -126.25 20.72 -126.13 C 23.12 -126.00 25.27 -125.54 27.17 -124.75 C 29.21 -123.90 30.84 -122.56 32.08 -120.73 C 33.33 -118.89 33.95 -116.36 33.95 -113.14 Z M 30.70 -11.54 L 30.70 -113.14 C 30.70 -115.70 30.26 -117.62 29.39 -118.91 C 28.51 -120.20 27.36 -121.15 25.92 -121.75 C 24.37 -122.39 22.57 -122.78 20.55 -122.89 C 18.36 -123.00 16.13 -123.07 13.85 -123.07 L 4.61 -123.07 L 4.61 -124.69 L 6.24 -124.69 L 6.24 0 L 4.61 0 L 4.61 -1.62 L 13.85 -1.62 C 16.13 -1.62 18.36 -1.68 20.55 -1.80 C 22.57 -1.91 24.37 -2.29 25.92 -2.94 C 27.36 -3.53 28.51 -4.48 29.39 -5.78 C 30.26 -7.07 30.70 -8.99 30.70 -11.54 Z M 30.70 -11.54 \"/></g><path fill=\"none\" stroke-width=\"0.22\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke=\"rgb(54.89%, 54.89%, 54.89%)\" stroke-opacity=\"1\" stroke-miterlimit=\"4\" d=\"M 51.49 170.49 L 164.49 170.49 \" transform=\"matrix(2.83, 0, 0, 2.83, 0.00, 0.79)\"/></svg>";
var SPINE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"603.78 9.29 14.17 841.89\"><g fill=\"#111\"><path fill-rule=\"nonzero\" d=\"M 606.5 66.74 C 606.5 66.48 606.55 66.29 606.67 66.16 C 606.78 66.03 606.94 65.97 607.13 65.97 C 607.18 65.97 607.23 65.98 607.28 65.98 C 607.34 65.99 607.39 66.00 607.45 66.01 L 611.17 67.09 L 611.17 66.30 L 611.21 66.30 L 611.21 67.87 L 606.93 66.67 C 606.90 66.66 606.87 66.66 606.84 66.66 C 606.82 66.65 606.79 66.65 606.77 66.65 C 606.71 66.65 606.66 66.67 606.62 66.69 C 606.58 66.72 606.56 66.77 606.56 66.85 C 606.56 67.04 606.61 67.22 606.71 67.37 C 606.82 67.53 606.99 67.68 607.22 67.82 C 607.46 67.96 607.76 68.10 608.14 68.24 L 608.13 68.27 C 607.75 68.13 607.43 67.99 607.19 67.84 C 606.95 67.70 606.78 67.54 606.66 67.37 C 606.55 67.19 606.5 66.99 606.5 66.74 Z M 606.5 66.74 \"/><path fill-rule=\"nonzero\" d=\"M 613.75 68.93 C 613.47 68.93 613.25 68.71 613.25 68.43 C 613.25 68.16 613.47 67.94 613.75 67.94 C 614.01 67.94 614.24 68.16 614.24 68.43 C 614.24 68.71 614.01 68.93 613.75 68.93 Z M 613.75 68.93 \"/><path fill-rule=\"nonzero\" d=\"M 606.5 74.87 C 606.5 74.60 606.55 74.41 606.67 74.30 C 606.79 74.19 606.95 74.13 607.14 74.13 C 607.21 74.13 607.28 74.14 607.35 74.16 C 607.41 74.17 607.47 74.18 607.52 74.19 L 609.68 74.83 C 610.16 74.97 610.54 75.04 610.81 75.05 C 611.08 75.05 611.22 74.97 611.22 74.79 C 611.22 74.55 611.12 74.32 610.93 74.09 C 610.73 73.87 610.48 73.66 610.15 73.47 C 609.83 73.28 609.48 73.10 609.09 72.95 C 608.70 72.80 608.32 72.68 607.93 72.58 L 607.93 72.55 C 608.31 72.65 608.70 72.77 609.09 72.92 C 609.49 73.07 609.85 73.25 610.19 73.44 C 610.52 73.64 610.79 73.86 611 74.10 C 611.20 74.34 611.30 74.59 611.30 74.86 C 611.30 75.16 611.23 75.38 611.09 75.52 C 610.96 75.66 610.77 75.74 610.55 75.76 C 610.32 75.77 610.07 75.74 609.80 75.66 L 606.94 74.84 C 606.91 74.83 606.87 74.82 606.84 74.82 C 606.80 74.81 606.77 74.81 606.73 74.81 C 606.68 74.81 606.64 74.82 606.60 74.86 C 606.58 74.89 606.56 74.94 606.56 75.01 C 606.56 75.19 606.61 75.36 606.72 75.52 C 606.82 75.68 606.99 75.83 607.22 75.97 C 607.45 76.12 607.76 76.26 608.14 76.40 L 608.13 76.42 C 607.75 76.28 607.43 76.14 607.19 75.99 C 606.95 75.85 606.78 75.69 606.66 75.51 C 606.55 75.33 606.5 75.12 606.5 74.87 Z M 606.60 68.80 L 611.17 69.90 L 611.17 69.21 L 611.21 69.21 L 611.21 70.71 L 606.60 69.60 Z M 606.60 71.46 L 609.68 72.21 C 610.17 72.33 610.55 72.40 610.82 72.42 C 611.09 72.43 611.22 72.35 611.22 72.17 C 611.22 71.93 611.12 71.69 610.93 71.47 C 610.73 71.24 610.48 71.03 610.15 70.83 C 609.83 70.63 609.48 70.46 609.09 70.30 C 608.70 70.14 608.32 70.02 607.93 69.92 L 607.93 69.90 C 608.31 70 608.70 70.12 609.09 70.27 C 609.49 70.42 609.85 70.60 610.19 70.81 C 610.52 71.01 610.79 71.24 611 71.48 C 611.20 71.73 611.30 72.00 611.30 72.28 C 611.30 72.56 611.23 72.76 611.09 72.89 C 610.96 73.02 610.77 73.10 610.55 73.12 C 610.32 73.14 610.07 73.11 609.80 73.04 L 606.60 72.26 Z M 606.60 71.46 \"/><path fill-rule=\"nonzero\" d=\"M 606.5 78.08 C 606.5 77.64 606.64 77.32 606.92 77.11 C 607.21 76.91 607.61 76.81 608.12 76.81 C 608.51 76.81 608.89 76.89 609.26 77.03 C 609.64 77.17 609.98 77.36 610.29 77.60 C 610.60 77.83 610.84 78.10 611.03 78.39 C 611.21 78.67 611.31 78.96 611.31 79.25 C 611.31 79.50 611.24 79.68 611.09 79.80 C 610.95 79.92 610.77 80 610.55 80.03 C 610.33 80.07 610.09 80.08 609.84 80.08 C 609.62 80.08 609.39 80.07 609.14 80.02 C 608.89 79.98 608.64 79.92 608.39 79.84 C 608.14 79.76 607.90 79.66 607.67 79.54 C 607.44 79.42 607.25 79.29 607.07 79.14 C 606.89 78.99 606.75 78.83 606.65 78.65 C 606.55 78.48 606.5 78.28 606.5 78.08 Z M 606.60 78.26 C 606.60 78.46 606.67 78.65 606.81 78.83 C 606.95 79.00 607.13 79.17 607.36 79.32 C 607.59 79.47 607.85 79.60 608.14 79.71 C 608.42 79.82 608.71 79.90 609.00 79.96 C 609.30 80.02 609.58 80.05 609.84 80.05 C 610.10 80.05 610.34 80.03 610.55 79.99 C 610.76 79.96 610.93 79.89 611.05 79.78 C 611.17 79.68 611.24 79.54 611.24 79.35 C 611.24 79.18 611.16 79.01 611.01 78.84 C 610.85 78.67 610.65 78.51 610.39 78.36 C 610.14 78.21 609.86 78.07 609.55 77.95 C 609.25 77.83 608.94 77.74 608.63 77.67 C 608.32 77.61 608.03 77.57 607.77 77.57 C 607.37 77.57 607.08 77.64 606.89 77.76 C 606.70 77.89 606.60 78.05 606.60 78.26 Z M 606.5 80.26 C 606.5 80.03 606.56 79.85 606.69 79.75 C 606.82 79.64 606.98 79.58 607.18 79.58 C 607.23 79.58 607.28 79.58 607.33 79.58 C 607.37 79.59 607.41 79.59 607.45 79.60 L 608.10 79.72 L 608.85 79.95 L 609.66 80.08 L 611.21 80.45 L 611.21 81.30 L 606.92 80.16 C 606.87 80.15 606.82 80.14 606.76 80.14 C 606.70 80.14 606.65 80.16 606.61 80.19 C 606.58 80.22 606.56 80.27 606.56 80.35 C 606.56 80.53 606.61 80.71 606.72 80.86 C 606.82 81.02 607 81.17 607.23 81.31 C 607.46 81.45 607.76 81.59 608.14 81.73 L 608.13 81.76 C 607.75 81.62 607.43 81.47 607.19 81.33 C 606.95 81.18 606.78 81.02 606.66 80.85 C 606.55 80.68 606.5 80.48 606.5 80.26 Z M 606.5 80.26 \"/><path fill-rule=\"nonzero\" d=\"M 606.72 82.36 L 608.01 82.36 L 611.22 85.24 L 610.51 85.61 L 610.51 82.44 L 612.14 82.44 L 612.14 87.42 L 610.85 87.42 L 607.64 84.54 L 608.35 84.17 L 608.35 87.53 L 606.72 87.53 Z M 606.72 82.36 \"/><path fill-rule=\"nonzero\" d=\"M 612.14 88.27 L 612.14 90.51 L 606.72 90.51 L 606.72 88.27 Z M 612.14 88.27 \"/><path fill-rule=\"nonzero\" d=\"M 613.75 90.74 C 613.06 90.74 612.51 90.19 612.51 89.51 C 612.51 88.82 613.06 88.27 613.75 88.27 C 614.42 88.27 614.98 88.82 614.98 89.51 C 614.98 90.19 614.42 90.74 613.75 90.74 Z M 613.75 90.74 \"/><path fill-rule=\"nonzero\" d=\"M 606.72 91.85 L 612.14 91.85 L 612.14 93.98 L 610.55 93.98 L 611.01 93.55 C 611.42 93.76 611.73 94.05 611.93 94.41 C 612.14 94.77 612.24 95.17 612.24 95.61 C 612.24 96.03 612.16 96.41 611.99 96.74 C 611.82 97.08 611.56 97.35 611.20 97.54 C 610.84 97.74 610.38 97.83 609.81 97.83 L 606.72 97.83 L 606.72 95.59 L 609.42 95.59 C 609.76 95.59 610.00 95.53 610.14 95.41 C 610.29 95.30 610.36 95.14 610.36 94.93 C 610.36 94.78 610.32 94.64 610.25 94.51 C 610.18 94.38 610.07 94.28 609.91 94.20 C 609.75 94.12 609.54 94.08 609.27 94.08 L 606.72 94.08 Z M 606.72 91.85 \"/><path fill-rule=\"nonzero\" d=\"M 606.62 101.78 C 606.62 101.12 606.74 100.55 606.99 100.05 C 607.23 99.56 607.57 99.18 608 98.91 C 608.42 98.64 608.90 98.50 609.44 98.50 C 609.98 98.50 610.47 98.64 610.89 98.90 C 611.32 99.17 611.65 99.54 611.88 100.00 C 612.12 100.47 612.24 100.99 612.24 101.57 C 612.24 102.11 612.14 102.60 611.92 103.05 C 611.71 103.51 611.40 103.87 610.98 104.14 C 610.57 104.42 610.05 104.56 609.44 104.56 C 609.35 104.56 609.27 104.55 609.17 104.55 C 609.08 104.54 608.99 104.53 608.91 104.53 L 608.91 100.35 L 609.99 100.35 L 609.99 103.34 L 609.70 102.5 C 609.91 102.5 610.09 102.46 610.25 102.38 C 610.39 102.30 610.51 102.20 610.59 102.07 C 610.67 101.94 610.71 101.78 610.71 101.59 C 610.71 101.41 610.67 101.25 610.59 101.11 C 610.51 100.98 610.39 100.87 610.25 100.80 C 610.09 100.73 609.91 100.69 609.70 100.69 L 609.37 100.69 C 609.14 100.69 608.94 100.74 608.77 100.83 C 608.60 100.92 608.48 101.05 608.40 101.23 C 608.32 101.40 608.28 101.60 608.28 101.85 C 608.28 102.10 608.31 102.31 608.37 102.47 C 608.44 102.63 608.54 102.80 608.67 102.98 L 607.49 104.15 C 607.21 103.89 606.99 103.56 606.84 103.17 C 606.69 102.79 606.62 102.32 606.62 101.78 Z M 606.62 101.78 \"/></g></svg>";
var BACK_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function backLine(d) { d = d instanceof Date && !isNaN(d) ? d : new Date(); return d.getFullYear() + ' in Frames · ' + BACK_MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function backCover(d) {
  var el = document.createElement('div'); el.className = 'bk';
  el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Back cover');
  el.innerHTML = BACK_SVG;
  var a = document.createElement('p'); a.className = 'bk-t bk-t1'; a.textContent = backLine(d);
  var b = document.createElement('p'); b.className = 'bk-t bk-t2'; b.textContent = 'theinnovatorsstudio.id/imazine';
  el.appendChild(a); el.appendChild(b);
  return el;
}
function spineEl() {
  var el = document.createElement('div'); el.className = 'spn'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = SPINE_SVG;
  var c = document.createElement('p'); c.className = 'spn-cr'; c.textContent = 'Designed by The Innovators Studio x Vier Moments ©';
  el.appendChild(c);
  return el;
}
