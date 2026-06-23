<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class EvidenciaRepository extends BaseRepository
{
    protected string $table = 'evidencias';

    /**
     * Listar evidencias con relaciones (compromiso, periodo, usuario registrador)
     * Filtros soportados: concertacion_id, compromiso_id, periodo_id, registrado_por, tipo, evaluado_id
     */
    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = ['e.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['concertacion_id'])) {
            $conditions[] = "e.concertacion_id = ?";
            $params[] = (int) $filtros['concertacion_id'];
        }
        if (!empty($filtros['compromiso_id'])) {
            $conditions[] = "e.compromiso_id = ?";
            $params[] = (int) $filtros['compromiso_id'];
        }
        if (!empty($filtros['periodo_id'])) {
            $conditions[] = "e.periodo_id = ?";
            $params[] = (int) $filtros['periodo_id'];
        }
        if (!empty($filtros['registrado_por'])) {
            $conditions[] = "e.registrado_por = ?";
            $params[] = (int) $filtros['registrado_por'];
        }
        if (!empty($filtros['tipo'])) {
            $conditions[] = "e.tipo = ?";
            $params[] = $filtros['tipo'];
        }

        // Filtro por evaluado: buscar evidencias donde la concertacion pertenece al evaluado
        if (!empty($filtros['evaluado_id'])) {
            $conditions[] = "e.concertacion_id IN (SELECT id FROM concertaciones WHERE evaluado_id = ? AND eliminado_en IS NULL)";
            $params[] = (int) $filtros['evaluado_id'];
        }

        $where = implode(' AND ', $conditions);

        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evidencias e WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("
            SELECT e.*,
                c.descripcion AS compromiso_descripcion,
                c.tipo AS compromiso_tipo,
                p.nombre AS periodo_nombre,
                u.nombres AS reg_nombre,
                u.apellidos AS reg_apellido
            FROM evidencias e
            LEFT JOIN compromisos c ON c.id = e.compromiso_id
            LEFT JOIN periodos p ON p.id = e.periodo_id
            INNER JOIN usuarios u ON u.id = e.registrado_por
            WHERE {$where}
            ORDER BY e.creado_en DESC
            LIMIT ? OFFSET ?
        ");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        $evidencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($evidencias as &$ev) {
            $ev['registrado_nombre'] = trim(($ev['reg_nombre'] ?? '') . ' ' . ($ev['reg_apellido'] ?? ''));
            unset($ev['reg_nombre'], $ev['reg_apellido']);
        }

        return [
            'data' => $evidencias,
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => $total > 0 ? (int) ceil($total / $porPagina) : 0
        ];
    }

    /**
     * Buscar una evidencia por ID con relaciones
     */
    public function buscarPorIdConRelaciones(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT e.*,
                c.descripcion AS compromiso_descripcion,
                c.tipo AS compromiso_tipo,
                p.nombre AS periodo_nombre,
                u.nombres AS reg_nombre,
                u.apellidos AS reg_apellido
            FROM evidencias e
            LEFT JOIN compromisos c ON c.id = e.compromiso_id
            LEFT JOIN periodos p ON p.id = e.periodo_id
            INNER JOIN usuarios u ON u.id = e.registrado_por
            WHERE e.id = ? AND e.eliminado_en IS NULL
        ");
        $stmt->execute([$id]);
        $ev = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ev) {
            return null;
        }
        $ev['registrado_nombre'] = trim(($ev['reg_nombre'] ?? '') . ' ' . ($ev['reg_apellido'] ?? ''));
        unset($ev['reg_nombre'], $ev['reg_apellido']);
        return $ev;
    }

    /**
     * Obtener compromisos concertados para un evaluado en un periodo
     */
    public function compromisosPorEvaluadoYPeriodo(int $evaluadoId, int $periodoId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT comp.*
            FROM compromisos comp
            INNER JOIN concertaciones conc ON conc.id = comp.concertacion_id AND conc.eliminado_en IS NULL
            WHERE conc.evaluado_id = ?
              AND conc.periodo_id = ?
              AND comp.estado IN ('aprobado', 'en_progreso', 'cumplido')
              AND comp.eliminado_en IS NULL
            ORDER BY comp.tipo, comp.id
        ");
        $stmt->execute([$evaluadoId, $periodoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Buscar concertacion activa de un evaluado en un periodo
     */
    public function concertacionPorEvaluadoYPeriodo(int $evaluadoId, int $periodoId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT conc.*
            FROM concertaciones conc
            WHERE conc.evaluado_id = ?
              AND conc.periodo_id = ?
              AND conc.eliminado_en IS NULL
            LIMIT 1
        ");
        $stmt->execute([$evaluadoId, $periodoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
