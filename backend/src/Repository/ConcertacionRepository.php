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
 $conditions[] = "c.meta_id IN (SELECT m.id FROM metas m WHERE m.periodo_id = ?)";
 $params[] = $filtros['periodo_id'];
 }
 if (!empty($filtros['evaluador_id'])) {
 $conditions[] = "c.evaluador_id = ?";
 $params[] = $filtros['evaluador_id'];
 }
 if (!empty($filtros['funcionario_id'])) {
 $conditions[] = "c.funcionario_id = ?";
 $params[] = $filtros['funcionario_id'];
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
 ev.nombres as ev_nombre, ev.apellidos as ev_apellido, ev.documento as ev_documento,
 ed.nombres as ed_nombre, ed.apellidos as ed_apellido, ed.documento as ed_documento,
 p.nombre as periodo_nombre
 FROM concertaciones c
 INNER JOIN usuarios ev ON ev.id = c.evaluador_id
 INNER JOIN usuarios ed ON ed.id = c.funcionario_id
 LEFT JOIN metas m ON m.id = c.meta_id
 LEFT JOIN periodos p ON p.id = m.periodo_id
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
 $c['compromisos'] = $this->compromisosPorEvaluacion((int) $c['id']);
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
 SELECT comp.*, m.descripcion as meta_descripcion
 FROM compromisos comp
 LEFT JOIN metas m ON m.id = comp.meta_id
 WHERE comp.evaluacion_id = ? AND comp.eliminado_en IS NULL
 ORDER BY comp.tipo, comp.id
 ");
 $stmt->execute([$evaluacionId]);
 return $stmt->fetchAll();
 }

 public function compromisosPorConcertacion(int $concertacionId): array
 {
 $stmt = $this->pdo->prepare("
 SELECT comp.*, m.descripcion as meta_descripcion
 FROM compromisos comp
 LEFT JOIN metas m ON m.id = comp.meta_id
 INNER JOIN evaluaciones e ON e.id = comp.evaluacion_id AND e.eliminado_en IS NULL
 INNER JOIN concertaciones c ON c.funcionario_id = e.evaluado_id AND c.eliminado_en IS NULL
 WHERE c.id = ? AND comp.eliminado_en IS NULL
 ORDER BY comp.tipo, comp.id
 ");
 $stmt->execute([$concertacionId]);
 return $stmt->fetchAll();
 }

 public function buscarPorPeriodoYFuncionario(int $periodoId, int $funcionarioId): ?array
 {
 $stmt = $this->pdo->prepare("
 SELECT c.* FROM concertaciones c
 INNER JOIN metas m ON m.id = c.meta_id
 WHERE m.periodo_id = ? AND c.funcionario_id = ? AND c.eliminado_en IS NULL
 LIMIT 1
 ");
 $stmt->execute([$periodoId, $funcionarioId]);
 return $stmt->fetch() ?: null;
 }

 public function contarCompromisosPorTipo(int $evaluacionId, string $tipo): int
 {
 $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE evaluacion_id = ? AND tipo = ? AND eliminado_en IS NULL");
 $stmt->execute([$evaluacionId, $tipo]);
 return (int) $stmt->fetchColumn();
 }
}
