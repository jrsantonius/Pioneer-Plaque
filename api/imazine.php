<?php
/**
 * Imazine API
 *
 * GET  /api/imazine/config                          harga dan batas foto
 * POST /api/imazine/orders                          buat pesanan (status draf)
 * PUT  /api/imazine/orders/{no}/photos/{idx}?t=     unggah satu foto asli (POST juga diterima, untuk hosting yang memblokir PUT)
 * PUT  /api/imazine/orders/{no}/cover/{render|photo}?t=  sampul majalah: render Full HD (JPEG) dan foto asli pembeli
 * POST /api/imazine/orders/{no}/checkout?t=         pesanan siap dibayar: beri link produk fisik Mayar dan batas bayar
 * GET  /api/imazine/orders/{no}/status?t=           status pesanan untuk halaman pembeli
 * POST /api/imazine/webhook/{token}                 notifikasi pembayaran dari Mayar
 */

require_once __DIR__ . '/../includes/imazine.php';

function imazineApi(string $uri, string $method): void {
    if ($uri === '/api/imazine/config' && $method === 'GET') {
        jsonResponse(['price' => IMAZINE_PRICE, 'maxQty' => IMAZINE_MAX_QTY, 'minPhotos' => IMAZINE_MIN_PHOTOS, 'maxPhotos' => IMAZINE_MAX_PHOTOS, 'payMinutes' => IMAZINE_PAY_MINUTES, 'payment' => (bool) IMAZINE_PAYMENT]);
    }
    if ($uri === '/api/imazine/orders' && $method === 'POST') imzCreateOrder();
    if (preg_match('#^/api/imazine/orders/(IMZ-[A-Z0-9]{6})/photos/(\d{1,3})$#', $uri, $m) && ($method === 'PUT' || $method === 'POST')) imzUploadPhoto($m[1], (int) $m[2]);
    if (preg_match('#^/api/imazine/orders/(IMZ-[A-Z0-9]{6})/cover/(render|photo)$#', $uri, $m) && ($method === 'PUT' || $method === 'POST')) imzUploadCover($m[1], $m[2]);
    if (preg_match('#^/api/imazine/orders/(IMZ-[A-Z0-9]{6})/checkout$#', $uri, $m) && $method === 'POST') imzCheckout($m[1]);
    if (preg_match('#^/api/imazine/orders/(IMZ-[A-Z0-9]{6})/status$#', $uri, $m) && $method === 'GET') imzStatus($m[1]);
    if (preg_match('#^/api/imazine/webhook/([A-Za-z0-9_-]{16,})$#', $uri, $m) && $method === 'POST') imzWebhook($m[1]);
    jsonResponse(['error' => 'Tidak ditemukan'], 404);
}

function imzBodyJson(int $maxBytes): array {
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) jsonResponse(['error' => 'Data terlalu besar'], 413);
    $j = json_decode($raw, true);
    if (!is_array($j)) jsonResponse(['error' => 'Data tidak valid'], 400);
    return $j;
}

function imzStr($v, int $max): string {
    return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
}

