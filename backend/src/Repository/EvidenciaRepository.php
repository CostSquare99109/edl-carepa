<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class EvidenciaRepository extends BaseRepository
{
 protected string $table = 'evidencias';

 public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['e.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['concertacion_id'])) {
 $conditions[] = "e.concertacion_id = ?";
 $params[] = $filtros['concertacion_id'];
 }
 if (!empty($filtros['compromiso_id'])) {
 $conditions[] = "e.compromiso_id = ?";
 $params[] = $filtros['compromiso_id'];
 }
 if (!empty($filtros['registrado_por'])) {
 $conditions[] = "e.registrado_por = ?";
 $params[] = $filtros['registrado_por'];
 }
 if (!empty($filtros['tipo'])) {
 $conditions[] = "e.tipo = ?";
 $params[] = $filtros['tipo'];
 }

 $where = implode(' AND ', $conditions);

 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM evidencias e WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT e.*,
 u.primer_nombre as reg_nombre, u.primer_apellido as reg_apellido
 FROM evidencias e
 INNER JOIN usuarios u ON u.id = e.registrado_por
 WHERE {$where}
 ORDER BY e.id DESC
 LIMIT ? OFFSET ?
 ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 $evidencias = $stmt->fetchAll();
 foreach ($evidencias as &$ev) {
 $ev['registrado_nombre'] = trim(($ev['reg_nombre'] ?? '') . ' ' . ($ev['reg_apellido'] ?? ''));
 unset($ev['reg_nombre'], $ev['reg_apellido']);
 }

 return [
 'data' => $evidencias,
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => ceil($total / $porPagina)
 ];
 }
}
