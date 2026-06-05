<?php
/**
 * TIS Pioneer - Database Seeder
 * Seeds 500 pioneers (TIS-0001 to TIS-0500) with random unique codes.
 *
 * Usage: php seed.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

function generateUniqueCode(int $length = 8): string {
    // No ambiguous characters (0/O, 1/I/L)
    $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

echo "=== TIS Pioneer Database Seeder ===\n\n";

$db = getDb();

// Check if pioneers already exist
$count = $db->query('SELECT COUNT(*) FROM pioneers')->fetchColumn();
if ($count > 0) {
    echo "Database already has {$count} pioneers.\n";
    echo "Do you want to re-seed? This will DELETE all existing data. (yes/no): ";
    $answer = trim(fgets(STDIN));
    if (strtolower($answer) !== 'yes') {
        echo "Aborted.\n";
        exit(0);
    }
    $db->exec('DELETE FROM sessions');
    $db->exec('DELETE FROM pioneers');
    echo "Cleared existing data.\n\n";
}

echo "Seeding 500 pioneers (TIS-0001 to TIS-0500)...\n";

$stmt = $db->prepare('INSERT INTO pioneers (pioneer_id, unique_code, batch_number) VALUES (?, ?, ?)');
$usedCodes = [];

$db->beginTransaction();

for ($i = 1; $i <= 500; $i++) {
    $pioneerId = sprintf('TIS-%04d', $i);

    // Generate unique code (ensure no duplicates)
    do {
        $code = generateUniqueCode();
    } while (isset($usedCodes[$code]));
    $usedCodes[$code] = true;

    $stmt->execute([$pioneerId, $code, 'BATCH-01']);

    if ($i % 50 === 0) {
        echo "  Seeded {$i}/500...\n";
    }
}

$db->commit();

echo "\nDone! 500 pioneers seeded successfully.\n\n";

// Show first 10 as sample
echo "Sample pioneers (first 10):\n";
echo str_repeat('-', 45) . "\n";
echo sprintf("%-12s %-12s %s\n", 'Pioneer ID', 'Unique Code', 'Batch');
echo str_repeat('-', 45) . "\n";

$samples = $db->query('SELECT pioneer_id, unique_code, batch_number FROM pioneers ORDER BY id LIMIT 10')->fetchAll();
foreach ($samples as $s) {
    echo sprintf("%-12s %-12s %s\n", $s['pioneer_id'], $s['unique_code'], $s['batch_number']);
}

echo str_repeat('-', 45) . "\n";
echo "\nUse any unique code above to login at the website.\n";
