<?php

function handleLogin(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = $input['unique_code'] ?? '';

    if (empty($code) || !is_string($code)) {
        jsonResponse(['error' => 'Unique code is required'], 400);
    }

    cleanupExpiredSessions();

    $pioneer = getPioneerByCode($code);
    if (!$pioneer) {
        jsonResponse(['error' => 'Invalid unique code. Please check and try again.'], 401);
    }

    $token = createSession($pioneer['pioneer_id']);
    setSessionCookie($token);

    jsonResponse([
        'success' => true,
        'pioneer_id' => $pioneer['pioneer_id'],
        'registered' => !empty($pioneer['registered_at']),
    ]);
}

function handleCheckSession(): void {
    $pioneer = getCurrentPioneer();
    if (!$pioneer) {
        jsonResponse(['authenticated' => false], 401);
    }

    jsonResponse([
        'authenticated' => true,
        'pioneer_id' => $pioneer['pioneer_id'],
        'registered' => !empty($pioneer['registered_at']),
        'full_name' => $pioneer['full_name'],
        'username' => $pioneer['username'],
        'email' => $pioneer['email'],
        'phone' => $pioneer['phone'],
        'address' => $pioneer['address'],
        'birth_date' => $pioneer['birth_date'],
        'bio' => $pioneer['bio'],
        'batch_number' => $pioneer['batch_number'],
        'claim_status' => $pioneer['claim_status'],
        'claim_date' => $pioneer['claim_date'],
    ]);
}

function handleLogout(): void {
    $token = $_COOKIE['tis_session'] ?? null;
    if ($token) {
        deleteSessionByToken($token);
    }
    clearSessionCookie();
    jsonResponse(['success' => true]);
}
