/* Audit of the stamp covers. Usage: node tools/audit-covers.js   (needs the test page served on :8765, see covers/build.py)
   Part 1 reads the scenes as data: broken numbers, things that float, bands painted over their box, framing.
   Part 2 measures the drawn covers in a browser: art over the name or the corner labels, contrast, name width, hidden sky pieces. */
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const fs = require('fs'), vm = require('vm'), { chromium } = require('playwright');
const C = path.join(ROOT, 'covers') + path.sep, ctx = { console, module: {} };
vm.createContext(ctx);
vm.runInContext(['stamp.js', 'scene.js', 'art.js'].map(f => fs.readFileSync(C + f, 'utf8')).join('\n'), ctx);
const { ART, PAL, SHADE, parseSolids, renderScene, stampCover } = ctx, flags = {}, add = (n, k, m) => { ((flags[n] = flags[n] || {})[k] = flags[n][k] || []).push(m); };
const r1 = v => Math.round(v * 10) / 10, over = (A, B) => A.box[0] < B.box[1] && B.box[0] < A.box[1] && A.box[2] < B.box[3] && B.box[2] < A.box[3];
const HANG = /balon|lampion|ketupat|bianglala|kincir|turki|imlek|lebaran/i;

/* ---------- part 1: the scenes as data ---------- */
Object.keys(ART).forEach(name => {
  const it = ART[name];
  if (!it.m) { add(name, 'no scene', 'still draft-1 art'); return; }
  const svg = stampCover(name, 'X · 2026', it), bad = svg.match(/NaN|undefined|Infinity|null/g);
  if (bad) add(name, 'broken numbers', bad.length + ' x ' + [...new Set(bad)].join('/'));
  const solids = parseSolids(it.m), real = solids.filter(s => s.V), r = renderScene(it, PAL[it.p], SHADE[it.p]);
  if (!real.some(s => s.subj)) add(name, 'framing', 'nothing is framed');
  if (r.frame[3] > 100.5) add(name, 'framing', 'framed solids reach y ' + r1(r.frame[3]) + ' (name starts near 104)');
  if (r.frame[0] < -1.5 || r.frame[2] > 101.5) add(name, 'crop', 'framed solids run off the sides: x ' + r1(r.frame[0]) + ' to ' + r1(r.frame[2]));
  if (r.frame[1] < -9) add(name, 'crop', 'framed solids run off the top: y ' + r1(r.frame[1]));
  real.forEach((s, i) => {
    if (s.lo > 0.3 && s.shadow) {   /* pieces drawn without a shadow (steam, strings, glints) may float on purpose */
      const near = (a, c) => a.box[0] < c.box[1] + 0.8 && c.box[0] < a.box[1] + 0.8 && a.box[2] < c.box[3] + 0.8 && c.box[2] < a.box[3] + 0.8;
      const held = real.some(t => t !== s && near(s, t) && ((t.hi >= s.lo - 0.8 && t.hi <= s.lo + 0.8) || (t.lo >= s.hi - 0.8 && t.lo <= s.hi + 0.8) || (t.lo < s.hi - 0.01 && t.hi > s.lo + 0.01)));
      if (!held) add(name, 'floating', s.col + ' at x ' + r1((s.box[0] + s.box[1]) / 2) + ' z ' + r1((s.box[2] + s.box[3]) / 2) + ' y ' + r1(s.lo) + '..' + r1(s.hi));
    }
  });
  const sun = (it.under || '').split(';').map(t => t.trim().split(/\s+/)).find(t => t[0] === 'c' && +t[3] >= 5);
  if (sun && +sun[1] > 45 && !it.sun) add(name, 'light', 'sun or moon drawn on the right (x ' + sun[1] + ') but the light comes from the left');
});

