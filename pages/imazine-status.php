<?php
/**
 * Imazine - halaman status pesanan untuk pembeli.
 * Dibuka dari redirect Mayar setelah bayar, atau dari link yang kami kirim.
 * Variabel: $imzOrderNo (sudah divalidasi pola IMZ-XXXXXX).
 */
require_once __DIR__ . '/../includes/imazine.php';

$token = is_string($_GET['t'] ?? null) ? $_GET['t'] : '';
$order = imzOrder($imzOrderNo);
$ok = imzTokenOk($order, $token);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');
header('X-Robots-Tag: noindex');
if (!$ok) http_response_code(404);
?><!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title data-t="title_status">Status pesanan Imazine</title>
<link rel="icon" type="image/png" sizes="64x64" href="/public/images/tis-icon-64.png"><link rel="apple-touch-icon" href="/public/images/tis-icon-180.png">
<style>
  :root { --bg:#0c0a09; --ink:#f4ede4; --ink2:#b9ada0; --line:#2a2420; --accent:#cf7a3c; --accent-ink:#1a0f06; --ok:#7fc58f; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body { margin:0; min-height:100vh; min-height:100dvh; display:grid; place-items:center; padding:max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)); background:var(--bg); color:var(--ink); font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { width:min(100%,480px); }
  .logo { font:italic 28px Georgia,serif; letter-spacing:.01em; margin:0 0 28px; } .logo b { font:700 28px/1 sans-serif; font-style:normal; }
  .card { border:1px solid var(--line); border-radius:16px; padding:28px 24px; background:#13100e; }
  .eyebrow { margin:0 0 8px; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); }
  h1 { margin:0 0 12px; font:400 30px/1.15 Georgia,serif; }
  p { margin:0 0 16px; color:var(--ink2); }
  dl { margin:20px 0 0; display:grid; gap:10px; font-size:15px; }
  dl div { display:flex; justify-content:space-between; gap:16px; border-top:1px solid var(--line); padding-top:10px; }
  dt { color:var(--ink2); } dd { margin:0; text-align:right; }
  .btn { display:inline-block; margin-top:6px; padding:14px 26px; border-radius:999px; background:var(--accent); color:var(--accent-ink); font-weight:600; text-decoration:none; }
  .ok { color:var(--ok); }
  .pulse { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent); margin-right:8px; animation:p 1.2s ease-in-out infinite; }
  @keyframes p { 50% { opacity:.25; } }
  @media (prefers-reduced-motion: reduce) { .pulse { animation:none; } }
  @media (min-width:700px) { main { width:min(100%,520px); } h1 { font-size:34px; } .card { padding:36px 32px; } }
  @media (max-width:420px) { .card { padding:24px 18px; } h1 { font-size:26px; } .btn { display:block; text-align:center; } }
