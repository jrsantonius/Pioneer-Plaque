<?php
/**
 * Simulasi pembayaran Mayar untuk uji LOKAL (Mayar tidak bisa memanggil localhost).
 * Mengirim webhook "payment.received" tiruan ke server lokal, seperti yang akan dikirim Mayar.
 * Menolak berjalan kalau IMAZINE_BASE_URL bukan localhost, supaya tidak pernah memalsukan pembayaran di situs asli.
 *
 * Pakai:
 *   php includes/imazine-sim-bayar.php                      # pesanan menunggu bayar terbaru, pembayar = pemilik pesanan
 *   php includes/imazine-sim-bayar.php IMZ-ABC234           # pesanan tertentu
 *   php includes/imazine-sim-bayar.php --nama="Budi" --hp=0811111111   # nama dan HP yang "diketik pembeli di Mayar"
 *   php includes/imazine-sim-bayar.php --email=lain@x.com              # email BERBEDA dari pesanan (lihat antrean "perlu dicek")
 *   php includes/imazine-sim-bayar.php --nominal=400000
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/imazine.php';

if (!preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', imzBaseUrl())) {
    fwrite(STDERR, "Ditolak: IMAZINE_BASE_URL (" . imzBaseUrl() . ") bukan localhost. Alat ini hanya untuk uji lokal.\n");
    exit(1);
}
if (IMAZINE_WEBHOOK_TOKEN === '') { fwrite(STDERR, "IMAZINE_WEBHOOK_TOKEN kosong di storage/imazine-secret.php\n"); exit(1); }

$opt = []; $no = null;
foreach (array_slice($argv, 1) as $a) {
    if (preg_match('/^--([a-z]+)=(.*)$/', $a, $m)) $opt[$m[1]] = $m[2];
    elseif (preg_match('/^IMZ-[A-Z0-9]{6}$/i', $a)) $no = strtoupper($a);
}
$o = $no ? imzOrder($no) : (imzDb()->query("SELECT * FROM imazine_orders WHERE status = 'menunggu_bayar' ORDER BY id DESC LIMIT 1")->fetch() ?: null);
if (!$o) { fwrite(STDERR, "Tidak ada pesanan " . ($no ? "dengan nomor $no" : "yang menunggu bayar") . ". Buat pesanan dulu di http://localhost:8000/imazine sampai diarahkan ke Mayar.\n"); exit(1); }

$amount = (int) ($opt['nominal'] ?? ((int) $o['total'] + 25000));   // harga album + contoh ongkir
$payload = ['event' => 'payment.received', 'data' => [
    'id'            => 'sim-' . bin2hex(random_bytes(6)),
    'status'        => true,
    'productId'     => IMAZINE_MAYAR_PRODUCT_ID,
    'productName'   => 'Imazine Photo Album',
    'amount'        => $amount,
    'customerName'  => $opt['nama'] ?? ($o['name'] !== '' ? $o['name'] : 'Pembeli Uji'),
    'customerEmail' => $opt['email'] ?? $o['email'],
    'customerMobile'=> $opt['hp'] ?? ($o['whatsapp'] !== '' ? $o['whatsapp'] : '081234567890'),
]];
echo "Pesanan  : {$o['order_no']} ({$o['email']}, status {$o['status']})\n";
echo "Pembayar : {$payload['data']['customerName']} / {$payload['data']['customerEmail']} / {$payload['data']['customerMobile']}\n";
echo "Nominal  : " . imzRupiah($amount) . "\n\n";

$ch = curl_init(imzBaseUrl() . '/api/imazine/webhook/' . IMAZINE_WEBHOOK_TOKEN);
curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($payload)]);
$res = curl_exec($ch);
if ($res === false) { fwrite(STDERR, "Gagal menghubungi server lokal: " . curl_error($ch) . "\nPastikan server lokal jalan di " . imzBaseUrl() . "\n"); exit(1); }
echo "Jawaban webhook: $res\n";

$after = imzOrder($o['order_no']);
echo "Status pesanan sekarang: {$after['status']}" . ($after['paid_method'] ? " (cocok via {$after['paid_method']})" : '') . "\n";
$p = imzDb()->query("SELECT status, note FROM imazine_payments ORDER BY id DESC LIMIT 1")->fetch();
if ($p && $p['status'] === 'perlu_cek') echo "Masuk antrean 'perlu dicek': {$p['note']}\nBuka " . imzBaseUrl() . "/imazine/admin untuk mencocokkannya.\n";
echo "Halaman status pembeli: " . imzBaseUrl() . "/imazine/pesanan/{$o['order_no']}?t={$o['token']}\n";
