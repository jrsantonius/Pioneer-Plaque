<?php
/**
 * Hapus pesanan Imazine yang belum dibayar dan sudah lewat batas waktu (beserta foto aslinya).
 * Pesanan lunas tidak pernah disentuh.
 *
 * Jalankan lewat cron (cPanel > Cron Jobs), misalnya tiap 15 menit:
 *   *\/15 * * * * php /home/AKUN/public_html/includes/imazine-purge-cron.php
 * Tanpa cron pun pembersihan tetap berjalan saat ada pesanan baru atau admin dibuka.
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/imazine.php';
$n = imzPurgeStale();
echo date('c'), " dihapus: $n pesanan\n";
