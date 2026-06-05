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
    if ($requestUri !== '/' && is_file($filePath)) {
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

    jsonResponse(['error' => 'Not found'], 404);
}

// ==================== Page Routes ====================

// GET / -> Company Profile Homepage
if ($requestUri === '/') {
    require __DIR__ . '/pages/home.php';
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
echo '<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h1 class="text-2xl font-bold text-gray-700 mb-2">404</h1><p class="text-gray-500">Halaman tidak ditemukan.</p><a href="' . BASE_URL . '/login" class="mt-4 inline-block text-sm text-gray-600 underline">Kembali ke Login</a></div></div>';
require __DIR__ . '/includes/footer.php';