/* ---------- part 2: the drawn covers ---------- */
(async () => {
  const b = await chromium.launch(), pg = await (await b.newContext({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1 })).newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/dist/covers-test.html'); await pg.waitForSelector('svg.cv'); await pg.evaluate(() => document.fonts.ready);
  const dom = await pg.evaluate(async () => {
    const out = {}, lum = c => { const a = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
    const rgb = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number), ratio = (a, c) => { const x = lum(rgb(a)), y = lum(rgb(c)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    for (const btn of document.querySelectorAll('.cell:not(.done) .open')) {
      btn.scrollIntoView({ block: 'center' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const svg = btn.querySelector('svg.cv'), name = btn.getAttribute('aria-label').replace('Lihat sampul ', '').replace(' lebih besar', ''), R = svg.getBoundingClientRect(), k = 200 / R.width, f = [];
      const box = el => { const q = el.getBoundingClientRect(); return [(q.left - R.left) * k, (q.top - R.top) * k, (q.right - R.left) * k, (q.bottom - R.top) * k]; };
      const texts = [...svg.querySelectorAll(':scope > text')], names = texts.filter(t => parseFloat(t.getAttribute('font-size')) >= 12 && parseFloat(t.getAttribute('y')) > 190);
      const lab = texts.filter(t => t.textContent === 'IMAZINE' || t.textContent === '40');
      /* what is painted under a point, skipping text, grain and see-through pieces */
      const under = (x, y) => {
        for (const el of document.elementsFromPoint(R.left + x / k, R.top + y / k)) {
          if (!svg.contains(el) || el === svg || el.tagName === 'text') continue;
          const cs = getComputedStyle(el); if (cs.fill.indexOf('url') > -1 || cs.fill === 'none') continue;
          if (+cs.fillOpacity < 1 || el.closest('g[opacity]')) continue;
          return el;
        }
        return null;
      };
      const layer = el => el && (el.closest('.sc-o') ? 'object' : el.closest('.sc-g') ? 'ground piece' : el.closest('.sc-u') ? 'sky piece' : 'field');
      names.forEach(t => {
        const q = box(t); if (q[2] - q[0] > 140) f.push(['name width', t.textContent + ' is ' + Math.round(q[2] - q[0]) + ' wide (140 fits)']);
        let hit = 0, worst = 99;
        for (let i = 0; i <= 10; i++) for (let j = 0; j <= 2; j++) { const el = under(q[0] + (q[2] - q[0]) * i / 10, q[1] + (q[3] - q[1]) * (0.25 + j * 0.25)); if (!el) continue; if (layer(el) === 'object') hit++; worst = Math.min(worst, ratio(getComputedStyle(t).fill, getComputedStyle(el).fill)); }
        if (hit) f.push(['art over name', hit + ' of 33 sample points under "' + t.textContent + '"']);
        if (worst < 3) f.push(['name contrast', t.textContent + ' ' + worst.toFixed(1) + ':1 (large text needs 3)']);
      });
      lab.forEach(t => {
        const q = box(t); let worst = 99, what = '';
        for (let i = 0; i <= 6; i++) { const el = under(q[0] + (q[2] - q[0]) * i / 6, (q[1] + q[3]) / 2); if (!el) continue; const c = ratio(getComputedStyle(t).fill, getComputedStyle(el).fill); if (c < worst) { worst = c; what = layer(el); } }
        if (worst < 3) f.push(['label contrast', t.textContent + ' ' + worst.toFixed(1) + ':1 over a ' + what]);
      });
      const floor = svg.querySelector('.sc-f'), fy = floor ? box(floor)[1] : 999;
      [...svg.querySelectorAll('.sc-u > *')].forEach(el => { const q = box(el); if (q[1] >= fy - 0.3 && q[1] < 262 && q[2] > 23 && q[0] < 177) f.push(['hidden sky piece', el.tagName + ' at y ' + Math.round(q[1]) + ' is below the floor line ' + Math.round(fy)]); });
      const zero = [...svg.querySelectorAll('polygon')].filter(p => (p.getAttribute('points') || '').trim().split(/\s+/).length < 3).length;
      if (zero) f.push(['broken shape', zero + ' polygons with fewer than 3 points']);
      out[name] = { f, n: svg.querySelectorAll('*').length };
    }
    return out;
  });
  Object.keys(dom).forEach(n => dom[n].f.forEach(x => add(n, x[0], x[1])));
  /* hanging and flying things (balloons, lanterns, ketupat, a ferris wheel, a windmill) float on purpose: listed apart, not counted */
  const meant = n => HANG.test(n) && !process.argv.includes('--all'), kinds = {}, skipped = [];
  Object.keys(flags).forEach(n => Object.keys(flags[n]).forEach(kk => { if (kk === 'floating' && meant(n)) { skipped.push(n); return; } kinds[kk] = (kinds[kk] || 0) + 1; }));
  console.log('covers checked', Object.keys(dom).length, '· page errors', errs.length, errs.slice(0, 3), '· heaviest', Object.entries(dom).sort((a, c) => c[1].n - a[1].n).slice(0, 3).map(e => e[0] + ' ' + e[1].n).join(', '));
  console.log('findings by kind', JSON.stringify(kinds), '· total', Object.values(kinds).reduce((x, y) => x + y, 0));
  if (skipped.length) console.log('floating on purpose, not counted:', skipped.join(', '), '(run with --all to list them)');
  Object.keys(flags).sort().forEach(n => Object.keys(flags[n]).forEach(kk => { if (kk === 'floating' && meant(n)) return; console.log(n.padEnd(22), kk.padEnd(16), flags[n][kk].slice(0, 6).join(' | ') + (flags[n][kk].length > 6 ? ' … +' + (flags[n][kk].length - 6) : '')); }));
  fs.writeFileSync(OUT + 'audit-covers.json', JSON.stringify(flags, null, 1));
  await b.close();
})();
