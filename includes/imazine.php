<?php
/**
 * Imazine - pesanan album, penyimpanan foto asli, pencocokan pembayaran Mayar.
 *
 * Pembayaran, alamat, ongkir JNE, label, pickup, dan resi memakai PRODUK FISIK Mayar yang dibuat sekali
 * di dashboard (link yang sama untuk semua pembeli). Server ini mencatat pesanan + foto, lalu mencocokkan webhook
 * "payment.received" ke pesanan lewat nama, email, dan nomor HP pembeli. Yang tidak yakin tidak dilunasi otomatis:
 * masuk antrean "perlu dicek" di admin.
 *
 * Rahasia dibaca dari storage/imazine-secret.php (di-gitignore, diblokir .htaccess).
 * Contoh isinya: includes/imazine-secret.example.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/functions.php';

$__imzSecret = __DIR__ . '/../storage/imazine-secret.php';
if (is_file($__imzSecret)) require_once $__imzSecret;
unset($__imzSecret);

foreach ([
    'IMAZINE_PRICE'            => 350000,            // harga per album (Rp); harus sama dengan harga produk di Mayar
    'IMAZINE_MAX_QTY'          => 20,
    'IMAZINE_MIN_PHOTOS'       => 20,                // minimal foto per album (bisa diubah)
    'IMAZINE_MAX_PHOTOS'       => 240,               // maksimal foto per album (bisa diubah)
    'IMAZINE_MAX_PHOTO_BYTES'  => 40 * 1024 * 1024,  // batas wajar satu file; tidak ada batas total per pesanan
    'IMAZINE_RATE_PER_HOUR'    => 60,                // pesanan baru per alamat IP per jam; 0 = tanpa batas
    'IMAZINE_PAY_MINUTES'      => 120,               // waktu membayar; lewat dari ini pesanan yang belum dibayar dihapus
    'IMAZINE_PAY_GRACE_MIN'    => 10,                // toleransi hapus, supaya pembayaran di menit terakhir tidak kehilangan pesanan
    'IMAZINE_MAYAR_URL'        => '',                // link checkout produk fisik Mayar
    'IMAZINE_MAYAR_PRODUCT_ID' => '',                // opsional: id produk, supaya produk Mayar lain (ebook) diabaikan
    'IMAZINE_BASE_URL'         => '',                // kosong = pakai BASE_URL
    'IMAZINE_NOTIFY_EMAIL'     => '',                // penerima notifikasi pesanan lunas / pembayaran perlu dicek
    'IMAZINE_ADMIN_PASSWORD'   => '',                // kosong = halaman admin mati
    'IMAZINE_WEBHOOK_TOKEN'    => '',                // rahasia di URL webhook
    'IMAZINE_PAYMENT'          => true,              // true = bayar dan kirim lewat Mayar (dinyalakan lagi 25 Nov 2026); false = album langsung masuk ke tim tanpa bayar (paid_method tanpa_bayar)
    'IMAZINE_ALLOW_SAMPLES'    => true,              // SEMENTARA untuk uji: boleh pesan memakai foto contoh. Pesanan itu ditandai UJI di admin. Ubah ke false sebelum jualan.
] as $k => $v) {
    if (!defined($k)) define($k, $v);
}

function imzBaseUrl(): string {
    return rtrim(IMAZINE_BASE_URL !== '' ? IMAZINE_BASE_URL : BASE_URL, '/');
}

function imzDataDir(string $sub = ''): string {
    $dir = __DIR__ . '/../storage/imazine' . ($sub !== '' ? '/' . trim($sub, '/') : '');
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    return $dir;
}

function imzLog(string $file, string $line): void {
    @file_put_contents(imzDataDir() . '/' . $file, '[' . date('c') . '] ' . $line . "\n", FILE_APPEND | LOCK_EX);
}

function imzDb(): PDO {
    static $ready = false;
    $db = getDb();
    if (!$ready) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS imazine_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_no TEXT UNIQUE NOT NULL,
                token TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'draf',      -- draf | menunggu_bayar | lunas
                name TEXT NOT NULL,
                whatsapp TEXT NOT NULL,
                email TEXT NOT NULL,
                note TEXT,
                address TEXT DEFAULT '',                   -- tidak dipakai (alamat ada di Mayar)
                city TEXT DEFAULT '',
                province TEXT DEFAULT '',
                postal_code TEXT DEFAULT '',
                qty INTEGER NOT NULL,
                unit_price INTEGER NOT NULL,
                shipping INTEGER DEFAULT 0,                -- ongkir JNE (Rp)
                total INTEGER NOT NULL,                    -- harga album x jumlah (ongkir dihitung Mayar)
                photo_count INTEGER NOT NULL,
                cover_name TEXT,
                order_json TEXT NOT NULL,
                mayar_product_id TEXT,                     -- link bayar Mayar milik pesanan ini
                mayar_link TEXT,
                paid_at TEXT,
                paid_amount INTEGER,
                paid_method TEXT,                          -- cara pembayaran dicocokkan ke pesanan
                waybill TEXT,                              -- nomor resi JNE, diisi tim
                shipped_at INTEGER,
                ip_hash TEXT,                              -- untuk pembatasan laju, bukan IP asli
                created_ts INTEGER,                        -- epoch dibuat
                pay_deadline INTEGER,                      -- epoch batas bayar (diisi saat checkout)
                claimed_at INTEGER,
                created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
            );
            CREATE INDEX IF NOT EXISTS idx_imz_orders_status ON imazine_orders(status);
            CREATE INDEX IF NOT EXISTS idx_imz_orders_email ON imazine_orders(email);

            CREATE TABLE IF NOT EXISTS imazine_photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_no TEXT NOT NULL,
                idx INTEGER NOT NULL,
                original_name TEXT,
                stored_name TEXT NOT NULL,
                mime TEXT NOT NULL,
                bytes INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                UNIQUE (order_no, idx),
                FOREIGN KEY (order_no) REFERENCES imazine_orders(order_no) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS imazine_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payment_key TEXT UNIQUE NOT NULL,          -- id dari Mayar (cegah dobel)
                product_id TEXT,
                customer_name TEXT,
                customer_email TEXT,
                customer_mobile TEXT,
                amount INTEGER NOT NULL,
                raw TEXT NOT NULL,
                status TEXT NOT NULL,                      -- cocok | perlu_cek | duplikat | diabaikan
                order_no TEXT,                             -- pesanan yang cocok, atau dugaan
                match_method TEXT,
                note TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
            );
            CREATE INDEX IF NOT EXISTS idx_imz_pay_status ON imazine_payments(status);
        ");
        // Basis data yang dibuat sebelum kolom-kolom ini ada.
        $cols = array_column($db->query('PRAGMA table_info(imazine_orders)')->fetchAll(), 'name');
        foreach ([
            'ip_hash' => 'TEXT', 'created_ts' => 'INTEGER', 'pay_deadline' => 'INTEGER', 'claimed_at' => 'INTEGER',
            'address' => "TEXT DEFAULT ''", 'city' => "TEXT DEFAULT ''", 'province' => "TEXT DEFAULT ''", 'postal_code' => "TEXT DEFAULT ''",
            'shipping' => 'INTEGER DEFAULT 0', 'mayar_product_id' => 'TEXT', 'mayar_link' => 'TEXT', 'waybill' => 'TEXT', 'shipped_at' => 'INTEGER',
        ] as $col => $type) {
            if (!in_array($col, $cols, true)) $db->exec("ALTER TABLE imazine_orders ADD COLUMN $col $type");
        }
        $db->exec('CREATE INDEX IF NOT EXISTS idx_imz_orders_ip ON imazine_orders(ip_hash, created_at)');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_imz_orders_product ON imazine_orders(mayar_product_id)');
        $ready = true;
    }
    return $db;
}

function imzOrder(string $orderNo): ?array {
    $st = imzDb()->prepare('SELECT * FROM imazine_orders WHERE order_no = ?');
    $st->execute([$orderNo]);
    return $st->fetch() ?: null;
}

function imzNewOrderNo(): string {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // tanpa I dan O supaya tidak tertukar dengan 1 dan 0
    for ($try = 0; $try < 20; $try++) {
        $s = '';
        for ($i = 0; $i < 6; $i++) $s .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        $no = 'IMZ-' . $s;
        if (!imzOrder($no)) return $no;
    }
    throw new RuntimeException('Gagal membuat nomor pesanan');
}

/**
 * Hapus pesanan yang belum dibayar setelah IMAZINE_PAY_MINUTES (+ toleransi), beserta foto aslinya.
 * Pesanan lunas tidak pernah dihapus. Draf yang belum sempat checkout dihitung dari saat dibuat.
 * Dipanggil saat ada pesanan baru, saat admin dibuka, dan oleh cron (includes/imazine-purge-cron.php).
 * @return int jumlah pesanan yang dihapus
 */
