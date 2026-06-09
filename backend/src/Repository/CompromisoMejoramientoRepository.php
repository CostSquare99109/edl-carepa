<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class CompromisoMejoramientoRepository extends BaseRepository
{
 protected string $table = 'compromisos_mejoramiento';

 public function listarConRelaciones(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $conditions = ['cm.eliminado_en IS NULL'];
 $params = [];

 if (!empty($filtros['concertacion_id'])) {
 $conditions[] = "cm.concertacion_id = ?";
 $params[] = $filtros['concertacion_id'];
 }
 if (!empty($filtros['compromiso_id'])) {
 $conditions[] = "cm.compromiso_id = ?";
 $params[] = $filtros['compromiso_id'];
 }
 if (!empty($filtros['registrado_por'])) {
 $conditions[] = "cm.registrado_por = ?";
 $params[] = $filtros['registrado_por'];
 }
 if (!empty($filtros['motivo'])) {
 $conditions[] = "cm.motivo = ?";
 $params[] = $filtros['motivo'];
 }

 $where = implode(' AND ', $conditions);

 $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM compromisos_mejoramiento cm WHERE {$where}");
 $countStmt->execute($params);
 $total = (int) $countStmt->fetchColumn();

 $offset = ($pagina - 1) * $porPagina;
 $stmt = $this->pdo->prepare("
 SELECT cm.*,
 u.nombres as reg_nombre, u.apellidos as reg_apellido,
 comp.descripcion as compromiso_descripcion
 FROM compromisos_mejoramiento cm
 INNER JOIN usuarios u ON u.id = cm.registrado_por
 LEFT JOIN compromisos comp ON comp.id = cm.compromiso_id
 WHERE {$where}
 ORDER BY cm.id DESC
 LIMIT ? OFFSET ?
 ");
 $params[] = $porPagina;
 $params[] = $offset;
 $stmt->execute($params);

 $items = $stmt->fetchAll();
 foreach ($items as &$item) {
 $item['registrado_nombre'] = trim(($item['reg_nombre'] ?? '') . ' ' . ($item['reg_apellido'] ?? ''));
 unset($item['reg_nombre'], $item['reg_apellido']);
 }

 return [
 'data' => $items,
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => ceil($total / $porPagina)
 ];
 }
}
