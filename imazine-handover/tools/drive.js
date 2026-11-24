// Drives the whole flow, takes screenshots, runs the UI audit on every state.
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
const fs = require('fs');
const AUDIT = fs.readFileSync(path.join(__dirname, 'audit.js'), 'utf8');
fs.mkdirSync(OUT, { recursive: true });
const arg = process.argv[2] || 'desktop';
const VP = arg === 'small' ? { width: 360, height: 700 } : arg === 'mobile' ? { width: 400, height: 860 } : arg === 'tablet' ? { width: 820, height: 1100 } : { width: 1440, height: 900 };
const SHOTS = process.argv.includes('--shots');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, hasTouch: arg !== 'desktop' });
  // no PHP on the test server: config answers empty, the order POST is caught and refused so nothing leaves the page
  await ctx.route('**/api/imazine/config', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await ctx.route('**/api/imazine/orders', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"uji"}' }));
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error' && !/status of 503/.test(m.text())) errs.push('console: ' + m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.addInitScript(AUDIT);
  const findings = {};
  const cls = {};
  async function state(name, opts = {}) {
    await pg.waitForTimeout(140); await pg.evaluate(() => { __cls.v = 0; __cls.src = []; });
    await pg.waitForTimeout(opts.wait || 650);
    if (SHOTS) await pg.screenshot({ path: OUT + arg + '-' + name + '.jpg', quality: 70, fullPage: !!opts.full });
    const r = await pg.evaluate(() => { const o = __uiAudit({ touch: 44, skip: '.pg, pre' }); o.__cls = __cls.v; o.__src = __cls.src.slice(-4); __cls.v = 0; __cls.src = []; return o; });
    cls[name] = +r.__cls.toFixed(4); if (r.__cls > 0.02) cls[name + ' src'] = r.__src; delete r.__cls; delete r.__src;
    for (const k in r) for (const m of r[k]) { (findings[k] = findings[k] || {}); (findings[k][m] = findings[k][m] || []).push(name); }
  }
  await pg.goto(BASE + '/dist/test.html');
  await pg.waitForTimeout(900);
  await state('01-home', { full: true });
  if (arg !== 'desktop') { /* scroll through the home sections so every block is audited in view */ }
  for (const id of ['tema', 'cara-kerja', 'harga', 'tanya-jawab']) { await pg.evaluate(i => document.getElementById(i).scrollIntoView(), id); await state('01-home-' + id); }
  await pg.click('#tanya-jawab summary'); await state('01-home-faq-open');
  await pg.evaluate(() => scrollTo(0, 0));
  await pg.click('.hero [data-start]'); await state('02-tema');
  await pg.click('.pick-cat >> nth=0'); await state('03-sampul', { full: true });
  await pg.click('#setup-next'); await state('04-gaya', { full: true });
  await pg.click('.styles .pick >> nth=2'); await state('04-gaya-picked');
  await pg.click('#setup-next'); await state('05-foto', { full: true });
  await pg.click('#use-samples'); await pg.waitForSelector('[data-view="studio"]:not([hidden])'); await state('06-studio', { wait: 1500 });
  // select a filled slot, zoom, pan
  const slot = pg.locator('#spread .slot:not(.is-empty)').first();
  await slot.click(); await state('07-slot-selected');
  for (let i = 0; i < 4; i++) await pg.click('#ph-zin');   // zoom from the floating bar on the page
  const box = await slot.boundingBox();
  await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await pg.mouse.down(); await pg.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 30, { steps: 5 }); await pg.mouse.up();
  const sAfter = await pg.evaluate(() => JSON.stringify(Array.from(document.querySelectorAll('#spread .slot img')).slice(0, 1).map(i => [i.style.width, i.style.left, i.style.top])));
  console.log('pan/zoom img style', sAfter);
  await state('07b-zoomed');
  // go to a page with text, edit a title
  await pg.click('#pg-next'); await state('08-next-page');
  if (arg === 'mobile') { await pg.click('#tab-teks'); await state('08b-tab-teks'); await pg.click('#tab-hal'); await state('08c-tab-hal'); await pg.click('#tab-teks'); }
  const tx = pg.locator('#spread [data-tx]').first();
  if (await tx.count()) { await tx.click({ force: true }); await state('09-text-selected'); await pg.keyboard.type('Hari pertama di Ubud'); await pg.keyboard.press('Enter'); await state('09b-text-typed'); }
  // empty-slot gate
  await pg.click('#st-preview'); await state('10-dialog-empty');
  await pg.click('#dlg-a .btn >> nth=0'); await state('11-filled-toast');
  await pg.click('#st-preview'); await pg.waitForSelector('[data-view="preview"]:not([hidden])'); await state('12-preview-cover', { wait: 900 });
  await pg.click('#pv-fwd'); await state('13-preview-p1');
  await pg.click('#pv-fwd'); await state('14-preview-spread');
  await pg.click('#pv-next'); await state('15-checkout', { full: true });
  await pg.click('#co-pay'); await state('16-checkout-errors', { full: true });
  await pg.fill('#f-mail', 'fadhil@contoh.id');
  await pg.click('#co-pay'); await state('17-order-refused', { full: true });
  const out = {};
  for (const k of Object.keys(findings).sort((a, b) => parseInt(a) - parseInt(b))) out[k] = Object.entries(findings[k]).map(([m, s]) => m + '  @ ' + [...new Set(s)].slice(0, 4).join(',') + (s.length > 4 ? ' +' + (s.length - 4) : ''));
  fs.writeFileSync(OUT + arg + '-audit.json', JSON.stringify({ findings: out, cls, errs }, null, 1));
  let n = 0; for (const k in out) { n += out[k].length; }
  console.log(arg, 'findings', n, 'errors', errs.length, errs.slice(0, 6));
  console.log('cls>0.02', Object.entries(cls).filter(([k, v]) => typeof v === 'number' && v > 0.02));
  await b.close();
})().catch(e => { console.error('DRIVER FAIL', e.message.split('\n').slice(0, 6).join('\n')); process.exit(1); });
