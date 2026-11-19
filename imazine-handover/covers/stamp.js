/* Imazine stamp covers: one frame for every cover, one small drawing language for the art.
   Cover artboard: 200 x 283 (A4 ratio). Art box: 100 x 100, mapped onto the colour field.
   Shapes, separated by ";":
     r x y w h [rx] col      rect            c cx cy r col          circle
     e cx cy rx ry col       ellipse         o cx cy r width col    ring
     g x,y x,y ... col       polygon         p <path> col           filled path
     s <path> width col      stroked path    l x1 y1 x2 y2 width col  line
     t x y size TEXT col     centred text    B cx cy r1 r2 n width col  burst of rays
     R n dx dy <shape>       repeat a shape n times, shifted by dx,dy
   Colours: a b c = palette, z = field colour, o = frame colour, w = paper white, k = ink.
   "a~w" = half-way between two colours, "a~w3" = 30% of the way, "b.4" = 40% opacity. */
var PAPER = '#fff6e4', INK = '#2b2118', CUR_SHADE = '#2b2118', GRAIN_URI = '';
var PAL = [
  { n: 'Senja',  out: '#e4883a', z: '#f6dcb8', a: '#e4883a', b: '#a5521f', c: '#3e787b' },
  { n: 'Laut',   out: '#3e787b', z: '#cfe6e0', a: '#3e787b', b: '#2b5658', c: '#e4883a' },
  { n: 'Tomat',  out: '#e25a3c', z: '#f7d2c4', a: '#e25a3c', b: '#9c3a22', c: '#f2b84b' },
  { n: 'Zaitun', out: '#8d9350', z: '#e7e4bf', a: '#8d9350', b: '#4f5527', c: '#e4883a' },
  { n: 'Lila',   out: '#7c71b4', z: '#ddd8ec', a: '#7c71b4', b: '#473f78', c: '#f2b84b' },
  { n: 'Langit', out: '#4f86b5', z: '#d2e2f0', a: '#4f86b5', b: '#2c5377', c: '#f2b84b' },
  { n: 'Malam',  out: '#f2b84b', z: '#26304f', a: '#f2b84b', b: '#e25a3c', c: '#6f8fc4', k: '#121830', dark: 1 },
  { n: 'Daun',   out: '#5f8f6b', z: '#d9e9d0', a: '#5f8f6b', b: '#2f5a3c', c: '#f2b84b' },
  { n: 'Mawar',  out: '#cf6f8a', z: '#f7d6dd', a: '#cf6f8a', b: '#8f3552', c: '#f2b84b' },
  { n: 'Kertas', out: '#c9853f', z: '#f7efd9', a: '#c9853f', b: '#6b4a2b', c: '#3e787b' },
  { n: 'Alpen',  out: '#2c5377', z: '#d6e6f2', a: '#e25a3c', b: '#2c5377', c: '#f2b84b' }
];
/* "a" one colour, "a~w" half-way to another, "a~w3" 30% of the way, "a.4" 40% opaque */
function stampColor(tok, pal) {
  var m = /^([a-z])(?:~([a-z])(\d)?)?(\.\d+)?$/.exec(tok) || ['', 'k'];
  var one = function (ch) { return ch === 'w' ? PAPER : ch === 'k' ? (pal.k || INK) : ch === 'o' ? pal.out : pal[ch] || INK; };
  var hex = one(m[1]); if (m[2]) hex = mixHex(hex, one(m[2]), (m[3] ? +m[3] : 5) / 10);
  return { hex: hex, op: m[4] ? parseFloat(m[4]) : 1 };
}
function fillAttr(tok, pal) { var c = stampColor(tok, pal); return ' fill="' + c.hex + '"' + (c.op < 1 ? ' fill-opacity="' + c.op + '"' : ''); }
function strokeAttr(tok, w, pal) { var c = stampColor(tok, pal); return ' fill="none" stroke="' + c.hex + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (c.op < 1 ? ' stroke-opacity="' + c.op + '"' : ''); }
function stampShape(t, pal, dx, dy) {
  var k = t[0], n = t.length, col = t[n - 1], mv = dx || dy ? ' transform="translate(' + dx + ' ' + dy + ')"' : '';
  if (k === 'r') return '<rect x="' + t[1] + '" y="' + t[2] + '" width="' + t[3] + '" height="' + t[4] + '"' + (n === 7 ? ' rx="' + t[5] + '"' : '') + fillAttr(col, pal) + mv + '/>';
  if (k === 'c') return '<circle cx="' + t[1] + '" cy="' + t[2] + '" r="' + t[3] + '"' + fillAttr(col, pal) + mv + '/>';
  if (k === 'e') return '<ellipse cx="' + t[1] + '" cy="' + t[2] + '" rx="' + t[3] + '" ry="' + t[4] + '"' + fillAttr(col, pal) + mv + '/>';
  if (k === 'o') return '<circle cx="' + t[1] + '" cy="' + t[2] + '" r="' + t[3] + '"' + strokeAttr(col, t[4], pal) + mv + '/>';
  if (k === 'g') return '<polygon points="' + t.slice(1, n - 1).join(' ') + '"' + fillAttr(col, pal) + mv + '/>';
  if (k === 'p') return '<path d="' + t.slice(1, n - 1).join(' ') + '"' + fillAttr(col, pal) + mv + '/>';
  if (k === 's') return '<path d="' + t.slice(1, n - 2).join(' ') + '"' + strokeAttr(col, t[n - 2], pal) + mv + '/>';
  if (k === 'l') return '<line x1="' + t[1] + '" y1="' + t[2] + '" x2="' + t[3] + '" y2="' + t[4] + '"' + strokeAttr(col, t[5], pal) + mv + '/>';
  if (k === 't') return '<text x="' + t[1] + '" y="' + t[2] + '" font-size="' + t[3] + '" text-anchor="middle" class="st-d"' + fillAttr(col, pal) + mv + '>' + t[4] + '</text>';
  if (k === 'B') {
    var out = '', cx = +t[1], cy = +t[2], r1 = +t[3], r2 = +t[4], cnt = +t[5];
    for (var i = 0; i < cnt; i++) { var a = i / cnt * Math.PI * 2 - Math.PI / 2; out += '<line x1="' + (cx + Math.cos(a) * r1).toFixed(1) + '" y1="' + (cy + Math.sin(a) * r1).toFixed(1) + '" x2="' + (cx + Math.cos(a) * r2).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r2).toFixed(1) + '"' + strokeAttr(col, t[6], pal) + mv + '/>'; }
    return out;
  }
  if (k === 'R') { var s = '', sub = t.slice(4); for (var j = 0; j < +t[1]; j++) s += stampShape(sub, pal, (dx || 0) + j * +t[2], (dy || 0) + j * +t[3]); return s; }
  if (typeof stampExtra === 'function') { var ex = stampExtra(t, pal, CUR_SHADE); return ex && mv ? '<g' + mv + '>' + ex + '</g>' : ex; }
  return '';
}
function stampArt(src, pal) {
  return src.split(';').map(function (s) { s = s.trim(); return s ? stampShape(s.split(/\s+/), pal, 0, 0) : ''; }).join('');
}
/* Text on a colour: paper white when it reads well enough, otherwise whichever of paper and ink contrasts more. */
function relLum(hex) { var n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function contrast(a, b) { var x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function textOn(bg, keep, ink) { var p = contrast(PAPER, bg), k = contrast(ink || INK, bg); return p >= keep || p >= k ? PAPER : (ink || INK); }
function lum(hex) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
/* Fit the name on one or two lines, as large as the field allows. */
function nameLines(name) {
  var up = name.toUpperCase(), W = 134, F = 0.84, one = Math.min(25, W / (F * up.length)), best = { lines: [up], size: one };
  var words = up.split(' ');
  for (var i = 1; i < words.length; i++) {
    var a = words.slice(0, i).join(' '), b = words.slice(i).join(' '), size = Math.min(21, W / (F * Math.max(a.length, b.length)));
    if (size > best.size * 1.22 && (best.lines.length === 1 || size > best.size)) best = { lines: [a, b], size: size };
  }
  return best;
}
/* One cover as an SVG string.
   Draft 1 item: { p, g, gy, a }. Draft 2 item: { p, g, m: solids, under, over, cam, sun, sky, gy } (see scene.js). */
function stampCover(name, sub, item) {
  var pal = PAL[item.p], SC = 1.54, top = 40, x0 = 23, gy = item.gy == null ? 86 : item.gy, three = null;
  CUR_SHADE = typeof SHADE !== 'undefined' ? SHADE[item.p] : INK;
  if (item.m) { three = renderScene(item, pal, CUR_SHADE); if (item.gy == null) gy = three.gy; }
  var sky = item.sky ? stampColor(item.sky, pal).hex : pal.z;
  var under = item.g ? stampColor(item.g, pal).hex : sky;
  var onTop = textOn(three && item.g && gy < 4 ? under : sky, 4.5), onBase = textOn(under, 3.5);
  var nl = nameLines(name), s = '', tr = '<g transform="translate(' + x0 + ' ' + top + ') scale(' + SC + ')">';
  s += '<svg class="cv" viewBox="0 0 200 283" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sampul ' + name + '">';
  s += '<rect width="200" height="283" fill="' + pal.out + '"/><rect x="13" y="13" width="174" height="257" fill="' + PAPER + '"/>';
  s += '<use href="#perf" fill="' + pal.out + '"/>';
  s += '<g clip-path="url(#fclip)"><rect x="23" y="23" width="154" height="237" fill="' + sky + '"/>';
  if (three) s += tr.replace('<g ', '<g class="sc-u" ') + stampArt(item.under || '', pal) + '</g>';
  if (item.g) s += '<rect class="sc-f" x="23" y="' + (top + gy * SC).toFixed(1) + '" width="154" height="440"' + fillAttr(item.g, pal) + '/>';
  s += tr + (three ? '<g class="sc-g">' + three.ground + '</g><g class="sc-o">' + three.objects + stampArt(item.over || '', pal) + '</g>' : stampArt(item.a, pal)) + '</g>';
  if (GRAIN_URI) s += '<rect x="23" y="23" width="154" height="237" fill="url(#grain)" style="mix-blend-mode:multiply"/>';
  s += '</g>';
  s += '<text x="31" y="36" font-size="5.6" class="st-s" fill="' + onTop + '">IMAZINE</text>';
  s += '<text x="169" y="38" font-size="11" text-anchor="end" class="st-d" fill="' + onTop + '">40</text>';
  var y1 = nl.lines.length === 1 ? 218 + nl.size * 0.36 : 207 + nl.size * 0.36;
  nl.lines.forEach(function (ln, i) { s += '<text x="100" y="' + (y1 + i * nl.size * 1.02).toFixed(1) + '" font-size="' + nl.size.toFixed(1) + '" text-anchor="middle" class="st-d" fill="' + onBase + '">' + ln.replace(/&/g, '&amp;') + '</text>'; });
  s += '<text x="100" y="251" font-size="5.6" text-anchor="middle" class="st-s" fill="' + onBase + '">' + sub.toUpperCase().replace(/&/g, '&amp;') + '</text>';
  return s + '</svg>';
}
/* Shared defs: the punched edge and the field clip, used by every cover on the page. */
function stampDefs() {
  var c = '';
  for (var i = 0; i <= 21; i++) { var x = (13 + i * 174 / 21).toFixed(2); c += '<circle cx="' + x + '" cy="13" r="3"/><circle cx="' + x + '" cy="270" r="3"/>'; }
  for (var j = 1; j < 31; j++) { var y = (13 + j * 257 / 31).toFixed(2); c += '<circle cx="13" cy="' + y + '" r="3"/><circle cx="187" cy="' + y + '" r="3"/>'; }
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><symbol id="perf" viewBox="0 0 200 283" overflow="visible">' + c + '</symbol><clipPath id="fclip"><rect x="23" y="23" width="154" height="237"/></clipPath>' + (GRAIN_URI ? '<pattern id="grain" width="96" height="96" patternUnits="userSpaceOnUse"><image href="' + GRAIN_URI + '" width="96" height="96"/></pattern>' : '') + '</defs></svg>';
}
if (typeof module !== 'undefined') module.exports = { PAL: PAL, stampCover: stampCover, stampDefs: stampDefs };
