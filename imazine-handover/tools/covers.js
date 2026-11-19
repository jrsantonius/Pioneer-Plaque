
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright'); const fs = require('fs');
const AUDIT = fs.readFileSync(path.join(__dirname, 'audit.js'), 'utf8');
(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 400, height: 860 }]]) {
    const pg = await (await b.newContext({ viewport: vp })).newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.addInitScript(AUDIT);
    await pg.goto(BASE + '/dist/covers-test.html'); await pg.waitForTimeout(800);
    const all = {}; const run = async () => { const r = await pg.evaluate(() => __uiAudit({ touch: 44 })); for (const k in r) for (const m of r[k]) (all[k] = all[k] || new Set()).add(m); };
    for (const y of [0, 600, 1500, 3200]) { await pg.evaluate(v => scrollTo(0, v), y); await pg.waitForTimeout(120); await run(); }
    await pg.screenshot({ path: OUT + 'covers-' + name + '.jpg', quality: 72 });
    await pg.click('.open >> nth=14'); await pg.waitForTimeout(350); await run();
    const t1 = await pg.textContent('#lb-h'); await pg.keyboard.press('ArrowRight'); const t2 = await pg.textContent('#lb-h');
    await pg.screenshot({ path: OUT + 'covers-' + name + '-lb.jpg', quality: 72 });
    await pg.keyboard.press('Escape'); const closed = await pg.isHidden('#lb');
    await pg.click('.tab >> nth=2'); await pg.waitForTimeout(150); const vis = await pg.locator('.cat:not([hidden])').count();
    console.log(name, 'errs', errs.length, 'lightbox', t1, '→', t2, 'closed', closed, 'filtered cats', vis, 'covers', await pg.locator('svg.cv').count(), JSON.stringify(Object.fromEntries(Object.entries(all).map(([k, v]) => [k, [...v].slice(0, 5)]))).slice(0, 700));
  }
  await b.close();
})();