</style>
<script>
/* Bahasa mengikuti pilihan pembeli di /imazine (localStorage "imz-lang" atau ?lang=id|en), sama seperti halaman utama. */
var IMZ_LANG = (function () { try { var q = new URLSearchParams(location.search).get('lang'); if (q === 'id' || q === 'en') return q; return localStorage.getItem('imz-lang') === 'id' ? 'id' : 'en'; } catch (e) { return 'en'; } })();
var IMZ_W = {
  en: {
    title_status: 'Imazine order status', title_thanks: 'Thank you - Imazine',
    nf_eyebrow: 'Order not found', nf_h: 'This link is no longer valid.',
    nf_p: 'Unpaid orders are deleted automatically after {h} hours. If that is what happened, make your album again. If you already paid, message our team on WhatsApp with the name and email you used.',
    home: 'Back to Imazine', checking: 'Checking your order…', wait: 'One moment.',
    l_no: 'Order number', l_cover: 'Cover', l_qty: 'Quantity', l_total: 'Album price', l_paid: 'Paid (incl. shipping)', l_unpaid: 'Album price (excl. shipping)', qty: '{n} album',
    sent_eyebrow: 'Album sent', thanks_name: 'Thank you, {name}.', thanks: 'Thank you.',
    sent_msg: 'We have received your album and all your photos. Our team will contact you on WhatsApp to confirm and arrange delivery.',
    paid_eyebrow: 'Payment received', paid_msg: 'We are getting your album ready for print. Once it ships, you will get the JNE tracking number.',
    wait_eyebrow: 'Waiting for payment', wait_h: 'No payment yet.',
    wait_msg: 'If you just paid, this page updates by itself in a moment. If not, finish your payment{within}', within: ' within {t}. After that, your order is deleted and you will need to make your album again.', dot: '.',
    hm: '{h} h {m} min', m: '{m} min', pay: 'Continue to payment',
    inc_eyebrow: 'Order not finished', inc_h: 'Your order was not fully sent.', inc_msg: 'Your photos did not finish uploading. Open Imazine again and send your album again.', back: 'Back to Imazine',
    err_h: 'We could not load your order status.', err_msg: 'Check your internet connection, then refresh this page.'
  },
  id: {
    title_status: 'Status pesanan Imazine', title_thanks: 'Makasih - Imazine',
    nf_eyebrow: 'Pesanan nggak ketemu', nf_h: 'Link ini udah nggak berlaku.',
    nf_p: 'Pesanan yang belum dibayar otomatis dihapus setelah {h} jam. Kalau itu yang terjadi, bikin albummu lagi dari awal, ya. Kalau kamu udah bayar, chat tim kami lewat WhatsApp dan sebutin nama serta email yang kamu pakai.',
    home: 'Ke beranda Imazine', checking: 'Lagi ngecek pesananmu…', wait: 'Sebentar, ya.',
    l_no: 'Nomor pesanan', l_cover: 'Cover', l_qty: 'Jumlah', l_total: 'Harga album', l_paid: 'Dibayar (termasuk ongkir)', l_unpaid: 'Harga album (belum termasuk ongkir)', qty: '{n} album',
    sent_eyebrow: 'Album terkirim', thanks_name: 'Makasih, {name}!', thanks: 'Makasih!',
    sent_msg: 'Album dan semua fotomu udah kami terima. Tim kami bakal ngehubungin kamu lewat WhatsApp buat konfirmasi dan pengiriman.',
    paid_eyebrow: 'Pembayaran diterima', paid_msg: 'Albummu lagi kami siapin buat dicetak. Begitu dikirim, kamu bakal dapat nomor resi JNE-nya.',
    wait_eyebrow: 'Menunggu pembayaran', wait_h: 'Belum ada pembayaran masuk.',
    wait_msg: 'Kalau kamu baru aja bayar, halaman ini bakal berubah sendiri sebentar lagi. Kalau belum, lanjutin pembayarannya{within}', within: ' dalam {t} lagi. Lewat dari itu, pesananmu dihapus dan albummu harus dibikin ulang.', dot: '.',
    hm: '{h} jam {m} menit', m: '{m} menit', pay: 'Lanjut bayar',
    inc_eyebrow: 'Pesanan belum selesai', inc_h: 'Pesananmu belum kekirim semua.', inc_msg: 'Fotomu belum selesai di-upload. Buka Imazine lagi, terus kirim ulang albummu.', back: 'Balik ke Imazine',
    err_h: 'Status pesananmu belum bisa dimuat.', err_msg: 'Cek koneksi internetmu, terus refresh halaman ini.'
  }
};
function tr(k, p) { var s = (IMZ_W[IMZ_LANG] || IMZ_W.en)[k] || k; return p ? s.replace(/\{(\w+)\}/g, function (m, n) { return p[n] != null ? p[n] : m; }) : s; }
function trPage() { document.documentElement.lang = IMZ_LANG; Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { el.textContent = tr(el.getAttribute('data-t'), el.dataset.h ? { h: el.dataset.h } : null); }); var tt = document.querySelector('title[data-t]'); if (tt) document.title = tr(tt.getAttribute('data-t')); }
</script>
</head>
<body>
<main>
  <p class="logo">ima<b>zine</b></p>
