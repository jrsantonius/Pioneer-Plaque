/* ---------- Page renderer -------------------------------------------------
   Draws one template page from tpl JSON (units: 1000 = page width, 1416 = height).
   mode: 'edit' (interactive, placeholders visible) | 'view' (print look) | 'thumb'
--------------------------------------------------------------------------- */
var PAGE_H = 1416;
var SVGNS = 'http://www.w3.org/2000/svg';
var FONT = { a: 'Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif', s: 'Georgia, "Times New Roman", "Liberation Serif", serif' };

function h(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function pct(v, base) { return (v / base * 100).toFixed(3) + '%'; }

/* Placeholder wording follows the casing the template asked for. */
function tokenHint(tk) { return t(tk.up ? 'TEXT' : 'text'); }

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
      pg.appendChild(d);
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
      pg.appendChild(svg);
    }
  });
  if (thumb) {
    P.pa.forEach(function (pa) {
      if (pa.rule) return;
      pa.bars.forEach(function (b) {
        var bar = h('span', 'cp-bar');
        bar.style.cssText = 'left:' + pct(b[0], 1000) + ';top:' + pct(b[1], PAGE_H) + ';width:' + pct(b[2], 1000) + ';height:' + pct(pa.bh, PAGE_H) + ';background:' + pa.c;
        pg.appendChild(bar);
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
      var fs = Math.min(pa.lh * 0.52, 46);
      t.style.cssText = 'font-family:' + bodyFont + ';font-size:' + (fs / 10).toFixed(3) + 'cqw;line-height:' + (pa.lh / fs).toFixed(3) + ';text-align:' + (pa.a === 'r' ? 'right' : pa.a === 'c' ? 'center' : 'left') + (pa.rule ? ';padding-top:' + pct(pa.lh * 0.16, pa.w) : '');
      box.appendChild(t);
    }
    pg.appendChild(box);
  });

  /* captions beside photo numbers: written by the buyer (a date or a short note); empty ones show a hint while editing */
  P.cp.forEach(function (cp, i) {
    var val = captionValue(album, pi, i);
    var hasPhoto = cp.p != null && st.slots[cp.p] && st.slots[cp.p].photo != null, mc = textMove(st, 'cp' + i);
    if (cp.bar && !val && edit) {
      var bar = h('span', 'cp-bar');
      bar.style.cssText = 'left:' + pct(cp.bar[0] + mc[0], 1000) + ';top:' + pct(cp.bar[1] + mc[1], PAGE_H) + ';width:' + pct(cp.bar[2], 1000) + ';height:' + pct(cp.bar[3], PAGE_H) + ';background:' + cp.bar[4];
      pg.appendChild(bar);
    }
    var hint = !val && edit && (cp.bar || hasPhoto);
    if (!val && !hint) return;
    var c = h('div', 'tx cp' + (val ? '' : ' is-empty') + (cp.a === 'r' ? ' tx-r' : ''));
    c.appendChild(h('span', 'tx-v', val || t(CAP_HINT)));
    if (edit) c.dataset.cp = i;
    c.style.cssText = 'left:' + pct(cp.x + mc[0], 1000) + ';top:' + pct(cp.y - 0.847 * cp.z + mc[1], PAGE_H) + ';font-size:' + (cp.z / 10).toFixed(3) + 'cqw;font-family:' + FONT[cp.f] + ';color:' + cp.c + (val || !cp.bar ? '' : ';width:' + pct(cp.bar[2], 1000));   /* tanpa max-width: caption panjang tidak terpotong */
    pg.appendChild(c);
  });

  /* template texts */
  P.tx.forEach(function (t, i) {
    var val = st.tx[i];
    var isToken = t.k === 'e';
    var shown = val != null ? val : (isToken ? '' : t.t);
    if (!edit && !shown && !(isToken && t.post && !t.pre)) return;
    if (!edit && !shown && !t.post) return;
    var e = h('div', 'tx' + (t.a === 'c' ? ' tx-c' : t.a === 'r' ? ' tx-r' : '') + (t.sp ? ' tx-sp' : '') + (t.up ? ' tx-up' : '') + (shown ? '' : ' is-empty'));
    if (edit) e.dataset.tx = i;
    var mt = textMove(st, 'tx' + i);
    var css = 'left:' + pct(t.x + mt[0], 1000) + ';top:' + pct(t.y - 0.847 * t.z + mt[1], PAGE_H) + ';font-size:' + (t.z / 10).toFixed(3) + 'cqw;font-family:' + FONT[t.f] + ';color:' + t.c;
    if (t.b) css += ';font-weight:700';
    if (t.i) css += ';font-style:italic';
    if (t.r) css += ';transform:rotate(' + t.r + 'deg)';
    e.style.cssText = css;
    if (t.pre && (shown || edit)) e.appendChild(h('span', 'tx-fix', t.pre));
    e.appendChild(h('span', 'tx-v', shown || (edit ? tokenHint(t) : '')));
    if (t.post) e.appendChild(h('span', 'tx-fix', t.post));
    pg.appendChild(e);
  });
  return pg;
}
