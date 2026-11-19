// Real-file path: EXIF dates, name dates, broken file, captions, swap, clear+undo, change of style.
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = path.join(__dirname, 'testphotos') + path.sep; const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/api/imazine/config', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));   // no PHP on the test server
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/dist/test.html'); await pg.waitForTimeout(500);
  await pg.click('#home-cats .cat >> nth=1');                       // Event, straight from the home card
  await pg.waitForTimeout(500); ok(await pg.textContent('#setup-h') === 'Pilih sampul albummu.', 'home card opens the cover step');
  await pg.click('#setup-next'); await pg.waitForTimeout(300);
  await pg.click('.styles .pick >> nth=1'); await pg.click('#setup-next'); await pg.waitForTimeout(300);
  const files = fs.readdirSync(DIR).map(f => path.join(DIR, f));
  await pg.setInputFiles('#file-first', files);
  await pg.waitForSelector('[data-view="studio"]:not([hidden])', { timeout: 60000 }); await pg.waitForTimeout(700);
  const toast1 = await pg.textContent('#toast-t'); console.log('  toast:', toast1);
  ok(/16 foto terpasang/.test(toast1) && /1 foto lain tidak bisa dibuka/.test(toast1), 'broken file reported, 16 placed');
  ok(await pg.textContent('#tray-n') === '16', 'tray holds 16 photos');
  const dates = await pg.$$eval('#tray .th-date', n => n.map(x => x.textContent));
  console.log('  tray dates:', dates.join(' | '));
  ok(dates[0] === '5 Jan', 'WhatsApp-style file name gives 5 Jan and sorts first');
  ok(dates.length === 15, 'PNG without any date has no date label');
  // captions on visible + following pages
  let caps = [];
  for (let i = 0; i < 4; i++) { caps = caps.concat(await pg.$$eval('#spread .cp:not(.is-empty)', n => n.map(x => x.textContent))); await pg.click('#pg-next'); await pg.waitForTimeout(120); }
  console.log('  captions:', caps.slice(0, 8).join(' | '));
  ok(caps.some(c => /^\d{1,2} (Jan|Mar|Apr|Mei) 2026$/.test(c)), 'photo dates fill the caption lines');
  await pg.screenshot({ path: OUT + 'upload-captions.jpg', quality: 75 });
  // caption editing through the slot tool
  const withCap = await pg.evaluate(() => { const c = document.querySelector('#spread .cp:not(.is-empty)'); return c ? { p: c.closest('.pg').dataset.p, i: c.dataset.cp } : null; });
  if (withCap) {
    await pg.click(`#spread .pg[data-p="${withCap.p}"] .cp[data-cp="${withCap.i}"]`, { force: true }); await pg.waitForTimeout(150);
    ok(await pg.getAttribute('#tab-teks', 'aria-selected') === 'true', 'clicking a caption opens the Teks tab');
    const f = pg.locator('#text-fields .tf.is-sel .in'); const before = await f.inputValue();
    await f.fill('Makan siang bareng'); await pg.waitForTimeout(100);
    ok((await pg.textContent(`#spread .pg[data-p="${withCap.p}"] .cp[data-cp="${withCap.i}"]`)) === 'Makan siang bareng', 'typed caption shows on the page (was "' + before + '")');
  }
  // swap two photos
  await pg.click('#pg-prev'); await pg.waitForTimeout(150);
  const slots = pg.locator('#spread .slot:not(.is-empty)');
  if (await slots.count() >= 2) {
    const src0 = await slots.nth(0).locator('img').getAttribute('src'), src1 = await slots.nth(1).locator('img').getAttribute('src');
    await slots.nth(0).click(); await pg.click('#slot-swap'); ok(!(await pg.isHidden('#st-hint')), 'swap hint appears');
    await slots.nth(1).click(); await pg.waitForTimeout(150);
    const a0 = await pg.locator('#spread .slot').nth(0).locator('img').getAttribute('src');
    ok(a0 === src1 && src0 !== src1, 'photos swapped');
    // keyboard pan
    const s0 = pg.locator('#spread .slot:not(.is-empty)').first(); await s0.focus(); const l0 = await s0.locator('img').evaluate(i => i.style.left + i.style.top);
    await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowDown'); const l1 = await s0.locator('img').evaluate(i => i.style.left + i.style.top);
    ok(l0 !== l1, 'arrow keys move the photo inside its frame');
    // clear + undo
    await s0.click(); const filled0 = await pg.textContent('#st-filled'); await pg.click('#slot-clear'); await pg.waitForTimeout(120);
    ok(+(await pg.textContent('#st-filled')) === +filled0 - 1, 'clear empties the slot');
    await pg.click('#toast-a'); await pg.waitForTimeout(120); ok(await pg.textContent('#st-filled') === filled0, 'undo restores it');
  }
  // armed photo → slot
  await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape');
  await pg.click('#tab-foto'); await pg.click('#tray .th >> nth=3'); ok(!(await pg.isHidden('#st-hint')), 'picking a tray photo first shows the "choose a slot" hint');
  await pg.locator('#spread .slot').first().click(); await pg.waitForTimeout(120); ok(await pg.isHidden('#st-hint'), 'placing ends the hint');
  // gate + add more photos
  await pg.click('#st-preview'); await pg.waitForTimeout(250);
  const title = await pg.textContent('#dlg-h'); console.log('  dialog:', title); ok(/Minimal 20 foto/.test(title), 'preview is gated below the 20-photo minimum');
  await pg.keyboard.press('Escape'); ok(await pg.isHidden('#dlg'), 'Escape closes the dialog');
  ok(await pg.evaluate(() => document.activeElement.id) === 'st-preview', 'focus returns to the trigger');
  await pg.setInputFiles('#file-more', files.slice(0, 5)); await pg.waitForTimeout(2500);
  console.log('  toast:', await pg.textContent('#toast-t'));
  ok(await pg.textContent('#tray-n') === '21', 'five more photos added');
  await pg.click('#st-preview'); await pg.waitForTimeout(250);
  ok(/bingkai.foto.masih.kosong/.test(await pg.textContent('#dlg-h')), 'with 20+ photos, preview is still gated while slots are empty');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  // change style with edits → confirm dialog
  await pg.click('#st-back'); await pg.waitForTimeout(400); await pg.click('.styles .pick >> nth=3'); await pg.click('#setup-next'); await pg.waitForTimeout(250);
  ok(/Ganti.ke.gaya.Chapter.Spread/.test(await pg.textContent('#dlg-h')), 'changing style after edits asks first');
  await pg.click('#dlg-a .btn >> nth=0'); await pg.waitForTimeout(700);
  ok(/Chapter Spread/.test(await pg.textContent('#st-meta')), 'new style applied, photos kept: ' + (await pg.textContent('#st-filled')) + '/' + (await pg.textContent('#st-total')));
  await pg.click('#st-note-fill'); await pg.waitForTimeout(300);
  ok(await pg.textContent('#st-filled') === await pg.textContent('#st-total'), 'fill-with-existing completes the album');
  await pg.click('#st-preview'); await pg.waitForTimeout(900); ok(!(await pg.isHidden('[data-view="preview"]')), 'preview opens once every slot is filled');
  await pg.screenshot({ path: OUT + 'upload-preview-cover.jpg', quality: 75 });
  for (let i = 0; i < 3; i++) await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: OUT + 'upload-preview-spread.jpg', quality: 75 });
  console.log('errors:', errs.length, errs.slice(0, 4));
  await b.close();
})().catch(e => { console.error('DRIVER FAIL', e.message.split('\n').slice(0, 8).join('\n')); process.exit(1); });
