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
<title>Status pesanan Imazine</title>
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
</head>
<body>
<main>
  <p class="logo">ima<b>zine</b></p>
<?php if (!$ok): ?>
  <div class="card">
    <p class="eyebrow">Pesanan tidak ditemukan</p>
    <h1>Link ini sudah tidak berlaku.</h1>
    <p>Pesanan yang belum dibayar dihapus otomatis setelah <?= (int) IMAZINE_PAY_MINUTES / 60 ?> jam. Kalau itu yang terjadi, buat albummu lagi dari awal. Kalau kamu sudah membayar, hubungi tim kami lewat WhatsApp dengan menyebut nama dan email yang kamu pakai.</p>
    <a class="btn" href="/imazine">Ke beranda Imazine</a>
  </div>
<?php else: ?>
  <div class="card" id="card" aria-live="polite">
    <p class="eyebrow" id="eyebrow">Mengecek pesananmu…</p>
    <h1 id="title">Sebentar ya.</h1>
    <p id="msg"></p>
    <a class="btn" id="btn" href="#" hidden></a>
    <dl>
      <div><dt>Nomor pesanan</dt><dd><?= e($imzOrderNo) ?></dd></div>
      <div><dt>Cover</dt><dd id="cover">-</dd></div>
      <div><dt>Jumlah</dt><dd id="qty">-</dd></div>
      <div><dt id="total-l">Harga album</dt><dd id="total">-</dd></div>
    </dl>
  </div>
<script>
(function () {
  var NO = <?= json_encode($imzOrderNo) ?>, T = <?= json_encode($token) ?>, tries = 0;
  var $ = function (id) { return document.getElementById(id); };
  var rp = function (n) { return 'Rp' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  function show(s) {
    $('cover').textContent = s.cover || '-'; $('qty').textContent = s.qty + ' album'; $('total').textContent = s.paidAmount ? rp(s.paidAmount) : rp(s.total); $('total-l').textContent = s.paidAmount ? 'Dibayar (termasuk ongkir)' : 'Harga album (belum termasuk ongkir)';
    var btn = $('btn'); btn.hidden = true;
    if (s.noPay) {   /* mode tanpa pembayaran: album langsung masuk ke tim */
      $('total').parentNode.style.display = 'none';
      $('eyebrow').textContent = 'Album terkirim'; $('eyebrow').className = 'eyebrow ok';
      $('title').textContent = s.name ? 'Terima kasih, ' + s.name.split(' ')[0] + '.' : 'Terima kasih.';
      $('msg').textContent = 'Album dan semua fotomu sudah kami terima. Tim kami akan menghubungimu lewat WhatsApp untuk konfirmasi dan pengiriman.';
      btn.href = '/imazine'; btn.textContent = 'Ke beranda Imazine'; btn.hidden = false;
    } else if (s.status === 'lunas') {
      $('eyebrow').textContent = 'Pembayaran diterima'; $('eyebrow').className = 'eyebrow ok';
      $('title').textContent = s.name ? 'Terima kasih, ' + s.name.split(' ')[0] + '.' : 'Terima kasih.';
      $('msg').textContent = 'Albummu sedang kami siapkan untuk dicetak. Nomor resi JNE dan kabar pengirimannya akan kamu terima lewat WhatsApp dan email.';
    } else if (s.status === 'menunggu_bayar') {
      $('eyebrow').innerHTML = '<span class="pulse"></span>Menunggu pembayaran';
      $('title').textContent = 'Belum ada pembayaran masuk.';
      var left = s.payBefore ? Math.max(0, s.payBefore * 1000 - Date.now()) : 0, hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000);
      $('msg').textContent = 'Kalau kamu baru saja membayar, halaman ini akan berubah sendiri dalam beberapa saat. Kalau belum, lanjutkan pembayarannya' + (s.payBefore ? ' dalam ' + (hh ? hh + ' jam ' : '') + mm + ' menit lagi. Setelah itu pesananmu dihapus dan albummu perlu dibuat ulang.' : '.');
      if (s.payUrl) { btn.href = s.payUrl; btn.textContent = 'Lanjut bayar'; btn.hidden = false; }
    } else {
      $('eyebrow').textContent = 'Pesanan belum selesai';
      $('title').textContent = 'Pesananmu belum terkirim sepenuhnya.';
      $('msg').textContent = 'Fotomu belum selesai di-upload. Buka Imazine lagi, lalu kirim ulang albummu.';
      btn.href = '/imazine'; btn.textContent = 'Kembali ke Imazine'; btn.hidden = false;
    }
  }
  function poll() {
    fetch('/api/imazine/orders/' + NO + '/status?t=' + encodeURIComponent(T), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (s) { show(s); if (s.status === 'menunggu_bayar' && ++tries < 150) setTimeout(poll, 4000); })
      .catch(function () { $('title').textContent = 'Status pesananmu belum bisa dimuat.'; $('msg').textContent = 'Cek koneksi internetmu, lalu refresh halaman ini.'; });
  }
  poll();
})();
</script>
<?php endif; ?>
</main>
</body>
</html>
