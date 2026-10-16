<?php
declare(strict_types=1);

/**
 * Debug script for database connection.
 * Uses the exact same logic as Database.php but exposes the real PDO error.
 */

// 1. Load Env class
require_once __DIR__ . '/src/Config/Env.php';

use App\Config\Env;

// Load .env
try {
    Env::load(__DIR__ . '/.env');
    echo "[OK] .env loaded\n";
} catch (Throwable $e) {
    echo "[FAIL] .env load: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. Read env vars exactly like Database::connect()
$host = Env::require('DB_HOST');
$name = Env::get('DB_DATABASE') ?: Env::require('DB_NAME');
$user = Env::require('DB_USER');
$pass = Env::require('DB_PASS');
$port = Env::get('DB_PORT', '3306');
$socket = Env::get('DB_SOCKET', '');

echo "--- Env values ---\n";
echo "DB_HOST:       '{$host}'\n";
echo "DB_NAME:       '{$name}'\n";
echo "DB_USER:       '{$user}'\n";
echo "DB_PASS:       '" . ($pass ? str_repeat('*', strlen($pass)) : '(empty)') . "'\n";
echo "DB_PORT:       '{$port}'\n";
echo "DB_SOCKET:     '{$socket}'\n";

// 3. Build DSN exactly like Database.php
$dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
if ($socket) {
    $dsn .= ";unix_socket={$socket}";
} elseif ($port !== '3306') {
    $dsn .= ";port={$port}";
}

echo "--- DSN ---\n";
echo "DSN: {$dsn}\n";

// 4. Resolve PDO::MYSQL_ATTR_FOUND_ROWS like Database.php does
if (defined('\\Pdo\\Mysql::ATTR_FOUND_ROWS')) {
    $foundRowsConst = \Pdo\Mysql::ATTR_FOUND_ROWS;
    echo "[OK] Using \\Pdo\\Mysql::ATTR_FOUND_ROWS\n";
} elseif (defined('PDO::MYSQL_ATTR_FOUND_ROWS')) {
    $foundRowsConst = \PDO::MYSQL_ATTR_FOUND_ROWS;
    echo "[OK] Using PDO::MYSQL_ATTR_FOUND_ROWS\n";
} else {
    $foundRowsConst = -1;
    echo "[WARN] No FOUND_ROWS constant found, using -1\n";
}

// 5. Check PHP extensions
echo "--- PHP Extensions ---\n";
echo "pdo:       " . (extension_loaded('pdo') ? 'YES' : 'NO') . "\n";
echo "pdo_mysql: " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
echo "mysqlnd:   " . (extension_loaded('mysqlnd') ? 'YES' : 'NO') . "\n";

// 6. Attempt connection with full error detail
echo "--- Connection attempt ---\n";

// Test 1: Using socket (original logic)
echo "\n[TEST 1] PDO connection with socket\n";
try {
    $pdo = new PDO($dsn, $user, $pass, [
        $foundRowsConst => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    echo "[OK] Connected successfully!\n";
    $stmt = $pdo->query('SELECT VERSION() AS v');
    $row = $stmt->fetch();
    echo "MySQL version: " . $row['v'] . "\n";
} catch (PDOException $e) {
    echo "[FAIL] Error code: " . $e->getCode() . "\n";
    echo "[FAIL] Error message: " . $e->getMessage() . "\n";
    echo "[FAIL] File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    // Show all PDO debug info
    echo "[FAIL] PDO errorInfo: " . print_r($pdo->errorInfo() ?? 'no pdo object', true) . "\n";
    echo "\n";
}

// Test 2: Without socket (TCP only) as fallback test
echo "\n[TEST 2] PDO connection via TCP only (no socket)\n";
$dsn_tcp = "mysql:host={$host};dbname={$name};charset=utf8mb4" . ($port !== '3306' ? ";port={$port}" : "");
echo "DSN: {$dsn_tcp}\n";
try {
    $pdo2 = new PDO($dsn_tcp, $user, $pass, [
        $foundRowsConst => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    echo "[OK] Connected via TCP!\n";
    $stmt = $pdo2->query('SELECT DATABASE() AS db');
    $row = $stmt->fetch();
    echo "Database: " . $row['db'] . "\n";
} catch (PDOException $e) {
    echo "[FAIL] Error: " . $e->getMessage() . "\n";
}

// Test 3: Connection with PHP 8.5 new Pdo\Mysql class directly (if available)
echo "\n[TEST 3] Using Pdo\\Mysql driver directly (PHP 8.5+)\n";
if (class_exists('\\Pdo\\Mysql')) {
    try {
        $pdo3 = new \Pdo\Mysql($dsn_tcp, $user, $pass, [
            \Pdo\Mysql::ATTR_FOUND_ROWS => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        echo "[OK] Connected via Pdo\\Mysql!\n";
    } catch (PDOException $e) {
        echo "[FAIL] Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "[SKIP] Class Pdo\\Mysql not available\n";
}

echo "\n--- All tests done ---\n";