function imzPurgeStale(): int {
    $db = imzDb();
    $span = ((int) IMAZINE_PAY_MINUTES + (int) IMAZINE_PAY_GRACE_MIN) * 60;
    $st = $db->prepare("SELECT order_no FROM imazine_orders WHERE (status = 'draf' AND COALESCE(created_ts, 0) < CAST(? AS INTEGER)) OR (status = 'menunggu_bayar' AND COALESCE(pay_deadline, 0) < CAST(? AS INTEGER))");
    // CAST wajib: PDO mengikat angka sebagai teks, dan SQLite menganggap angka selalu lebih kecil dari teks.
    $st->execute([time() - $span, time() - (int) IMAZINE_PAY_GRACE_MIN * 60]);
    $gone = 0;
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $no) {
        $dir = imzDataDir('orders/' . $no);
        foreach (['photos', 'cetak', 'cover'] as $sub) {
            foreach (glob($dir . '/' . $sub . '/{,.}*', GLOB_BRACE) ?: [] as $f) { if (is_file($f)) @unlink($f); }
            @rmdir($dir . '/' . $sub);
        }
        @rmdir($dir);
        $db->prepare('DELETE FROM imazine_orders WHERE order_no = ?')->execute([$no]);
        $gone++;
    }
    return $gone;
}

