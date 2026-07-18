<?php

namespace App\Service;

use App\Repository\CargoManualRepository;
use App\Repository\UsuarioRepository;
use App\Config\Database;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class CargoManualService
{
 private CargoManualRepository $repo;
 private UsuarioRepository $usuarioRepo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->repo = new CargoManualRepository($pdo);
  $this->usuarioRepo = new UsuarioRepository($pdo);
 }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
  return $this->repo->listarManual($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): ?array
 {
  $cargo = $this->repo->buscarPorId($id);
  if (!$cargo) {
   return null;
  }
  $cargo['detalle'] = $this->repo->detalle($id);
  $cargo['requisitos'] = $this->repo->requisitos($id);
  return $cargo;
 }

 public function asignar(int $usuarioId, int $cargoManualId, ?string $observaciones): array
 {
  $usuario = $this->usuarioRepo->buscarPorId($usuarioId);
  if (!$usuario) {
   ResponseHelper::error('Usuario no encontrado', 422);
  }

  $cargo = $this->repo->buscarPorId($cargoManualId);
  if (!$cargo) {
   ResponseHelper::error('Cargo no encontrado', 422);
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();
  if ($rolActivo === 'jefe_dependencia') {
   $userDep = (int) ($user['dependencia_id'] ?? 0);
   $cargoDep = (int) $cargo['dependencia_id'];
   if ($userDep !== $cargoDep) {
    ResponseHelper::error('No tiene permiso para asignar cargos de otra dependencia', 422);
   }
  }

  $asignadoPor = (int) ($user['id'] ?? 0);
  $newId = $this->repo->asignarUsuario($usuarioId, $cargoManualId, $asignadoPor ?: null, $observaciones);

  try {
   $stmt = Database::getInstance()->prepare("
    UPDATE usuarios
    SET nivel = ?, naturaleza = ?
    WHERE id = ? AND eliminado_en IS NULL
   ");
   $stmt->execute([$cargo['nivel'], $cargo['naturaleza'], $usuarioId]);
  } catch (\Throwable $e) {
   // no fatal
  }

  return [
   'id' => $newId,
   'usuario_id' => $usuarioId,
   'cargo_manual_id' => $cargoManualId,
   'denominacion' => $cargo['denominacion'],
  ];
 }

 public function cargoDeUsuario(int $usuarioId): ?array
 {
  return $this->repo->cargoDeUsuario($usuarioId);
 }

 public function conteos(): array
 {
  return $this->repo->conteos();
 }

 public function catalogos(): array
 {
  $pdo = Database::getInstance();

  $niveles = $pdo->query("SELECT codigo, nombre, descripcion, orden FROM niveles_jerarquicos ORDER BY orden")->fetchAll(\PDO::FETCH_ASSOC);
  $naturalezas = $pdo->query("SELECT codigo, nombre, descripcion, requiere_periodo, es_carrera FROM naturalezas_cargo ORDER BY nombre")->fetchAll(\PDO::FETCH_ASSOC);
  $nbc = $pdo->query("SELECT id, area_conocimiento, nbc FROM nucleos_basicos_conocimiento ORDER BY area_conocimiento, nbc")->fetchAll(\PDO::FETCH_ASSOC);

  return [
   'niveles' => $niveles,
   'naturalezas' => $naturalezas,
   'nbc' => $nbc,
  ];
 }

 public function catalogosNiveles(): array
 {
  return Database::getInstance()
   ->query("SELECT codigo, nombre, descripcion, orden FROM niveles_jerarquicos ORDER BY orden")
   ->fetchAll(\PDO::FETCH_ASSOC);
 }

 public function catalogosNaturalezas(): array
 {
  return Database::getInstance()
   ->query("SELECT codigo, nombre, descripcion, requiere_periodo, es_carrera FROM naturalezas_cargo ORDER BY nombre")
   ->fetchAll(\PDO::FETCH_ASSOC);
 }

 public function catalogosNbc(?string $area = null): array
 {
  if ($area) {
   $stmt = Database::getInstance()->prepare(
    "SELECT id, area_conocimiento, nbc FROM nucleos_basicos_conocimiento WHERE area_conocimiento = ? ORDER BY nbc"
   );
   $stmt->execute([$area]);
   return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }
  return Database::getInstance()
   ->query("SELECT id, area_conocimiento, nbc FROM nucleos_basicos_conocimiento ORDER BY area_conocimiento, nbc")
   ->fetchAll(\PDO::FETCH_ASSOC);
 }
}