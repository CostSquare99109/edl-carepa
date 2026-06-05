<?php

namespace App\Repository;

use PDO;

class CompromisoRepository extends BaseRepository
{
 protected string $table = 'compromisos';

 public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['c.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['tipo'])) { $conditions[] = "c.tipo = ?"; $params[] = $filtros['tipo']; }
 if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }
 if (!empty($filtros['concertacion_id'])) { $conditions[] = "c.concertacion_id = ?"; $params[] = $filtros['concertacion_id']; }
 if (!empty($filtros['competencia_codigo'])) { $conditions[] = "c.competencia_codigo = ?"; $params[] = $filtros['competencia_codigo']; }

 $where = implode(' AND ', $conditions);
 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT c.*,
 comp.nombre as competencia_nombre,
 m.descripcion as meta_descripcion
 FROM compromisos c
 LEFT JOIN competencias comp ON comp.codigo = c.competencia_codigo
 LEFT JOIN metas m ON m.id = c.meta_id
 WHERE {$where}
 ORDER BY c.tipo, c.id
 LIMIT ? OFFSET ?
 ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
 }

 public function pendientesPorEvaluador(int $evaluadorId, int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['c.eliminado_en IS NULL', "c.estado = 'propuesto'", 'con.evaluador_id = ?'];
 $params = [$evaluadorId];

 $where = implode(' AND ', $conditions);
 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c INNER JOIN concertaciones con ON con.id = c.concertacion_id WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT c.*,
 comp.nombre as competencia_nombre,
 con.evaluador_id,
 con.evaluado_id,
 ev.primer_nombre as ev_nombre, ev.primer_apellido as ev_apellido,
 ed.primer_nombre as ed_nombre, ed.primer_apellido as ed_apellido,
 p.nombre as periodo_nombre
 FROM compromisos c
 INNER JOIN concertaciones con ON con.id = c.concertacion_id
 INNER JOIN usuarios ev ON ev.id = con.evaluador_id
 INNER JOIN usuarios ed ON ed.id = con.evaluado_id
 INNER JOIN periodos p ON p.id = con.periodo_id
 LEFT JOIN competencias comp ON comp.codigo = c.competencia_codigo
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

 return ['data' => $items, 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
 }

 public function sumPesosPorConcertacionYTipo(int $concertacionId, string $tipo): float
 {
 $stmt = $this->pdo->prepare("SELECT COALESCE(SUM(peso), 0) FROM compromisos WHERE concertacion_id = ? AND tipo = ? AND eliminado_en IS NULL AND estado != 'rechazado'");
 $stmt->execute([$concertacionId, $tipo]);
 return (float) $stmt->fetchColumn();
 }

 public function contarPorConcertacionYTipo(int $concertacionId, string $tipo): int
 {
 $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE concertacion_id = ? AND tipo = ? AND eliminado_en IS NULL AND estado != 'rechazado'");
 $stmt->execute([$concertacionId, $tipo]);
 return (int) $stmt->fetchColumn();
 }
}