function imzTokenOk(?array $order, ?string $token): bool {
    return $order && is_string($token) && $token !== '' && hash_equals($order['token'], $token);
}

function imzRupiah(int $n): string {
    return 'Rp' . number_format($n, 0, ',', '.');
}

function imzPhotos(string $orderNo): array {
    $st = imzDb()->prepare('SELECT * FROM imazine_photos WHERE order_no = ? ORDER BY idx');
    $st->execute([$orderNo]);
    return $st->fetchAll();
}

/** Sampul majalah: render Full HD (render.jpg) dan foto asli pembeli (photo.{ext}). Null kalau belum ada. */
function imzCoverFile(string $orderNo, string $kind): ?array {
    $dir = __DIR__ . '/../storage/imazine/orders/' . $orderNo . '/cover';
    foreach ($kind === 'render' ? ['jpg'] : ['jpg', 'png', 'webp', 'heic'] as $ext) {
        $f = $dir . '/' . $kind . '.' . $ext;
        if (is_file($f)) return [$f, ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'heic' => 'image/heic'][$ext], $ext];
    }
    return null;
}

function imzPhotoPath(string $orderNo, string $storedName): string {
    return imzDataDir('orders/' . $orderNo . '/photos') . '/' . $storedName;
}

// ==================== Foto ukuran cetak (untuk album PDF di admin) ====================

const IMZ_PRINT_EDGE = 3500;   // sisi terpanjang; satu halaman A4 penuh di 300 dpi = 3508 px
const IMZ_PRINT_QUALITY = 90;

/** Orientasi EXIF (1-8) dari JPEG, dibaca langsung dari file supaya tidak bergantung pada ekstensi exif. */
function imzJpegOrientation(string $path): int {
    $f = @fopen($path, 'rb');
    if (!$f) return 1;
    $o = 1;
    if (fread($f, 2) === "\xFF\xD8") {
        while (!feof($f)) {
            $m = fread($f, 4);
            if (strlen($m) < 4 || $m[0] !== "\xFF") break;
            $len = unpack('n', substr($m, 2, 2))[1];
            if ($m[1] === "\xE1") {
                $seg = fread($f, max(0, $len - 2));
                if (substr($seg, 0, 6) === "Exif\0\0") {
                    $t = substr($seg, 6);
                    $le = substr($t, 0, 2) === 'II';
                    $u16 = fn($s) => unpack($le ? 'v' : 'n', $s)[1];
                    $u32 = fn($s) => unpack($le ? 'V' : 'N', $s)[1];
                    $ifd = $u32(substr($t, 4, 4));
                    $n = $u16(substr($t, $ifd, 2));
                    for ($i = 0; $i < $n; $i++) {
                        $e = substr($t, $ifd + 2 + $i * 12, 12);
                        if (strlen($e) === 12 && $u16(substr($e, 0, 2)) === 0x0112) { $o = $u16(substr($e, 8, 2)); break; }
                    }
                }
                break;
            }
            if ($m[1] === "\xDA") break;   // data gambar mulai, tidak ada EXIF
            fseek($f, $len - 2, SEEK_CUR);
        }
    }
    fclose($f);
    return ($o >= 1 && $o <= 8) ? $o : 1;
}

