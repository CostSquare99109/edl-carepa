<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
 private static ?PDO $instance = null;

 public static function getInstance(): PDO
 {
 if (self::$instance === null) {
 self::connect();
 }
 return self::$instance;
 }

 private static function connect(): void
 {
 $host = Env::require('DB_HOST');
 $name = Env::get('DB_DATABASE') ?: Env::require('DB_NAME');
 $user = Env::require('DB_USER');
 $pass = Env::require('DB_PASS');

 $port = Env::get('DB_PORT', '3306');
 $socket = Env::get('DB_SOCKET', '');

 $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
 if ($socket) {
 $dsn .= ";unix_socket={$socket}";
 } elseif ($port !== '3306') {
 $dsn .= ";port={$port}";
 }

 try {
 self::$instance = new PDO($dsn, $user, $pass, [
 PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
 PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
 PDO::ATTR_EMULATE_PREPARES => false,
 ]);
 } catch (PDOException $e) {
 throw new \RuntimeException('Database connection failed');
 }
 }

 public static function transaction(callable $callback): mixed
 {
 $pdo = self::getInstance();
 $pdo->beginTransaction();
 try {
 $result = $callback($pdo);
 $pdo->commit();
 return $result;
 } catch (\Throwable $e) {
 $pdo->rollBack();
 throw $e;
 }
 }
}
