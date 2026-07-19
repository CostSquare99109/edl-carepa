<?php
declare(strict_types=1);

namespace App\Repository;

use PDO;

/**
 * Repository para Paquete 1: Compromisos Funcionales.
 *
 * Opera EXCLUSIVAMENTE sobre la tabla `compromisos` con `tipo='funcional'`
 * (la columna `tipo` es ENUM('funcional') tras la separación de paquetes).
 * Los compromisos comportamentales se gestionan a través de
 * CompromisoComportamentalRepository (Paquete 2).
 */
class CompromisoRepository extends BaseRepository
{
    protected string $table = 'compromisos';

    public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $joins = '';
        $conditions = ["c.tipo = 'funcional'", 'c.eliminado_en IS NULL'];
        $params = [];

        if (!empty($filtros['estado'])) {
            $conditions[] = 'c.estado = ?';
            $params[] = $filtros['estado'];
        }
        if (!empty($filtros['concertacion_id'])) {
            $conditions[] = 'c.concertacion_id = ?';
            $params[] = $filtros['concertacion_id'];
        }

        if (!empty($filtros['evaluador_id'])) {
            $joins = 'INNER JOIN concertaciones con ON con.id = c.concertacion_id';
            $conditions[] = 'con.evaluador_id = ?';
            $params[] = $filtros['evaluador_id'];
        }
        if (!empty($filtros['evaluado_id'])) {
            if (empty($joins)) {
                $joins = 'INNER JOIN concertaciones con ON con.id = c.concertacion_id';
            }
            $conditions[] = 'con.evaluado_id = ?';
            $params[] = $filtros['evaluado_id'];
        }

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c {$joins} WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $selectExtra = $joins ? ', con.evaluador_id, con.evaluado_id' : ', NULL AS evaluador_id, NULL AS evaluado_id';
        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("
            SELECT c.*{$selectExtra},
                   m.descripcion as meta_descripcion
            FROM compromisos c
            {$joins}
            LEFT JOIN metas m ON m.id = c.meta_id
            WHERE {$where}
            ORDER BY c.id
            LIMIT ? OFFSET ?
        ");
        $params[] = $porPagina;
        $params[] = $offset;
        $stmt->execute($params);

        return [
            'data' => $stmt->fetchAll(),
            'total' => $total,
            'pagina' => $pagina,
            'por_pagina' => $porPagina,
            'total_paginas' => ceil($total / $porPagina),
        ];
    }

    public function pendientesPorEvaluador(int $evaluadorId, int $pagina = 1, int $porPagina = 20, ?string $estado = 'propuesto'): array
    {
        // Si no se pasa estado, por defecto 'propuesto' (compatibilidad).
        // Soporta multiples estados separados por coma (ej. 'propuesto,devuelto').
        $estadosValidos = ['propuesto', 'devuelto', 'aprobado', 'rechazado', 'rechazado_evaluado'];
        $estados = array_filter(array_map('trim', explode(',', (string) $estado)));
        $estados = array_values(array_intersect($estados, $estadosValidos));
        if (empty($estados)) {
            $estados = ['propuesto'];
        }
        $placeholders = implode(',', array_fill(0, count($estados), '?'));
        $paramsEstados = $estados;

        $conditions = [
            "c.tipo = 'funcional'",
            'c.eliminado_en IS NULL',
            "c.estado IN ({$placeholders})",
            'con.evaluador_id = ?',
        ];
        $params = array_merge($paramsEstados, [$evaluadorId]);

        $where = implode(' AND ', $conditions);
        $countStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM compromisos c
            INNER JOIN concertaciones con ON con.id = c.concertacion_id
            WHERE {$where}
        ");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($pagina - 1) * $porPagina;
        $stmt = $this->pdo->prepare("
            SELECT c.*,
                   ev.primer_nombre as ev_nombre, ev.primer_apellido as ev_apellido,
                   ed.primer_nombre as ed_nombre, ed.primer_apellido as ed_apellido,
                   p.nombre as periodo_nombre
            FROM compromisos c
            INNER JOIN concertaciones con ON con.id = c.concertacion_id
            INNER JOIN usuarios ev ON ev.id = con.evaluador_id
            INNER JOIN usuarios ed ON ed.id = con.evaluado_id
            LEFT JOIN periodos p ON p.id = con.periodo_id
            WHERE {$where}
            ORDER BY c.creado_en ASC LIMIT ? OFFSET ?
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
        $stmt = $this->pdo->prepare("SELECT COALESCE(SUM(peso), 0) FROM compromisos WHERE concertacion_id = ? AND tipo = 'funcional' AND eliminado_en IS NULL AND estado != 'rechazado'");
        $stmt->execute([$concertacionId]);
        return (float) $stmt->fetchColumn();
    }

    public function contarPorConcertacion(int $concertacionId): int
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE concertacion_id = ? AND tipo = 'funcional' AND eliminado_en IS NULL AND estado NOT IN ('cumplido','incumplido','rechazado')");
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

    public function buscarConMetas(int $evaluacionId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT c.*,
                    m.descripcion as meta_descripcion
             FROM compromisos c
             INNER JOIN concertaciones con ON con.id = c.concertacion_id
             INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
             LEFT JOIN metas m ON m.id = c.meta_id
             WHERE ev.id = ? AND c.tipo = 'funcional' AND c.eliminado_en IS NULL
             ORDER BY c.id"
        );
        $stmt->execute([$evaluacionId]);
        return $stmt->fetchAll();
    }

    public function listarPorConcertacion(int $concertacionId, bool $soloVivos = true): array
    {
        $sql = "SELECT * FROM compromisos WHERE concertacion_id = ? AND tipo = 'funcional'";
        if ($soloVivos) {
            $sql .= " AND eliminado_en IS NULL";
        }
        $sql .= " ORDER BY id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$concertacionId]);
        return $stmt->fetchAll();
    }

    public function getPdo(): PDO
    {
        return $this->pdo;
    }
}