<?php

function handleRegister(): void {
    $pioneer = getCurrentPioneer();
    if (!$pioneer) {
        jsonResponse(['error' => 'Not authenticated'], 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        jsonResponse(['error' => 'Invalid request data'], 400);
    }

    $fullName  = trim($input['full_name'] ?? '');
    $email     = trim($input['email'] ?? '');
    $phone     = trim($input['phone'] ?? '');
    $address   = trim($input['address'] ?? '');
    $birthDate = trim($input['birth_date'] ?? '');
    $username  = trim($input['username'] ?? '');
    $bio       = trim($input['bio'] ?? '');

    // Validation
    if (empty($fullName) || empty($email) || empty($phone) || empty($username)) {
        jsonResponse(['error' => 'Full name, email, phone, and username are required'], 400);
    }

    if (!isValidEmail($email)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }

    if (!isValidPhone($phone)) {
        jsonResponse(['error' => 'Phone number must have at least 8 digits'], 400);
    }

    if (!isValidUsername($username)) {
        jsonResponse(['error' => 'Username must be 3-30 characters, only letters, numbers, and underscores'], 400);
    }

    // Check username uniqueness
    $existing = getPioneerByUsername($username);
    if ($existing && $existing['pioneer_id'] !== $pioneer['pioneer_id']) {
        jsonResponse(['error' => 'Username is already taken'], 409);
    }

    $data = [
        'full_name' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'address' => $address ?: null,
        'birth_date' => $birthDate ?: null,
        'username' => $username,
        'bio' => $bio ?: null,
    ];

    if (!empty($pioneer['registered_at'])) {
        updatePioneerProfile($pioneer['pioneer_id'], $data);
    } else {
        registerPioneer($pioneer['pioneer_id'], $data);
    }

    jsonResponse(['success' => true, 'message' => 'Profile saved successfully']);
}