function imzCreateOrder(): void {
    $in = imzBodyJson(3 * 1024 * 1024);
    $c = is_array($in['customer'] ?? null) ? $in['customer'] : [];
    $p = is_array($in['product'] ?? null) ? $in['product'] : [];

    // Form hanya menanyakan email. Nama dan HP diambil dari Mayar setelah pembayaran (imzAdoptPayer).
    $name = imzStr($c['name'] ?? '', 100);
    $wa = preg_replace('/[^\d+]/', '', imzStr($c['whatsapp'] ?? '', 30));
    $email = imzStr($c['email'] ?? '', 150);
    $qty = (int) ($p['qty'] ?? 0);
    $photos = is_array($in['photos'] ?? null) ? array_values($in['photos']) : [];

    $err = [];
    if (!isValidEmail($email)) $err['email'] = 'Email belum benar';
    if (!IMAZINE_PAYMENT) {   // tanpa Mayar, nama dan WhatsApp diisi di form kita
        if (mb_strlen($name) < 2) $err['name'] = 'Nama belum diisi';
        if (strlen(preg_replace('/\D/', '', $wa)) < 9) $err['whatsapp'] = 'Nomor WhatsApp belum benar';
    }
    if ($qty < 1 || $qty > IMAZINE_MAX_QTY) $err['qty'] = 'Jumlah album tidak valid';
    if (count($photos) < IMAZINE_MIN_PHOTOS) $err['photos'] = 'Minimal ' . IMAZINE_MIN_PHOTOS . ' foto';
    elseif (count($photos) > IMAZINE_MAX_PHOTOS) $err['photos'] = 'Maksimal ' . IMAZINE_MAX_PHOTOS . ' foto';
    if ($err) jsonResponse(['error' => 'Data belum lengkap', 'fields' => $err], 422);

    imzPurgeStale();
    // Pembatasan laju: satu alamat IP tidak boleh membuat pesanan tanpa batas (mencegah disk penuh).
    $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|imazine');
    $cnt = imzDb()->prepare("SELECT COUNT(*) FROM imazine_orders WHERE ip_hash = ? AND created_at > datetime('now','localtime','-1 hour')");
    $cnt->execute([$ipHash]);
    if (IMAZINE_RATE_PER_HOUR > 0 && (int) $cnt->fetchColumn() >= IMAZINE_RATE_PER_HOUR) jsonResponse(['error' => 'Terlalu banyak pesanan dari jaringan ini. Coba lagi satu jam lagi.'], 429);
    $orderNo = imzNewOrderNo();
    $token = bin2hex(random_bytes(16));
    $unit = IMAZINE_PRICE;
    $total = $unit * $qty;   // harga album x jumlah, dihitung server (ongkir JNE dihitung Mayar sesuai alamat pembeli)

    // Simpan data pesanan apa adanya (tata letak, teks, fokus foto), tapi angka uang dari server.
    $in['orderNo'] = $orderNo;
    $in['createdAt'] = date('c');
    $in['product'] = ['size' => 'A4', 'pages' => 40, 'paper' => 'Art Paper 260 gsm', 'cover' => 'Softcover', 'binding' => 'Binding', 'unitPrice' => $unit, 'qty' => $qty, 'total' => $total];
    $in['customer']['whatsapp'] = $wa;
    unset($in['customer']['address']);   // alamat hanya ada di Mayar

    imzDb()->prepare('INSERT INTO imazine_orders
        (order_no, token, status, name, whatsapp, email, note, qty, unit_price, total, photo_count, cover_name, order_json, ip_hash, created_ts)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
        $orderNo, $token, 'draf', $name, $wa, $email, imzStr($c['note'] ?? '', 300),
        $qty, $unit, $total, count($photos), imzStr($in['coverName'] ?? '', 100), json_encode($in, JSON_UNESCAPED_UNICODE), $ipHash, time(),
    ]);
    jsonResponse(['orderNo' => $orderNo, 'token' => $token, 'photoCount' => count($photos), 'unitPrice' => $unit, 'total' => $total, 'payMinutes' => IMAZINE_PAY_MINUTES], 201);
}

function imzUploadPhoto(string $orderNo, int $idx): void {
    $o = imzOrder($orderNo);
    if (!imzTokenOk($o, $_GET['t'] ?? null)) jsonResponse(['error' => 'Tidak berhak'], 403);
    if ($o['status'] !== 'draf' && $o['status'] !== 'menunggu_bayar') jsonResponse(['error' => 'Pesanan sudah tidak menerima foto'], 409);
    if ($idx < 0 || $idx >= (int) $o['photo_count']) jsonResponse(['error' => 'Nomor foto di luar jumlah foto pesanan'], 422);

    // Alirkan body ke file sementara dengan batas ukuran.
    $dir = imzDataDir('orders/' . $orderNo . '/photos');
    $tmp = $dir . '/.tmp-' . $idx . '-' . bin2hex(random_bytes(4));
    $in = fopen('php://input', 'rb');
    $out = fopen($tmp, 'wb');
    $bytes = 0;
    while (!feof($in)) {
        $chunk = fread($in, 1 << 20);
        if ($chunk === false || $chunk === '') break;
        $bytes += strlen($chunk);
        if ($bytes > IMAZINE_MAX_PHOTO_BYTES) { fclose($in); fclose($out); @unlink($tmp); jsonResponse(['error' => 'Ukuran foto terlalu besar'], 413); }
        if (fwrite($out, $chunk) !== strlen($chunk)) { fclose($in); fclose($out); @unlink($tmp); imzLog('error.log', "tulis gagal (disk penuh?) $orderNo/$idx"); jsonResponse(['error' => 'Server gagal menyimpan foto. Coba lagi sebentar.'], 507); }
    }
    fclose($in); fclose($out);
    if ($bytes < 1) { @unlink($tmp); jsonResponse(['error' => 'File kosong'], 400); }
    // Sambungan yang putus di tengah unggahan menghasilkan file terpotong: tolak, jangan disimpan.
    $declared = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declared > 0 && $declared !== $bytes) { @unlink($tmp); jsonResponse(['error' => 'Unggahan terputus, coba lagi'], 400); }

    $kind = imzDetectImage($tmp);
    if (!$kind) { @unlink($tmp); jsonResponse(['error' => 'Format foto tidak didukung'], 415); }
    [$mime, $ext] = $kind;

    $stored = $idx . '.' . $ext;
    $old = imzDb()->prepare('SELECT stored_name FROM imazine_photos WHERE order_no = ? AND idx = ?');
    $old->execute([$orderNo, $idx]);
    $prev = $old->fetchColumn();
    if ($prev && $prev !== $stored) @unlink(imzPhotoPath($orderNo, $prev));
    if (!rename($tmp, imzPhotoPath($orderNo, $stored))) { @unlink($tmp); imzLog('error.log', "rename gagal $orderNo/$idx"); jsonResponse(['error' => 'Server gagal menyimpan foto. Coba lagi sebentar.'], 500); }

    $name = imzStr($_SERVER['HTTP_X_FILENAME'] ?? '', 200);
    $name = $name !== '' ? rawurldecode($name) : null;
    imzDb()->prepare('INSERT INTO imazine_photos (order_no, idx, original_name, stored_name, mime, bytes) VALUES (?,?,?,?,?,?)
        ON CONFLICT(order_no, idx) DO UPDATE SET original_name = excluded.original_name, stored_name = excluded.stored_name, mime = excluded.mime, bytes = excluded.bytes')
        ->execute([$orderNo, $idx, $name, $stored, $mime, $bytes]);
    jsonResponse(['ok' => true, 'idx' => $idx, 'bytes' => $bytes]);
}

