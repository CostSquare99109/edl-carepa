<?php
declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database
{
 private static ?PDO $instance = null;

 /**
 * Resuelve la constante MySQL_ATTR_FOUND_ROWS segun la version de PHP.
 *
 * PHP 8.5 deprecó la constante global PDO::MYSQL_ATTR_FOUND_ROWS a favor
 * de la constante tipada \Pdo\Mysql::ATTR_FOUND_ROWS. Este helper
 * selecciona la constante disponible en tiempo de ejecucion y permite
 * que el codigo siga funcionando en PHP 8.2-8.4 y en 8.5+.
 *
 * @return int
 */
 private static function pdoMysqlAttr(): int
 {
 if (defined('\\Pdo\\Mysql::ATTR_FOUND_ROWS')) {
 return \Pdo\Mysql::ATTR_FOUND_ROWS;
 }
 if (defined('PDO::MYSQL_ATTR_FOUND_ROWS')) {
 return \PDO::MYSQL_ATTR_FOUND_ROWS;
 }
 return -1;
 }

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
 self::pdoMysqlAttr() => true,
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
