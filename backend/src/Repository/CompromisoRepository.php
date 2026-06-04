<?php

namespace App\Repository;

class CompromisoRepository extends BaseRepository
{
  protected string $table = 'compromisos';

  public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
  {
    $conditions = ['c.eliminado_en IS NULL'];
    $params = [];

    if (!empty($filtros['tipo'])) { $conditions[] = "c.tipo = ?"; $params[] = $filtros['tipo']; }
    if (!empty($filtros['estado'])) { $conditions[] = "c.estado = ?"; $params[] = $filtros['estado']; }
    if (!empty($filtros['responsable_id'])) { $conditions[] = "c.responsable_id = ?"; $params[] = $filtros['responsable_id']; }
    if (!empty($filtros['evaluador_id'])) { $conditions[] = "c.evaluador_id = ?"; $params[] = $filtros['evaluador_id']; }
    if (!empty($filtros['evaluacion_id'])) { $conditions[] = "c.evaluacion_id = ?"; $params[] = $filtros['evaluacion_id']; }

    $where = implode(' AND ', $conditions);
    $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c WHERE {$where}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $offset = ($pagina - 1) * $porPagina;
    $stmt = $this->pdo->prepare("
      SELECT c.*,
             CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre,
             CONCAT(e.nombres, ' ', e.apellidos) as evaluador_nombre
      FROM compromisos c
      INNER JOIN usuarios u ON u.id = c.responsable_id
      LEFT JOIN usuarios e ON e.id = c.evaluador_id
      WHERE {$where}
      ORDER BY c.id DESC LIMIT ? OFFSET ?
    ");
    $params[] = $porPagina;
    $params[] = $offset;
    $stmt->execute($params);

    return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
  }

  /** Compromisos pendientes de aprobación para un evaluador específico */
  public function pendientesPorEvaluador(int $evaluadorId, int $pagina = 1, int $porPagina = 20): array
  {
    $conditions = ['c.eliminado_en IS NULL', 'c.evaluador_id = ?', "c.estado = 'propuesto'"];
    $params = [$evaluadorId];

    $where = implode(' AND ', $conditions);
    $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos c WHERE {$where}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $offset = ($pagina - 1) * $porPagina;
    $stmt = $this->pdo->prepare("
      SELECT c.*,
             CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre,
             ev.id as evaluacion_id_ref,
             ev.tipo as evaluacion_tipo,
             p.nombre as periodo_nombre
      FROM compromisos c
      INNER JOIN usuarios u ON u.id = c.responsable_id
      INNER JOIN evaluaciones ev ON ev.id = c.evaluacion_id
      INNER JOIN periodos p ON p.id = ev.periodo_id
      WHERE {$where}
      ORDER BY c.creado_en ASC LIMIT ? OFFSET ?
    ");
    $params[] = $porPagina;
    $params[] = $offset;
    $stmt->execute($params);

    return ['data' => $stmt->fetchAll(), 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'total_paginas' => ceil($total / $porPagina)];
  }
}
