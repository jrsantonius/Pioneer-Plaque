window.__uiAudit = function (opts) {
  opts = opts || {}; var MIN = opts.touch || 44, out = {}, add = function (k, m) { (out[k] = out[k] || []).push(m); };
  var vis = function (e) { var r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && !e.closest('[hidden],[aria-hidden="true"]'); };
  var name = function (e) { return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (e.textContent || '').trim().slice(0, 28) + '"'; };
  var tcache = {}, tnumOK = function (s) { var k = s.fontFamily + s.fontWeight; if (k in tcache) return tcache[k]; var sp = document.createElement('span'); sp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:100px;font-family:' + s.fontFamily + ';font-weight:' + s.fontWeight; document.body.appendChild(sp); sp.textContent = '1111111111'; var a = sp.getBoundingClientRect().width; sp.textContent = '0000000000'; var b = sp.getBoundingClientRect().width; sp.remove(); return (tcache[k] = Math.abs(a - b) < 2); };
  var rowsOf = function (e) { var r = document.createRange(), rows = []; r.selectNodeContents(e); [].forEach.call(r.getClientRects(), function (q) { if (q.width < 1) return; var row = rows.find(function (t) { return Math.abs(t.top - q.top) < q.height * .6; }); if (!row) rows.push({ top: q.top, l: q.left, r: q.right }); else { row.l = Math.min(row.l, q.left); row.r = Math.max(row.r, q.right); } }); return rows.sort(function (a, b) { return a.top - b.top; }); };
  [].filter.call(document.querySelectorAll('body *'), function (e) { return vis(e) && !e.closest('svg') && !(opts.skip && e.closest(opts.skip)) && [].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim().length > 1; }); }).forEach(function (e) {
    var s = getComputedStyle(e), fs = parseFloat(s.fontSize), ls = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) / fs, lh = s.lineHeight === 'normal' ? 1.2 : parseFloat(s.lineHeight) / fs, t = e.textContent.trim(), rows = rowsOf(e), n = rows.length;
    if (s.fontKerning === 'none') add('1 kerning', name(e) + ' font-kerning none');
    if (/\d/.test(t) && /^[\d\s.,:%+\-\/x]+$/.test(t) && (s.fontVariantNumeric.indexOf('tabular-nums') < 0 || !tnumOK(s)) && !e.closest('[data-tnum]')) add('3 tabular', name(e) + ' digits are not fixed width');
    if (fs < 14 && ls < -.001) add('5 tracking', name(e) + ' ' + fs + 'px tightened');
    if (fs >= 30 && ls > -.012) add('5 tracking', name(e) + ' ' + fs + 'px display text not tightened');
    if (s.textTransform === 'uppercase' && ls < .03) add('5 tracking', name(e) + ' uppercase without open tracking');
    if (fs < 12) add('7 x-height', name(e) + ' ' + fs + 'px is too small');
    var d = s.display; if (n < 2 || d.indexOf('inline') > -1 || d.indexOf('flex') > -1 || d.indexOf('grid') > -1) return;
    if (fs >= 26 && (lh < .98 || lh > 1.25)) add('9 leading', name(e) + ' ' + fs + 'px line-height ' + lh.toFixed(2));
    if (fs < 22 && (lh < 1.3 || lh > 1.7)) add('9 leading', name(e) + ' ' + fs + 'px line-height ' + lh.toFixed(2));
    var cpl = t.length / n; if (n >= 3 && cpl > 80) add('15 line length', name(e) + ' ~' + Math.round(cpl) + ' chars per line');
    if (n >= 4 && cpl < 22) add('15 line length', name(e) + ' ~' + Math.round(cpl) + ' chars per line, too narrow');
    var ws = rows.map(function (r) { return r.r - r.l; }), mx = Math.max.apply(null, ws);
    if (ws[n - 1] < mx * .25) add('12 widow', name(e) + ' last line is ' + Math.round(ws[n - 1] / mx * 100) + '% wide');
  });
  [].filter.call(document.querySelectorAll('button, a[href], [role="button"], [role="tab"], [role="checkbox"], [role="option"], [role="combobox"], input, select, summary'), vis).forEach(function (e) {
    if (e.disabled) return; var r = e.getBoundingClientRect();
    if (getComputedStyle(e).cursor !== 'pointer' && e.tagName !== 'INPUT' && e.tagName !== 'SELECT') add('16 affordance', name(e) + ' cursor is not pointer');
    if (r.width >= MIN && r.height >= MIN) return;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, h = MIN / 2 - 1, hit = function (x, y) { var el = document.elementFromPoint(x, y); return el && (el === e || e.contains(el)); };
    if (!((r.width >= MIN || (hit(cx - h, cy) && hit(cx + h, cy))) && (r.height >= MIN || (hit(cx, cy - h) && hit(cx, cy + h))))) add('8 touch target', name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  [].forEach.call(document.querySelectorAll('[role="listbox"]'), function (lb) { var c = lb.id && document.querySelector('[aria-controls="' + lb.id + '"]'); if (!c || c.getAttribute('aria-expanded') !== 'true' || !c.getAttribute('aria-haspopup')) add('17 combobox', 'listbox without a wired trigger (aria-controls, aria-expanded, aria-haspopup)'); if (!lb.querySelector('[role="option"][aria-selected]')) add('17 combobox', 'options without aria-selected'); });
  [].forEach.call(document.querySelectorAll('body *'), function (e) { var s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && vis(e)) { var r = e.getBoundingClientRect(); if (r.bottom >= innerHeight - 2 && r.height < innerHeight * .6 && r.width > innerWidth * .5 && !('safe' in e.dataset)) add('13 safe area', name(e) + ' sits on the bottom edge: confirm env(safe-area-inset-bottom), then mark it data-safe'); } });
  if (document.documentElement.scrollWidth > innerWidth + 1) add('4 layout shift', 'page scrolls sideways: ' + document.documentElement.scrollWidth + ' > ' + innerWidth);
  return out;
};
window.__cls = { v: 0, src: [] };
try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { __cls.v += e.value; (e.sources || []).forEach(function (s) { if (s.node && s.node.nodeType === 1) __cls.src.push(e.value.toFixed(4) + ' ' + s.node.tagName.toLowerCase() + '.' + (typeof s.node.className === 'string' ? s.node.className.split(' ')[0] : '')); }); }); }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
