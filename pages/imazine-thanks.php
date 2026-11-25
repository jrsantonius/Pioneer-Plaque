<?php
/**
 * Imazine - tujuan "Redirect URL" produk Mayar setelah pembeli membayar.
 * Link Mayar sama untuk semua pembeli, jadi nomor pesanan tidak ikut di URL: browser pembeli menyimpannya
 * (localStorage) sebelum pindah ke Mayar, lalu halaman ini membawanya ke status pesanannya.
 * Tanpa data itu (browser lain, data dihapus), tetap tampil ucapan terima kasih.
 */
require_once __DIR__ . '/../includes/imazine.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
?><!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Terima kasih - Imazine</title>
<style>
  :root { --bg:#0c0a09; --ink:#f4ede4; --ink2:#b9ada0; --line:#2a2420; --accent:#cf7a3c; --accent-ink:#1a0f06; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; min-height:100dvh; display:grid; place-items:center; padding:max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)); background:var(--bg); color:var(--ink); font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { width:min(100%,480px); }
  .logo { font:italic 28px Georgia,serif; margin:0 0 28px; } .logo b { font:700 28px/1 sans-serif; font-style:normal; }
  .card { border:1px solid var(--line); border-radius:16px; padding:28px 24px; background:#13100e; }
  .eyebrow { margin:0 0 8px; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); }
  h1 { margin:0 0 12px; font:400 30px/1.15 Georgia,serif; } p { margin:0 0 16px; color:var(--ink2); }
  .btn { display:inline-block; padding:14px 26px; border-radius:999px; background:var(--accent); color:var(--accent-ink); font-weight:600; text-decoration:none; }
  @media (min-width:700px) { main { width:min(100%,520px); } h1 { font-size:34px; } .card { padding:36px 32px; } }
  @media (max-width:420px) { .card { padding:24px 18px; } h1 { font-size:26px; } .btn { display:block; text-align:center; } }
</style>
</head>
<body>
<main>
  <p class="logo">ima<b>zine</b></p>
  <div class="card">
    <p class="eyebrow">Pembayaran diterima</p>
    <h1>Terima kasih.</h1>
    <p>Albummu sedang kami siapkan untuk dicetak. Nomor resi JNE dan kabar pengiriman kamu terima dari Mayar lewat WhatsApp dan email.</p>
    <a class="btn" href="/imazine">Ke beranda Imazine</a>
  </div>
</main>
<script>
(function () {
  try {
    if (window.top !== window.self) { try { window.top.location.replace(location.href); return; } catch (e) { /* bukan dari Imazine */ } }
    var last = JSON.parse(localStorage.getItem('imz_last') || 'null');
    if (last && /^IMZ-[A-Z0-9]{6}$/.test(last.no) && /^[a-f0-9]{32}$/.test(last.t)) {
      location.replace('/imazine/pesanan/' + last.no + '?t=' + last.t);
    }
  } catch (e) { /* tanpa localStorage: ucapan terima kasih di atas sudah cukup */ }
})();
</script>
</body>
</html>
