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
 INNER JOIN periodos p ON p.id = c.periodo_id
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

 public function compromisosPorConcertacion(int $concertacionId): array
 {
 $stmt = $this->pdo->prepare("
 SELECT comp.*, m.descripcion as meta_descripcion
 FROM compromisos comp
 LEFT JOIN metas m ON m.id = comp.meta_id
 WHERE comp.concertacion_id = ? AND comp.eliminado_en IS NULL
 ORDER BY comp.tipo, comp.id
 ");
 $stmt->execute([$concertacionId]);
 return $stmt->fetchAll();
 }

 public function buscarPorPeriodoYEvalauado(int $periodoId, int $evaluadoId): ?array
 {
 $stmt = $this->pdo->prepare("SELECT * FROM concertaciones WHERE periodo_id = ? AND evaluado_id = ? AND eliminado_en IS NULL LIMIT 1");
 $stmt->execute([$periodoId, $evaluadoId]);
 return $stmt->fetch() ?: null;
 }

 public function contarCompromisosPorTipo(int $concertacionId, string $tipo): int
 {
 $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos WHERE concertacion_id = ? AND tipo = ? AND eliminado_en IS NULL");
 $stmt->execute([$concertacionId, $tipo]);
 return (int) $stmt->fetchColumn();
 }
}
