<?php
/**
 * TIS Pioneer - Database Helper (PDO SQLite)
 */

require_once __DIR__ . '/config.php';

function getDb(): PDO {
    static $db = null;
    if ($db === null) {
        $db = new PDO('sqlite:' . DB_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $db->exec('PRAGMA journal_mode = WAL');
        $db->exec('PRAGMA foreign_keys = ON');
        initDb($db);
    }
    return $db;
}

function initDb(PDO $db): void {
    $db->exec("
        CREATE TABLE IF NOT EXISTS pioneers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pioneer_id TEXT UNIQUE NOT NULL,
            unique_code TEXT UNIQUE NOT NULL,
            batch_number TEXT NOT NULL DEFAULT 'BATCH-01',
            claim_status TEXT NOT NULL DEFAULT 'UNCLAIMED',
            claim_date TEXT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            birth_date TEXT,
            username TEXT UNIQUE,
            bio TEXT,
            registered_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            pioneer_id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            expires_at TEXT NOT NULL,
            FOREIGN KEY (pioneer_id) REFERENCES pioneers(pioneer_id)
        );
    ");
}

// ==================== Pioneer Queries ====================

function getPioneerByCode(string $code): ?array {
    $stmt = getDb()->prepare('SELECT * FROM pioneers WHERE unique_code = ?');
    $stmt->execute([strtoupper(trim($code))]);
    return $stmt->fetch() ?: null;
}

function getPioneerById(string $pioneerId): ?array {
    $stmt = getDb()->prepare('SELECT * FROM pioneers WHERE pioneer_id = ?');
    $stmt->execute([$pioneerId]);
    return $stmt->fetch() ?: null;
}

function getPioneerByUsername(string $username): ?array {
    $stmt = getDb()->prepare('SELECT * FROM pioneers WHERE username = ?');
    $stmt->execute([$username]);
    return $stmt->fetch() ?: null;
}

function registerPioneer(string $pioneerId, array $data): void {
    $stmt = getDb()->prepare("
        UPDATE pioneers SET
            full_name = ?, email = ?, phone = ?, address = ?, birth_date = ?,
            username = ?, bio = ?, registered_at = datetime('now','localtime'),
            claim_status = 'CLAIMED', claim_date = COALESCE(claim_date, datetime('now','localtime'))
        WHERE pioneer_id = ?
    ");
    $stmt->execute([
        $data['full_name'], $data['email'], $data['phone'],
        $data['address'] ?? null, $data['birth_date'] ?? null,
        $data['username'], $data['bio'] ?? null, $pioneerId
    ]);
}

function updatePioneerProfile(string $pioneerId, array $data): void {
    $stmt = getDb()->prepare("
        UPDATE pioneers SET
            full_name = ?, email = ?, phone = ?, address = ?, birth_date = ?,
            username = ?, bio = ?
        WHERE pioneer_id = ?
    ");
    $stmt->execute([
        $data['full_name'], $data['email'], $data['phone'],
        $data['address'] ?? null, $data['birth_date'] ?? null,
        $data['username'], $data['bio'] ?? null, $pioneerId
    ]);
}

// ==================== Session Queries ====================

function generateToken(int $length = 64): string {
    return bin2hex(random_bytes($length / 2));
}

function createSession(string $pioneerId): string {
    $token = generateToken();
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
    $stmt = getDb()->prepare('INSERT INTO sessions (token, pioneer_id, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$token, $pioneerId, $expiresAt]);
    return $token;
}

function getSessionPioneer(string $token): ?array {
    $stmt = getDb()->prepare("
        SELECT pioneer_id FROM sessions WHERE token = ? AND expires_at > datetime('now','localtime')
    ");
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    if (!$session) return null;
    return getPioneerById($session['pioneer_id']);
}

function deleteSessionByToken(string $token): void {
    $stmt = getDb()->prepare('DELETE FROM sessions WHERE token = ?');
    $stmt->execute([$token]);
}

function cleanupExpiredSessions(): void {
    getDb()->exec("DELETE FROM sessions WHERE expires_at <= datetime('now','localtime')");
}

// ==================== Auth Helpers ====================

function getCurrentPioneer(): ?array {
    $token = $_COOKIE['tis_session'] ?? null;
    if (!$token) return null;
    return getSessionPioneer($token);
}

function requireAuth(): array {
    $pioneer = getCurrentPioneer();
    if (!$pioneer) {
        header('Location: ' . BASE_URL . '/login');
        exit;
    }
    return $pioneer;
}

function requireRegistered(): array {
    $pioneer = requireAuth();
    if (empty($pioneer['registered_at'])) {
        header('Location: ' . BASE_URL . '/register');
        exit;
    }
    return $pioneer;
}

function setSessionCookie(string $token): void {
    setcookie('tis_session', $token, [
        'expires' => time() + SESSION_LIFETIME,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => isset($_SERVER['HTTPS']),
    ]);
}

function clearSessionCookie(): void {
    setcookie('tis_session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
