<?php

namespace App\Repository;

class AusentismoRepository extends BaseRepository
{
    protected string $table = 'ausentismos';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['a.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['funcionario_id'])) { $conditions[] = "a.funcionario_id = ?"; $params[] = $filtros['funcionario_id']; }
        if (!empty($filtros['tipo'])) { $conditions[] = "a.tipo = ?"; $params[] = $filtros['tipo']; }
        if (!empty($filtros['estado'])) { $conditions[] = "a.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM ausentismos a WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT a.*, CONCAT(u.nombres, ' ', u.apellidos) as funcionario_nombre FROM ausentismos a INNER JOIN usuarios u ON u.id = a.funcionario_id WHERE {$where} ORDER BY a.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
