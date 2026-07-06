<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class ConcertacionRepository extends BaseRepository
{
 protected string $table = 'concertaciones';

 public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['c.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['periodo_id'])) {
  $conditions[] = "c.periodo_id = ?";
 $params[] = $filtros['periodo_id'];
 }
 if (!empty($filtros['evaluador_id'])) {
 $conditions[] = "c.evaluador_id = ?";
 $params[] = $filtros['evaluador_id'];
 }
  if (!empty($filtros['evaluado_id'])) {
  $conditions[] = "c.evaluado_id = ?";
  $params[] = $filtros['evaluado_id'];
  }
 if (!empty($filtros['estado'])) {
 $conditions[] = "c.estado = ?";
 $params[] = $filtros['estado'];
 }

 $where = implode(' AND ', $conditions);

 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM concertaciones c WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
  $stmt = $this->pdo->prepare("
  SELECT c.*,
  ev.primer_nombre as ev_nombre, ev.primer_apellido as ev_apellido, ev.documento as ev_documento,
  ed.primer_nombre as ed_nombre, ed.primer_apellido as ed_apellido, ed.documento as ed_documento,
  p.nombre as periodo_nombre
  FROM concertaciones c
  INNER JOIN usuarios ev ON ev.id = c.evaluador_id
  INNER JOIN usuarios ed ON ed.id = c.evaluado_id
  LEFT JOIN periodos p ON p.id = c.periodo_id
  WHERE {$where}
  ORDER BY c.id DESC
  LIMIT ? OFFSET ?
  ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 $concertaciones = $stmt->fetchAll();
 foreach ($concertaciones as &$c) {
 $c['evaluador_nombre'] = trim(($c['ev_nombre'] ?? '') . ' ' . ($c['ev_apellido'] ?? ''));
 $c['evaluado_nombre'] = trim(($c['ed_nombre'] ?? '') . ' ' . ($c['ed_apellido'] ?? ''));
	$c['compromisos'] = $this->compromisosPorConcertacion((int) $c['id']);
 }

 return [
 'data' => $concertaciones,
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => ceil($total / $porPagina)
 ];
 }

	public function compromisosPorEvaluacion(int $evaluacionId): array
	{
		$stmt = $this->pdo->prepare("
			SELECT comp.*, comps.nombre as competencia_nombre, m.descripcion as meta_descripcion
			FROM compromisos comp
			LEFT JOIN competencias comps ON comps.codigo = comp.competencia_codigo
			LEFT JOIN metas m ON m.id = comp.meta_id
			INNER JOIN concertaciones c ON c.id = comp.concertacion_id
			INNER JOIN evaluaciones e ON e.concertacion_id = c.id
			WHERE e.id = ? AND comp.eliminado_en IS NULL
			ORDER BY comp.tipo, comp.id
		");
		$stmt->execute([$evaluacionId]);
		return $stmt->fetchAll();
	}

	public function compromisosPorConcertacion(int $concertacionId): array
	{
		// Paquete 1: solo compromisos funcionales (la columna tipo es ENUM('funcional')).
		$stmt = $this->pdo->prepare("
			SELECT comp.*, m.descripcion as meta_descripcion
			FROM compromisos comp
			LEFT JOIN metas m ON m.id = comp.meta_id
			WHERE comp.concertacion_id = ? AND comp.eliminado_en IS NULL
			ORDER BY comp.id
		");
		$stmt->execute([$concertacionId]);
		return $stmt->fetchAll();
	}

	public function compromisosComportamentalesPorConcertacion(int $concertacionId): array
	{
		// Paquete 2: solo compromisos comportamentales.
		$stmt = $this->pdo->prepare("
			SELECT cc.*, comp.nombre as competencia_nombre
			FROM compromisos cc
			LEFT JOIN competencias comp ON comp.codigo = cc.competencia_codigo
			WHERE cc.concertacion_id = ? AND cc.eliminado_en IS NULL AND cc.tipo = 'comportamental'
			ORDER BY cc.id
		");
		$stmt->execute([$concertacionId]);
		return $stmt->fetchAll();
	}

 public function buscarPorPeriodoYFuncionario(int $periodoId, int $evaluadoId): ?array
 {
 $stmt = $this->pdo->prepare("
 SELECT c.* FROM concertaciones c
 WHERE c.periodo_id = ? AND c.evaluado_id = ? AND c.eliminado_en IS NULL
 LIMIT 1
 ");
	$stmt->execute([$periodoId, $evaluadoId]);
 return $stmt->fetch() ?: null;
 }

    public function contarCompromisosPorConcertacionYTipo(int $concertacionId, string $tipo): int
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE concertacion_id = ? AND tipo = ? AND eliminado_en IS NULL");
        $stmt->execute([$concertacionId, $tipo]);
        return (int) $stmt->fetchColumn();
    }

    public function buscarPorEvaluadorYEvaluado(int $evaluadorId, int $evaluadoId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT c.* FROM concertaciones c
            WHERE c.evaluador_id = ? AND c.evaluado_id = ? AND c.eliminado_en IS NULL
        ");
        $stmt->execute([$evaluadorId, $evaluadoId]);
        return $stmt->fetchAll();
    }

    public function reassignarEvaluador(int $concertacionId, int $nuevoEvaluadorId): bool
    {
        $stmt = $this->pdo->prepare("UPDATE concertaciones SET evaluador_id = ? WHERE id = ? AND eliminado_en IS NULL");
        return $stmt->execute([$nuevoEvaluadorId, $concertacionId]);
    }

    public function tieneEvaluadorActivo(int $evaluadoId, int $periodoId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT c.* FROM concertaciones c
            WHERE c.evaluado_id = ? AND c.periodo_id = ? AND c.eliminado_en IS NULL AND c.evaluador_id IS NOT NULL
            LIMIT 1
        ");
        $stmt->execute([$evaluadoId, $periodoId]);
        return $stmt->fetch() ?: null;
    }
}
