<?php

namespace App\Repository;

class ConcertacionRepository extends BaseRepository
{
    protected string $table = 'concertaciones';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['c.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['meta_id'])) { $conditions[] = "c.meta_id = ?"; $params[] = $filtros['meta_id']; }
        if (!empty($filtros['funcionario_id'])) { $conditions[] = "c.funcionario_id = ?"; $params[] = $filtros['funcionario_id']; }
        if (!empty($filtros['evaluador_id'])) { $conditions[] = "c.evaluador_id = ?"; $params[] = $filtros['evaluador_id']; }
        if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM concertaciones c WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT c.*, m.descripcion as meta_descripcion, CONCAT(f.nombres, ' ', f.apellidos) as funcionario_nombre, CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre FROM concertaciones c INNER JOIN metas m ON m.id = c.meta_id INNER JOIN usuarios f ON f.id = c.funcionario_id INNER JOIN usuarios e ON e.id = c.evaluador_id WHERE {$where} ORDER BY c.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
