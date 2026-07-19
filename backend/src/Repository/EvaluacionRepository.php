<?php
declare(strict_types=1);

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
 if (isset($filtros['es_comision_evaluadora']) && $filtros['es_comision_evaluadora'] !== '') { $conditions[] = "ev.es_comision_evaluadora = ?"; $params[] = (int) $filtros['es_comision_evaluadora']; }
  $hasDocumentFilter = !empty($filtros['documento_evaluado']);
  if ($hasDocumentFilter) { $conditions[] = "ed.documento = ?"; $params[] = $filtros['documento_evaluado']; }

  $where = implode(' AND ', $conditions);
  $countFrom = $hasDocumentFilter ? "FROM evaluaciones ev INNER JOIN usuarios ed ON ed.id = ev.evaluado_id" : "FROM evaluaciones ev";
  $countStmt = $this->pdo->prepare("SELECT COUNT(*) {$countFrom} WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT ev.*,
 TRIM(CONCAT_WS(' ', ed.primer_nombre, ed.segundo_nombre, ed.primer_apellido, ed.segundo_apellido)) as evaluado_nombre,
 ed.documento as evaluado_documento,
 ed.dependencia_id as evaluado_dependencia_id,
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

  /**
   * Devuelve los compromisos funcionales Y comportamentales de una evaluación,
   * consultando las dos tablas independientes (Paquete 1 y Paquete 2).
   *
   * Cada item viene con `tipo` y `origen` (`funcionales` o `comportamentales`)
   * para mantenerlos identificables en el cálculo de la definitiva.
   */
  public function compromisosCompletosPorEvaluacion(int $evaluacionId): array
  {
      $stmt = $this->pdo->prepare("
          SELECT c.id, c.concertacion_id, c.descripcion, c.peso, c.calificacion,
                 c.estado, 'funcional' AS tipo, 'funcionales' AS origen,
                 c.competencia_codigo, c.nivel_comportamental, c.puntaje_comportamental,
                 c.frecuencia, c.impacto_aporta_compromisos, c.impacto_excede_estipulado,
                 c.justificacion_excede, c.conductas_json,
                 m.descripcion AS meta_descripcion,
                 NULL AS competencia_nombre
          FROM compromisos c
          INNER JOIN concertaciones con ON con.id = c.concertacion_id
          INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
          LEFT JOIN metas m ON m.id = c.meta_id
          WHERE ev.id = ? AND c.tipo = 'funcional' AND c.eliminado_en IS NULL

          UNION ALL

          SELECT cc.id, cc.concertacion_id, cc.descripcion, cc.peso, cc.calificacion,
                 cc.estado, 'comportamental' AS tipo, 'comportamentales' AS origen,
                 cc.competencia_codigo, cc.nivel_comportamental, cc.puntaje_comportamental,
                 cc.frecuencia, cc.impacto_aporta_compromisos, cc.impacto_excede_estipulado,
                 cc.justificacion_excede, cc.conductas_json,
                 NULL AS meta_descripcion,
                 comp.nombre AS competencia_nombre
          FROM compromisos cc
          INNER JOIN concertaciones con ON con.id = cc.concertacion_id
          INNER JOIN evaluaciones ev ON ev.concertacion_id = con.id
          LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
          WHERE ev.id = ? AND cc.eliminado_en IS NULL AND cc.tipo = 'comportamental'
      ");
      $stmt->execute([$evaluacionId, $evaluacionId]);
      return $stmt->fetchAll();
  }

  public function concertacionIdPorEvaluacion(int $evaluacionId): ?int
  {
      $stmt = $this->pdo->prepare("SELECT concertacion_id FROM evaluaciones WHERE id = ? AND eliminado_en IS NULL");
      $stmt->execute([$evaluacionId]);
      $val = $stmt->fetchColumn();
      return $val ? (int) $val : null;
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
