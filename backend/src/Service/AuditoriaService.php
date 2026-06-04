<?php

namespace App\Service;

use App\Config\Database;
use App\Middleware\AuthMiddleware;
use App\Helper\IpHelper;

class AuditoriaService
{
 public static function registrar(string $accion, string $entidad, int $registroId, ?array $datosAnteriores = null, ?array $datosNuevos = null): void
 {
 $pdo = Database::getInstance();
 $user = AuthMiddleware::user();
 $ip = IpHelper::clientIp();
 $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

        $stmt = $pdo->prepare("INSERT INTO auditoria (usuario_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'] ?? null,
            $accion,
            $entidad,
            $registroId,
            $datosAnteriores ? json_encode($datosAnteriores) : null,
            $datosNuevos ? json_encode($datosNuevos) : null,
            $ip,
            $ua
        ]);
    }
}
