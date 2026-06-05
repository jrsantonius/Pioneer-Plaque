<?php

function handlePioneerApi(string $pioneerId): void {
    $pioneer = getPioneerById($pioneerId);
    if (!$pioneer) {
        jsonResponse(['error' => 'Pioneer not found'], 404);
    }

    jsonResponse([
        'pioneer_id' => $pioneer['pioneer_id'],
        'unique_code' => $pioneer['unique_code'],
        'batch_number' => $pioneer['batch_number'],
        'claim_status' => $pioneer['claim_status'],
        'claim_date' => $pioneer['claim_date'],
        'full_name' => $pioneer['full_name'] ?: 'FULL NAME',
        'email' => $pioneer['email'],
        'phone' => $pioneer['phone'],
        'username' => $pioneer['username'],
        'registered' => !empty($pioneer['registered_at']),
    ]);
}
