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
<title data-t="title_thanks">Terima kasih - Imazine</title>
<link rel="icon" type="image/png" sizes="64x64" href="/public/images/tis-icon-64.png"><link rel="apple-touch-icon" href="/public/images/tis-icon-180.png">
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
    title_status: 'Status pesanan Imazine', title_thanks: 'Terima kasih - Imazine',
    nf_eyebrow: 'Pesanan tidak ditemukan', nf_h: 'Tautan ini sudah tidak berlaku.',
    nf_p: 'Pesanan yang belum dibayar dihapus secara otomatis setelah {h} jam. Jika itu yang terjadi, silakan buat albummu kembali. Jika kamu sudah membayar, hubungi tim kami melalui WhatsApp dengan menyebutkan nama dan email yang kamu gunakan.',
    home: 'Ke beranda Imazine', checking: 'Memeriksa pesananmu…', wait: 'Mohon tunggu sebentar.',
    l_no: 'Nomor pesanan', l_cover: 'Cover', l_qty: 'Jumlah', l_total: 'Harga album', l_paid: 'Dibayar (termasuk ongkir)', l_unpaid: 'Harga album (belum termasuk ongkir)', qty: '{n} album',
    sent_eyebrow: 'Album terkirim', thanks_name: 'Terima kasih, {name}.', thanks: 'Terima kasih.',
    sent_msg: 'Album dan seluruh fotomu sudah kami terima. Tim kami akan menghubungimu melalui WhatsApp untuk konfirmasi dan pengiriman.',
    paid_eyebrow: 'Pembayaran diterima', paid_msg: 'Albummu sedang kami siapkan untuk dicetak. Setelah dikirim, kamu akan menerima nomor resi JNE.',
    wait_eyebrow: 'Menunggu pembayaran', wait_h: 'Belum ada pembayaran yang masuk.',
    wait_msg: 'Jika kamu baru saja membayar, halaman ini akan diperbarui secara otomatis. Jika belum, selesaikan pembayaranmu{within}', within: ' dalam {t}. Setelah itu, pesanan akan dihapus dan album perlu dibuat kembali.', dot: '.',
    hm: '{h} jam {m} menit', m: '{m} menit', pay: 'Lanjutkan pembayaran',
    inc_eyebrow: 'Pesanan belum selesai', inc_h: 'Pesananmu belum terkirim sepenuhnya.', inc_msg: 'Fotomu belum selesai diunggah. Buka Imazine kembali, lalu kirim ulang albummu.', back: 'Kembali ke Imazine',
    err_h: 'Status pesananmu belum dapat dimuat.', err_msg: 'Periksa koneksi internetmu, lalu muat ulang halaman ini.'
  }
};
function tr(k, p) { var s = (IMZ_W[IMZ_LANG] || IMZ_W.en)[k] || k; return p ? s.replace(/\{(\w+)\}/g, function (m, n) { return p[n] != null ? p[n] : m; }) : s; }
function trPage() { document.documentElement.lang = IMZ_LANG; Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { el.textContent = tr(el.getAttribute('data-t'), el.dataset.h ? { h: el.dataset.h } : null); }); var tt = document.querySelector('title[data-t]'); if (tt) document.title = tr(tt.getAttribute('data-t')); }
</script>
</head>
<body>
<main>
  <p class="logo">ima<b>zine</b></p>
  <div class="card">
    <p class="eyebrow" data-t="paid_eyebrow">Pembayaran diterima</p>
    <h1 data-t="thanks">Terima kasih.</h1>
    <p data-t="paid_msg">Albummu sedang kami siapkan untuk dicetak. Setelah dikirim, kamu akan menerima nomor resi JNE.</p>
    <a class="btn" href="/imazine" data-t="home">Ke beranda Imazine</a>
  </div>
<script>trPage();</script>
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