<?php if (!$ok): ?>
  <div class="card">
    <p class="eyebrow" data-t="nf_eyebrow">Pesanan nggak ketemu</p>
    <h1 data-t="nf_h">Link ini udah nggak berlaku.</h1>
    <p data-t="nf_p" data-h="<?= (int) IMAZINE_PAY_MINUTES / 60 ?>">Pesanan yang belum dibayar otomatis dihapus setelah <?= (int) IMAZINE_PAY_MINUTES / 60 ?> jam.</p>
    <a class="btn" href="/imazine" data-t="home">Ke beranda Imazine</a>
  </div>
<script>trPage();</script>
<?php else: ?>
  <div class="card" id="card" aria-live="polite">
    <p class="eyebrow" id="eyebrow" data-t="checking">Lagi ngecek pesananmu…</p>
    <h1 id="title" data-t="wait">Sebentar, ya.</h1>
    <p id="msg"></p>
    <a class="btn" id="btn" href="#" hidden></a>
    <dl>
      <div><dt data-t="l_no">Nomor pesanan</dt><dd><?= e($imzOrderNo) ?></dd></div>
      <div><dt data-t="l_cover">Cover</dt><dd id="cover">-</dd></div>
      <div><dt data-t="l_qty">Jumlah</dt><dd id="qty">-</dd></div>
      <div><dt id="total-l" data-t="l_total">Harga album</dt><dd id="total">-</dd></div>
    </dl>
  </div>
<script>
trPage();
(function () {
  var NO = <?= json_encode($imzOrderNo) ?>, T = <?= json_encode($token) ?>, tries = 0;
  var $ = function (id) { return document.getElementById(id); };
  var rp = function (n) { return 'Rp' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  function show(s) {
    var first = s.name ? s.name.split(' ')[0] : '';
    $('cover').textContent = s.cover || '-'; $('qty').textContent = tr('qty', { n: s.qty }); $('total').textContent = s.paidAmount ? rp(s.paidAmount) : rp(s.total); $('total-l').textContent = tr(s.paidAmount ? 'l_paid' : 'l_unpaid');
    var btn = $('btn'); btn.hidden = true;
    if (s.noPay) {   /* mode tanpa pembayaran: album langsung masuk ke tim */
      $('total').parentNode.style.display = 'none';
      $('eyebrow').textContent = tr('sent_eyebrow'); $('eyebrow').className = 'eyebrow ok';
      $('title').textContent = first ? tr('thanks_name', { name: first }) : tr('thanks');
      $('msg').textContent = tr('sent_msg');
      btn.href = '/imazine'; btn.textContent = tr('home'); btn.hidden = false;
    } else if (s.status === 'lunas') {
      $('eyebrow').textContent = tr('paid_eyebrow'); $('eyebrow').className = 'eyebrow ok';
      $('title').textContent = first ? tr('thanks_name', { name: first }) : tr('thanks');
      $('msg').textContent = tr('paid_msg');
    } else if (s.status === 'menunggu_bayar') {
      $('eyebrow').innerHTML = '<span class="pulse"></span>'; $('eyebrow').appendChild(document.createTextNode(tr('wait_eyebrow')));
      $('title').textContent = tr('wait_h');
      var left = s.payBefore ? Math.max(0, s.payBefore * 1000 - Date.now()) : 0, hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000);
      $('msg').textContent = tr('wait_msg', { within: s.payBefore ? tr('within', { t: hh ? tr('hm', { h: hh, m: mm }) : tr('m', { m: mm }) }) : tr('dot') });
      if (s.payUrl) { btn.href = s.payUrl; btn.textContent = tr('pay'); btn.hidden = false; }
    } else {
      $('eyebrow').textContent = tr('inc_eyebrow');
      $('title').textContent = tr('inc_h');
      $('msg').textContent = tr('inc_msg');
      btn.href = '/imazine'; btn.textContent = tr('back'); btn.hidden = false;
    }
  }
  function poll() {
    fetch('/api/imazine/orders/' + NO + '/status?t=' + encodeURIComponent(T), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (s) { show(s); if (s.status === 'menunggu_bayar' && ++tries < 150) setTimeout(poll, 4000); })
      .catch(function () { $('title').textContent = tr('err_h'); $('msg').textContent = tr('err_msg'); });
  }
  poll();
})();
</script>
<?php endif; ?>
</main>
</body>
</html>
