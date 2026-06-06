<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class CompetenciaRepository extends BaseRepository
{
 protected string $table = 'competencias_comportamentales';
 protected string $primaryKey = 'id';

 public function listarTodas(): array
 {
  $stmt = $this->pdo->prepare("SELECT id, nombre, decreto, descripcion, estado FROM competencias_comportamentales WHERE eliminado_en IS NULL ORDER BY decreto, nombre");
  $stmt->execute();
  return $stmt->fetchAll();
 }

 public function listarPorDecreto(string $decreto): array
 {
  $stmt = $this->pdo->prepare("SELECT id, nombre, decreto, descripcion, estado FROM competencias_comportamentales WHERE decreto = ? AND eliminado_en IS NULL ORDER BY nombre");
  $stmt->execute([$decreto]);
  return $stmt->fetchAll();
 }

 public function decretosDisponibles(): array
 {
  $stmt = $this->pdo->prepare("SELECT DISTINCT decreto FROM competencias_comportamentales WHERE eliminado_en IS NULL ORDER BY decreto");
  $stmt->execute();
  return $stmt->fetchAll(PDO::FETCH_COLUMN);
 }
}
