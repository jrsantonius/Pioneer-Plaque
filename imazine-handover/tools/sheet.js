// Contact sheets of the stamp covers for review: node sheet.js [startIndex] [count] [cols] [outName]
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
const [start, count, cols, out] = [+(process.argv[2] || 0), +(process.argv[3] || 36), +(process.argv[4] || 9), process.argv[5] || 'sheet'];
const CW = +(process.env.CW || 200);
(async () => {
  const b = await chromium.launch();
  const pg = await (await b.newContext({ viewport: { width: cols * (CW + 14) + 14, height: 900 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/dist/covers-test.html'); await pg.waitForTimeout(900);
  const n = await pg.evaluate(([start, count, cols, PICK, CW]) => {
    let cells = [...document.querySelectorAll('.cell:not(.done) .open')]; const pick = (PICK || '').split('|').filter(Boolean); cells = pick.length ? cells.filter(c => pick.some(n => c.getAttribute('aria-label').includes(n))) : cells.slice(start, start + count);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:0;top:0;z-index:99;background:#777;display:grid;gap:14px;padding:14px;grid-template-columns:repeat(' + cols + ',' + CW + 'px)';
    cells.forEach(c => { const d = document.createElement('div'); d.style.cssText = 'width:' + CW + 'px'; d.appendChild(c.firstChild.cloneNode(true)); wrap.appendChild(d); });
    [...document.body.children].forEach(ch => { if (ch.tagName.toLowerCase() !== 'svg') ch.style.display = 'none'; }); document.body.appendChild(wrap);
    return cells.length;
  }, [start, count, cols, process.argv[6] || '', CW]);
  console.log('covers', n, 'errs', errs.slice(0, 5));
  const el = await pg.$('body > div:last-child');
  await el.screenshot({ path: OUT + out + '.jpg', quality: 82 });
  await b.close();
})();
