<?php

namespace App\Repository;

class MovilidadRepository extends BaseRepository
{
    protected string $table = 'movilidades';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['m.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['funcionario_id'])) { $conditions[] = "m.funcionario_id = ?"; $params[] = $filtros['funcionario_id']; }
        if (!empty($filtros['tipo'])) { $conditions[] = "m.tipo = ?"; $params[] = $filtros['tipo']; }
        if (!empty($filtros['estado'])) { $conditions[] = "m.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM movilidades m WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT m.*, CONCAT(u.nombres, ' ', u.apellidos) as funcionario_nombre, eo.nombre as entidad_origen, ed.nombre as entidad_destino FROM movilidades m INNER JOIN usuarios u ON u.id = m.funcionario_id LEFT JOIN entidades eo ON eo.id = m.entidad_origen_id LEFT JOIN entidades ed ON ed.id = m.entidad_destino_id WHERE {$where} ORDER BY m.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }
}
