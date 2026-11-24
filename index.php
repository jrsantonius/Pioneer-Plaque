<?php
/**
 * TIS Pioneer - Main Router
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/includes/functions.php';

// Parse request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Determine base path - on PHP built-in server SCRIPT_NAME equals the request path,
// so we use SCRIPT_FILENAME to detect if running through the router (index.php).
$scriptName = $_SERVER['SCRIPT_NAME'];
if (php_sapi_name() === 'cli-server') {
    // Built-in server with router: basePath is always /
    $basePath = '/';
} else {
    $basePath = dirname($scriptName);
}

if ($basePath !== '/' && $basePath !== '\\') {
    $requestUri = substr($requestUri, strlen($basePath));
}
$requestUri = '/' . ltrim($requestUri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Serve static files on built-in server
if (php_sapi_name() === 'cli-server') {
    $filePath = __DIR__ . $requestUri;
    if ($requestUri !== '/' && !str_starts_with($requestUri, '/storage/') && is_file($filePath)) {
        return false; // let built-in server handle static files
    }
}

// ==================== API Routes ====================

if (str_starts_with($requestUri, '/api/')) {
    header('Content-Type: application/json');

    // POST /api/auth - Login
    if ($requestUri === '/api/auth' && $method === 'POST') {
        require __DIR__ . '/api/auth.php';
        handleLogin();
        exit;
    }

    // GET /api/auth - Check session
    if ($requestUri === '/api/auth' && $method === 'GET') {
        require __DIR__ . '/api/auth.php';
        handleCheckSession();
        exit;
    }

    // DELETE /api/auth - Logout
    if ($requestUri === '/api/auth' && $method === 'DELETE') {
        require __DIR__ . '/api/auth.php';
        handleLogout();
        exit;
    }

    // POST /api/register
    if ($requestUri === '/api/register' && $method === 'POST') {
        require __DIR__ . '/api/register.php';
        handleRegister();
        exit;
    }

    // GET /api/membership
    if ($requestUri === '/api/membership' && $method === 'GET') {
        require __DIR__ . '/api/membership.php';
        handleMembership();
        exit;
    }

    // GET /api/pioneer/{code}
    if (preg_match('#^/api/pioneer/(TIS-\d{4})$#', $requestUri, $m)) {
        require __DIR__ . '/api/pioneer.php';
        handlePioneerApi($m[1]);
        exit;
    }

    // /api/imazine/* -> pesanan album Imazine (Mayar, unggah foto, webhook)
    if (str_starts_with($requestUri, '/api/imazine/')) {
        require __DIR__ . '/api/imazine.php';
        imazineApi($requestUri, $method);
        exit;
    }

    jsonResponse(['error' => 'Not found'], 404);
}

// ==================== Page Routes ====================

// GET / -> Company Profile Homepage
if ($requestUri === '/') {
    require __DIR__ . '/pages/home.php';
    exit;
}

// GET /neosabang
if ($requestUri === '/neosabang') {
    require __DIR__ . '/pages/neosabang.php';
    exit;
}

// GET /imazine -> Imazine album prototype (single static file)
if ($requestUri === '/imazine' || $requestUri === '/imazine/') {
    // Kunjungan ulang cukup bertanya "masih sama?" (304, tanpa isi) alih-alih mengunduh ulang ~330 KB.
    $imzFile = __DIR__ . '/public/imazine/index.html';
    $imzTag = '"' . filemtime($imzFile) . '-' . filesize($imzFile) . '"';
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    header('ETag: ' . $imzTag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($imzFile)) . ' GMT');
    header('Vary: Accept-Encoding');
    if (trim($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $imzTag) { http_response_code(304); exit; }
    // Versi brotli tingkat maksimal (dibuat saat build, ~155 KB vs ~330 KB kompresi bawaan server). Dipakai hanya bila
    // lebih baru dari index.html, supaya tidak pernah menyajikan versi lama.
    $imzBr = $imzFile . '.br';
    if (str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'br') && is_file($imzBr) && filemtime($imzBr) >= filemtime($imzFile)) {
        header('Content-Encoding: br');
        header('Content-Length: ' . filesize($imzBr));
        readfile($imzBr);
        exit;
    }
    readfile($imzFile);
    exit;
}

// GET /imazine/terima-kasih -> tujuan redirect Mayar setelah bayar
if ($requestUri === '/imazine/terima-kasih') {
    require __DIR__ . '/pages/imazine-thanks.php';
    exit;
}

// GET /imazine/pesanan/{no}?t= -> status pesanan untuk pembeli
if (preg_match('#^/imazine/pesanan/(IMZ-[A-Z0-9]{6})$#', $requestUri, $m)) {
    $imzOrderNo = $m[1];
    require __DIR__ . '/pages/imazine-status.php';
    exit;
}

// /imazine/admin... -> daftar dan detail pesanan untuk tim
if ($requestUri === '/imazine/admin' || str_starts_with($requestUri, '/imazine/admin/')) {
    require __DIR__ . '/pages/imazine-admin.php';
    exit;
}

// GET /creativebusiness
if ($requestUri === '/creativebusiness') {
    require __DIR__ . '/pages/creativebusiness.php';
    exit;
}

// GET /demoreto -> short public link to the reader
if ($requestUri === '/demoreto') {
    require_once __DIR__ . '/storage/demoreto-secret.php';
    $readerToken = DEMORETO_TOKEN;
    require __DIR__ . '/pages/demoreto-reader.php';
    exit;
}

// GET /baca/demoreto/{token} -> protected book reader
if (preg_match('#^/baca/demoreto/([a-f0-9]{24})$#', $requestUri, $m)) {
    $readerToken = $m[1];
    require __DIR__ . '/pages/demoreto-reader.php';
    exit;
}

// GET /baca/demoreto/unduh?e=&s= -> signed PDF download
if ($requestUri === '/baca/demoreto/unduh') {
    $readerDownload = true;
    require __DIR__ . '/pages/demoreto-reader.php';
    exit;
}

// GET /baca/demoreto/page/{n}?e=&s= -> signed page image
if (preg_match('#^/baca/demoreto/page/(\d{1,2})$#', $requestUri, $m)) {
    require __DIR__ . '/pages/demoreto-reader.php';
    exit;
}

// GET /login
if ($requestUri === '/login') {
    require __DIR__ . '/pages/login.php';
    exit;
}

// GET /register
if ($requestUri === '/register') {
    require __DIR__ . '/pages/register.php';
    exit;
}

// GET /membership
if ($requestUri === '/membership') {
    require __DIR__ . '/pages/membership.php';
    exit;
}

// GET /pioneer/{code}
if (preg_match('#^/pioneer/(TIS-\d{4})$#', $requestUri, $m)) {
    $pioneerCode = $m[1];
    require __DIR__ . '/pages/pioneer.php';
    exit;
}

// GET /verify/{id}
if (preg_match('#^/verify/(TIS-\d{4})$#', $requestUri, $m)) {
    $verifyId = $m[1];
    require __DIR__ . '/pages/verify.php';
    exit;
}

// 404
http_response_code(404);
$pageTitle = 'Not Found - TIS';
require __DIR__ . '/includes/header.php';
echo '<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h1 class="text-2xl font-bold text-gray-700 mb-2">404</h1><p class="text-gray-500">Halaman yang kamu cari tidak ada. Mungkin link-nya salah ketik atau halamannya sudah dipindah.</p><a href="' . BASE_URL . '/login" class="mt-4 inline-block text-sm text-gray-600 underline">Kembali ke Login</a></div></div>';
require __DIR__ . '/includes/footer.php';