/**
 * Path foto ukuran cetak untuk satu foto pesanan: diperkecil ke IMZ_PRINT_EDGE, orientasi EXIF sudah diterapkan
 * (sama seperti yang dilihat pembeli di browser), JPEG. Disimpan di orders/{no}/cetak/ supaya cukup dibuat sekali.
 * Memakai Imagick kalau ada (juga membaca HEIC bila servernya mendukung), lalu GD.
 * @return array{0:string,1:string}|null [path, mime]; null kalau tidak bisa dibuat (pemanggil memakai foto asli)
 */
function imzPrintPhoto(string $orderNo, array $photo): ?array {
    $src = imzPhotoPath($orderNo, $photo['stored_name']);
    if (!is_file($src)) return null;
    $dst = imzDataDir('orders/' . $orderNo . '/cetak') . '/' . (int) $photo['idx'] . '.jpg';
    if (is_file($dst) && filemtime($dst) >= filemtime($src)) return [$dst, 'image/jpeg'];
    @set_time_limit(120);
    $tmp = $dst . '.tmp-' . bin2hex(random_bytes(3));

    if (class_exists('Imagick')) {
        try {
            $im = new Imagick();
            $im->readImage($src);
            $im = $im->getImage();   // frame pertama saja
            if (method_exists($im, 'autoOrient')) $im->autoOrient(); else $im->setImageOrientation(Imagick::ORIENTATION_TOPLEFT);
            if (max($im->getImageWidth(), $im->getImageHeight()) > IMZ_PRINT_EDGE) $im->thumbnailImage(IMZ_PRINT_EDGE, IMZ_PRINT_EDGE, true);
            $im->setImageBackgroundColor('white');
            $im = $im->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);
            $im->setImageFormat('jpeg');
            $im->setImageCompressionQuality(IMZ_PRINT_QUALITY);
            $im->stripImage();
            if ($im->writeImage($tmp) && rename($tmp, $dst)) return [$dst, 'image/jpeg'];
        } catch (Throwable $e) {
            imzLog('error.log', "foto cetak Imagick gagal $orderNo/{$photo['idx']}: " . $e->getMessage());
        }
        @unlink($tmp);
    }

    if (!function_exists('imagecreatetruecolor')) return null;
    $open = ['image/jpeg' => 'imagecreatefromjpeg', 'image/png' => 'imagecreatefrompng', 'image/webp' => 'imagecreatefromwebp'][$photo['mime']] ?? null;
    if (!$open || !function_exists($open)) return null;   // HEIC tanpa Imagick: tidak bisa dibaca GD
    $info = @getimagesize($src);
    if (!$info) return null;
    // perkiraan memori: gambar asli + hasil, masing-masing ~5 byte/piksel
    $need = (int) ($info[0] * $info[1] * 5 + IMZ_PRINT_EDGE * IMZ_PRINT_EDGE * 4 + 32 * 1048576);
    $limit = ini_get('memory_limit');
    $bytes = $limit === '-1' ? PHP_INT_MAX : (int) $limit * (['g' => 1073741824, 'm' => 1048576, 'k' => 1024][strtolower(substr($limit, -1))] ?? 1);
    if ($need > $bytes) @ini_set('memory_limit', (string) (int) ceil($need / 1048576) . 'M');

    $img = @$open($src);
    if (!$img) { imzLog('error.log', "foto cetak GD gagal membuka $orderNo/{$photo['idx']}"); return null; }
    if ($photo['mime'] === 'image/jpeg') {
        $or = imzJpegOrientation($src);
        // putar dulu (sudut GD berlawanan arah jarum jam), lalu cerminkan. 6 = putar 90 searah jarum jam, dst.
        [$deg, $flip] = [1 => [0, 0], 2 => [0, IMG_FLIP_HORIZONTAL], 3 => [180, 0], 4 => [0, IMG_FLIP_VERTICAL],
                         5 => [270, IMG_FLIP_HORIZONTAL], 6 => [270, 0], 7 => [270, IMG_FLIP_VERTICAL], 8 => [90, 0]][$or];
        if ($deg) { $r = imagerotate($img, $deg, 0); if ($r) { imagedestroy($img); $img = $r; } }
        if ($flip) imageflip($img, $flip);
    }
    $w = imagesx($img); $hh = imagesy($img);
    $k = min(1, IMZ_PRINT_EDGE / max($w, $hh));
    $nw = max(1, (int) round($w * $k)); $nh = max(1, (int) round($hh * $k));
    $out = imagecreatetruecolor($nw, $nh);
    imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));   // latar putih untuk PNG transparan
    imagecopyresampled($out, $img, 0, 0, 0, 0, $nw, $nh, $w, $hh);
    imagedestroy($img);
    imageinterlace($out, true);
    $ok = imagejpeg($out, $tmp, IMZ_PRINT_QUALITY) && rename($tmp, $dst);
    imagedestroy($out);
    if (!$ok) { @unlink($tmp); imzLog('error.log', "foto cetak GD gagal menyimpan $orderNo/{$photo['idx']}"); return null; }
    return [$dst, 'image/jpeg'];
}

