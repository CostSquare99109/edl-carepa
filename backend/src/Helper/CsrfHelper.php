<?php

namespace App\Helper;

use App\Config\Env;

class CsrfHelper
{
 private static int $tokenLifetime = 3600;

 public static function generar(): string
 {
 $token = bin2hex(random_bytes(32));
 $expiracion = time() + self::$tokenLifetime;

 $pdo = \App\Config\Database::getInstance();
 $stmt = $pdo->prepare("INSERT INTO csrf_tokens (token, expiracion, creado_en) VALUES (?, ?, NOW())");
 $stmt->execute([$token, date('Y-m-d H:i:s', $expiracion)]);

 return $token;
 }

 public static function validar(string $token): bool
 {
 if (empty($token)) {
 return false;
 }

 $pdo = \App\Config\Database::getInstance();
 $stmt = $pdo->prepare("SELECT id FROM csrf_tokens WHERE token = ? AND expiracion > NOW() AND utilizado = 0");
 $stmt->execute([$token]);
 $row = $stmt->fetch();

 if (!$row) {
 return false;
 }

 $stmt = $pdo->prepare("UPDATE csrf_tokens SET utilizado = 1, utilizado_en = NOW() WHERE id = ?");
 $stmt->execute([$row['id']]);

 return true;
 }

 public static function limpiarExpirados(): void
 {
 $pdo = \App\Config\Database::getInstance();
 $stmt = $pdo->prepare("DELETE FROM csrf_tokens WHERE expiracion < NOW()");
 $stmt->execute();
 }
}
