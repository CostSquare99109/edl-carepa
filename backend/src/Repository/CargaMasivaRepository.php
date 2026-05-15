<?php

namespace App\Repository;

class CargaMasivaRepository extends BaseRepository
{
    protected string $table = 'cargas_masivas';

    public function listarPorUsuario(int $usuarioId, int $pagina = 1, int $porPagina = 20): array
    {
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM cargas_masivas WHERE usuario_id = ?");
        $stmt->execute([$usuarioId]);
        $total = (int) $stmt->fetchColumn();

        $stmt = $this->pdo->prepare("SELECT * FROM cargas_masivas WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT ? OFFSET ?");
        $stmt->execute([$usuarioId, $porPagina, $offset]);
        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function registrarCarga(int $usuarioId, string $tipo, string $nombreArchivo, string $rutaArchivo): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO cargas_masivas (usuario_id, tipo, nombre_archivo, ruta_archivo, estado) VALUES (?, ?, ?, ?, 'pendiente')");
        $stmt->execute([$usuarioId, $tipo, $nombreArchivo, $rutaArchivo]);
        return (int) $this->pdo->lastInsertId();
    }

    public function actualizarResultado(int $id, int $total, int $exitosos, int $fallidos, string $estado, ?string $detalle = null): void
    {
        $stmt = $this->pdo->prepare("UPDATE cargas_masivas SET registros_total = ?, registros_exitosos = ?, registros_fallidos = ?, estado = ?, resultado_detalle = ? WHERE id = ?");
        $stmt->execute([$total, $exitosos, $fallidos, $estado, $detalle, $id]);
    }
}