/** Jenis gambar yang diterima, dari isi file (bukan dari nama atau header klien). */
function imzDetectImage(string $path): ?array {
    $fi = new finfo(FILEINFO_MIME_TYPE);
    $mime = $fi->file($path) ?: '';
    $map = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (isset($map[$mime])) return [$mime, $map[$mime]];
    $head = (string) @file_get_contents($path, false, null, 0, 16);
    if (strlen($head) >= 12 && substr($head, 4, 4) === 'ftyp' && preg_match('/^(heic|heix|hevc|mif1|msf1|heif)/', substr($head, 8, 4))) {
        return ['image/heic', 'heic'];
    }
    return null;
}

// ==================== Pencocokan pembayaran ====================

/** Nomor telepon -> 9 digit terakhir, supaya 0812..., +62812..., dan 62812... dianggap sama. */
function imzPhoneKey(?string $p): string {
    $d = preg_replace('/\D/', '', (string) $p);
    return strlen($d) >= 9 ? substr($d, -9) : '';
}

/** Huruf kecil, tanpa tanda baca, spasi dirapikan: "Siti  Rahma, S.Pd." -> "siti rahma s pd". */
function imzNameNorm(string $n): string {
    $n = mb_strtolower($n);
    $n = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $n) ?? '';
    return trim($n);
}

/** Nama dianggap mirip bila ada kata (min 3 huruf) yang sama, atau kemiripan teks cukup tinggi. */
function imzNameSimilar(string $a, string $b): bool {
    $a = imzNameNorm($a); $b = imzNameNorm($b);
    if ($a === '' || $b === '') return false;
    if ($a === $b) return true;
    $ta = array_filter(explode(' ', $a), fn($w) => mb_strlen($w) >= 3);
    $tb = array_filter(explode(' ', $b), fn($w) => mb_strlen($w) >= 3);
    if (array_intersect($ta, $tb)) return true;
    similar_text($a, $b, $pct);
    return $pct >= 70;
}

/**
 * Cari pesanan untuk satu pembayaran Mayar (link produk Mayar sama untuk semua pembeli, jadi dicocokkan lewat EMAIL
 * yang pembeli isi di form kita dan di Mayar). Otomatis hanya bila yakin:
 *  1. nomor pesanan IMZ-XXXXXX di mana saja dalam payload (bila pembeli mengisinya di kolom opsional Mayar)
 *  2. tepat satu pesanan menunggu bayar dengan email yang sama persis
 * Selain itu tidak dilunasi: dikembalikan sebagai dugaan untuk dicek admin.
 * Nama dan HP pembeli diambil dari Mayar dan disalin ke pesanan setelah cocok (imzAdoptPayer).
 * @return array{0:?array,1:?string,2:string,3:bool,4:?string} [pesanan, cara cocok, catatan, produk Imazine?, dugaan nomor pesanan]
 */
