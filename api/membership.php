<?php

function handleMembership(): void {
    $pioneer = getCurrentPioneer();
    if (!$pioneer) {
        jsonResponse(['error' => 'Not authenticated'], 401);
    }

    if (empty($pioneer['registered_at'])) {
        jsonResponse(['error' => 'Not registered yet'], 403);
    }

    $membershipUrl = BASE_URL . '/verify/' . $pioneer['pioneer_id'];

    jsonResponse([
        'pioneer_id' => $pioneer['pioneer_id'],
        'username' => $pioneer['username'],
        'full_name' => $pioneer['full_name'],
        'email' => $pioneer['email'],
        'phone' => $pioneer['phone'],
        'address' => $pioneer['address'],
        'birth_date' => $pioneer['birth_date'],
        'bio' => $pioneer['bio'],
        'batch_number' => $pioneer['batch_number'],
        'claim_status' => $pioneer['claim_status'],
        'claim_date' => $pioneer['claim_date'],
        'registered_at' => $pioneer['registered_at'],
        'membership_url' => $membershipUrl,
    ]);
}
