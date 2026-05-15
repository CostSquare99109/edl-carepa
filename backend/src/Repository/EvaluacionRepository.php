<?php

namespace App\Repository;

class EvaluacionRepository extends BaseRepository
{
    protected string $table = 'evaluaciones';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['ev.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['periodo_id'])) { $conditions[] = "ev.periodo_id = ?"; $params[] = $filtros['periodo_id']; }
        if (!empty($filtros['evaluado_id'])) { $conditions[] = "ev.evaluado_id = ?"; $params[] = $filtros['evaluado_id']; }
        if (!empty($filtros['evaluador_id'])) { $conditions[] = "ev.evaluador_id = ?"; $params[] = $filtros['evaluador_id']; }
        if (!empty($filtros['tipo'])) { $conditions[] = "ev.tipo = ?"; $params[] = $filtros['tipo']; }
        if (!empty($filtros['estado'])) { $conditions[] = "ev.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evaluaciones ev WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("SELECT ev.*, CONCAT(ev2.nombres, ' ', ev2.apellidos) as evaluado_nombre, CONCAT(ev3.nombres, ' ', ev3.apellidos) as evaluador_nombre, p.nombre as periodo_nombre FROM evaluaciones ev INNER JOIN usuarios ev2 ON ev2.id = ev.evaluado_id INNER JOIN usuarios ev3 ON ev3.id = ev.evaluador_id INNER JOIN periodos p ON p.id = ev.periodo_id WHERE {$where} ORDER BY ev.id DESC LIMIT ? OFFSET ?");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
    }

    public function compromisosPorEvaluacion(int $evaluacionId): array
    {
        $stmt = $this->pdo->prepare("SELECT c.*, CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre FROM compromisos c INNER JOIN usuarios u ON u.id = c.responsable_id WHERE c.evaluacion_id = ? AND c.eliminado_en IS NULL ORDER BY c.id DESC");
        $stmt->execute([$evaluacionId]);
        return $stmt->fetchAll();
    }
}
