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
 TRIM(CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido)) as registrado_nombre,
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

 return [
 'data' => $stmt->fetchAll(),
 'total' => $total,
 'pagina' => $pagina,
 'por_pagina' => $porPagina,
 'total_paginas' => ceil($total / $porPagina)
 ];
 }
}
