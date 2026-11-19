/* Draft 2 drawing engine for the stamp covers.
   A cover is modelled as simple solids standing on a ground plane. The engine looks at them through
   a camera (real perspective), lights them from one sun (a face is either lit or in shadow, no
   mid-tones), drops hard shadows on the ground, and adds sky pieces drawn in 2D.

   Solids, separated by ";" (x = right, z = depth, y = up; sizes in the model's own units):
     b cx cz w d y0 h col                 box
     f cx cz w0 d0 w1 d1 y0 h col         tapering box (w1 = d1 = 0 gives a pyramid)
     c cx cz r y0 h col                   cylinder          k cx cz r0 r1 y0 h col   round taper / cone
     s cx cz r yc col                     ball              L cx cz y0 col r,y r,y …  lathe (any turned profile)
     p cx cz w d y0 h col                 gable roof, ridge along x
     x cx cz y0 h col <outline>           any outline lying flat, raised by h (with "u": standing upright, h thick)
     q x0 z0 x1 z1 col                    flat patch on the ground (road, plaza, blanket)
   Details, drawn right after the solid they follow (or on the ground when they come first):
     d cx cz y col <outline>              flat piece at height y (with "u": upright, facing the camera side)
     t cx cz y size TEXT col              a word or number that always faces the camera
   Trees that always face the camera, with their own ground shadow:
     P cx cz h lean seed [col]  palm      T cx cz h [col]  pine      D cx cz h seed [col]  round tree      U cx cz size seed [col]  bush
   Outline: points "x,y x,y …", or a ready shape: o:r[:r2[:cx:cy]] circle, r:w:d[:corner[:cx:cy]] rectangle,
     h:size heart, *:r1:r2:n star, m:r crescent, f:r:n flower with n petals, l:length:halfwidth leaf, a:r:deg0:deg1[:cx:cy] arc (a line). "|" starts a hole.
     "~" rounds the points into a curve, "s:2" turns lines into strips 2 wide.
   Options after a solid: +12 raise a tree by 12, @30 turn, /20 lean right, ^20 lean back, n6 sides of a round solid, w3x5k windows on the
     sides (cols x rows, colour), y3x4k the same on the top, z4w four stripes alternating with colour w,
     vw every other side panel in colour w, e always lit, ns no ground shadow. A leading "!" (as in "!b")
     keeps the solid out of the automatic framing.
   w2x0k = as many window rows as fit. "last" on a detail draws it over everything.
   Repeats: "R n dx dz <solid>" places n copies in a row, "A n cx cz r deg0 deg1 <solid>" places them along an arc.
   Groups: "[ cx cz y @turn ^back /right" … "]" moves, turns and leans everything in between as one object.

   2D pieces usable in `under` / `over` next to the draft-1 shapes:
     K cx cy size seed [col]    cumulus cloud, lit top and shaded underside (in the scene: K cx cz width seed [col] +height)
     P x y h lean seed [col]    palm      T x y h [col]  pine      D x y h seed [col]  round tree      U x y size seed [col]  bush
     V x y size seed [col]      a few birds
     M yBase yPeak seed col [w] mountain ridge (w = snow caps)      N yBase yCrest seed col  rolling hills or dunes
     H y0 y1 n seed [col]       streaks on water  */
