// v7 checks: the cover shelf (pick, search, shelf filter, keyboard, shelf scrolling) and the chosen cover in studio, preview, checkout and order.
// Usage: node tools/v7.js [light|dark|mobile|all]   (test page on :8765)
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
async function run(b, tag, vp, scheme, touch) {
  const ctx = await b.newContext({ viewport: vp, colorScheme: scheme, hasTouch: !!touch });
  await ctx.route('**/api/imazine/config', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));   // no PHP on the test server
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(700);
  ok(/36 sampul/.test(await pg.textContent('#home-cats .cat >> nth=0')), tag + ' home card counts 36 Travel covers');
  await pg.click('#home-cats .cat >> nth=0'); await pg.waitForTimeout(700);
  const books = pg.locator('.book');
  ok(await books.count() === 36 && await pg.locator('.shelf').count() === 3, tag + ' Travel shows 36 covers on 3 shelves');
  ok(await pg.evaluate(() => document.querySelector('.cvs').getBoundingClientRect().right <= innerWidth + 1), tag + ' the cover step fits the screen width (body hides sideways overflow, so measure it)');
  ok(await pg.evaluate(() => document.querySelector('.shelf').dataset.g) === 'Cover Majalah' && await pg.locator('.shelf >> nth=0').locator('.book').count() === 5, tag + ' first shelf is Cover Majalah with 5 styles');
  ok((await pg.textContent('.cvp-nm')) === 'Bali 2026' && /Bali 2026/.test(await pg.textContent('#setup-pick')), tag + ' starts on the photo cover Bali 2026');
  ok(await pg.locator('.book[aria-checked="true"]').count() === 1 && await pg.locator('.book[tabindex="0"]').count() === 1, tag + ' one checked cover, one tab stop');
  await pg.screenshot({ path: OUT + tag + '-shelf.jpg', quality: 72 });
  await pg.screenshot({ path: OUT + tag + '-shelf-full.jpg', quality: 72, fullPage: true });
  // pick Yogyakarta
  await pg.click('.book[data-id="yogyakarta"]'); await pg.waitForTimeout(650);
  ok((await pg.textContent('.cvp-nm')) === 'Yogyakarta' && await pg.locator('.cvp-art svg.cv').count() === 1, tag + ' tapping Yogyakarta puts it large on top');
  ok(/Yogyakarta/.test(await pg.textContent('#setup-pick')) && await pg.getAttribute('.book[data-id="yogyakarta"]', 'aria-checked') === 'true', tag + ' footer and radio state follow');
  ok(/Terpilih/.test(await pg.textContent('.book[data-id="yogyakarta"] .book-st')), tag + ' the chosen cover says Terpilih under it');
  // search by motif and by name
  await pg.fill('#cover-q', 'sakura'); await pg.waitForTimeout(120);
  let vis = await pg.locator('.book:visible').count();
  ok(vis === 1 && await pg.locator('.book[data-id="jepang"]:visible').count() === 1, tag + ' search "sakura" finds Jepang by its motif');
  ok(await pg.locator('.cvs.is-grid').count() === 1 && /1 sampul cocok/.test(await pg.textContent('.find-n')), tag + ' search lays out a grid and reports the count');
  await pg.fill('#cover-q', 'zzz'); await pg.waitForTimeout(120);
  ok(await pg.locator('.find-empty:visible').count() === 1, tag + ' no match shows the empty state');
  await pg.click('.find-empty .btn'); await pg.waitForTimeout(120);
  ok(await pg.locator('.book:visible').count() === 36 && (await pg.inputValue('#cover-q')) === '', tag + ' clearing the search brings every cover back');
  // shelf filter
  await pg.click('.seg-b >> nth=3'); await pg.waitForTimeout(150);
  ok(await pg.locator('.book:visible').count() === 18 && await pg.locator('.shelf:visible').count() === 1, tag + ' Mancanegara shelf alone shows 18');
  await pg.screenshot({ path: OUT + tag + '-grid.jpg', quality: 72 });
  await pg.click('.seg-b >> nth=0'); await pg.waitForTimeout(150);
  // keyboard
  await pg.focus('.book[aria-checked="true"]'); await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(120);
  ok((await pg.textContent('.cvp-nm')) === 'Bandung' && await pg.evaluate(() => document.activeElement.dataset.id) === 'bandung', tag + ' ArrowRight moves focus and choice to Bandung');
  await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(120);
  ok(await pg.evaluate(() => document.activeElement.closest('.shelf').dataset.g) === 'Mancanegara', tag + ' ArrowDown goes to the next shelf');
  await pg.keyboard.press('ArrowUp'); await pg.keyboard.press('Home'); await pg.waitForTimeout(120);
  ok((await pg.textContent('.cvp-nm')) === 'Majalah Noir', tag + ' Home goes back to the first cover (Majalah Noir)');
  // shelf scrolling (pointer layouts show arrows when a shelf overflows)
  if (!touch) {
    const nav = pg.locator('.shelf >> nth=1').locator('.shelf-go >> nth=1');
    if (await nav.isVisible()) { const x0 = await pg.evaluate(() => document.querySelectorAll('.shelf-row')[1].scrollLeft); await nav.click(); await pg.waitForTimeout(700); const x1 = await pg.evaluate(() => document.querySelectorAll('.shelf-row')[1].scrollLeft); ok(x1 > x0, tag + ' shelf arrow scrolls the row (' + x0 + ' → ' + Math.round(x1) + ')'); }
    else ok(false, tag + ' shelf arrows visible on a pointer layout');
  }
  // through the flow with Yogyakarta
  await pg.click('.book[data-id="yogyakarta"]'); await pg.waitForTimeout(650);
  await pg.click('#setup-next'); await pg.click('.styles .pick >> nth=2'); await pg.click('#setup-next'); await pg.click('#use-samples');
  await pg.waitForSelector('[data-view="studio"]:not([hidden])'); await pg.waitForTimeout(900);
  ok((await pg.textContent('#st-name')) === 'Yogyakarta', tag + ' studio is named after the chosen cover');
  await pg.click('#st-preview'); const dlg = await pg.locator('#dlg:not([hidden])').count(); if (dlg) { await pg.click('#dlg-a .btn >> nth=0'); await pg.waitForTimeout(150); await pg.click('#st-preview'); }
  await pg.waitForSelector('[data-view="preview"]:not([hidden])'); await pg.waitForTimeout(900);
  ok(await pg.locator('#pv-book svg.cv.pv-cover.is-front[aria-label="Sampul depan Yogyakarta"]').count() === 1 && (await pg.textContent('#pv-title')) === 'Yogyakarta', tag + ' preview opens on the stamp cover');
  await pg.screenshot({ path: OUT + tag + '-pv-cover.jpg', quality: 72 });
  let guard = 0; while (!(await pg.isDisabled('#pv-fwd')) && guard++ < 60) { await pg.click('#pv-fwd'); await pg.waitForTimeout(30); }
  await pg.waitForTimeout(900);
  ok(await pg.locator('#pv-book .pv-backc').count() === 1, tag + ' back cover is drawn in the stamp colour');
  await pg.screenshot({ path: OUT + tag + '-pv-back.jpg', quality: 72 });
  await pg.click('#pv-next'); await pg.waitForTimeout(700);
  ok(await pg.locator('#co-cover svg.cv').count() === 1 && (await pg.textContent('#co-name')) === 'Yogyakarta', tag + ' checkout shows the stamp cover');
  await pg.screenshot({ path: OUT + tag + '-checkout.jpg', quality: 72 });
  // the static test server has no PHP API: catch the order POST and answer it with an error so nothing leaves the page
  let order = null;
  await pg.route('**/api/imazine/orders', r => { order = JSON.parse(r.request().postData() || 'null'); r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"uji"}' }); });
  await pg.fill('#f-mail', 'fadhil@contoh.id');
  await pg.click('#co-pay'); await pg.waitForTimeout(900);
  order = order || {};
  errs.splice(0); // the 503 above is expected here
  ok(order.cover === 'yogyakarta' && order.coverName === 'Yogyakarta' && order.category === 'travel', tag + ' order carries the cover id and name');
  // event and slice of life shelves
  await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(600);
  for (const [i, n, sh] of [[1, 26, 4], [2, 24, 4]]) {
    await pg.click('#home-cats .cat >> nth=' + i); await pg.waitForTimeout(600);
    ok(await pg.locator('.book').count() === n && await pg.locator('.shelf').count() === sh, tag + ' theme ' + i + ' shows ' + n + ' covers on ' + sh + ' shelves');
    ok(await pg.evaluate(() => document.querySelector('.cvs').getBoundingClientRect().right <= innerWidth + 1), tag + ' theme ' + i + ' cover step fits the screen width');
    await pg.screenshot({ path: OUT + tag + '-shelf-' + i + '.jpg', quality: 72 });
    await pg.click('#setup-back'); await pg.waitForTimeout(300); await pg.click('#setup-back'); await pg.waitForTimeout(400);
  }
  ok(!errs.length, tag + ' no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await pg.context().close();
}
(async () => {
  const b = await chromium.launch(); const which = process.argv[2] || 'all';
  if (which === 'all' || which === 'light') await run(b, 'v7-light', { width: 1440, height: 900 }, 'light');
  if (which === 'all' || which === 'dark') await run(b, 'v7-dark', { width: 1440, height: 900 }, 'dark');
  if (which === 'all' || which === 'mobile') await run(b, 'v7-m', { width: 400, height: 860 }, 'light', true);
  await b.close(); console.log(fails ? fails + ' FAILED' : 'all passed');
})().catch(e => { console.error('FAIL', e.message.split('\n').slice(0, 8).join('\n')); process.exit(1); });
