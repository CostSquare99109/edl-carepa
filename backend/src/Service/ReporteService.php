<?php

namespace App\Service;

use App\Config\Database;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class ReporteService
{
    public function concertacion(array $filtros): array
    {
        $pdo = Database::getInstance();
        $conditions = ['c.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['periodo_id'])) { $conditions[] = "m.periodo_id = ?"; $params[] = $filtros['periodo_id']; }
        if (!empty($filtros['entidad_id'])) { $conditions[] = "u.entidad_id = ?"; $params[] = $filtros['entidad_id']; }
        if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $stmt = $pdo->prepare("SELECT c.estado, COUNT(*) as total FROM concertaciones c INNER JOIN metas m ON m.id = c.meta_id INNER JOIN usuarios u ON u.id = c.funcionario_id WHERE {$where} GROUP BY c.estado");
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function evaluaciones(array $filtros): array
    {
        $pdo = Database::getInstance();
        $conditions = ['ev.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['periodo_id'])) { $conditions[] = "ev.periodo_id = ?"; $params[] = $filtros['periodo_id']; }
        if (!empty($filtros['tipo'])) { $conditions[] = "ev.tipo = ?"; $params[] = $filtros['tipo']; }
        if (!empty($filtros['estado'])) { $conditions[] = "ev.estado = ?"; $params[] = $filtros['estado']; }

        $where = implode(' AND ', $conditions);
        $stmt = $pdo->prepare("SELECT ev.tipo, ev.estado, COUNT(*) as total, AVG(ev.puntaje) as promedio FROM evaluaciones ev WHERE {$where} GROUP BY ev.tipo, ev.estado");
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function funcionario(int $funcionarioId): array
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id, nombres, apellidos, documento, cargo, estado FROM usuarios WHERE id = ? AND eliminado_en IS NULL");
        $stmt->execute([$funcionarioId]);
        $funcionario = $stmt->fetch();
        if (!$funcionario) {
            ResponseHelper::error('Funcionario no encontrado', 404);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) as total, AVG(puntaje) as promedio FROM evaluaciones WHERE evaluado_id = ? AND eliminado_en IS NULL");
        $stmt->execute([$funcionarioId]);
        $evalStats = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM metas WHERE funcionario_id = ? AND eliminado_en IS NULL");
        $stmt->execute([$funcionarioId]);
        $metaStats = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM compromisos c INNER JOIN evaluaciones ev ON ev.id = c.evaluacion_id WHERE ev.evaluado_id = ? AND c.eliminado_en IS NULL");
        $stmt->execute([$funcionarioId]);
        $compStats = $stmt->fetch();

        return [
            'funcionario' => $funcionario,
            'evaluaciones' => $evalStats,
            'metas' => $metaStats,
            'compromisos' => $compStats
        ];
    }
}
