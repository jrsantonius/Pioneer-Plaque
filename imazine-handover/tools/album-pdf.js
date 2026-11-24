// Cetak halaman album admin lokal ke PDF dengan Chromium (jalur cetak yang sama dengan "Simpan sebagai PDF" di Chrome).
// Pakai: node tools/album-pdf.js IMZ-XXXXXX out.pdf [base=http://localhost:8000]
// Cookie admin lokal dibuat dari storage/imazine-secret.php lewat php CLI (hanya untuk server lokal).
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
(async () => {
  const [no, out, base = 'http://localhost:8000'] = process.argv.slice(2);
  const root = path.resolve(__dirname, '../..');
  const ck = execFileSync('php', ['-r', 'require "storage/imazine-secret.php"; $ts=(string)time(); echo $ts.".".hash_hmac("sha256","imazine-admin|".$ts, IMAZINE_ADMIN_PASSWORD."|".IMAZINE_WEBHOOK_TOKEN);'], { cwd: root }).toString();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: 'imz_admin', value: ck, url: base + '/imazine/admin' }]);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('pageerror', e.message));
  await page.goto(base + '/imazine/admin/pesanan/' + no + '/album');
  await page.waitForFunction(() => !document.querySelector('#save').disabled || !document.querySelector('#warn').hidden, null, { timeout: 180000 });
  console.log(await page.textContent('#prog'), '|', await page.textContent('#warn'));
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log('saved', out);
})();
