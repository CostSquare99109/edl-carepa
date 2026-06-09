<?php

namespace App\Repository;

use PDO;

class MovilidadRepository
{
 private PDO $pdo;

 public function __construct(PDO $pdo)
 {
  $this->pdo = $pdo;
 }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
  $where = ['m.eliminado_en IS NULL'];
  $params = [];

  if (!empty($filtros['busqueda'])) {
   $where[] = '(u.nombres LIKE ? OR u.apellidos LIKE ? OR u.documento LIKE ?)';
   $b = '%' . $filtros['busqueda'] . '%';
   $params[] = $b; $params[] = $b; $params[] = $b;
  }
  if (!empty($filtros['tipo'])) {
   $where[] = 'm.tipo = ?';
   $params[] = $filtros['tipo'];
  }
  if (!empty($filtros['estado'])) {
   $where[] = 'm.estado = ?';
   $params[] = $filtros['estado'];
  }

  $whereSQL = implode(' AND ', $where);

  $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM movilidades m LEFT JOIN usuarios u ON u.id = m.funcionario_id WHERE {$whereSQL}");
  $countStmt->execute($params);
  $total = (int) $countStmt->fetchColumn();

  $offset = ($pagina - 1) * $porPagina;
  $stmt = $this->pdo->prepare("
   SELECT m.*, u.nombres as funcionario_nombres, u.apellidos as funcionario_apellidos,
    u.documento as funcionario_documento, u.cargo as funcionario_cargo,
    do1.nombre as dependencia_origen, do2.nombre as dependencia_destino
   FROM movilidades m
   LEFT JOIN usuarios u ON u.id = m.funcionario_id
   LEFT JOIN dependencias do1 ON do1.id = m.dependencia_origen_id
   LEFT JOIN dependencias do2 ON do2.id = m.dependencia_destino_id
   WHERE {$whereSQL}
   ORDER BY m.fecha_movimiento DESC
   LIMIT {$porPagina} OFFSET {$offset}
  ");
  $stmt->execute($params);
  $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return ['data' => $data, 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina];
 }

 public function crear(array $datos): int
 {
  $stmt = $this->pdo->prepare("
   INSERT INTO movilidades (funcionario_id, tipo, entidad_origen_id, dependencia_origen_id,
    entidad_destino_id, dependencia_destino_id, fecha_movimiento, acto_administrativo, observaciones, estado)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([
   $datos['funcionario_id'],
   $datos['tipo'],
   $datos['entidad_origen_id'] ?? null,
   $datos['dependencia_origen_id'] ?? null,
   $datos['entidad_destino_id'] ?? null,
   $datos['dependencia_destino_id'] ?? null,
   $datos['fecha_movimiento'],
   $datos['acto_administrativo'] ?? null,
   $datos['observaciones'] ?? null,
   $datos['estado'] ?? 'tramite',
  ]);
  return (int) $this->pdo->lastInsertId();
 }

 public function buscarPorId(int $id): ?array
 {
  $stmt = $this->pdo->prepare("SELECT * FROM movilidades WHERE id = ? AND eliminado_en IS NULL");
  $stmt->execute([$id]);
  $r = $stmt->fetch(PDO::FETCH_ASSOC);
  return $r ?: null;
 }

 public function actualizar(int $id, array $datos): void
 {
  $campos = [];
  $params = [];
  $permitidos = ['tipo','entidad_origen_id','dependencia_origen_id','entidad_destino_id',
   'dependencia_destino_id','fecha_movimiento','acto_administrativo','observaciones','estado'];

  foreach ($permitidos as $c) {
   if (array_key_exists($c, $datos)) {
    $campos[] = "{$c} = ?";
    $params[] = $datos[$c];
   }
  }

  if (empty($campos)) {
   ResponseHelper::error('No hay datos para actualizar', 400);
  }

  $params[] = $id;
  $stmt = $this->pdo->prepare("UPDATE movilidades SET " . implode(', ', $campos) . " WHERE id = ? AND eliminado_en IS NULL");
  $stmt->execute($params);
 }

 public function ejecutar(int $id, array $mov): void
 {
  $this->pdo->beginTransaction();
  try {
   $this->pdo->prepare("UPDATE movilidades SET estado = 'ejecutado' WHERE id = ?")->execute([$id]);

   if ($mov['funcionario_id'] && ($mov['dependencia_destino_id'] || $mov['entidad_destino_id'])) {
    $campos = [];
    $params = [];
    if ($mov['dependencia_destino_id']) {
     $campos[] = 'dependencia_id = ?';
     $params[] = $mov['dependencia_destino_id'];
    }
    if ($mov['entidad_destino_id']) {
     $campos[] = 'entidad_id = ?';
     $params[] = $mov['entidad_destino_id'];
    }
    if ($mov['tipo'] === 'retiro') {
     $campos[] = 'estado = ?';
     $params[] = 'inactivo';
    }
    if (!empty($campos)) {
     $params[] = $mov['funcionario_id'];
     $this->pdo->prepare("UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id = ?")->execute($params);
    }
   }

   $this->pdo->commit();
   } catch (\Throwable $e) {
   $this->pdo->rollBack();
   throw $e;
   }
   }

   public function eliminar(int $id): bool
   {
   $stmt = $this->pdo->prepare("UPDATE movilidades SET eliminado_en = NOW() WHERE id = ?");
   return $stmt->execute([$id]);
   }
   }
