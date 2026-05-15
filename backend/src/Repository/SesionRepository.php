<?php

namespace App\Repository;

use PDO;

class SesionRepository extends BaseRepository
{
    protected string $table = 'sesiones';
    protected string $primaryKey = 'id';

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function crearSesion(int $usuarioId, string $tokenHash, string $ip, string $userAgent, string $expiracion): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO sesiones (usuario_id, token_hash, ip_address, user_agent, fecha_expiracion) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$usuarioId, $tokenHash, $ip, $userAgent, $expiracion]);
        return (int) $this->pdo->lastInsertId();
    }

    public function buscarPorTokenHash(string $tokenHash): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM sesiones WHERE token_hash = ? LIMIT 1");
        $stmt->execute([$tokenHash]);
        return $stmt->fetch() ?: null;
    }

    public function revocarPorUsuario(int $usuarioId): void
    {
        $stmt = $this->pdo->prepare("UPDATE sesiones SET revocada = 1 WHERE usuario_id = ? AND revocada = 0");
        $stmt->execute([$usuarioId]);
    }

    public function limpiarExpiradas(): int
    {
        $stmt = $this->pdo->prepare("DELETE FROM sesiones WHERE fecha_expiracion < NOW()");
        $stmt->execute();
        return $stmt->rowCount();
    }
}
