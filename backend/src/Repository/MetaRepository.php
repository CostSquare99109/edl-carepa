<?php
declare(strict_types=1);

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
        if (!empty($filtros['dependencia_id'])) {
            $conditions[] = "m.dependencia_id = ?";
            $params[] = $filtros['dependencia_id'];
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
        $stmt = $this->pdo->prepare("SELECT m.*, d.nombre as dependencia_nombre, p.nombre as periodo_nombre FROM metas m LEFT JOIN dependencias d ON d.id = m.dependencia_id LEFT JOIN periodos p ON p.id = m.periodo_id WHERE {$where} ORDER BY m.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function evidenciasPorMeta(int $metaId): array
    {
        $stmt = $this->pdo->prepare("SELECT e.*, TRIM(CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido)) as registrado_por_nombre FROM evidencias e INNER JOIN usuarios u ON u.id = e.registrado_por INNER JOIN compromisos c ON c.id = e.compromiso_id AND c.meta_id = ? WHERE e.eliminado_en IS NULL ORDER BY e.id DESC");
        $stmt->execute([$metaId]);
        return $stmt->fetchAll();
    }
}
