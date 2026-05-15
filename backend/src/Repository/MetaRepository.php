<?php

namespace App\Repository;

class MetaRepository extends BaseRepository
{
    protected string $table = 'metas';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['m.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['periodo_id'])) {
            $conditions[] = "m.periodo_id = ?";
            $params[] = $filtros['periodo_id'];
        }
        if (!empty($filtros['funcionario_id'])) {
            $conditions[] = "m.funcionario_id = ?";
            $params[] = $filtros['funcionario_id'];
        }
        if (!empty($filtros['evaluador_id'])) {
            $conditions[] = "m.evaluador_id = ?";
            $params[] = $filtros['evaluador_id'];
        }
        if (!empty($filtros['estado'])) {
            $conditions[] = "m.estado = ?";
            $params[] = $filtros['estado'];
        }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM metas m WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT m.*, CONCAT(f.nombres, ' ', f.apellidos) as funcionario_nombre, CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre, p.nombre as periodo_nombre FROM metas m INNER JOIN usuarios f ON f.id = m.funcionario_id INNER JOIN usuarios e ON e.id = m.evaluador_id INNER JOIN periodos p ON p.id = m.periodo_id WHERE {$where} ORDER BY m.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function evidenciasPorMeta(int $metaId): array
    {
        $stmt = $this->pdo->prepare("SELECT e.*, CONCAT(u.nombres, ' ', u.apellidos) as subido_por_nombre FROM evidencias e INNER JOIN usuarios u ON u.id = e.subido_por WHERE e.meta_id = ? AND e.eliminado_en IS NULL ORDER BY e.id DESC");
        $stmt->execute([$metaId]);
        return $stmt->fetchAll();
    }
}