function imzMatchPayment(array $payload, array $d): array {
    $blob = json_encode($payload, JSON_UNESCAPED_UNICODE) ?: '';
    $productId = (string) ($d['productId'] ?? $d['product_id'] ?? '');
    $lost = '';
    $hasCode = false;
    // Toleran pada cara penulisan: IMZ-ABC234, imz abc234, IMZ–ABC234 (strip panjang), IMZABC234.
    if (preg_match_all('/IMZ[\s\-\x{2010}-\x{2015}_.:]*([A-HJ-NP-Z2-9]{6})(?![A-Za-z0-9])/iu', $blob, $m)) {
        $hasCode = true;
        foreach (array_unique(array_map('strtoupper', $m[1])) as $code) {
            $no = 'IMZ-' . $code;
            $o = imzOrder($no);
            if ($o && $o['status'] !== 'lunas') return [$o, 'nomor_pesanan', '', true, $no];
            if ($o) return [$o, 'sudah_lunas', "Nomor $no sudah lunas sebelumnya", true, $no];
            $lost = "Nomor $no tidak ditemukan (kemungkinan pesanan sudah dihapus karena lewat " . (int) IMAZINE_PAY_MINUTES . " menit). Hubungi pembeli untuk mengunggah ulang.";
        }
    }
    $ours = $hasCode
        || (IMAZINE_MAYAR_PRODUCT_ID !== '' && $productId === IMAZINE_MAYAR_PRODUCT_ID)
        || stripos((string) ($d['productName'] ?? ''), 'imazine') !== false;
    if (!$ours) return [null, null, '', false, null];
    if ($lost !== '') return [null, null, $lost, true, null];

    $email = strtolower(trim((string) ($d['customerEmail'] ?? '')));
    $pending = imzDb()->query("SELECT * FROM imazine_orders WHERE status = 'menunggu_bayar' ORDER BY id DESC LIMIT 500")->fetchAll();
    $cands = $email === '' ? [] : array_values(array_filter($pending, fn($o) => strtolower(trim($o['email'])) === $email));
    if (count($cands) === 1) return [$cands[0], 'email', '', true, $cands[0]['order_no']];
    if (count($cands) > 1) {
        return [null, null, 'Email ini punya ' . count($cands) . ' pesanan menunggu bayar (kemungkinan orang yang sama). Pilih manual berdasarkan sampul dan waktu. Dugaan: ' . $cands[0]['order_no'] . ' (terbaru).', true, $cands[0]['order_no']];
    }
    // Pembayar yang sama baru saja melunasi pesanannya: biasanya webhook yang dikirim ulang Mayar, bukan pembayaran baru.
    if ($email !== '') {
        $recent = imzDb()->query("SELECT * FROM imazine_orders WHERE status = 'lunas' AND paid_at > datetime('now','localtime','-1 day') ORDER BY id DESC LIMIT 200")->fetchAll();
        foreach ($recent as $o) {
            if (strtolower(trim($o['email'])) === $email) return [$o, 'sudah_lunas', 'Pesanan ' . $o['order_no'] . ' sudah lunas sebelumnya', true, $o['order_no']];
        }
    }
    return [null, null, 'Tidak ada pesanan menunggu bayar dengan email "' . $email . '". Mungkin pesanan sudah dihapus (lewat ' . (int) IMAZINE_PAY_MINUTES . ' menit), atau pembeli memakai email berbeda di Mayar. Hubungi pembeli.', true, null];
}

/** Salin nama dan HP pembayar dari Mayar ke pesanan (form kita hanya menanyakan email). */
function imzAdoptPayer(string $orderNo, ?string $name, ?string $mobile): void {
    $name = trim((string) $name); $mobile = trim((string) $mobile);
    $db = imzDb();
    if ($name !== '') $db->prepare("UPDATE imazine_orders SET name = ? WHERE order_no = ? AND (name IS NULL OR name = '')")->execute([mb_substr($name, 0, 100), $orderNo]);
    if ($mobile !== '') $db->prepare("UPDATE imazine_orders SET whatsapp = ? WHERE order_no = ? AND (whatsapp IS NULL OR whatsapp = '')")->execute([mb_substr($mobile, 0, 30), $orderNo]);
}

/** Tandai lunas satu kali saja. Mengembalikan true bila baru saja berubah. */
function imzMarkPaid(string $orderNo, int $amount, string $method): bool {
    $u = imzDb()->prepare("UPDATE imazine_orders SET status = 'lunas', paid_at = datetime('now','localtime'), paid_amount = ?, paid_method = ?, updated_at = datetime('now','localtime') WHERE order_no = ? AND status != 'lunas'");
    $u->execute([$amount, $method, $orderNo]);
    if ($u->rowCount() !== 1) return false;
    imzNotifyPaid(imzOrder($orderNo));
    return true;
}

