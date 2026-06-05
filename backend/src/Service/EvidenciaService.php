<?php

namespace App\Service;

use App\Repository\EvidenciaRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Middleware\AuthMiddleware;

class EvidenciaService
{
 private EvidenciaRepository $evidenciaRepo;
 private ConcertacionRepository $concertacionRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->evidenciaRepo = new EvidenciaRepository($pdo);
 $this->concertacionRepo = new ConcertacionRepository($pdo);
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

 $concertacionId = $datos['concertacion_id'] ?? null;
 if (!$concertacionId) {
 ResponseHelper::error('concertacion_id es requerido', 422);
 }

 $concertacion = $this->concertacionRepo->buscarPorId((int) $concertacionId);
 if (!$concertacion) {
 ResponseHelper::notFound('Concertacion no encontrada');
 }

 $crearDatos = [
 'concertacion_id' => $concertacionId,
 'compromiso_id' => $datos['compromiso_id'] ?? null,
 'registrado_por' => $user['id'],
 'compromiso_competencia' => $datos['compromiso_competencia'] ?? '',
 'descripcion' => $datos['descripcion'],
 'ubicacion' => $datos['ubicacion'] ?? null,
 'observacion' => $datos['observacion'] ?? null,
 'tipo' => $datos['tipo'] ?? 'general',
 ];

 $id = $this->evidenciaRepo->crear($crearDatos);
 AuditoriaService::registrar('registrar_evidencia', 'evidencias', $id);

 return $id;
 }

 public function ver(int $id): array
 {
 $evidencia = $this->evidenciaRepo->buscarPorId($id);
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

 if (!in_array($rolActivo, ['admin', 'jefe_personal']) &&
 (int) $evidencia['registrado_por'] !== $user['id']) {
 ResponseHelper::forbidden('Solo puede modificar evidencias propias');
 }

 $permitidos = ['descripcion', 'ubicacion', 'observacion', 'compromiso_competencia', 'tipo'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

 if (!empty($datosFiltrados)) {
 $this->evidenciaRepo->actualizar($id, $datosFiltrados);
 AuditoriaService::registrar('actualizar_evidencia', 'evidencias', $id);
 }
 }
}
