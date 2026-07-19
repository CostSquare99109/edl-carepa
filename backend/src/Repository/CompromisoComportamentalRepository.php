<?php
declare(strict_types=1);

namespace App\Repository;

use PDO;

/**
 * Repository para Paquete 2: Compromisos Comportamentales.
 *
 * Opera sobre la tabla `compromisos` con filtro `tipo = 'comportamental'`.
 */
class CompromisoComportamentalRepository extends BaseRepository
{
    protected string $table = 'compromisos';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $joins = '';
        $conditions = ['cc.eliminado_en IS NULL', "cc.tipo = 'comportamental'"];
        $params = [];

        if (!empty($filtros['estado'])) {
            $conditions[] = "cc.estado = ?";
            $params[] = $filtros['estado'];
        }
        if (!empty($filtros['concertacion_id'])) {
            $conditions[] = "cc.concertacion_id = ?";
            $params[] = $filtros['concertacion_id'];
        }
        if (!empty($filtros['competencia_codigo'])) {
            $conditions[] = "cc.competencia_codigo = ?";
            $params[] = $filtros['competencia_codigo'];
        }

        if (!empty($filtros['evaluador_id'])) {
            $joins = "INNER JOIN concertaciones con ON con.id = cc.concertacion_id";
            $conditions[] = "con.evaluador_id = ?";
            $params[] = $filtros['evaluador_id'];
        }
        if (!empty($filtros['evaluado_id'])) {
            if (empty($joins)) {
                $joins = "INNER JOIN concertaciones con ON con.id = cc.concertacion_id";
            }
            $conditions[] = "con.evaluado_id = ?";
            $params[] = $filtros['evaluado_id'];
        }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos cc {$joins} WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $selectExtra = $joins ? ', con.evaluador_id, con.evaluado_id' : ', NULL AS evaluador_id, NULL AS evaluado_id';
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("
            SELECT cc.*{$selectExtra},
                   comp.nombre as competencia_nombre,
                   comp.decreto as competencia_decreto,
                   (
                       SELECT CONCAT('[',
                              GROUP_CONCAT(
                                  JSON_OBJECT('id', co.id, 'texto', co.texto, 'orden', co.orden)
                                  ORDER BY co.orden
                                  SEPARATOR ','
                              ),
                              ']')
                       FROM conductas co
                       WHERE co.competencia_codigo = cc.competencia_codigo
                         AND co.activo = 1
                   ) AS conductas_json_list
            FROM compromisos cc
            {$joins}
            LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
            WHERE {$where}
            ORDER BY cc.id
            LIMIT ? OFFSET ?
        ");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            if (!empty($row['conductas_json_list'])) {
                $decoded = json_decode($row['conductas_json_list'], true);
                $row['conductas'] = is_array($decoded) ? $decoded : [];
            } else {
                $row['conductas'] = [];
            }
            unset($row['conductas_json_list']);
        }

        return [
            'data' => $rows,
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => ceil($total / $porPagina),
        ];
    }

    public function pendientesPorEvaluador(int $evaluadorId, int $pagina = 1, int $porPagina = 20): array
    {
        $conditions = [
            'cc.eliminado_en IS NULL',
            "cc.tipo = 'comportamental'",
            "cc.estado = 'propuesto'",
            'con.evaluador_id = ?',
        ];
        $params = [$evaluadorId];

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM compromisos cc
            INNER JOIN concertaciones con ON con.id = cc.concertacion_id
            WHERE {$where}
        ");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("
            SELECT cc.*,
                   ev.primer_nombre as ev_nombre, ev.primer_apellido as ev_apellido,
                   ed.primer_nombre as ed_nombre, ed.primer_apellido as ed_apellido,
                   p.nombre as periodo_nombre,
                   comp.nombre as competencia_nombre
            FROM compromisos cc
            INNER JOIN concertaciones con ON con.id = cc.concertacion_id
            INNER JOIN usuarios ev ON ev.id = con.evaluador_id
            INNER JOIN usuarios ed ON ed.id = con.evaluado_id
            LEFT JOIN periodos p ON p.id = con.periodo_id
            LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
            WHERE {$where}
            ORDER BY cc.creado_en ASC LIMIT ? OFFSET ?
        ");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['evaluador_nombre'] = trim(($item['ev_nombre'] ?? '') . ' ' . ($item['ev_apellido'] ?? ''));
            $item['evaluado_nombre'] = trim(($item['ed_nombre'] ?? '') . ' ' . ($item['ed_apellido'] ?? ''));
            unset($item['ev_nombre'], $item['ev_apellido'], $item['ed_nombre'], $item['ed_apellido']);
        }

        return [
            'data' => $items,
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => ceil($total / $porPagina),
        ];
    }

    public function sumPesosPorConcertacion(int $concertacionId): float
    {
        $stmt = $this->pdo->prepare("SELECT COALESCE(SUM(peso), 0) FROM compromisos WHERE concertacion_id = ? AND eliminado_en IS NULL AND estado != 'rechazado' AND tipo = 'comportamental'");
        $stmt->execute([$concertacionId]);
        return (float) $stmt->fetchColumn();
    }

    public function contarPorConcertacion(int $concertacionId): int
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE concertacion_id = ? AND eliminado_en IS NULL AND tipo = 'comportamental' AND estado NOT IN ('cumplido','incumplido','rechazado')");
        $stmt->execute([$concertacionId]);
        return (int) $stmt->fetchColumn();
    }

    public function resolverConcertacionId(int $evaluacionId): ?int
    {
        $stmt = $this->pdo->prepare("SELECT concertacion_id FROM evaluaciones WHERE id = ? AND eliminado_en IS NULL");
        $stmt->execute([$evaluacionId]);
        $val = $stmt->fetchColumn();
        return $val ? (int) $val : null;
    }

    public function buscarConConductas(int $evaluacionId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT cc.*, cc.calificacion as puntaje,
                    comp.nombre as competencia_nombre,
                    comp.decreto as competencia_decreto,
                    co.id as conducta_id,
                    co.texto as conducta_texto,
                    co.orden as conducta_orden
             FROM compromisos cc
             LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
             LEFT JOIN conductas co ON co.competencia_codigo = cc.competencia_codigo AND co.activo = 1
             INNER JOIN concertaciones con ON con.id = cc.concertacion_id
             INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
             WHERE ev.id = ? AND cc.eliminado_en IS NULL AND cc.tipo = 'comportamental'
             ORDER BY cc.id, co.orden"
        );
        $stmt->execute([$evaluacionId]);
        $rows = $stmt->fetchAll();

        $compromisos = [];
        foreach ($rows as $row) {
            $id = (int) $row['id'];
            if (!isset($compromisos[$id])) {
                $compromisos[$id] = $row;
                $compromisos[$id]['tipo'] = 'comportamental';
                $compromisos[$id]['conductas'] = [];
                unset($compromisos[$id]['conducta_id'], $compromisos[$id]['conducta_texto'], $compromisos[$id]['conducta_orden']);
            }
            if ($row['conducta_id']) {
                $compromisos[$id]['conductas'][] = [
                    'id' => (int) $row['conducta_id'],
                    'competencia_codigo' => $row['competencia_codigo'],
                    'texto' => $row['conducta_texto'],
                    'orden' => (int) $row['conducta_orden'],
                    'valoracion' => null,
                ];
            }
        }

        $result = array_values($compromisos);
        foreach ($result as &$comp) {
            if (!empty($comp['conductas_json'])) {
                $saved = json_decode($comp['conductas_json'], true);
                if (is_array($saved)) {
                    $valMap = [];
                    foreach ($saved as $item) {
                        $cid = $item['conducta_id'] ?? $item['id'] ?? null;
                        if ($cid !== null && isset($item['valoracion'])) {
                            $valMap[(int) $cid] = $item['valoracion'];
                        }
                    }
                    foreach ($comp['conductas'] as &$cond) {
                        if (isset($valMap[$cond['id']])) {
                            $cond['valoracion'] = $valMap[$cond['id']];
                        }
                    }
                }
            }
            unset($comp['conductas_json']);
        }
        return $result;
    }

    public function listarPorConcertacion(int $concertacionId, bool $soloVivos = true): array
    {
        $sql = "SELECT cc.*, comp.nombre as competencia_nombre
                FROM compromisos cc
                LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
                WHERE cc.concertacion_id = ? AND cc.tipo = 'comportamental'";
        if ($soloVivos) {
            $sql .= " AND cc.eliminado_en IS NULL";
        }
        $sql .= " ORDER BY cc.id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$concertacionId]);
        return $stmt->fetchAll();
    }

    public function buscarPorId(int $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ? AND eliminado_en IS NULL AND tipo = 'comportamental'");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function getPdo(): PDO
    {
        return $this->pdo;
    }
}