/** Mode tanpa pembayaran: album yang dikirim langsung siap diproses tim (memakai status lunas supaya album PDF, foto asli, dan slip kemasan di admin langsung terbuka). */
function imzMarkSubmitted(string $orderNo): bool {
    $u = imzDb()->prepare("UPDATE imazine_orders SET status = 'lunas', paid_at = datetime('now','localtime'), paid_amount = 0, paid_method = 'tanpa_bayar', updated_at = datetime('now','localtime') WHERE order_no = ? AND status IN ('draf','menunggu_bayar')");
    $u->execute([$orderNo]);
    if ($u->rowCount() !== 1) return false;
    $o = imzOrder($orderNo);
    if (IMAZINE_NOTIFY_EMAIL === '') { imzLog('mail.log', 'IMAZINE_NOTIFY_EMAIL kosong, notifikasi ' . $orderNo . ' dilewati'); return true; }
    $body = "Album Imazine baru MASUK (tanpa pembayaran): {$o['order_no']}\n\n"
        . "Nama     : {$o['name']}\nWhatsApp : {$o['whatsapp']}\nEmail    : {$o['email']}\n"
        . "Sampul   : {$o['cover_name']}\nFoto     : {$o['photo_count']}\nJumlah   : {$o['qty']} album\n\n"
        . ($o['note'] !== null && $o['note'] !== '' ? "Catatan: {$o['note']}\n\n" : '')
        . "Hubungi pengirim lewat WhatsApp untuk alamat dan pengiriman.\n\n"
        . "Data, foto asli, album PDF, dan slip kemasan:\n" . imzBaseUrl() . '/imazine/admin/pesanan/' . $o['order_no'] . "\n";
    imzMail(IMAZINE_NOTIFY_EMAIL, 'Album masuk ' . $o['order_no'] . ' - ' . $o['name'], $body);
    return true;
}

// ==================== Notifikasi ====================

function imzMail(string $to, string $subject, string $body): bool {
    $host = parse_url(BASE_URL, PHP_URL_HOST) ?: 'localhost';
    $headers = "From: Imazine <no-reply@$host>\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0";
    $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
    imzLog('mail.log', ($ok ? 'terkirim' : 'GAGAL/dilewati') . " ke $to: $subject");
    return $ok;
}

function imzNotifyPaid(array $o): void {
    if (IMAZINE_NOTIFY_EMAIL === '') {
        imzLog('mail.log', 'IMAZINE_NOTIFY_EMAIL kosong, notifikasi ' . $o['order_no'] . ' dilewati');
        return;
    }
    $admin = imzBaseUrl() . '/imazine/admin/pesanan/' . $o['order_no'];
    $body = "Pesanan Imazine LUNAS: {$o['order_no']}\n\n"
        . "Nama     : {$o['name']} (dari Mayar)\n"
        . "WhatsApp : {$o['whatsapp']} (dari Mayar)\n"
        . "Email    : {$o['email']}\n"
        . "Sampul   : {$o['cover_name']}\n"
        . "Foto     : {$o['photo_count']}\n"
        . "Jumlah   : {$o['qty']} album\n"
        . "Dibayar  : " . imzRupiah((int) ($o['paid_amount'] ?? $o['total'])) . " (termasuk ongkir JNE)\n"
        . "Cocok via: {$o['paid_method']}\n\n"
        . ($o['note'] !== null && $o['note'] !== '' ? "Catatan: {$o['note']}\n\n" : '')
        . "Alamat, label, pickup, dan resi JNE ada di dashboard Mayar (menu Order). Cocokkan dengan nama dan HP di atas.\n\n"
        . "Data pesanan, foto asli, dan slip kemasan:\n$admin\n";
    imzMail(IMAZINE_NOTIFY_EMAIL, 'Pesanan lunas ' . $o['order_no'] . ' - ' . $o['name'], $body);
}

function imzNotifyNeedsCheck(array $p): void {
    if (IMAZINE_NOTIFY_EMAIL === '') return;
    $body = "Ada pembayaran Imazine yang PERLU DICEK (belum otomatis cocok ke pesanan).\n\n"
        . "Pembeli  : {$p['customer_name']}\nEmail    : {$p['customer_email']}\nWhatsApp : {$p['customer_mobile']}\n"
        . "Jumlah   : " . imzRupiah((int) $p['amount']) . "\nCatatan  : {$p['note']}\n\n"
        . "Cocokkan manual di:\n" . imzBaseUrl() . "/imazine/admin\n";
    imzMail(IMAZINE_NOTIFY_EMAIL, 'Pembayaran Imazine perlu dicek', $body);
}
