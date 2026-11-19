// UI checklist audit of every state of the cover shelf at four widths (shelves scrolled into view, search, one shelf, empty, keyboard focus).
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright'); const fs = require('fs');
const AUDIT = fs.readFileSync(path.join(__dirname, 'audit.js'), 'utf8');
(async () => {
  const b = await chromium.launch(), all = {};
  for (const [tag, vp, scheme] of [['desk', { width: 1440, height: 900 }, 'light'], ['tab', { width: 820, height: 1100 }, 'dark'], ['mob', { width: 400, height: 860 }, 'light'], ['small', { width: 360, height: 700 }, 'dark']]) {
    const ctx = await b.newContext({ viewport: vp, colorScheme: scheme, hasTouch: tag !== 'desk' }), pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(AUDIT);
    await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(600);
    const run = async (name) => { await pg.waitForTimeout(250); const r = await pg.evaluate(() => __uiAudit({ touch: 44, skip: '.pg, pre, svg.cv' })); for (const k in r) for (const m of r[k]) ((all[k] = all[k] || {})[m] = (all[k][m] || []).concat(tag + ':' + name)); };
    for (const i of [0, 1, 2]) {
      await pg.click('#home-cats .cat >> nth=' + i); await pg.waitForTimeout(700); await run('top' + i);
      const n = await pg.locator('.shelf').count();
      for (let s = 0; s < n; s++) { await pg.evaluate(k => document.querySelectorAll('.shelf')[k].scrollIntoView({ block: 'center' }), s); await run('shelf' + i + s); }
      if (i === 0) {
        await pg.evaluate(() => scrollTo(0, 0)); await pg.fill('#cover-q', 'pantai'); await run('search');
        await pg.fill('#cover-q', 'zzz'); await run('empty'); await pg.fill('#cover-q', '');
        await pg.click('.seg-b >> nth=2'); await run('one-shelf'); await pg.evaluate(() => document.querySelector('.shelf:not([hidden])').scrollIntoView({ block: 'end' })); await run('one-shelf-end');
        await pg.click('.seg-b >> nth=0'); await pg.focus('.book[aria-checked="true"]'); await pg.keyboard.press('ArrowRight'); await run('keyboard');
      }
      await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(500);
    }
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(tag, 'errors', errs.length, errs.slice(0, 2), 'sideways', sw);
    await ctx.close();
  }
  let n = 0; for (const k in all) for (const m in all[k]) { n++; console.log(k, '|', m, '|', [...new Set(all[k][m])].slice(0, 5).join(',')); }
  console.log('findings', n); await b.close();
})();