function imzUploadCover(string $orderNo, string $kind): void {
    $o = imzOrder($orderNo);
    if (!imzTokenOk($o, $_GET['t'] ?? null)) jsonResponse(['error' => 'Tidak berhak'], 403);
    if ($o['status'] !== 'draf' && $o['status'] !== 'menunggu_bayar') jsonResponse(['error' => 'Pesanan sudah tidak menerima file'], 409);
    $info = json_decode((string) $o['order_json'], true);
    if (!is_array($info['magCover'] ?? null)) jsonResponse(['error' => 'Pesanan ini tidak memakai sampul majalah'], 422);

    $max = $kind === 'render' ? 20 * 1024 * 1024 : (int) IMAZINE_MAX_PHOTO_BYTES;
    $dir = imzDataDir('orders/' . $orderNo . '/cover');
    $tmp = $dir . '/.tmp-' . $kind . '-' . bin2hex(random_bytes(4));
    $in = fopen('php://input', 'rb');
    $out = fopen($tmp, 'wb');
    $bytes = 0;
    while (!feof($in)) {
        $chunk = fread($in, 1 << 20);
        if ($chunk === false || $chunk === '') break;
        $bytes += strlen($chunk);
        if ($bytes > $max) { fclose($in); fclose($out); @unlink($tmp); jsonResponse(['error' => 'Ukuran file sampul terlalu besar'], 413); }
        if (fwrite($out, $chunk) !== strlen($chunk)) { fclose($in); fclose($out); @unlink($tmp); imzLog('error.log', "tulis sampul gagal (disk penuh?) $orderNo/$kind"); jsonResponse(['error' => 'Server gagal menyimpan sampul. Coba lagi sebentar.'], 507); }
    }
    fclose($in); fclose($out);
    if ($bytes < 1) { @unlink($tmp); jsonResponse(['error' => 'File kosong'], 400); }
    $declared = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declared > 0 && $declared !== $bytes) { @unlink($tmp); jsonResponse(['error' => 'Unggahan terputus, coba lagi'], 400); }

    $kindInfo = imzDetectImage($tmp);
    if (!$kindInfo || ($kind === 'render' && $kindInfo[1] !== 'jpg')) { @unlink($tmp); jsonResponse(['error' => 'Format file sampul tidak didukung'], 415); }
    foreach (['jpg', 'png', 'webp', 'heic'] as $ext) @unlink($dir . '/' . $kind . '.' . $ext);   // ganti yang lama, apa pun ekstensinya
    if (!rename($tmp, $dir . '/' . $kind . '.' . $kindInfo[1])) { @unlink($tmp); imzLog('error.log', "rename sampul gagal $orderNo/$kind"); jsonResponse(['error' => 'Server gagal menyimpan sampul. Coba lagi sebentar.'], 500); }
    jsonResponse(['ok' => true, 'kind' => $kind, 'bytes' => $bytes]);
}

