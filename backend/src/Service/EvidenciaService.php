<?php

namespace App\Service;

use App\Repository\EvidenciaRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class EvidenciaService
{
 private EvidenciaRepository $evidenciaRepo;

 public function __construct()
 {
  $pdo = Database::getInstance();
  $this->evidenciaRepo = new EvidenciaRepository($pdo);
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

  if (in_array($rolActivo, ['evaluador', 'evaluado'])) {
   $filtros['registrado_por'] = $user['id'];
  }

  return $this->evidenciaRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function registrar(array $datos): int
 {
  $user = AuthMiddleware::user();

  $compromisoId = (int) ($datos['compromiso_id'] ?? 0);
  $descripcion = trim($datos['descripcion'] ?? '');
  $ubicacion = trim($datos['ubicacion'] ?? '');
  $periodoId = (int) ($datos['periodo_id'] ?? 0);
  $observacion = trim($datos['observacion'] ?? '');
  $tipo = $datos['tipo'] ?? 'compromiso';

  if ($compromisoId <= 0) {
   ResponseHelper::error('Debe seleccionar un compromiso o competencia', 400);
  }
  if ($descripcion === '') {
   ResponseHelper::error('La descripción es obligatoria', 400);
  }
  if ($ubicacion === '') {
   ResponseHelper::error('La ubicación del soporte es obligatoria', 400);
  }
  if ($periodoId <= 0) {
   ResponseHelper::error('Debe seleccionar el periodo de evaluación', 400);
  }

  $pdo = Database::getInstance();
  $stmt = $pdo->prepare("
   SELECT c.id, c.tipo, c.descripcion, con.id as concertacion_id, con.evaluador_id, con.evaluado_id
   FROM compromisos c
   INNER JOIN concertaciones con ON con.id = c.concertacion_id
   WHERE c.id = :cid AND c.eliminado_en IS NULL
  ");
  $stmt->execute(['cid' => $compromisoId]);
  $compromiso = $stmt->fetch(\PDO::FETCH_ASSOC);

  if (!$compromiso) {
   ResponseHelper::error('Compromiso no encontrado', 404);
  }

  $concertacionId = (int) $compromiso['concertacion_id'];

  $crearDatos = [
   'concertacion_id' => $concertacionId,
   'compromiso_id' => $compromisoId,
   'periodo_id' => $periodoId,
   'registrado_por' => $user['id'],
   'compromiso_competencia' => $compromiso['descripcion'],
   'descripcion' => $descripcion,
   'ubicacion' => $ubicacion,
   'observacion' => $observacion ?: null,
   'tipo' => $tipo === 'competencia' ? 'competencia' : 'compromiso',
  ];

  $id = $this->evidenciaRepo->crear($crearDatos);
  AuditoriaService::registrar('registrar_evidencia', 'evidencias', $id);

  return $id;
 }

 public function ver(int $id): array
 {
  $evidencia = $this->evidenciaRepo->buscarPorIdConRelaciones($id);
  if (!$evidencia) {
   ResponseHelper::notFound('Evidencia no encontrada');
  }
  return $evidencia;
 }

 public function actualizar(int $id, array $datos): void
 {
  $evidencia = $this->evidenciaRepo->buscarPorId($id);
  if (!$evidencia) {
   ResponseHelper::notFound('Evidencia no encontrada');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

  if (!in_array($rolActivo, ['admin']) &&
   (int) $evidencia['registrado_por'] !== $user['id']) {
   ResponseHelper::forbidden('Solo puede modificar evidencias propias');
  }

  $permitidos = ['descripcion', 'ubicacion', 'observacion', 'compromiso_competencia', 'tipo'];
  $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

  foreach (['descripcion', 'ubicacion'] as $req) {
   if (isset($datosFiltrados[$req]) && trim($datosFiltrados[$req]) === '') {
    ResponseHelper::error("$req es obligatorio", 400);
   }
  }

  $this->evidenciaRepo->actualizar($id, $datosFiltrados);
  AuditoriaService::registrar('actualizar_evidencia', 'evidencias', $id);
 }

 public function eliminar(int $id): void
 {
  $evidencia = $this->evidenciaRepo->buscarPorId($id);
  if (!$evidencia) {
   ResponseHelper::notFound('Evidencia no encontrada');
  }

  $user = AuthMiddleware::user();
  $rolActivo = AuthMiddleware::rolActivo();

  if (!in_array($rolActivo, ['admin']) &&
   (int) $evidencia['registrado_por'] !== $user['id']) {
   ResponseHelper::forbidden('Solo puede eliminar evidencias propias');
  }

  $this->evidenciaRepo->eliminar($id);
  AuditoriaService::registrar('eliminar_evidencia', 'evidencias', $id);
 }
}
