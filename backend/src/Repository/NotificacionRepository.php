<?php

namespace App\Repository;

class NotificacionRepository extends BaseRepository
{
    protected string $table = 'notificaciones';

    public function listarPorUsuario(int $usuarioId, int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT ? OFFSET ?");
        $stmt->execute([$usuarioId, $porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function marcarLeida(int $id, int $usuarioId): bool
    {
        $stmt = $this->pdo->prepare("UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?");
        return $stmt->execute([$id, $usuarioId]);
    }

    public function crearNotificacion(int $usuarioId, string $titulo, string $mensaje, string $tipo = 'info'): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)");
        $stmt->execute([$usuarioId, $titulo, $mensaje, $tipo]);
        return (int) $this->pdo->lastInsertId();
    }
}
