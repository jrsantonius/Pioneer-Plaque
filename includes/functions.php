<?php
/**
 * TIS Pioneer - Helper Functions
 */

function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function formatDate(?string $date, string $format = 'd M Y'): string {
    if (!$date) return '-';
    return strtoupper(date($format, strtotime($date)));
}

function isValidEmail(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function isValidUsername(string $username): bool {
    return preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username) === 1;
}

function isValidPhone(string $phone): bool {
    $digits = preg_replace('/\D/', '', $phone);
    return strlen($digits) >= 8;
}

function asset(string $path): string {
    return BASE_URL . '/public/' . ltrim($path, '/');
}
