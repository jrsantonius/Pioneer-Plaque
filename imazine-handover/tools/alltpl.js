// Every layout: sample photos in, page through the whole book in the editor and the preview, watch for errors.
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.route('**/api/imazine/config', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));   // no PHP on the test server
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  for (let c = 0; c < 3; c++) for (let l = 0; l < 4; l++) {
    await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(250);
    await pg.click(`#home-cats .cat >> nth=${c}`); await pg.click('#setup-next'); await pg.click(`.styles .pick >> nth=${l}`); await pg.click('#setup-next');
    await pg.click('#use-samples'); await pg.waitForSelector('[data-view="studio"]:not([hidden])'); await pg.waitForTimeout(300);
    const meta = await pg.textContent('#st-meta'), prog = (await pg.textContent('#st-filled')) + '/' + (await pg.textContent('#st-total'));
    let fields = 0, caps = 0;
    for (let i = 0; i < 21; i++) {
      await pg.click('#tab-teks'); fields += await pg.locator('#text-fields .in').count(); caps += await pg.locator('#spread .cp:not(.is-empty)').count();
      const tx = pg.locator('#spread [data-tx]').first(); if (i === 2 && await tx.count()) { await tx.click({ force: true }); await pg.keyboard.type('Uji teks'); await pg.keyboard.press('Enter'); }
      if (await pg.isDisabled('#pg-next')) break; await pg.click('#pg-next');
    }
    await pg.click('#tab-foto'); await pg.click('#st-note-fill'); await pg.click('#st-preview'); await pg.waitForSelector('[data-view="preview"]:not([hidden])');
    let views = 1; while (!(await pg.isDisabled('#pv-fwd'))) { await pg.click('#pv-fwd'); views++; }
    const over = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    console.log(meta.replace(' · A4 · 40 halaman', '').padEnd(32), prog.padEnd(7), 'fields', String(fields).padEnd(4), 'date captions', String(caps).padEnd(3), 'preview views', views, over ? 'OVERFLOW' : '', 'errs', errs.length);
  }
  console.log(errs.slice(0, 5));
  await b.close();
})().catch(e => { console.error('FAIL', e.message.split('\n').slice(0, 6).join('\n')); process.exit(1); });
