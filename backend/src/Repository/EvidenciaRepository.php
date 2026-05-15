<?php

namespace App\Repository;

class EvidenciaRepository extends BaseRepository
{
    protected string $table = 'evidencias';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['e.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['meta_id'])) { $conditions[] = "e.meta_id = ?"; $params[] = $filtros['meta_id']; }
        if (!empty($filtros['compromiso_id'])) { $conditions[] = "e.compromiso_id = ?"; $params[] = $filtros['compromiso_id']; }
        if (!empty($filtros['subido_por'])) { $conditions[] = "e.subido_por = ?"; $params[] = $filtros['subido_por']; }
        if (!empty($filtros['estado'])) { $conditions[] = "e.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evidencias e WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT e.*, CONCAT(u.nombres, ' ', u.apellidos) as subido_por_nombre FROM evidencias e INNER JOIN usuarios u ON u.id = e.subido_por WHERE {$where} ORDER BY e.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
