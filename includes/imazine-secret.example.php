<?php
// Salin ke storage/imazine-secret.php (folder storage/ di-gitignore dan diblokir .htaccess).
// JANGAN di-commit dan jangan tempel isinya ke chat.

// --- Produk fisik Mayar (dibuat SEKALI di dashboard Mayar) ---
// Dashboard Mayar > Produk > Produk Fisik: harga sama dengan IMAZINE_PRICE, isi berat dan ukuran paket,
// aktifkan kurir JNE di menu pengiriman. Alamat, ongkir, label, pickup, dan resi ditangani Mayar.
// Kolom isian kustom "Nomor Order" tidak diperlukan: hapus, atau jadikan opsional (jangan diwajibkan).
define('IMAZINE_MAYAR_URL', '');           // link checkout produk itu
define('IMAZINE_MAYAR_PRODUCT_ID', '');    // id produk, supaya produk Mayar lain (ebook) diabaikan

// Rahasia di URL webhook. Daftarkan di Mayar (Integration > Webhook):
//   https://DOMAINMU/api/imazine/webhook/<IMAZINE_WEBHOOK_TOKEN>
// Buat acak, minimal 16 karakter huruf/angka: php -r "echo bin2hex(random_bytes(16));"
define('IMAZINE_WEBHOOK_TOKEN', '');

// --- Halaman admin /imazine/admin ---
define('IMAZINE_ADMIN_PASSWORD', '');

// --- Notifikasi pesanan lunas dan pembayaran yang perlu dicek (email) ---
define('IMAZINE_NOTIFY_EMAIL', '');

// --- Opsional ---
// define('IMAZINE_PRICE', 250000);        // harga bayar per album (sama dengan harga produk di Mayar)
// define('IMAZINE_PRICE_NORMAL', 350000); // harga normal yang dicoret di web; 0 = tanpa harga coret
// define('IMAZINE_MIN_PHOTOS', 20);       // minimal foto per album
// define('IMAZINE_MAX_PHOTOS', 240);      // maksimal foto per album
// define('IMAZINE_PAY_MINUTES', 120);     // batas bayar; lewat dari ini pesanan yang belum dibayar dihapus
// define('IMAZINE_RATE_PER_HOUR', 60);    // pesanan baru per IP per jam; 0 = tanpa batas
// define('IMAZINE_BASE_URL', 'https://theinnovatorsstudio.id');
