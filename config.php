<?php
/**
 * TIS Pioneer - Configuration
 */

// Base URL
define('BASE_URL', rtrim($_ENV['BASE_URL'] ?? 'https://theinnovatorsstudio.id', '/'));

// Database path
define('DB_PATH', __DIR__ . '/tis-pioneer.db');

// Session lifetime (30 hari)
define('SESSION_LIFETIME', 30 * 24 * 60 * 60);

// WhatsApp Group Link (GANTI dengan link group asli)
define('WHATSAPP_LINK', 'https://chat.whatsapp.com/YOUR_GROUP_LINK');

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Error reporting (matikan di production)
if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}
