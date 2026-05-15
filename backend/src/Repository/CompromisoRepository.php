<?php

namespace App\Repository;

class CompromisoRepository extends BaseRepository
{
    protected string $table = 'compromisos';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['c.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['tipo'])) { $conditions[] = "c.tipo = ?"; $params[] = $filtros['tipo']; }
        if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }
        if (!empty($filtros['responsable_id'])) { $conditions[] = "c.responsable_id = ?"; $params[] = $filtros['responsable_id']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT c.*, CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre FROM compromisos c INNER JOIN usuarios u ON u.id = c.responsable_id WHERE {$where} ORDER BY c.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
