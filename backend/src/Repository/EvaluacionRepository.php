<?php

namespace App\Repository;

use PDO;

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
 if (!empty($filtros['nivel_resultado'])) { $conditions[] = "ev.nivel_resultado = ?"; $params[] = $filtros['nivel_resultado']; }

 $where = implode(' AND ', $conditions);
 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evaluaciones ev WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT ev.*,
 TRIM(CONCAT_WS(' ', ed.primer_nombre, ed.segundo_nombre, ed.primer_apellido, ed.segundo_apellido)) as evaluado_nombre,
 ed.documento as evaluado_documento,
 TRIM(CONCAT_WS(' ', evr.primer_nombre, evr.segundo_nombre, evr.primer_apellido, evr.segundo_apellido)) as evaluador_nombre,
 p.nombre as periodo_nombre
 FROM evaluaciones ev
 INNER JOIN usuarios ed ON ed.id = ev.evaluado_id
 INNER JOIN usuarios evr ON evr.id = ev.evaluador_id
 INNER JOIN periodos p ON p.id = ev.periodo_id
 WHERE {$where}
 ORDER BY ev.id DESC LIMIT ? OFFSET ?
 ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
 }

 public function compromisosPorEvaluacion(int $evaluacionId): array
 {
 $stmt = $this->pdo->prepare("
 SELECT c.*, comp.nombre as competencia_nombre, m.descripcion as meta_descripcion
 FROM compromisos c
 LEFT JOIN competencias comp ON comp.codigo = c.competencia_codigo
 LEFT JOIN metas m ON m.id = c.meta_id
 INNER JOIN concertaciones con ON con.id = c.concertacion_id
 INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
 WHERE ev.id = ? AND c.eliminado_en IS NULL
 ORDER BY c.tipo, c.id
 ");
 $stmt->execute([$evaluacionId]);
 return $stmt->fetchAll();
 }

 public function pendientesPorEvaluador(int $evaluadorId, int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['ev.eliminado_en IS NULL', 'ev.evaluador_id = ?', "ev.estado IN ('pendiente','en_proceso')"];
 $params = [$evaluadorId];

 $where = implode(' AND ', $conditions);
 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evaluaciones ev WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT ev.*, TRIM(CONCAT_WS(' ', ed.primer_nombre, ed.segundo_nombre, ed.primer_apellido, ed.segundo_apellido)) as evaluado_nombre, p.nombre as periodo_nombre
 FROM evaluaciones ev
 INNER JOIN usuarios ed ON ed.id = ev.evaluado_id
 INNER JOIN periodos p ON p.id = ev.periodo_id
 WHERE {$where}
 ORDER BY ev.id ASC LIMIT ? OFFSET ?
 ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
 }
}
