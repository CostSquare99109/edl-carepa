<?php
declare(strict_types=1);

namespace App\Repository;

use PDO;

class CargoManualRepository extends BaseRepository
{
 protected string $table = 'cargos_manual';

 /**
  * Lista cargos del manual con paginacion y filtros
  * Nota: nombre 'listarManual' para no chocar firma con BaseRepository::listar()
  */
 public function listarManual(array $filtros, int $pagina, int $porPagina): array
 {
  $where = ['cm.eliminado_en IS NULL'];
  $params = [];

  if (!empty($filtros['planta'])) {
   $where[] = 'cm.planta = ?';
   $params[] = $filtros['planta'];
  }
  if (!empty($filtros['nivel'])) {
   $where[] = 'cm.nivel = ?';
   $params[] = $filtros['nivel'];
  }
  if (!empty($filtros['naturaleza'])) {
   $where[] = 'cm.naturaleza = ?';
   $params[] = $filtros['naturaleza'];
  }
  if (!empty($filtros['dependencia_id'])) {
   $where[] = 'cm.dependencia_id = ?';
   $params[] = (int) $filtros['dependencia_id'];
  }
  if (!empty($filtros['buscar'])) {
   $where[] = 'cm.denominacion LIKE ?';
   $params[] = '%' . $filtros['buscar'] . '%';
  }

  $whereSql = implode(' AND ', $where);
  $offset = ($pagina - 1) * $porPagina;

  // Conteo total
  $stmtCount = $this->pdo->prepare("SELECT COUNT(*) FROM cargos_manual cm WHERE {$whereSql}");
  $stmtCount->execute($params);
  $total = (int) $stmtCount->fetchColumn();

  // Datos
  $sql = "SELECT cm.*, d.nombre AS dependencia_nombre
    FROM cargos_manual cm
    LEFT JOIN dependencias d ON d.id = cm.dependencia_id AND d.eliminado_en IS NULL
    WHERE {$whereSql}
    ORDER BY cm.dependencia_id, cm.denominacion
    LIMIT {$porPagina} OFFSET {$offset}";
  $stmt = $this->pdo->prepare($sql);
  $stmt->execute($params);
  $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return [
   'data' => $data,
   'total' => $total,
   'pagina' => $pagina,
   'por_pagina' => $porPagina,
   'total_paginas' => (int) ceil($total / $porPagina),
  ];
 }

 public function buscarPorId(int $id): ?array
 {
  $stmt = $this->pdo->prepare("
   SELECT cm.*, d.nombre AS dependencia_nombre
   FROM cargos_manual cm
   LEFT JOIN dependencias d ON d.id = cm.dependencia_id AND d.eliminado_en IS NULL
   WHERE cm.id = ? AND cm.eliminado_en IS NULL
  ");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return $row ?: null;
 }

 public function detalle(int $cargoManualId): array
 {
  $stmt = $this->pdo->prepare("
   SELECT seccion, contenido, orden
   FROM cargos_manual_detalle
   WHERE cargo_manual_id = ?
   ORDER BY orden ASC
  ");
  $stmt->execute([$cargoManualId]);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
 }

 public function requisitos(int $cargoManualId): array
 {
  $stmt = $this->pdo->prepare("
   SELECT cmr.*, nbc.area_conocimiento, nbc.nbc
   FROM cargos_manual_requisitos cmr
   LEFT JOIN nucleos_basicos_conocimiento nbc ON nbc.id = cmr.nbc_id
   WHERE cmr.cargo_manual_id = ?
  ");
  $stmt->execute([$cargoManualId]);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
 }

 public function cargoDeUsuario(int $usuarioId): ?array
 {
  $stmt = $this->pdo->prepare("
   SELECT ucm.*, cm.denominacion, cm.codigo, cm.grado, cm.nivel, cm.naturaleza,
          cm.proposito_principal, d.nombre AS dependencia_nombre
   FROM usuario_cargo_manual ucm
   INNER JOIN cargos_manual cm ON cm.id = ucm.cargo_manual_id AND cm.eliminado_en IS NULL
   LEFT JOIN dependencias d ON d.id = cm.dependencia_id AND d.eliminado_en IS NULL
   WHERE ucm.usuario_id = ? AND ucm.vigente = 1
  ");
  $stmt->execute([$usuarioId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return $row ?: null;
 }

 public function asignarUsuario(int $usuarioId, int $cargoManualId, ?int $asignadoPor, ?string $observaciones): int
 {
  $this->pdo->beginTransaction();
  try {
   $stmt = $this->pdo->prepare("
    UPDATE usuario_cargo_manual
    SET vigente = 0
    WHERE usuario_id = ? AND vigente = 1
   ");
   $stmt->execute([$usuarioId]);

   $stmt = $this->pdo->prepare("
    INSERT INTO usuario_cargo_manual (usuario_id, cargo_manual_id, fecha_asignacion, vigente, asignado_por, observaciones)
    VALUES (?, ?, CURDATE(), 1, ?, ?)
   ");
   $stmt->execute([$usuarioId, $cargoManualId, $asignadoPor, $observaciones]);

   $newId = (int) $this->pdo->lastInsertId();
   $this->pdo->commit();
   return $newId;
  } catch (\Throwable $e) {
   $this->pdo->rollBack();
   throw $e;
  }
 }

 public function conteos(): array
 {
  $stmt = $this->pdo->query("
   SELECT
    (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL) AS total_cargos,
    (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND planta='global') AS planta_global,
    (SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND planta='temporal') AS planta_temporal,
    (SELECT COUNT(*) FROM cargos_manual_detalle) AS total_detalle,
    (SELECT COUNT(*) FROM usuario_cargo_manual WHERE vigente=1) AS asignaciones_vigentes,
    (SELECT COUNT(*) FROM nucleos_basicos_conocimiento) AS total_nbc,
    (SELECT COUNT(*) FROM niveles_jerarquicos) AS total_niveles,
    (SELECT COUNT(*) FROM naturalezas_cargo) AS total_naturalezas
  ");
  return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
 }
}