function imzCheckout(string $orderNo): void {
    $o = imzOrder($orderNo);
    if (!imzTokenOk($o, $_GET['t'] ?? null)) jsonResponse(['error' => 'Tidak berhak'], 403);
    if ($o['status'] === 'lunas') jsonResponse(['error' => 'Pesanan ini sudah dibayar'], 409);

    $have = array_column(imzPhotos($orderNo), 'idx');
    $missing = array_values(array_diff(range(0, (int) $o['photo_count'] - 1), array_map('intval', $have)));
    if ($missing) jsonResponse(['error' => 'Masih ada foto yang belum terunggah', 'missing' => $missing], 409);
    $info = json_decode((string) $o['order_json'], true);
    if (is_array($info['magCover'] ?? null) && (!imzCoverFile($orderNo, 'render') || !imzCoverFile($orderNo, 'photo'))) jsonResponse(['error' => 'Sampul majalah belum terunggah. Coba kirim lagi.', 'missing' => ['cover']], 409);
    if (!IMAZINE_PAYMENT) {   // pembayaran disembunyikan: album langsung masuk ke tim
        imzMarkSubmitted($orderNo);
        jsonResponse(['orderNo' => $orderNo, 'submitted' => true, 'next' => '/imazine/pesanan/' . $orderNo . '?t=' . $o['token']]);
    }
    if (IMAZINE_MAYAR_URL === '') jsonResponse(['error' => 'Pembayaran belum dikonfigurasi'], 503);

    // Batas bayar mulai dihitung dari checkout pertama. Checkout ulang tidak memperpanjangnya.
    $deadline = $o['pay_deadline'] ? (int) $o['pay_deadline'] : time() + (int) IMAZINE_PAY_MINUTES * 60;
    if ($deadline <= time() + 30) jsonResponse(['error' => 'Waktu pembayaran pesanan ini sudah habis. Buat albummu lagi dari awal.'], 410);
    imzDb()->prepare("UPDATE imazine_orders SET status = 'menunggu_bayar', pay_deadline = ?, updated_at = datetime('now','localtime') WHERE order_no = ? AND status IN ('draf','menunggu_bayar')")->execute([$deadline, $orderNo]);
    jsonResponse(['orderNo' => $orderNo, 'payUrl' => IMAZINE_MAYAR_URL, 'qty' => (int) $o['qty'], 'total' => (int) $o['total'], 'payBefore' => $deadline]);
}

function imzStatus(string $orderNo): void {
    $o = imzOrder($orderNo);
    if (!imzTokenOk($o, $_GET['t'] ?? null)) jsonResponse(['error' => 'Tidak berhak'], 403);
    jsonResponse([
        'orderNo' => $o['order_no'], 'status' => $o['status'], 'name' => $o['name'], 'cover' => $o['cover_name'],
        'qty' => (int) $o['qty'], 'total' => (int) $o['total'], 'noPay' => $o['paid_method'] === 'tanpa_bayar', 'paidAt' => $o['paid_at'], 'paidAmount' => $o['paid_amount'] !== null ? (int) $o['paid_amount'] : null,
        'payUrl' => $o['status'] === 'menunggu_bayar' && IMAZINE_MAYAR_URL !== '' ? IMAZINE_MAYAR_URL : null,
        'payBefore' => $o['status'] === 'menunggu_bayar' && $o['pay_deadline'] ? (int) $o['pay_deadline'] : null,
    ]);
}