var SHADE = ['#6a2f14', '#14343a', '#5e1d10', '#2f3414', '#2b2452', '#173452', '#090d1c', '#173622', '#5c1f36', '#4a3018', '#173452'];
function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
function mixHex(a, b, t) { var x = hexRgb(a), y = hexRgb(b); return '#' + [0, 1, 2].map(function (i) { var v = Math.round(x[i] + (y[i] - x[i]) * t); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function f1(v) { return (Math.round(v * 10) / 10).toString(); }
function ptsStr(p) { return p.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' '); }
var V3 = {
  sub: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
  add: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
  mul: function (a, k) { return [a[0] * k, a[1] * k, a[2] * k]; },
  dot: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  cross: function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; },
  norm: function (a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  rotY: function (v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; },
  rotX: function (v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; },
  rotZ: function (v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c, v[2]]; }
};

/* ---------- outlines ---------- */
function ringArea(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function smoothRing(p, closed) {
  var n = p.length, out = [], seg = closed ? n : n - 1;
  for (var i = 0; i < seg; i++) {
    var p0 = p[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
    for (var s = 0; s < 6; s++) {
      var t = s / 6, t2 = t * t, t3 = t2 * t, q = [0, 0];
      for (var k = 0; k < 2; k++) q[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push(q);
    }
  }
  if (!closed) out.push(p[n - 1]);
  return out;
}
function strokeRing(p, w) {
  var n = p.length, A = [], B = [];
  for (var i = 0; i < n; i++) {
    var a = p[Math.max(i - 1, 0)], b = p[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
    A.push([p[i][0] + nx, p[i][1] + ny]); B.push([p[i][0] - nx, p[i][1] - ny]);
  }
  return A.concat(B.reverse());
}
/* tokens -> [{ outer: [[x,y]…], holes: [[[x,y]…]…] }] */
function outlineParts(tokens, opt) {
  var rings = [], cur = null, hole = false;
  tokens.forEach(function (tok) {
    if (tok === '|') { cur = null; hole = true; return; }
    var i = tok.indexOf(':'), j, a;
    if (i > 0) {
      var k = tok.slice(0, i), v = tok.slice(i + 1).split(':').map(Number), pts = [];
      if (k === 'a') {
        if (!cur) { cur = { p: [], raw: false, hole: hole, open: true }; rings.push(cur); hole = false; }
        var steps = Math.max(4, Math.round(Math.abs(v[2] - v[1]) / 12));
        for (j = 0; j <= steps; j++) { a = (v[1] + (v[2] - v[1]) * j / steps) * Math.PI / 180; cur.p.push([(v[3] || 0) + Math.cos(a) * v[0], (v[4] || 0) + Math.sin(a) * v[0]]); }
        return;
      }
      if (k === 'o') { var rx = v[0], ry = v[1] || v[0], n = rx > 5 ? 28 : 18; for (j = 0; j < n; j++) { a = j / n * Math.PI * 2; pts.push([(v[2] || 0) + Math.cos(a) * rx, (v[3] || 0) + Math.sin(a) * ry]); } }
      else if (k === 'r') {
        var w = v[0] / 2, d = v[1] / 2, rad = Math.min(v[2] || 0, w, d), ox = v[3] || 0, oy = v[4] || 0;
        if (!rad) pts = [[ox - w, oy - d], [ox + w, oy - d], [ox + w, oy + d], [ox - w, oy + d]];
        else [[w - rad, d - rad, 0], [-(w - rad), d - rad, 90], [-(w - rad), -(d - rad), 180], [w - rad, -(d - rad), 270]].forEach(function (c) { for (j = 0; j <= 4; j++) { a = (c[2] + j * 22.5) * Math.PI / 180; pts.push([ox + c[0] + Math.cos(a) * rad, oy + c[1] + Math.sin(a) * rad]); } });
      }
      else if (k === 'f') { var pn = v[1] || 6; for (j = 0; j < pn * 10; j++) { a = j / (pn * 10) * Math.PI * 2; var fr = v[0] * (0.7 + 0.3 * Math.abs(Math.cos(pn * a / 2))); pts.push([(v[2] || 0) + Math.cos(a) * fr, (v[3] || 0) + Math.sin(a) * fr]); } }
      else if (k === 'l') { for (j = 0; j <= 10; j++) pts.push([(v[2] || 0) + v[0] * j / 10, (v[3] || 0) + v[1] * Math.pow(Math.sin(Math.PI * j / 10), 0.8)]); for (j = 9; j >= 1; j--) pts.push([(v[2] || 0) + v[0] * j / 10, (v[3] || 0) - v[1] * Math.pow(Math.sin(Math.PI * j / 10), 0.8)]); }
      else if (k === 'h') { for (j = 0; j < 30; j++) { a = j / 30 * Math.PI * 2; pts.push([(v[1] || 0) + v[0] * Math.pow(Math.sin(a), 3), (v[2] || 0) + v[0] / 16 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); } }
      else if (k === '*') { var m = v[2] || 5; for (j = 0; j < m * 2; j++) { a = j / (m * 2) * Math.PI * 2 + Math.PI / 2; var rr = j % 2 ? v[1] : v[0]; pts.push([(v[3] || 0) + Math.cos(a) * rr, (v[4] || 0) + Math.sin(a) * rr]); } }
      else if (k === 'm') { var R = v[0], c0 = R * 0.45, r2 = Math.hypot(R * 0.643 - c0, R * 0.766), ph = Math.atan2(R * 0.766, R * 0.643 - c0); for (j = 0; j <= 16; j++) { a = (50 + j * 16.25) * Math.PI / 180; pts.push([Math.cos(a) * R, Math.sin(a) * R]); } for (j = 1; j < 12; j++) { a = -ph + (2 * ph - Math.PI * 2) * j / 12; pts.push([c0 + Math.cos(a) * r2, Math.sin(a) * r2]); } }
      else return;
      rings.push({ p: pts, raw: false, hole: hole }); cur = null; hole = false;
    } else if (tok.indexOf(',') > 0) {
      if (!cur) { cur = { p: [], raw: true, hole: hole, open: true }; rings.push(cur); hole = false; }
      cur.p.push(tok.split(',').map(Number));
    }
  });
  var parts = [];
  rings.forEach(function (r) {
    var p = r.p; if (p.length < 2) return;
    if (opt.stroke) { if (opt.smooth && r.raw && p.length > 2) p = smoothRing(p, false); p = strokeRing(p, opt.stroke); }
    else if (opt.smooth && r.raw && p.length > 2) p = smoothRing(p, true);
    if (p.length < 3) return;
    var ccw = ringArea(p) > 0;
    if (r.hole && parts.length && !opt.stroke) { if (ccw) p = p.slice().reverse(); parts[parts.length - 1].holes.push(p); }
    else { if (!ccw) p = p.slice().reverse(); parts.push({ outer: p, holes: [] }); }
  });
  return parts;
}

/* ---------- solids ---------- */
function solidRect(w0, d0, w1, d1, y0, h) {
  var V = [];
  [[w0, d0, y0], [Math.max(w1, 0.01), Math.max(d1, 0.01), y0 + h]].forEach(function (r) {
    V.push([-r[0] / 2, r[2], -r[1] / 2], [r[0] / 2, r[2], -r[1] / 2], [r[0] / 2, r[2], r[1] / 2], [-r[0] / 2, r[2], r[1] / 2]);
  });
  var F = [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(function (ix) { return { ix: ix, kind: 'side' }; });
  F.push({ ix: [4, 5, 6, 7], kind: 'top' }, { ix: [3, 2, 1, 0], kind: 'bottom' });
  return { V: V, F: F, sh: [[0, 1, 2, 3, 4, 5, 6, 7]] };
}
function solidLathe(prof, n, y0) {
  var V = [], F = [], sh = [], off = n === 4 ? Math.PI / 4 : 0, i, j;
  prof.forEach(function (p) { for (i = 0; i < n; i++) { var a = off + i / n * Math.PI * 2, r = Math.max(p[0], 0.01); V.push([Math.cos(a) * r, y0 + p[1], Math.sin(a) * r]); } });
  var ring = function (j) { var o = []; for (var i = 0; i < n; i++) o.push(j * n + i); return o; };
  for (j = 0; j + 1 < prof.length; j++) {
    for (i = 0; i < n; i++) { var a0 = j * n + i, a1 = j * n + (i + 1) % n; F.push({ ix: [a0, a1, a1 + n, a0 + n], kind: 'side', col: i }); }
    sh.push(ring(j).concat(ring(j + 1)));
  }
  if (prof[0][0] > 0.02) F.push({ ix: ring(0), kind: 'bottom' });
  if (prof[prof.length - 1][0] > 0.02) F.push({ ix: ring(prof.length - 1), kind: 'top' });
  return { V: V, F: F, sh: sh };
}
function solidRoof(w, d, y0, h) {
  return { V: [[-w / 2, y0, -d / 2], [w / 2, y0, -d / 2], [w / 2, y0, d / 2], [-w / 2, y0, d / 2], [-w / 2, y0 + h, 0], [w / 2, y0 + h, 0]],
    F: [{ ix: [0, 1, 5, 4], kind: 'side' }, { ix: [2, 3, 4, 5], kind: 'side' }, { ix: [1, 2, 5], kind: 'end' }, { ix: [3, 0, 4], kind: 'end' }], sh: [[0, 1, 2, 3, 4, 5]] };
}
/* outline (x, o) raised along e from 0 to h; vertices are [x, e, o] */
function solidPrism(parts, h) {
  var V = [], F = [];
  parts.forEach(function (pt) {
    var top = [], bot = [];
    [pt.outer].concat(pt.holes).forEach(function (r) {
      var n = r.length, b0 = V.length, t0 = b0 + n, bi = [], ti = [], i;
      for (i = 0; i < n; i++) V.push([r[i][0], 0, r[i][1]]);
      for (i = 0; i < n; i++) V.push([r[i][0], h, r[i][1]]);
      for (i = 0; i < n; i++) {
        var j = (i + 1) % n, dx = r[j][0] - r[i][0], dz = r[j][1] - r[i][1], l = Math.hypot(dx, dz) || 1;
        F.push({ ix: [b0 + i, b0 + j, t0 + j, t0 + i], N: [dz / l, 0, -dx / l], kind: 'side' }); bi.push(b0 + i); ti.push(t0 + i);
      }
      top.push(ti); bot.push(bi);
    });
    F.push({ ix: top[0], rings: top, N: [0, 1, 0], kind: 'top', cap: true }, { ix: bot[0], rings: bot, N: [0, -1, 0], kind: 'bottom', cap: true });
  });
  return { V: V, F: F, prism: true };
}
var COLTOK = '[a-z](?:~[a-z]\\d?)?(?:\\.\\d+)?';
function parseSolids(src) {
  var out = [], tail = [], host = null, grp = null, D = Math.PI / 180;
  var rows = [];
  src.split(';').forEach(function (raw) {
    var t = raw.trim().split(/\s+/), i, c, bang = t[0].length > 1 && t[0][0] === '!';
    if (bang && (t[0] === '!R' || t[0] === '!A')) t[0] = t[0].slice(1); else bang = false;
    if (t[0] === 'R' || t[0] === 'A') {
      var cnt = +t[1], sub = t.slice(t[0] === 'R' ? 4 : 7);
      if (bang && sub[0][0] !== '!') sub[0] = '!' + sub[0];
      for (i = 0; i < cnt; i++) {
        c = sub.slice();
        if (t[0] === 'R') { c[1] = +c[1] + i * +t[2]; c[2] = +c[2] + i * +t[3]; }
        else { var ang = (+t[5] + (+t[6] - +t[5]) * (cnt > 1 ? i / (cnt - 1) : 0)) * Math.PI / 180; c[1] = +c[1] + +t[2] + Math.cos(ang) * +t[4]; c[2] = +c[2] + +t[3] + Math.sin(ang) * +t[4]; }
        rows.push(c.map(String));
      }
    } else if (t[0]) rows.push(t);
  });
  rows.forEach(function (t) {
    var kind = t[0], subj = true; if (kind[0] === '!' && kind.length > 1) { subj = false; kind = kind.slice(1); }
    if (kind === ']') { grp = null; return; }
    var opt = { yaw: 0, pitch: 0, roll: 0, n: 0, win: null, top: null, band: null, gore: null, shadow: true, emit: false, up: false, smooth: false, stroke: 0 }, args = [], prof = [], shape = [], m;
    var isShape = kind === 'x' || kind === 'd', body = t.slice(1), txt = null;
    if (kind === 't') { txt = body[4]; body = body.slice(0, 4).concat(body.slice(5)); }
    body.forEach(function (x) {
      if (x[0] === '@') opt.yaw = parseFloat(x.slice(1)) * D;
      else if (x[0] === '^' && x.length > 1) opt.pitch = parseFloat(x.slice(1)) * D;
      else if (x[0] === '/' && x.length > 1) opt.roll = parseFloat(x.slice(1)) * D;
      else if ((m = /^n(\d+)$/.exec(x))) opt.n = +m[1];
      else if ((m = new RegExp('^w(\\d+)x(\\d+)(' + COLTOK + ')$').exec(x))) opt.win = [+m[1], +m[2], m[3]];
      else if ((m = new RegExp('^y(\\d+)x(\\d+)(' + COLTOK + ')$').exec(x))) opt.top = [+m[1], +m[2], m[3]];
      else if ((m = new RegExp('^z(\\d+)(' + COLTOK + ')$').exec(x))) opt.band = [+m[1], m[2]];
      else if ((m = new RegExp('^v(' + COLTOK + ')$').exec(x))) opt.gore = m[1];
      else if ((m = /^s:([\d.]+)$/.exec(x))) opt.stroke = +m[1];
      else if (/^\+[\d.]+$/.test(x)) opt.lift = parseFloat(x.slice(1));
      else if (x === 'ns') opt.shadow = false;
      else if (x === 'last') opt.last = true;
      else if (x === 'e') opt.emit = true;
      else if (x === 'u') opt.up = true;
      else if (x === '~') opt.smooth = true;
      else if (isShape && (x === '|' || x.indexOf(':') > 0 || x.indexOf(',') > 0)) shape.push(x);
      else if (x.indexOf(',') > 0 && kind === 'L') prof.push(x.split(',').map(Number));
      else args.push(x);
    });
    var num = function (i) { return parseFloat(args[i]); }, cx = num(0) || 0, cz = num(1) || 0, lerp = function (a, b, u) { return a + (b - a) * u; };
    if (kind === '[') { grp = { x: cx, z: cz, y: num(2) || 0, yaw: opt.yaw, pitch: opt.pitch, roll: opt.roll }; return; }
    /* place a local point: lean, turn, move, then the group's own lean, turn and move */
    function place(v, dir, pivotY) {
      var p = dir ? v : [v[0], v[1] - pivotY, v[2]];
      if (opt.roll) p = V3.rotZ(p, opt.roll); if (opt.pitch) p = V3.rotX(p, opt.pitch); if (opt.yaw) p = V3.rotY(p, opt.yaw);
      if (!dir) p = [p[0] + cx, p[1] + pivotY, p[2] + cz];
      if (grp) {
        if (!dir) p = [p[0], p[1] - grp.y, p[2]];
        if (grp.roll) p = V3.rotZ(p, grp.roll); if (grp.pitch) p = V3.rotX(p, grp.pitch); if (grp.yaw) p = V3.rotY(p, grp.yaw);
        if (!dir) p = [p[0] + grp.x, p[1] + grp.y, p[2] + grp.z];
      }
      return p;
    }
    if (kind === 'q') { var x0 = num(0), z0 = num(1), x1 = num(2), z1 = num(3); out.push({ flat: true, rings: [[[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]]], col: args[4] }); return; }
    if ('PTDUK'.indexOf(kind) > -1) {
      var base = place([0, opt.lift || 0, 0], false, 0);
      out.push({ bill: kind, pos: base, h: num(2), a: args.slice(3), mid: [base[0], base[1] + num(2) * 0.5, base[2]], box: [base[0] - 1, base[0] + 1, base[2] - 1, base[2] + 1], lo: base[1], hi: base[1] + num(2), shadow: opt.shadow && kind !== 'K' });
      return;
    }
    if (kind === 't') {
      var T = { text: txt, pos: place([0, num(2), 0], false, 0), size: num(3), col: args[4] || 'k', emit: true };
      if (opt.last) tail.push(T); else if (host) host.decals.push(T); else out.push({ flat: true, text: T });
      return;
    }
    if (kind === 'd') {
      var parts = outlineParts(shape, opt), y = num(2) || 0, col = args[3], dec = [];
      parts.forEach(function (pt) {
        var rings = [pt.outer].concat(pt.holes).map(function (r) { return r.map(function (q) { return place(opt.up ? [q[0], q[1] + y, 0] : [q[0], y, q[1]], false, 0); }); });
        dec.push({ rings: rings, N: place(opt.up ? [0, 0, -1] : [0, 1, 0], true, 0), col: col, emit: opt.emit });
      });
      dec.forEach(function (dd) { if (opt.last) tail.push(dd); else if (host) host.decals.push(dd); else out.push({ flat: true, rings: dd.rings, col: dd.col }); });
      return;
    }
    var made = [], cuts = opt.band && 'bfck'.indexOf(kind) > -1 ? opt.band[0] : 1;
    for (var bi = 0; bi < cuts; bi++) {
      var t0 = bi / cuts, t1 = (bi + 1) / cuts, S = null, col = null;
      if (kind === 'b') { S = solidRect(num(2), num(3), num(2), num(3), num(4) + num(5) * t0, num(5) / cuts); col = args[6]; }
      else if (kind === 'f') { S = solidRect(lerp(num(2), num(4), t0), lerp(num(3), num(5), t0), lerp(num(2), num(4), t1), lerp(num(3), num(5), t1), num(6) + num(7) * t0, num(7) / cuts); col = args[8]; }
      else if (kind === 'c') { S = solidLathe([[num(2), 0], [num(2), num(4) / cuts]], opt.n || 16, num(3) + num(4) * t0); col = args[5]; }
      else if (kind === 'k') { S = solidLathe([[lerp(num(2), num(3), t0), 0], [lerp(num(2), num(3), t1), num(5) / cuts]], opt.n || 16, num(4) + num(5) * t0); col = args[6]; }
      else if (kind === 's') { var r = num(2), yc = num(3); S = { ball: r, V: [[-r, yc, 0], [r, yc, 0], [0, yc - r, 0], [0, yc + r, 0], [0, yc, -r], [0, yc, r]], F: [], sh: [] }; col = args[4]; }
      else if (kind === 'L') { S = solidLathe(prof, opt.n || 16, num(2)); col = args[3]; }
      else if (kind === 'p') { S = solidRoof(num(2), num(3), num(4), num(5)); col = args[6]; }
      else if (kind === 'x') {
        var pp = outlineParts(shape, opt), y0 = num(2), h = num(3); if (!pp.length) return;
        S = solidPrism(pp, h); col = args[4];
        if (opt.up) { S.V = S.V.map(function (v) { return [v[0], v[2] + y0, v[1] - h / 2]; }); S.F.forEach(function (f) { f.N = [f.N[0], f.N[2], f.N[1]]; }); }
        else S.V = S.V.map(function (v) { return [v[0], v[1] + y0, v[2]]; });
      }
      if (!S) return;
      S.col = cuts > 1 && bi % 2 ? opt.band[1] : col;
      made.push(S);
    }
    made.forEach(function (S) {
      var pv = Infinity; S.V.forEach(function (v) { pv = Math.min(pv, v[1]); });
      S.V = S.V.map(function (v) { return place(v, false, pv); });
      S.F.forEach(function (f) { if (f.N) f.N = place(f.N, true, 0); });
      S.subj = subj; S.win = opt.win; S.top = opt.top; S.gore = opt.gore; S.shadow = opt.shadow; S.emit = opt.emit; S.decals = [];
      var lo = Infinity, hi = -Infinity, mx = [Infinity, -Infinity, Infinity, -Infinity], sum = [0, 0, 0];
      S.V.forEach(function (v) { lo = Math.min(lo, v[1]); hi = Math.max(hi, v[1]); mx[0] = Math.min(mx[0], v[0]); mx[1] = Math.max(mx[1], v[0]); mx[2] = Math.min(mx[2], v[2]); mx[3] = Math.max(mx[3], v[2]); sum = V3.add(sum, v); });
      S.lo = lo; S.hi = hi; S.box = mx; S.mid = [(mx[0] + mx[1]) / 2, (lo + hi) / 2, (mx[2] + mx[3]) / 2]; S.cen = V3.mul(sum, 1 / S.V.length);
      if (S.ball) { S.lo = S.cen[1] - S.ball; S.hi = S.cen[1] + S.ball; S.box = [S.cen[0] - S.ball, S.cen[0] + S.ball, S.cen[2] - S.ball, S.cen[2] + S.ball]; }
      S.lathe = 'ckL'.indexOf(kind) > -1 && !opt.roll && !opt.pitch && !(grp && (grp.roll || grp.pitch));
      out.push(S); host = S;
    });
  });
  out.tail = tail;
  return out;
}
function hull(pts) {
  var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], up = [];
  p.forEach(function (q) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
  p.reverse().forEach(function (q) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* ---------- camera, light, drawing ---------- */
function renderScene(item, pal, shade) {
  var solids = parseSolids(item.m), cam = item.cam || [], subj = solids.filter(function (s) { return s.subj && s.V; });
  var hi = 1, ext = 1;
  subj.forEach(function (s) { hi = Math.max(hi, s.hi); ext = Math.max(ext, Math.abs(s.box[0]), Math.abs(s.box[1]), Math.abs(s.box[2]), Math.abs(s.box[3])); });
  var az = (cam[0] == null ? 30 : cam[0]) * Math.PI / 180, eh = cam[1] == null ? Math.max(3, hi * 0.06) : cam[1];
  var dist = cam[2] == null ? Math.max(hi * 1.7, ext * 3.4) : cam[2], ty = cam[3] == null ? hi * 0.5 : cam[3];
  var eye = [Math.sin(az) * dist, eh, -Math.cos(az) * dist], fwd = V3.norm(V3.sub([0, ty, 0], eye));
  var right = V3.norm(V3.cross([0, 1, 0], fwd)), up = V3.cross(fwd, right), fl = 1 / Math.tan((item.fov || 38) * Math.PI / 360);
  var sun = item.sun || [-0.62, 0.66, -0.42], L = V3.norm(V3.add(V3.add(V3.mul(right, sun[0]), V3.mul(up, sun[1])), V3.mul(fwd, sun[2])));
  if (L[1] < 0.3) { L[1] = 0.3; L = V3.norm(L); }
  var Lv = [V3.dot(L, right), V3.dot(L, up), V3.dot(L, fwd)];
  function view(p) { var d = V3.sub(p, eye); return [V3.dot(d, right), V3.dot(d, up), V3.dot(d, fwd)]; }
  /* frame the subject inside the art box */
  var fit = item.fit || [6, 6, 94, 92], bx = [Infinity, -Infinity, Infinity, -Infinity];
  subj.forEach(function (s) { s.V.forEach(function (p) { var v = view(p); if (v[2] < 0.6) return; var qx = fl * v[0] / v[2], qy = fl * v[1] / v[2]; bx[0] = Math.min(bx[0], qx); bx[1] = Math.max(bx[1], qx); bx[2] = Math.min(bx[2], qy); bx[3] = Math.max(bx[3], qy); }); });
  if (bx[0] === Infinity) bx = [-1, 1, -1, 1];
  var sc = Math.min((fit[2] - fit[0]) / (bx[1] - bx[0]), (fit[3] - fit[1]) / (bx[3] - bx[2]));
  var ox = fit[0] + ((fit[2] - fit[0]) - (bx[1] - bx[0]) * sc) / 2 - bx[0] * sc + (item.dx || 0), oy = (item.mid ? fit[1] + ((fit[3] - fit[1]) - (bx[3] - bx[2]) * sc) / 2 + bx[3] * sc : fit[3] + bx[2] * sc) + (item.dy || 0);
  if (item.zoom) { var zc = (fit[0] + fit[2]) / 2, za = item.mid ? (fit[1] + fit[3]) / 2 : fit[3]; sc *= item.zoom; ox = zc + (ox - zc) * item.zoom; oy = za + (oy - za) * item.zoom; }
  function scr(p) { var v = view(p); return v[2] < 0.6 ? null : [ox + fl * v[0] / v[2] * sc, oy - fl * v[1] / v[2] * sc, v[2]]; }
  function unit(p) { var v = view(p); return sc * fl / Math.max(v[2], 0.6); }           /* art units per model unit at p */
  /* a 3D polygon, cut at the camera plane, as screen points */
  function scrPoly(P) {
    var Q = P.map(view), o = [], near = 0.6;
    for (var i = 0; i < Q.length; i++) {
      var a = Q[i], b = Q[(i + 1) % Q.length], ia = a[2] >= near, ib = b[2] >= near;
      if (ia) o.push(a);
      if (ia !== ib) { var u = (near - a[2]) / (b[2] - a[2]); o.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, near]); }
    }
    return o.length < 3 ? null : o.map(function (v) { return [ox + fl * v[0] / v[2] * sc, oy - fl * v[1] / v[2] * sc]; });
  }
  var fh = V3.norm([fwd[0], 0, fwd[2]]), hz = scr([eye[0] + fh[0] * 1e5, eye[1], eye[2] + fh[2] * 1e5]), gy = hz ? Math.max(-40, Math.min(hz[1], 97)) : 97;
  if (fwd[1] < -0.94) gy = -40;
  function tone(tok, lit) { var c = stampColor(tok, pal); return lit ? c.hex : mixHex(c.hex, shade, tok[0] === 'w' ? 0.3 : tok[0] === 'k' ? 0.5 : 0.44); }
  function shapeSvg(rings, fill, seam, op) {
    var ok = rings.filter(Boolean); if (!ok.length) return '';
    var st = op ? ' fill-opacity="' + op + '"' : seam ? ' stroke="' + fill + '" stroke-width=".3" stroke-linejoin="round"' : '';
    if (ok.length === 1) return '<polygon points="' + ptsStr(ok[0]) + '" fill="' + fill + '"' + st + '/>';
    return '<path d="' + ok.map(function (r) { return 'M' + ptsStr(r).replace(/ /g, 'L') + 'Z'; }).join('') + '" fill-rule="evenodd" fill="' + fill + '"' + st + '/>';
  }
  function textSvg(T) { var p = scr(T.pos); if (!p) return ''; return '<text x="' + f1(p[0]) + '" y="' + f1(p[1]) + '" font-size="' + f1(T.size * unit(T.pos)) + '" text-anchor="middle" class="st-d" fill="' + stampColor(T.col, pal).hex + '">' + T.text + '</text>'; }
  var gsvg = '', ssvg = '', osvg = '';
  solids.forEach(function (s) { if (!s.flat) return; gsvg += s.text ? textSvg(s.text) : shapeSvg(s.rings.map(scrPoly), stampColor(s.col, pal).hex, false); });
  /* hard shadows on the ground: one flat layer, so overlapping shadows never add up */
  function drop(v) { var u = Math.max(v[1], 0) / L[1]; return [v[0] - L[0] * u, 0.03, v[2] - L[2] * u]; }
  solids.forEach(function (s) {
    if (s.flat || !s.shadow) return;
    if (s.bill) {
      var b = s.pos, h = s.h, k = s.bill, top = drop([b[0], b[1] + h * (k === 'T' ? 1 : k === 'P' ? 0.98 : 0.68), b[2]]), ax = V3.norm(V3.sub(top, [b[0], 0.03, b[2]])), side = [-ax[2], 0, ax[0]], g0 = [b[0], 0.03, b[2]];
      var wd = k === 'T' ? h * 0.2 : h * 0.03, rad = k === 'P' ? h * 0.3 : k === 'D' ? h * 0.34 : k === 'U' ? h * 0.6 : 0;
      ssvg += shapeSvg([scrPoly(k === 'T' ? [V3.add(g0, V3.mul(side, wd)), V3.add(g0, V3.mul(side, -wd)), top] : [V3.add(g0, V3.mul(side, wd)), V3.add(g0, V3.mul(side, -wd)), V3.add(top, V3.mul(side, -wd)), V3.add(top, V3.mul(side, wd))])], '#000', false);
      if (rad) { var ring = []; for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI * 2; ring.push(V3.add(V3.add(top, V3.mul(ax, Math.cos(a) * rad * 1.25)), V3.mul(side, Math.sin(a) * rad))); } ssvg += shapeSvg([scrPoly(ring)], '#000', false); }
      return;
    }
    if (s.ball) {
      var bu = V3.norm(V3.cross(L, [0, 1, 0])), bv = V3.cross(L, bu), br = [];
      for (var bi = 0; bi < 16; bi++) { var ba = bi / 16 * Math.PI * 2; br.push(drop(V3.add(s.cen, V3.add(V3.mul(bu, Math.cos(ba) * s.ball), V3.mul(bv, Math.sin(ba) * s.ball))))); }
      ssvg += shapeSvg([scrPoly(br)], '#000', false); return;
    }
    if (s.prism) s.F.forEach(function (f) { ssvg += shapeSvg((f.rings || [f.ix]).map(function (r) { return scrPoly(r.map(function (i) { return drop(s.V[i]); })); }), '#000', false); });
    else s.sh.forEach(function (ix) { var g = hull(ix.map(function (i) { var d = drop(s.V[i]); return [d[0], d[2]]; })); if (g.length > 2) ssvg += shapeSvg([scrPoly(g.map(function (p) { return [p[0], 0.03, p[1]]; }))], '#000', false); });
  });
  if (ssvg) gsvg += '<g opacity="' + (item.sh == null ? 0.34 : item.sh) + '">' + ssvg.replace(/fill="#000"/g, 'fill="' + shade + '"') + '</g>';
  /* far solids first; a solid standing on another is drawn after it when the camera sees the lower one from above */
  var list = solids.filter(function (s) { return !s.flat; });
  list.forEach(function (s) { s.depth = view(s.cen || s.mid)[2]; });
  list.sort(function (a, b) { return b.depth - a.depth; });
  function inside(A, B) { return B.box[0] < A.box[0] - 0.01 && B.box[1] > A.box[1] + 0.01 && B.box[2] < A.box[2] - 0.01 && B.box[3] > A.box[3] + 0.01; }   /* A's footprint lies inside B's */
  function bandOf(B, A) { return B.lo >= A.lo - 0.01 && A.lo < B.hi && B.lo < A.hi && B.hi - B.lo < A.hi - A.lo && inside(A, B) && B.box[1] - B.box[0] <= (A.box[1] - A.box[0]) * 1.3 + 0.5 && B.box[3] - B.box[2] <= (A.box[3] - A.box[2]) * 1.3 + 0.5; }                    /* B is a band around A */
  function before(A, B) {                           /* must A be painted before B? */
    if (!(A.box[0] < B.box[1] && B.box[0] < A.box[1] && A.box[2] < B.box[3] && B.box[2] < A.box[3])) return false;
    if (B.lo >= A.hi - 0.01 && eye[1] > A.hi) return true;       /* B stands on A, A's top is in view */
    if (B.hi <= A.lo + 0.01 && eye[1] < A.lo) return true;       /* B hangs under A, seen from below */
    if (bandOf(B, A)) return true;
    if (A.lo < B.lo - 0.01 && A.hi > B.lo && A.hi <= B.lo + (B.hi - B.lo) * 0.5 && eye[1] > A.hi && inside(B, A)) return true;   /* B is seated in A: a plate, a tray, a bowl */
    return false;
  }
  list.forEach(function (B) { B.noTop = !!B.V && list.some(function (A) { return A !== B && A.V && bandOf(B, A) && A.hi > B.hi + 0.01; }); });
  for (var pass = 0; pass < 4; pass++) {
    var moved = false;
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) if (before(list[j], list[i]) && !before(list[i], list[j])) { var mv = list.splice(j, 1)[0]; list.splice(i, 0, mv); moved = true; }
    if (!moved) break;
  }
  function grid(P, g, lit) {
    var cols = g[0], rows = g[1] || Math.max(1, Math.round(Math.hypot(P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]) / (Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]) / cols || 1) / 1.25)), mu = 0.12, mv2 = 0.09, cu = (1 - 2 * mu) / cols, cv = (1 - 2 * mv2) / rows, wc = tone(g[2], lit), o = '';
    var at = function (u, v) { var a = V3.add(P[0], V3.mul(V3.sub(P[1], P[0]), u)), b = V3.add(P[3], V3.mul(V3.sub(P[2], P[3]), u)); return scr(V3.add(a, V3.mul(V3.sub(b, a), v))); };
    for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
      var u0 = mu + q * cu + cu * 0.18, u1 = mu + (q + 1) * cu - cu * 0.18, v0 = mv2 + r * cv + cv * 0.2, v1 = mv2 + (r + 1) * cv - cv * 0.2, w = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
      if (w.every(Boolean)) o += '<polygon points="' + ptsStr(w) + '" fill="' + wc + '"/>';
    }
    return o;
  }
  function decal(d) {
    if (d.text) { osvg += textSvg(d); return; }
    var c = [0, 0, 0], r0 = d.rings[0]; r0.forEach(function (q) { c = V3.add(c, q); }); c = V3.mul(c, 1 / r0.length);
    if (V3.dot(d.N, V3.sub(eye, c)) <= 0) return;
    var dop = stampColor(d.col, pal).op;
    osvg += shapeSvg(d.rings.map(scrPoly), tone(d.col, d.emit || V3.dot(d.N, L) > 0.08), false, dop < 1 ? dop : 0);
  }
  list.forEach(function (s) {
    if (s.bill) {
      var p = scr(s.pos); if (!p) return;
      var hh = s.h * unit(s.pos), t = s.bill === 'K' ? ['K', p[0], p[1], hh / 30, s.a[0] || 3, s.a[1]] : s.bill === 'P' ? ['P', p[0], p[1], hh, (parseFloat(s.a[0]) || 0) * unit(s.pos), s.a[1] || 3, s.a[2]] : s.bill === 'T' ? ['T', p[0], p[1], hh, s.a[0]] : [s.bill, p[0], p[1], hh, s.a[0] || 3, s.a[1]];
      osvg += stampExtra(t.filter(function (x) { return x !== undefined; }), pal, shade);
      return;
    }
    if (s.ball) {
      var bp = scr(s.cen); if (!bp) return;
      var R = s.ball * unit(s.cen), sl = Math.hypot(Lv[0], Lv[1]) || 1e-6, d = [-Lv[0] / sl, Lv[1] / sl], e1 = [-d[1], d[0]], cres = [], ti, ta;
      osvg += '<circle cx="' + f1(bp[0]) + '" cy="' + f1(bp[1]) + '" r="' + f1(R) + '" fill="' + tone(s.col, true) + '"/>';
      if (!s.emit) {
        for (ti = 0; ti <= 16; ti++) { ta = (-90 + ti * 11.25) * Math.PI / 180; cres.push([bp[0] + R * (Math.cos(ta) * d[0] + Math.sin(ta) * e1[0]), bp[1] + R * (Math.cos(ta) * d[1] + Math.sin(ta) * e1[1])]); }
        for (ti = 0; ti <= 16; ti++) { ta = (90 - ti * 11.25) * Math.PI / 180; cres.push([bp[0] + R * (Math.sin(ta) * e1[0] - Math.cos(ta) * Lv[2] * d[0]), bp[1] + R * (Math.sin(ta) * e1[1] - Math.cos(ta) * Lv[2] * d[1])]); }
        osvg += '<polygon points="' + ptsStr(cres) + '" fill="' + tone(s.col, false) + '"/>';
      }
      s.decals.forEach(decal);
      return;
    }
    var faces = [];
    s.F.forEach(function (f) {
      var P = f.ix.map(function (i) { return s.V[i]; }), c = [0, 0, 0];
      P.forEach(function (q) { c = V3.add(c, q); }); c = V3.mul(c, 1 / P.length);
      var n = f.N;
      if (!n) { n = V3.norm(V3.cross(V3.sub(P[1], P[0]), V3.sub(P[2], P[0]))); if (V3.dot(n, V3.sub(c, s.cen)) < 0) n = V3.mul(n, -1); }
      if (V3.dot(n, V3.sub(eye, c)) <= 0 || (s.noTop && f.kind === 'top')) return;
      var rings = (f.rings || [f.ix]).map(function (r) { return scrPoly(r.map(function (i) { return s.V[i]; })); });
      if (!rings[0]) return;
      var lit = V3.dot(n, L) > 0.08;
      if (s.lathe && f.kind === 'side') lit = Math.abs(n[1]) > 0.8 ? n[1] > 0 : (n[0] * L[0] + n[2] * L[2]) / (Math.hypot(n[0], n[2]) * Math.hypot(L[0], L[2]) || 1) > 0.05;
      faces.push({ rings: rings, P: P, lit: s.emit || lit, z: view(c)[2] - (f.cap ? 1e4 : 0), f: f });
    });
    faces.sort(function (a, b) { return b.z - a.z; });
    faces.forEach(function (fc) {
      var f = fc.f, tok = s.gore && f.col % 2 ? s.gore : s.col;
      osvg += shapeSvg(fc.rings, tone(tok, fc.lit), true);
      if (s.win && f.kind === 'side' && fc.P.length === 4) osvg += grid(fc.P, s.win, fc.lit);
      if (s.top && f.kind === 'top' && fc.P.length === 4) osvg += grid(fc.P, s.top, fc.lit);
    });
    s.decals.forEach(decal);
  });
  solids.tail.forEach(decal);
  return { ground: gsvg, objects: osvg, gy: gy, frame: [ox + bx[0] * sc, oy - bx[3] * sc, ox + bx[1] * sc, oy - bx[2] * sc], eye: eye, at: scr };
}

/* ---------- 2D pieces: clouds, trees, birds, ridges, water ---------- */
function blobPts(cx, cy, rx, ry, r, half) {          /* a lumpy closed outline; half = only the upper part, flat base */
  var p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28, pts = [], n = 44;
  for (var i = 0; i <= n; i++) {
    var a = half ? Math.PI + i / n * Math.PI : i / n * Math.PI * 2, k = 1 + 0.11 * Math.sin(3 * a + p1) + 0.07 * Math.sin(5 * a + p2) + 0.05 * Math.sin(9 * a + p3);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return pts;
}
function stampExtra(t, pal, shade) {
  var k = t[0], n = function (i) { return parseFloat(t[i]); }, out = '', i;
  if (k === 'K') {                                 /* cumulus: one bumpy outline, flat base, shaded scalloped underside */
    var cx = n(1), cy = n(2), s = n(3), r = rng(n(4) || 1), lit = t[5] ? stampColor(t[5], pal).hex : PAPER, dark = mixHex(lit, shade, 0.24), lob = [], cnt = 4 + Math.floor(r() * 2), w = 30 * s, base = cy + 4 * s;
    for (i = 0; i < cnt; i++) { var u = i / (cnt - 1), rad = (4.4 + Math.sin(u * Math.PI) * 3.4 + r() * 1.4) * s; lob.push([cx - w / 2 + u * w, base - rad * 0.5, rad]); }
    for (i = 0; i < 2 + Math.floor(r() * 2); i++) { var u2 = 0.24 + i * 0.24 + (r() - 0.5) * 0.1, rad2 = (5 + r() * 3.2) * s; lob.push([cx - w / 2 + u2 * w, base - (8.5 + r() * 5) * s, rad2]); }
    var sh = [], ph = r() * 3;
    for (i = 0; i < 4; i++) sh.push([cx - w / 2 + (i + 0.6 + r() * 0.3) / 4 * w, base + (0.6 + r() * 0.8) * s, (3.6 + r() * 1.6) * s]);
    var env = function (set, x, sign) { var best = sign < 0 ? Infinity : -Infinity; set.forEach(function (c) { var dx = x - c[0]; if (Math.abs(dx) >= c[2]) return; var y = c[1] + sign * Math.sqrt(c[2] * c[2] - dx * dx); best = sign < 0 ? Math.min(best, y) : Math.max(best, y); }); return best; };
    var xa = Infinity, xb = -Infinity; lob.forEach(function (c) { xa = Math.min(xa, c[0] - c[2]); xb = Math.max(xb, c[0] + c[2]); });
    var topP = [], botP = [], shP = [], step = 0.55 * s;
    for (var x = xa + 0.01; x < xb; x += step) {
      var yt = env(lob, x, -1), yb = Math.min(env(lob, x, 1), base); if (yt === Infinity) continue;
      topP.push([x, yt]); botP.push([x, yb]);
      shP.push([x, Math.min(yb, Math.max(yt, Math.min(env(sh, x, -1), base - 1.2 * s - (x - xa) / (xb - xa) * 2.4 * s)))]);
    }
    out += '<polygon points="' + ptsStr(topP.concat(botP.slice().reverse())) + '" fill="' + lit + '"/>';
    out += '<polygon points="' + ptsStr(shP.concat(botP.slice().reverse())) + '" fill="' + dark + '"/>';
    out += '<rect x="' + f1(xb + 1.2 * s) + '" y="' + f1(base - 2.2 * s) + '" width="' + f1(7 * s) + '" height="' + f1(2.2 * s) + '" rx="' + f1(1.1 * s) + '" fill="' + lit + '"/>';
    return out;
  }
  if (k === 'P') {                                 /* palm: curved trunk, fronds alternating lit and shaded */
    var px0 = n(1), py0 = n(2), h = n(3), lean = n(4) || 0, rp = rng(n(5) || 3), tx = px0 + lean, ty = py0 - h, trunk = stampColor('k', pal).hex, leaf = stampColor(t[6] || 'b', pal).hex, leafD = mixHex(leaf, shade, 0.5);
    out += '<path d="M' + f1(px0 - h * 0.022) + ' ' + f1(py0) + ' Q' + f1(px0 + lean * 0.15) + ' ' + f1(py0 - h * 0.55) + ' ' + f1(tx - h * 0.012) + ' ' + f1(ty) + ' L' + f1(tx + h * 0.012) + ' ' + f1(ty) + ' Q' + f1(px0 + lean * 0.15 + h * 0.03) + ' ' + f1(py0 - h * 0.55) + ' ' + f1(px0 + h * 0.022) + ' ' + f1(py0) + 'Z" fill="' + trunk + '"/>';
    for (var q = 0; q < 9; q++) {
      var ang = (-205 + q * 28 + (rp() - 0.5) * 10) * Math.PI / 180, len = h * (0.34 + rp() * 0.1), ex = tx + Math.cos(ang) * len, ey = ty + Math.sin(ang) * len * 0.75 + len * 0.42;
      var c1x = tx + Math.cos(ang) * len * 0.55, c1y = ty + Math.sin(ang) * len * 0.6 - len * 0.2;
      out += '<path d="M' + f1(tx) + ' ' + f1(ty) + ' Q' + f1(c1x) + ' ' + f1(c1y) + ' ' + f1(ex) + ' ' + f1(ey) + ' Q' + f1(c1x + (tx - c1x) * 0.2) + ' ' + f1(c1y + len * 0.2) + ' ' + f1(tx) + ' ' + f1(ty + len * 0.08) + 'Z" fill="' + (q % 2 ? leaf : leafD) + '"/>';
    }
    return out;
  }
  if (k === 'T') {                                 /* pine: three tiers, right half in shadow */
    var px = n(1), py = n(2), ph2 = n(3), g = stampColor(t[4] || 'b', pal).hex, gd = mixHex(g, shade, 0.5), wd = ph2 * 0.36;
    out += '<rect x="' + f1(px - ph2 * 0.03) + '" y="' + f1(py - ph2 * 0.14) + '" width="' + f1(ph2 * 0.06) + '" height="' + f1(ph2 * 0.14) + '" fill="' + mixHex(g, shade, 0.7) + '"/>';
    for (var z = 0; z < 3; z++) {
      var top = py - ph2 + z * ph2 * 0.24, bot = py - ph2 * 0.12 - (2 - z) * ph2 * 0.2, hw = wd * (0.5 + z * 0.25);
      out += '<polygon points="' + f1(px) + ',' + f1(top) + ' ' + f1(px + hw) + ',' + f1(bot) + ' ' + f1(px - hw) + ',' + f1(bot) + '" fill="' + g + '"/>';
      out += '<polygon points="' + f1(px) + ',' + f1(top) + ' ' + f1(px + hw) + ',' + f1(bot) + ' ' + f1(px + hw * 0.1) + ',' + f1(bot) + '" fill="' + gd + '"/>';
    }
    return out;
  }
  if (k === 'D' || k === 'U') {                    /* round tree or bush: lumpy crown, lit toward the sun */
    var dx = n(1), dy = n(2), dh = n(3), rd = rng(n(4) || 3), dc = stampColor(t[5] || 'b', pal).hex, dd = mixHex(dc, shade, 0.5);
    if (k === 'D') {
      var cr = dh * 0.34, ccy = dy - dh + cr * 1.02;
      out += '<polygon points="' + ptsStr([[dx - dh * 0.035, dy], [dx - dh * 0.022, ccy], [dx + dh * 0.022, ccy], [dx + dh * 0.035, dy]]) + '" fill="' + mixHex(dc, shade, 0.78) + '"/>';
      var bp = blobPts(dx, ccy, cr, cr * 1.04, rd, false);
      out += '<polygon points="' + ptsStr(bp) + '" fill="' + dd + '"/>';
      out += '<polygon points="' + ptsStr(bp.map(function (p) { return [dx - cr * 0.13 + (p[0] - dx) * 0.84, ccy - cr * 0.15 + (p[1] - ccy) * 0.84]; })) + '" fill="' + dc + '"/>';
    } else {
      var up = blobPts(dx, dy, dh * 0.62, dh * 0.6, rd, true);
      out += '<polygon points="' + ptsStr(up) + '" fill="' + dd + '"/>';
      out += '<polygon points="' + ptsStr(up.map(function (p) { return [dx - dh * 0.07 + (p[0] - dx) * 0.86, dy + (p[1] - dy) * 0.8 - (p[1] < dy - 0.01 ? dh * 0.07 : 0)]; })) + '" fill="' + dc + '"/>';
    }
    return out;
  }
  if (k === 'V') {                                 /* birds */
    var rb = rng(n(4) || 5), bs = n(3), bc = stampColor(t[5] || 'w', pal).hex;
    for (var b = 0; b < 4; b++) { var bx = n(1) + (rb() - 0.3) * 14 * bs + b * 3 * bs, by = n(2) + (rb() - 0.5) * 8 * bs, sz = (1.4 + rb() * 0.8) * bs; out += '<path d="M' + f1(bx - sz) + ' ' + f1(by) + ' Q' + f1(bx - sz * 0.4) + ' ' + f1(by - sz * 0.7) + ' ' + f1(bx) + ' ' + f1(by) + ' Q' + f1(bx + sz * 0.4) + ' ' + f1(by - sz * 0.7) + ' ' + f1(bx + sz) + ' ' + f1(by) + '" fill="none" stroke="' + bc + '" stroke-width="' + f1(0.45 * bs) + '" stroke-linecap="round"/>'; }
    return out;
  }
  if (k === 'M') {                                 /* ridge: every peak has a lit face and a shadow face */
    var yb2 = n(1), yp = n(2), rm = rng(n(3) || 7), col = stampColor(t[4], pal), bcol = col.hex, dk = mixHex(bcol, shade, 0.42), pts = [[-6, yb2]], peaks = [], xx = -6;
    while (xx < 104) { var stepx = 16 + rm() * 16, pk = [xx + stepx * 0.5, yp + rm() * (yb2 - yp) * 0.45]; var val = [xx + stepx, yb2 - (yb2 - pk[1]) * (0.12 + rm() * 0.28)]; pts.push(pk, val); peaks.push([pk, val]); xx += stepx; }
    pts.push([108, yb2]);
    var op = col.op < 1 ? ' fill-opacity="' + col.op + '"' : '';
    out += '<polygon points="' + ptsStr(pts) + '" fill="' + bcol + '"' + op + '/>';
    peaks.forEach(function (pv) {
      var pk = pv[0], va = pv[1], foot = [pk[0] + (va[0] - pk[0]) * 0.28, yb2];
      out += '<polygon points="' + ptsStr([pk, va, [va[0], yb2], foot]) + '" fill="' + dk + '"' + op + '/>';
      if (t[5] === 'w') { var d = (yb2 - pk[1]) * 0.26; out += '<polygon points="' + ptsStr([pk, [pk[0] + d * 0.62, pk[1] + d], [pk[0] + d * 0.2, pk[1] + d * 0.7], [pk[0] - d * 0.15, pk[1] + d * 1.1], [pk[0] - d * 0.6, pk[1] + d * 0.9]]) + '" fill="' + PAPER + '"/>'; }
    });
    return out;
  }
  if (k === 'N') {                                 /* rolling hills or dunes: a lit crest line, the far side in shadow */
    var y0 = n(1), y1 = n(2), rn = rng(n(3) || 4), nc = stampColor(t[4], pal), a1 = rn() * 6, a2 = rn() * 6, f1n = 0.045 + rn() * 0.03, f2n = 0.11 + rn() * 0.05, hp = [], sp = [];
    var hy = function (x) { return y1 + (y0 - y1) * (0.42 - 0.3 * Math.sin(x * f1n + a1) - 0.12 * Math.sin(x * f2n + a2)); };
    for (var hx = -4; hx <= 104; hx += 2) { hp.push([hx, hy(hx)]); sp.push([hx, Math.max(hy(hx), hy(hx - 7) + (y0 - y1) * 0.1)]); }
    var nop = nc.op < 1 ? ' fill-opacity="' + nc.op + '"' : '';
    out += '<polygon points="' + ptsStr(hp.concat([[104, y0 + 1], [-4, y0 + 1]])) + '" fill="' + nc.hex + '"' + nop + '/>';
    out += '<polygon points="' + ptsStr(sp.concat([[104, y0 + 1], [-4, y0 + 1]])) + '" fill="' + mixHex(nc.hex, shade, 0.3) + '"' + nop + '/>';
    return out;
  }
  if (k === 'H') {                                 /* light streaks on water */
    var rh = rng(n(4) || 9), hc = stampColor(t[5] || 'w.6', pal);
    for (var e = 0; e < n(3); e++) { var hy2 = n(1) + rh() * (n(2) - n(1)), hx2 = rh() * 100, hl = 3 + rh() * 9; out += '<rect x="' + f1(hx2 - hl / 2) + '" y="' + f1(hy2) + '" width="' + f1(hl) + '" height=".9" rx=".45" fill="' + hc.hex + '" fill-opacity="' + hc.op + '"/>'; }
    return out;
  }
  return '';
}
if (typeof module !== 'undefined') module.exports = { renderScene: renderScene, stampExtra: stampExtra, SHADE: SHADE, mixHex: mixHex };
