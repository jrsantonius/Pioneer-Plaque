<?php
/**
 * Imazine - admin pesanan untuk tim.
 *   /imazine/admin                            daftar pesanan (login dulu)
 *   /imazine/admin/pesanan/{no}               detail
 *   /imazine/admin/pesanan/{no}/data.json     data pesanan lengkap (untuk membuat file cetak)
 *   /imazine/admin/pesanan/{no}/foto.zip      semua foto asli
 *   /imazine/admin/pesanan/{no}/foto/{idx}    satu foto asli
 *   /imazine/admin/pesanan/{no}/album         album jadi (sudah diedit pembeli), disimpan sebagai PDF A4
 *   /imazine/admin/pesanan/{no}/cetak/{idx}   satu foto ukuran cetak (dipakai halaman album)
 *   POST /imazine/admin                       login   |   POST /imazine/admin/keluar   logout
 */
require_once __DIR__ . '/../includes/imazine.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

if (IMAZINE_ADMIN_PASSWORD === '') {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Admin Imazine belum diaktifkan (IMAZINE_ADMIN_PASSWORD kosong).');
}

const IMZ_ADMIN_COOKIE = 'imz_admin';
const IMZ_ADMIN_TTL = 12 * 3600;

function imzAdminSig(string $ts): string {
    return hash_hmac('sha256', 'imazine-admin|' . $ts, IMAZINE_ADMIN_PASSWORD . '|' . IMAZINE_WEBHOOK_TOKEN);
}
function imzAdminAuthed(): bool {
    $c = $_COOKIE[IMZ_ADMIN_COOKIE] ?? '';
    if (!is_string($c) || !preg_match('/^(\d{10})\.([a-f0-9]{64})$/', $c, $m)) return false;
    return (time() - (int) $m[1]) < IMZ_ADMIN_TTL && hash_equals(imzAdminSig($m[1]), $m[2]);
}
function imzAdminCookie(?string $value, int $expires): void {
    setcookie(IMZ_ADMIN_COOKIE, (string) $value, [
        'expires' => $expires, 'path' => '/imazine/admin', 'httponly' => true, 'samesite' => 'Strict',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// ---- logout ----
if ($path === '/imazine/admin/keluar' && $method === 'POST') {
    imzAdminCookie('', time() - 3600);
    header('Location: /imazine/admin');
    exit;
}

// ---- login ----
$loginError = '';
if ($path === '/imazine/admin' && $method === 'POST') {
    $pw = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
    if (hash_equals(IMAZINE_ADMIN_PASSWORD, $pw)) {
        $ts = (string) time();
        imzAdminCookie($ts . '.' . imzAdminSig($ts), time() + IMZ_ADMIN_TTL);
        header('Location: /imazine/admin');
        exit;
    }
    sleep(1);
    http_response_code(401);
    $loginError = 'Password salah.';
}

function imzAdminHead(string $title): void {
    header('Content-Type: text/html; charset=utf-8');
    ?><!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title><?= e($title) ?></title>
<link rel="icon" type="image/png" sizes="64x64" href="/public/images/tis-icon-64.png"><link rel="apple-touch-icon" href="/public/images/tis-icon-180.png">
<style>
  :root { --bg:#0c0a09; --ink:#f4ede4; --ink2:#b9ada0; --line:#2a2420; --card:#13100e; --accent:#cf7a3c; --ok:#7fc58f; --warn:#e0b25a; }
  * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  .wrap { width:min(100%,1000px); margin:0 auto; padding:24px 16px 64px; }
  a { color:var(--accent); } h1 { font:400 28px Georgia,serif; margin:0 0 4px; } h2 { font:600 15px sans-serif; margin:28px 0 10px; letter-spacing:.04em; text-transform:uppercase; color:var(--ink2); }
  .top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
  table { width:100%; border-collapse:collapse; } th,td { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); vertical-align:top; } th { color:var(--ink2); font-weight:500; font-size:13px; }
  .pill { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; border:1px solid var(--line); }
  .pill.lunas { color:var(--ok); border-color:var(--ok); } .pill.menunggu_bayar { color:var(--warn); border-color:var(--warn); } .pill.uji { color:#fff; background:#d97706; border-color:#d97706; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px; }
  dl { margin:0; display:grid; grid-template-columns:150px 1fr; gap:8px 16px; } dt { color:var(--ink2); } dd { margin:0; word-break:break-word; }
  .btn { display:inline-block; padding:9px 16px; border-radius:999px; background:var(--accent); color:#1a0f06; font-weight:600; text-decoration:none; border:0; cursor:pointer; font-size:14px; }
  .btn.ghost { background:none; color:var(--ink); border:1px solid var(--line); }
  input[type=password] { padding:10px 12px; border-radius:8px; border:1px solid var(--line); background:#0c0a09; color:var(--ink); font-size:16px; width:100%; margin:10px 0 14px; }
  .previews { display:grid; grid-template-columns:repeat(auto-fill,minmax(88px,1fr)); gap:8px; margin-top:10px; max-width:820px; } .previews a { display:block; } .previews img { width:100%; aspect-ratio:1; height:auto; display:block; object-fit:cover; border-radius:6px; border:1px solid var(--line); }
  .err { color:#ff8b7a; } .muted { color:var(--ink2); }
  .acts { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:0 0 12px; }
  .top-acts { display:flex; gap:8px; flex-wrap:wrap; }
  .filters { display:flex; flex-wrap:wrap; gap:6px; margin:16px 0; } .filters .pill { text-decoration:none; padding:5px 12px; font-size:13px; } .filters .pill.on { background:var(--line); }
  .match-form input { padding:8px 10px; border-radius:8px; border:1px solid var(--line); background:#0c0a09; color:var(--ink); width:150px; font-size:16px; }
  .fname { word-break:break-all; }
  /* tablet */
  @media (max-width:900px) { .wrap { padding:20px 20px 56px; } .hide-m { display:none; } }
  /* ponsel */
  @media (max-width:640px) {
    .wrap { padding:16px 16px 48px; } h1 { font-size:24px; }
    dl { grid-template-columns:1fr; gap:2px 0; } dd { margin-bottom:8px; } .hide-s { display:none; }
    .card { padding:14px; }
    .acts .btn, .top-acts .btn, .top-acts form { flex:1 1 auto; text-align:center; } .top-acts form .btn { width:100%; }
    .match-form input { flex:1 1 100%; width:auto; }
    /* daftar pesanan: tiap baris jadi kartu yang bisa diketuk */
    table.orders thead { display:none; }
    table.orders, table.orders tbody { display:block; }
    table.orders tr { position:relative; display:grid; grid-template-columns:1fr auto; gap:2px 12px; padding:12px 14px; margin-bottom:10px; background:var(--card); border:1px solid var(--line); border-radius:12px; }
    table.orders td { display:block; padding:0; border:0; }
    table.orders td.hide-s { display:block; }
    table.orders .c-no { font-weight:600; } table.orders .c-no a::after { content:""; position:absolute; inset:0; border-radius:12px; }
    table.orders .c-st, table.orders .c-photos, table.orders .c-ship { text-align:right; }
    table.orders .c-buyer { grid-column:1 / -1; }
    table.orders .c-cover, table.orders .c-photos, table.orders .c-date { color:var(--ink2); font-size:13px; }
    table.orders .c-photos:not(:empty)::after { content:" foto"; }
    table.orders .c-ship:not(:empty)::before { content:"Dikemas: "; color:var(--ink2); }
    table.orders .c-date { grid-column:1 / -1; }
  }
  @media (pointer:coarse) { .btn { padding:11px 18px; } .filters .pill { padding:7px 14px; } }
</style></head><body><div class="wrap"><?php
}
function imzAdminFoot(): void { echo '</div></body></html>'; }

if (!imzAdminAuthed()) {
    if ($path !== '/imazine/admin') http_response_code(401);   // unduhan dan detail tanpa login ditolak jelas
    imzAdminHead('Admin Imazine');
    ?><div class="card" style="max-width:380px;margin:12vh auto 0">
      <h1>Admin Imazine</h1><p class="muted">Khusus tim.</p>
      <form method="post" action="/imazine/admin">
        <label for="pw" class="muted">Password</label>
        <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required>
        <?php if ($loginError): ?><p class="err"><?= e($loginError) ?></p><?php endif; ?>
        <button class="btn" type="submit">Masuk</button>
      </form></div><?php
    imzAdminFoot();
    exit;
}

// ---- cocokkan pembayaran manual ----
if (preg_match('#^/imazine/admin/pembayaran/(\d+)$#', $path, $pm) && $method === 'POST') {
    $st = imzDb()->prepare('SELECT * FROM imazine_payments WHERE id = ?');
    $st->execute([(int) $pm[1]]);
    $pay = $st->fetch();
    if ($pay && $pay['status'] === 'perlu_cek') {
        if (($_POST['aksi'] ?? '') === 'abaikan') {
            imzDb()->prepare("UPDATE imazine_payments SET status = 'diabaikan' WHERE id = ?")->execute([$pay['id']]);
        } else {
            $no = strtoupper(trim((string) ($_POST['order_no'] ?? '')));
            $ord = preg_match('/^IMZ-[A-Z0-9]{6}$/', $no) ? imzOrder($no) : null;
            if ($ord && $ord['status'] !== 'lunas') {
                imzAdoptPayer($no, $pay['customer_name'], $pay['customer_mobile']);
                imzMarkPaid($no, (int) $pay['amount'], 'manual');
                imzDb()->prepare("UPDATE imazine_payments SET status = 'cocok', order_no = ?, match_method = 'manual' WHERE id = ?")->execute([$no, $pay['id']]);
            }
        }
    }
    header('Location: /imazine/admin');
    exit;
}

// ---- dikemas: tim menandai album sudah dikemas dan siap dijemput kurir ----
if (preg_match('#^/imazine/admin/pesanan/(IMZ-[A-Z0-9]{6})/dikemas$#', $path, $dm) && $method === 'POST') {
    $ord = imzOrder($dm[1]);
    if ($ord && $ord['status'] === 'lunas') {
        if (($_POST['aksi'] ?? '') === 'batal') imzDb()->prepare('UPDATE imazine_orders SET shipped_at = NULL WHERE order_no = ?')->execute([$ord['order_no']]);
        else imzDb()->prepare('UPDATE imazine_orders SET shipped_at = ? WHERE order_no = ?')->execute([time(), $ord['order_no']]);
    }
    header('Location: /imazine/admin/pesanan/' . $dm[1]);
    exit;
}

// ---- slip kemasan (cetak): dimasukkan ke dalam paket. Alamat dan resi ada di label Mayar di luar paket. ----
function imzSlipHtml(array $o): string {
    ob_start(); ?>
    <section class="slip">
      <div class="slip-top"><strong>Imazine</strong><span><?= e($o['order_no']) ?></span></div>
      <p class="slip-k">Untuk</p>
      <p class="slip-n"><?= e($o['name']) ?></p>
      <p class="slip-c"><?= e($o['whatsapp']) ?><br><?= e($o['email']) ?></p>
      <?php $sship = imzOrderShipping($o['order_no']); if ($sship): ?>
      <p class="slip-k">Kirim ke</p>
      <p class="slip-f"><strong><?= e($sship['name']) ?></strong><?= $sship['phone'] !== '' ? ' &middot; ' . e($sship['phone']) : '' ?><br><?= e($sship['address']) ?><br><?= e($sship['courier']) ?> <?= e($sship['service']) ?></p>
      <?php endif; ?>
      <p class="slip-k">Isi paket</p>
      <p class="slip-f">Album foto cetak A4, 20 lembar (40 halaman bolak-balik), Art Paper 190 gsm, soft cover, jilid binding &times; <?= (int) $o['qty'] ?><br>Sampul: <?= e((string) $o['cover_name']) ?></p>
      <?php if ($o['note']): ?><p class="slip-k">Catatan pembeli</p><p class="slip-f"><?= e($o['note']) ?></p><?php endif; ?>
      <p class="slip-w">Sebelum paket ditutup, pastikan nama dan alamat di label JNE (dari Mayar) sama dengan di atas.</p>
    </section><?php
    return (string) ob_get_clean();
}
function imzSlipPage(array $orders, string $title): void {
    header('Content-Type: text/html; charset=utf-8'); ?><!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title><?= e($title) ?></title>
<link rel="icon" type="image/png" sizes="64x64" href="/public/images/tis-icon-64.png"><link rel="apple-touch-icon" href="/public/images/tis-icon-180.png">
<style>
  body { margin:0; font:14px/1.4 -apple-system,"Segoe UI",Roboto,sans-serif; color:#000; background:#eee; }
  .bar { padding:12px 16px; background:#fff; border-bottom:1px solid #ccc; display:flex; gap:12px; align-items:center; }
  .bar a { color:#000; } .bar button { padding:10px 16px; font-size:15px; }
  .slip { width:105mm; max-width:calc(100% - 24px); min-height:100mm; box-sizing:border-box; margin:12px auto; padding:8mm; background:#fff; border:1px solid #999; page-break-after:always; break-after:page; }
  .slip-top { display:flex; justify-content:space-between; align-items:baseline; border-bottom:2px solid #000; padding-bottom:4mm; margin-bottom:4mm; font-size:22px; }
  .slip-top span { font:700 20px monospace; }
  .slip-k { margin:4mm 0 1mm; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#444; }
  .slip-n { margin:0; font-size:22px; font-weight:700; } .slip-c, .slip-f { margin:0; font-size:15px; } .slip-w { margin:8mm 0 0; font-size:12px; border:1px dashed #666; padding:3mm; }
  @media print { body { background:#fff; } .bar { display:none; } .slip { margin:0; border:0; width:auto; max-width:none; min-height:0; } @page { size:A6; margin:6mm; } }
</style></head><body>
<div class="bar"><button onclick="window.print()">Cetak (<?= count($orders) ?> slip)</button><a href="/imazine/admin">&larr; Kembali</a></div>
<?php foreach ($orders as $o) echo imzSlipHtml($o); if (!$orders) echo '<p style="padding:24px">Tidak ada pesanan untuk dicetak.</p>'; ?>
</body></html><?php
}
if ($path === '/imazine/admin/slip') {
    $rows = imzDb()->query("SELECT * FROM imazine_orders WHERE status = 'lunas' AND shipped_at IS NULL ORDER BY id")->fetchAll();
    imzSlipPage($rows, 'Slip belum dikemas');
    exit;
}

// ---- detail & unduhan ----
if (preg_match('#^/imazine/admin/pesanan/(IMZ-[A-Z0-9]{6})(?:/(data\.json|foto\.zip|slip|album|edit|simpan|simpan-sampul|sampul(?:/foto)?|(?:foto|cetak)/(\d{1,3})))?$#', $path, $m)) {
    $o = imzOrder($m[1]);
    if (!$o) { http_response_code(404); imzAdminHead('Tidak ditemukan'); echo '<p>Pesanan tidak ditemukan. <a href="/imazine/admin">Kembali</a></p>'; imzAdminFoot(); exit; }
    $what = $m[2] ?? '';
    $photos = imzPhotos($o['order_no']);

    if ($what === 'data.json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $o['order_no'] . '.json"');
        $data = json_decode($o['order_json'], true) ?: [];
        $data['status'] = $o['status'];
        $data['paidAt'] = $o['paid_at'];
        $data['photoFiles'] = array_map(fn($p) => ['idx' => (int) $p['idx'], 'originalName' => $p['original_name'], 'file' => $p['stored_name'], 'mime' => $p['mime'], 'bytes' => (int) $p['bytes']], $photos);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    if ($what === 'slip') { imzSlipPage([$o], 'Slip ' . $o['order_no']); exit; }
    if ($what === 'album') {
        // Halaman statis (hasil imazine-handover/site/build.py); data dan foto diambil lewat rute admin ini.
        header('Content-Type: text/html; charset=utf-8');
        readfile(__DIR__ . '/imazine-album.html');
        exit;
    }
    // ---- edit album pesanan (23 Nov 2026): halaman pembeli yang sama, dibuka dalam mode admin (src/admin-edit.js) ----
    if ($what === 'edit') {
        header('Content-Type: text/html; charset=utf-8');
        readfile(__DIR__ . '/../public/imazine/index.html');
        exit;
    }
    if ($what === 'simpan' || $what === 'simpan-sampul') {
        header('Content-Type: application/json; charset=utf-8');
        if ($method !== 'POST') { http_response_code(405); exit(json_encode(['error' => 'Pakai POST'])); }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) { http_response_code(403); exit(json_encode(['error' => 'Asal permintaan tidak dikenal'])); }
        $dir = imzDataDir('orders/' . $o['order_no']);
        if ($what === 'simpan') {
            $raw = file_get_contents('php://input', false, null, 0, 4 * 1048576);
            $in = json_decode((string) $raw, true);
            $old = json_decode($o['order_json'], true) ?: [];
            if (!is_array($in) || !is_array($in['pages'] ?? null) || count($in['pages']) !== count($old['pages'] ?? []) || count($in['pages']) < 1) { http_response_code(422); exit(json_encode(['error' => 'Data album tidak lengkap'])); }
            if (!is_string($in['template'] ?? null) || !preg_match('/^[a-z0-9-]{3,60}$/', $in['template']) || !is_string($in['cover'] ?? null) || !preg_match('/^[a-z0-9-]{2,60}$/', $in['cover'])) { http_response_code(422); exit(json_encode(['error' => 'Layout atau sampul tidak dikenal'])); }
            $nPhotos = count($old['photos'] ?? []);
            foreach ($in['pages'] as $pg) foreach (($pg['slots'] ?? []) as $sl) {
                if (($sl['photo'] ?? null) !== null && (!is_int($sl['photo']) || $sl['photo'] < 0 || $sl['photo'] >= $nPhotos)) { http_response_code(422); exit(json_encode(['error' => 'Ada foto yang tidak ada di pesanan ini'])); }
            }
            // versi pertama dari pembeli disimpan sekali, tidak pernah ditimpa
            if (!is_file($dir . '/order-asli.json')) file_put_contents($dir . '/order-asli.json', $o['order_json']);
            $new = $old;
            foreach (['template', 'cover', 'pages'] as $k) $new[$k] = $in[$k];
            $new['coverName'] = mb_substr((string) ($in['coverName'] ?? $old['coverName'] ?? ''), 0, 80);
            if (is_array($in['magCover'] ?? null)) $new['magCover'] = $in['magCover']; else unset($new['magCover']);
            $new['editedAt'] = date('c');
            $new['editCount'] = (int) ($old['editCount'] ?? 0) + 1;
            imzDb()->prepare('UPDATE imazine_orders SET order_json = ?, cover_name = ? WHERE order_no = ?')
                ->execute([json_encode($new, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $new['coverName'], $o['order_no']]);
            imzLog('admin.log', "album $o[order_no] diedit admin (ke-{$new['editCount']})");
            exit(json_encode(['ok' => true, 'editCount' => $new['editCount']]));
        }
        // simpan-sampul: render sampul majalah baru (JPEG Full HD dari browser admin)
        $tmp = $dir . '/cover/render.tmp-' . bin2hex(random_bytes(3));
        if (!is_dir($dir . '/cover')) mkdir($dir . '/cover', 0755, true);
        $in = fopen('php://input', 'rb'); $outF = fopen($tmp, 'wb'); $bytes = stream_copy_to_stream($in, $outF, 20 * 1048576 + 1); fclose($in); fclose($outF);
        $head = (string) file_get_contents($tmp, false, null, 0, 3);
        if ($bytes < 1000 || $bytes > 20 * 1048576 || $head !== "\xFF\xD8\xFF" || !@getimagesize($tmp)) { @unlink($tmp); http_response_code(415); exit(json_encode(['error' => 'Sampul harus JPEG (maks 20 MB)'])); }
        $cur = $dir . '/cover/render.jpg';
        if (is_file($cur) && !is_file($dir . '/cover/render-asli.jpg')) copy($cur, $dir . '/cover/render-asli.jpg');
        rename($tmp, $cur);
        exit(json_encode(['ok' => true]));
    }
    if ($what === 'sampul' || $what === 'sampul/foto') {
        $f = imzCoverFile($o['order_no'], $what === 'sampul' ? 'render' : 'photo');
        if (!$f) { http_response_code(404); exit('Sampul tidak ada'); }
        header('Content-Type: ' . $f[1]);
        header('Content-Length: ' . filesize($f[0]));
        header('X-Content-Type-Options: nosniff');
        if (isset($_GET['unduh'])) header('Content-Disposition: attachment; filename="' . $o['order_no'] . ($what === 'sampul' ? '-sampul-majalah.jpg' : '-sampul-foto-asli.' . $f[2]) . '"');
        readfile($f[0]);
        exit;
    }
    if (str_starts_with($what, 'cetak/')) {
        foreach ($photos as $p) {
            if ((int) $p['idx'] !== (int) $m[3]) continue;
            $file = imzPrintPhoto($o['order_no'], $p);
            // Tanpa Imagick/GD (atau HEIC tanpa Imagick): kirim foto asli; halaman album memberi peringatan kalau rasionya beda.
            [$fp, $mime] = $file ?: [imzPhotoPath($o['order_no'], $p['stored_name']), $p['mime']];
            header('Cache-Control: private, max-age=86400');
            header('Content-Type: ' . $mime);
            header('Content-Length: ' . filesize($fp));
            header('X-Content-Type-Options: nosniff');
            readfile($fp);
            exit;
        }
        http_response_code(404); exit('Foto tidak ada');
    }
    if (str_starts_with($what, 'foto/')) {
        foreach ($photos as $p) {
            if ((int) $p['idx'] === (int) $m[3]) {
                header('Content-Type: ' . $p['mime']);
                header('Content-Length: ' . (int) $p['bytes']);
                header('X-Content-Type-Options: nosniff');
                readfile(imzPhotoPath($o['order_no'], $p['stored_name']));
                exit;
            }
        }
        http_response_code(404); exit('Foto tidak ada');
    }
    if ($what === 'foto.zip') {
        @set_time_limit(0);   // ratusan foto asli bisa memakan waktu lebih dari batas bawaan
        ignore_user_abort(false);
        $zipPath = tempnam(sys_get_temp_dir(), 'imz');
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::OVERWRITE);
        foreach ($photos as $p) {
            $nm = sprintf('%03d-%s', (int) $p['idx'] + 1, preg_replace('/[^\w.\-]+/u', '_', (string) ($p['original_name'] ?: $p['stored_name'])));
            $zip->addFile(imzPhotoPath($o['order_no'], $p['stored_name']), $nm);
            $zip->setCompressionName($nm, ZipArchive::CM_STORE);   // foto sudah terkompresi
        }
        $zip->close();
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $o['order_no'] . '-foto.zip"');
        header('Content-Length: ' . filesize($zipPath));
        readfile($zipPath);
        @unlink($zipPath);
        exit;
    }

    imzAdminHead('Pesanan ' . $o['order_no']);
    $json = json_decode($o['order_json'], true) ?: [];
    ?>
    <div class="top"><div><a href="/imazine/admin">&larr; Semua pesanan</a><h1><?= e($o['order_no']) ?> <span class="pill <?= e($o['status']) ?>"><?= e($o['status']) ?></span><?php if (!empty($json['test'])): ?> <span class="pill uji">UJI</span><?php endif; ?></h1></div></div>
    <?php if (!empty($json['test'])): ?><div class="card" style="border-color:#d97706;background:rgba(217,119,6,.16);color:inherit;margin-bottom:12px"><strong>Pesanan uji.</strong> Album ini memakai foto contoh, jangan dicetak atau dikirim.</div><?php endif; ?>
    <div class="card"><dl>
      <dt>Pembeli</dt><dd><?= $o['name'] !== '' ? e($o['name']) : '<span class="muted">belum ada (diambil dari Mayar setelah bayar)</span>' ?></dd>
      <dt>WhatsApp</dt><dd><?= $o['whatsapp'] !== '' ? '<a href="https://wa.me/' . e(ltrim(preg_replace('/^0/', '62', $o['whatsapp']), '+')) . '">' . e($o['whatsapp']) . '</a>' : '<span class="muted">belum ada</span>' ?></dd>
      <dt>Email</dt><dd><?= e($o['email']) ?></dd>
      <?php $ship = imzOrderShipping($o['order_no']); ?>
      <dt>Alamat kirim</dt><dd><?php if ($ship): ?>
        <strong><?= e($ship['name']) ?></strong><?= $ship['phone'] !== '' ? ' &middot; ' . e($ship['phone']) : '' ?><br>
        <?= e($ship['address']) ?><?= $ship['postcode'] !== '' && strpos($ship['address'], $ship['postcode']) === false ? ' ' . e($ship['postcode']) : '' ?><br>
        <span class="muted"><?= e($ship['courier'] ?: 'Kurir') ?><?= $ship['service'] !== '' ? ' ' . e($ship['service']) : '' ?> &middot; ongkir <?= e(imzRupiah($ship['ongkir'])) ?><?= $ship['insurance'] ? ' + asuransi ' . e(imzRupiah($ship['insurance'])) : '' ?> &middot; dari Mayar<?= $ship['confirmed'] ? '' : ', pembayaran belum dicocokkan' ?>. Label, pickup, dan resi di dashboard Mayar (menu Order).</span>
      <?php else: ?><span class="muted">Belum ada. Muncul otomatis setelah pembeli membayar di Mayar (label, pickup, dan resi di dashboard Mayar, menu Order).</span><?php endif; ?></dd>
      <dt>Catatan</dt><dd><?= $o['note'] !== '' && $o['note'] !== null ? nl2br(e($o['note'])) : '<span class="muted">-</span>' ?></dd>
      <dt>Sampul / gaya</dt><dd><?= e((string) $o['cover_name']) ?> &middot; <?= e((string) ($json['template'] ?? '-')) ?></dd>
      <dt>Jumlah</dt><dd><?= (int) $o['qty'] ?> album &times; <?= e(imzRupiah((int) $o['unit_price'])) ?> = <strong><?= e(imzRupiah((int) $o['total'])) ?></strong> <span class="muted">(belum termasuk ongkir JNE)</span></dd>
      <dt>Dibuat</dt><dd><?= e($o['created_at']) ?></dd>
      <dt>Dibayar</dt><dd><?= $o['paid_at'] ? e($o['paid_at']) . ' (' . e(imzRupiah((int) $o['paid_amount'])) . ' termasuk ongkir, cocok via ' . e((string) $o['paid_method']) . ')' : '<span class="muted">belum</span>' ?></dd>
    </dl></div>

    <?php
    $pays = imzDb()->prepare("SELECT * FROM imazine_payments WHERE order_no = ? AND status = 'cocok' ORDER BY id");
    $pays->execute([$o['order_no']]);
    foreach ($pays->fetchAll() as $pay):
        $okName = $o['name'] === '' || imzNameSimilar((string) $pay['customer_name'], $o['name']);
        $okMail = strtolower(trim((string) $pay['customer_email'])) === strtolower(trim($o['email']));
        $okHp = imzPhoneKey($pay['customer_mobile']) !== '' && imzPhoneKey($pay['customer_mobile']) === imzPhoneKey($o['whatsapp']);
        $bad = !$okName || (!$okMail && !$okHp);
    ?>
    <h2>Pembayar di Mayar</h2>
    <div class="card" style="<?= $bad ? 'border-color:#ff8b7a' : '' ?>">
      <dl>
        <dt>Nama</dt><dd><?= e((string) $pay['customer_name']) ?> <?= $okName ? '<span style="color:var(--ok)">&#10003; sama</span>' : '<span class="err">&#9888; beda dari "' . e($o['name']) . '"</span>' ?></dd>
        <dt>Email</dt><dd><?= e((string) $pay['customer_email']) ?> <?= $okMail ? '<span style="color:var(--ok)">&#10003; sama</span>' : '<span class="err">&#9888; beda</span>' ?></dd>
        <dt>HP</dt><dd><?= e((string) $pay['customer_mobile']) ?> <?= $okHp ? '<span style="color:var(--ok)">&#10003; sama</span>' : '<span class="err">&#9888; beda</span>' ?></dd>
        <dt>Nominal</dt><dd><?= e(imzRupiah((int) $pay['amount'])) ?> (termasuk ongkir) &middot; <?= e($pay['created_at']) ?> &middot; cocok via <?= e((string) $pay['match_method']) ?></dd>
      </dl>
      <?php if ($bad): ?><p class="err" style="margin:10px 0 0">Data pembayar tidak sepenuhnya sama dengan pesanan. Pastikan ini orang yang sama sebelum paket dikirim.</p><?php endif; ?>
    </div>
    <?php endforeach; ?>

    <?php if ($o['status'] === 'lunas'): ?>
    <h2>Pengemasan</h2>
    <form class="acts" method="post" action="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/dikemas">
      <?php if ($o['shipped_at']): ?>
        <span class="muted">Dikemas <?= e(date('d M Y H:i', (int) $o['shipped_at'])) ?>.</span>
        <button class="btn ghost" type="submit" name="aksi" value="batal">Batalkan tanda dikemas</button>
      <?php else: ?>
        <button class="btn" type="submit">Tandai sudah dikemas</button>
        <span class="muted">Alamat, label JNE, pickup, dan resi diurus di dashboard Mayar (menu Order).</span>
      <?php endif; ?>
    </form>
    <?php endif; ?>
    <?php if (is_array($json['magCover'] ?? null)): $mc = $json['magCover']; $cr = imzCoverFile($o['order_no'], 'render'); $cp = imzCoverFile($o['order_no'], 'photo'); ?>
    <h2>Sampul majalah</h2>
    <div class="card" style="margin-bottom:12px">
      <p style="margin:0 0 10px"><strong>Gaya <?= e((string) ($mc['style'] ?? '')) ?></strong> &middot; <?= (int) ($mc['render']['width'] ?? 0) ?>&times;<?= (int) ($mc['render']['height'] ?? 0) ?> px<br><span class="muted">Foto asli pembeli: <?= e((string) ($mc['photoName'] ?? '')) ?> (<?= (int) ($mc['original']['width'] ?? 0) ?>&times;<?= (int) ($mc['original']['height'] ?? 0) ?> px). Render Full HD dibuat di browser pembeli dari foto yang dinaikkan skalanya, bukan AI.</span></p>
      <?php if ($cr): ?>
        <a href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/sampul" target="_blank"><img src="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/sampul" alt="Sampul majalah" style="max-width:220px;border:1px solid #ccc;display:block;margin-bottom:10px"></a>
        <a class="btn" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/sampul?unduh=1">Unduh sampul (JPEG)</a>
        <?php if ($cp): ?> <a class="btn" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/sampul/foto?unduh=1">Unduh foto asli sampul</a><?php endif; ?>
      <?php else: ?><span class="muted">Belum terunggah.</span><?php endif; ?>
    </div>
    <?php endif; ?>
    <h2>Berkas</h2>
    <?php $allIn = count($photos) >= (int) $o['photo_count']; ?>
    <div class="card" style="margin-bottom:12px">
      <?php if (!empty($json['editedAt'])): ?><p class="muted" style="margin:0 0 8px">Sudah diedit tim <?= (int) ($json['editCount'] ?? 1) ?>&times;, terakhir <?= e(date('d M Y H:i', strtotime((string) $json['editedAt']))) ?>. Versi asli pembeli tersimpan di server (order-asli.json).</p><?php endif; ?>
      <p style="margin:0 0 10px"><strong>Album jadi (PDF A4)</strong><br><span class="muted">40 halaman persis seperti yang disusun pembeli: tata letak, crop foto, dan semua teksnya. Foto dipakai dalam ukuran cetak, bukan versi kecil dari browser.</span></p>
      <?php if ($allIn): ?>
        <a class="btn" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/album" target="_blank">Buka album &amp; simpan PDF</a>
        <a class="btn ghost" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/edit">Edit album</a>
      <?php else: ?>
        <span class="muted">Belum bisa: baru <?= count($photos) ?> dari <?= (int) $o['photo_count'] ?> foto terunggah.</span>
      <?php endif; ?>
    </div>
    <p class="acts">
      <a class="btn ghost" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/data.json">Unduh data pesanan (.json)</a>
      <a class="btn ghost" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/slip" target="_blank">Cetak slip kemasan</a>
      <?php if ($photos): ?><a class="btn ghost" href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/foto.zip">Unduh semua foto asli (.zip)</a><?php endif; ?>
    </p>
    <h2>Foto asli (<?= count($photos) ?> dari <?= (int) $o['photo_count'] ?>)</h2>
    <?php if ($photos): ?>
      <div class="previews">
        <?php foreach (array_slice($photos, 0, 8) as $p): ?>
          <a href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/foto/<?= (int) $p['idx'] ?>"><img loading="lazy" alt="Foto <?= (int) $p['idx'] + 1 ?>" src="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/foto/<?= (int) $p['idx'] ?>"></a>
        <?php endforeach; ?>
      </div>
      <table style="margin-top:14px"><thead><tr><th>#</th><th>Nama file</th><th class="hide-s">Jenis</th><th>Ukuran</th></tr></thead><tbody>
        <?php foreach ($photos as $p): ?>
          <tr><td><?= (int) $p['idx'] + 1 ?></td><td class="fname"><a href="/imazine/admin/pesanan/<?= e($o['order_no']) ?>/foto/<?= (int) $p['idx'] ?>"><?= e((string) ($p['original_name'] ?: $p['stored_name'])) ?></a></td><td class="hide-s"><?= e($p['mime']) ?></td><td style="white-space:nowrap"><?= e(number_format($p['bytes'] / 1048576, 2, ',', '.')) ?> MB</td></tr>
        <?php endforeach; ?>
      </tbody></table>
    <?php else: ?><p class="muted">Belum ada foto yang terunggah.</p><?php endif; ?>
    <?php
    imzAdminFoot();
    exit;
}

// ---- daftar ----
imzPurgeStale();
$filter = $_GET['status'] ?? '';
$allowed = ['draf', 'menunggu_bayar', 'lunas', 'perlu_dikemas'];
$sql = 'SELECT order_no, status, name, email, cover_name, qty, total, photo_count, created_at, paid_at, shipped_at, (order_json LIKE \'%"test":true%\') AS is_test FROM imazine_orders';
$args = [];
if ($filter === 'perlu_dikemas') { $sql .= " WHERE status = 'lunas' AND shipped_at IS NULL"; }
elseif (in_array($filter, $allowed, true)) { $sql .= ' WHERE status = ?'; $args[] = $filter; }
$st = imzDb()->prepare($sql . ' ORDER BY id DESC LIMIT 300');
$st->execute($args);
$rows = $st->fetchAll();

imzAdminHead('Pesanan Imazine');
?>
<div class="top"><div><h1>Pesanan Imazine</h1><span class="muted"><?= count($rows) ?> pesanan</span></div>
  <div class="top-acts"><a class="btn" href="/imazine/admin/slip" target="_blank">Cetak slip belum dikemas</a><form method="post" action="/imazine/admin/keluar"><button class="btn ghost" type="submit">Keluar</button></form></div></div>
<?php
$need = imzDb()->query("SELECT * FROM imazine_payments WHERE status = 'perlu_cek' ORDER BY id DESC LIMIT 100")->fetchAll();
if ($need): ?>
<h2>Pembayaran perlu dicek (<?= count($need) ?>)</h2>
<?php foreach ($need as $pay): ?>
  <div class="card" style="margin-bottom:10px">
    <p style="margin:0 0 6px"><strong><?= e($pay['customer_name'] ?: '(tanpa nama)') ?></strong> &middot; <?= e(imzRupiah((int) $pay['amount'])) ?> &middot; <span class="muted"><?= e($pay['created_at']) ?></span></p>
    <p class="muted" style="margin:0 0 10px"><?= e($pay['customer_email']) ?> &middot; <?= e($pay['customer_mobile']) ?><br><?= e((string) $pay['note']) ?></p>
    <?php $pship = imzShipFromRaw($pay['raw']); if ($pship): ?><p style="margin:0 0 10px;font-size:14px">Kirim ke: <strong><?= e($pship['name']) ?></strong> &middot; <?= e($pship['address']) ?> &middot; <?= e($pship['courier']) ?> <?= e($pship['service']) ?></p><?php endif; ?>
    <?php $sg = $pay['order_no'] ? imzOrder($pay['order_no']) : null; if ($sg): ?>
      <p style="margin:0 0 10px;font-size:14px">Dugaan pesanan: <a href="/imazine/admin/pesanan/<?= e($sg['order_no']) ?>"><?= e($sg['order_no']) ?></a> &middot; <strong><?= e($sg['email']) ?></strong> &middot; sampul <?= e((string) $sg['cover_name']) ?> &middot; <?= (int) $sg['photo_count'] ?> foto &middot; dibuat <?= e($sg['created_at']) ?> &middot; <?= e(imzRupiah((int) $sg['total'])) ?></p>
    <?php endif; ?>
    <form class="acts match-form" method="post" action="/imazine/admin/pembayaran/<?= (int) $pay['id'] ?>" style="margin:0">
      <input name="order_no" placeholder="IMZ-XXXXXX" value="<?= e((string) $pay['order_no']) ?>" maxlength="10" autocapitalize="characters" aria-label="Nomor pesanan">
      <button class="btn" type="submit">Cocokkan ke pesanan</button>
      <button class="btn ghost" type="submit" name="aksi" value="abaikan">Abaikan</button>
    </form>
  </div>
<?php endforeach; endif; ?>
<nav class="filters" aria-label="Saring status">
<?php foreach (['' => ['Semua', ''], 'lunas' => ['Lunas', 'lunas'], 'perlu_dikemas' => ['Perlu dikemas', 'lunas'], 'menunggu_bayar' => ['Menunggu bayar', 'menunggu_bayar'], 'draf' => ['Draf', '']] as $k => [$lbl, $cls]): ?>
  <a class="pill <?= $cls ?><?= $filter === $k ? ' on' : '' ?>" href="/imazine/admin<?= $k !== '' ? '?status=' . $k : '' ?>"<?= $filter === $k ? ' aria-current="page"' : '' ?>><?= $lbl ?></a>
<?php endforeach; ?>
</nav>
<?php if (!$rows): ?><p class="muted">Belum ada pesanan.</p><?php else: ?>
<table class="orders"><thead><tr><th>Nomor</th><th>Status</th><th>Pembeli</th><th class="hide-s">Sampul</th><th class="hide-s">Foto</th><th>Total</th><th>Dikemas</th><th class="hide-s hide-m">Dibuat</th></tr></thead><tbody>
<?php foreach ($rows as $r): ?>
  <tr>
    <td class="c-no"><a href="/imazine/admin/pesanan/<?= e($r['order_no']) ?>"><?= e($r['order_no']) ?></a></td>
    <td class="c-st"><span class="pill <?= e($r['status']) ?>"><?= e($r['status']) ?></span><?php if ($r['is_test']): ?> <span class="pill uji" title="Memakai foto contoh. Jangan dicetak.">UJI</span><?php endif; ?></td>
    <td class="c-buyer fname"><?= e($r['name'] !== '' ? $r['name'] : $r['email']) ?></td>
    <td class="c-cover hide-s"><?= e((string) $r['cover_name']) ?></td>
    <td class="c-photos hide-s"><?= (int) $r['photo_count'] ?></td>
    <td class="c-total"><?= e(imzRupiah((int) $r['total'])) ?></td>
    <td class="c-ship"><?= $r['status'] === 'lunas' ? ($r['shipped_at'] ? e(date('d M H:i', (int) $r['shipped_at'])) : '<span class="muted">belum</span>') : '' ?></td>
    <td class="c-date hide-s hide-m muted"><?= e($r['created_at']) ?></td>
  </tr>
<?php endforeach; ?>
</tbody></table>
<?php endif; imzAdminFoot();