function imzWebhook(string $token): void {
    if (IMAZINE_WEBHOOK_TOKEN === '' || !hash_equals(IMAZINE_WEBHOOK_TOKEN, $token)) jsonResponse(['error' => 'Tidak ditemukan'], 404);

    $raw = (string) file_get_contents('php://input', false, null, 0, 262144);
    imzLog('webhook.log', $raw);   // simpan mentah: bentuk payload asli bisa dicek di sini
    // Catat nama header dan awal nilainya (disamarkan) untuk mengetahui apakah Mayar mengirim token verifikasi,
    // dan di header mana. Nilai penuh tidak dicatat.
    $hdr = [];
    foreach ($_SERVER as $k => $v) {
        if (!is_string($v) || !str_starts_with($k, 'HTTP_')) continue;
        if (in_array($k, ['HTTP_HOST', 'HTTP_ACCEPT', 'HTTP_ACCEPT_ENCODING', 'HTTP_CONNECTION', 'HTTP_CONTENT_LENGTH', 'HTTP_CONTENT_TYPE'], true)) continue;
        $hdr[] = substr($k, 5) . '=' . substr($v, 0, 6) . '…(' . strlen($v) . ')' . (hash_equals(IMAZINE_WEBHOOK_TOKEN, $v) || hash_equals(IMAZINE_WEBHOOK_TOKEN, preg_replace('/^Bearer\s+/i', '', $v)) ? ' <== SAMA DENGAN TOKEN' : '');
    }
    imzLog('webhook.log', 'header: ' . implode(' | ', $hdr));
    $p = json_decode($raw, true);
    if (!is_array($p)) jsonResponse(['ok' => true, 'ignored' => 'bukan json']);

    $event = $p['event'] ?? ($p['event.received'] ?? ($p['type'] ?? ''));
    $d = is_array($p['data'] ?? null) ? $p['data'] : [];
    if ($event !== '' && $event !== 'payment.received') jsonResponse(['ok' => true, 'ignored' => 'event ' . (is_string($event) ? $event : '?')]);
    $paid = $d['status'] ?? true;
    if ($paid === false || $paid === 'false' || $paid === 'FAILED' || $paid === 'EXPIRED') jsonResponse(['ok' => true, 'ignored' => 'belum lunas']);

    // Webhook Mayar berlaku untuk seluruh akun (ebook dan produk lain). Hanya pembayaran Imazine yang diproses.
    [$o, $method, $note, $ours, $suggest] = imzMatchPayment($p, $d);
    if (!$ours) jsonResponse(['ok' => true, 'ignored' => 'produk lain']);

    $productId = (string) ($d['productId'] ?? $d['product_id'] ?? '');
    $amount = (int) ($d['amount'] ?? 0);
    $key = (string) ($d['id'] ?? '') !== '' ? (string) $d['id'] : 'raw-' . sha1($raw);
    $ins = imzDb()->prepare("INSERT OR IGNORE INTO imazine_payments (payment_key, product_id, customer_name, customer_email, customer_mobile, amount, raw, status) VALUES (?,?,?,?,?,?,?, 'perlu_cek')");
    $ins->execute([$key, $productId, (string) ($d['customerName'] ?? ''), (string) ($d['customerEmail'] ?? ''), (string) ($d['customerMobile'] ?? ''), $amount, $raw]);
    if ($ins->rowCount() !== 1) jsonResponse(['ok' => true, 'duplicate' => true]);   // webhook dobel
    $payId = (int) imzDb()->lastInsertId();

    $status = 'perlu_cek';
    if ($o && $method === 'sudah_lunas') {
        // Pesanan yang sudah lunas: biasanya webhook yang dikirim ulang Mayar. Nominal sama = duplikat, abaikan senyap.
        if ($amount === (int) $o['paid_amount']) { $status = 'duplikat'; $note = 'Webhook ulang untuk ' . $o['order_no']; }
        else $note = 'Pesanan ' . $o['order_no'] . ' sudah lunas dengan nominal berbeda (' . imzRupiah((int) $o['paid_amount']) . ' vs ' . imzRupiah($amount) . '). Dibayar dobel?';
    } elseif ($o && $amount < (int) $o['total']) {
        // Nominal kurang dari harga album (ongkir belum dihitung). Jangan lunaskan otomatis.
        $note = 'Nominal ' . imzRupiah($amount) . ' kurang dari harga album ' . imzRupiah((int) $o['total']) . ' untuk ' . $o['order_no'];
    } elseif ($o) {
        imzAdoptPayer($o['order_no'], $d['customerName'] ?? '', $d['customerMobile'] ?? '');   // sebelum notifikasi dikirim
        imzMarkPaid($o['order_no'], $amount, $method);
        $status = 'cocok';
    }
    imzDb()->prepare('UPDATE imazine_payments SET status = ?, order_no = ?, match_method = ?, note = ? WHERE id = ?')
        ->execute([$status, $o['order_no'] ?? $suggest, $method, $note, $payId]);   // untuk perlu_cek, order_no adalah dugaan
    if ($status === 'perlu_cek') {
        $st = imzDb()->prepare('SELECT * FROM imazine_payments WHERE id = ?');
        $st->execute([$payId]);
        imzNotifyNeedsCheck($st->fetch());
    }
    jsonResponse(['ok' => true, 'matched' => $status === 'cocok']);
}
