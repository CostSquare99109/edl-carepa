<?php

namespace App\Service;

use App\Repository\EvaluacionRepository;
use App\Repository\CompromisoRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class EvaluacionService
{
 private EvaluacionRepository $evaluacionRepo;
 private CompromisoRepository $compromisoRepo;
 private ConcertacionRepository $concertacionRepo;

 public function __construct()
 {
 $pdo = Database::getInstance();
 $this->evaluacionRepo = new EvaluacionRepository($pdo);
 $this->compromisoRepo = new CompromisoRepository($pdo);
 $this->concertacionRepo = new ConcertacionRepository($pdo);
 }

 public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if ($rolActivo === 'evaluador') {
 $filtros['evaluador_id'] = $user['id'];
 } elseif ($rolActivo === 'evaluado') {
 $filtros['evaluado_id'] = $user['id'];
 }

 return $this->evaluacionRepo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

 public function ver(int $id): array
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }
 return $evaluacion;
 }

 public function crear(array $datos): int
 {
 $user = AuthMiddleware::user();
 $rolActivo = AuthMiddleware::rolActivo();

 if (!in_array($rolActivo, ['admin', 'jefe_personal', 'evaluador'])) {
 ResponseHelper::forbidden('Solo evaluadores o jefes pueden crear evaluaciones');
 }

 $tiposValidos = ['parcial_primer_semestre', 'parcial_segundo_semestre', 'parcial_eventual', 'calificacion_definitiva', 'calificacion_extraordinaria'];
 $tipo = $datos['tipo'] ?? 'parcial_primer_semestre';
 if (!in_array($tipo, $tiposValidos)) {
 ResponseHelper::error('Tipo de evaluacion invalido', 422);
 }

 $crearDatos = [
 'periodo_id' => $datos['periodo_id'],
 'evaluado_id' => $datos['evaluado_id'],
 'evaluador_id' => $datos['evaluador_id'] ?? $user['id'],
 'concertacion_id' => $datos['concertacion_id'] ?? null,
 'tipo' => $tipo,
 'motivo_parcial_eventual' => $datos['motivo_parcial_eventual'] ?? null,
 'motivo_extraordinaria' => $datos['motivo_extraordinaria'] ?? null,
 'evaluador_no_jefe' => $datos['evaluador_no_jefe'] ?? 0,
 'motivo_no_jefe' => $datos['motivo_no_jefe'] ?? null,
 'fecha_inicio' => $datos['fecha_inicio'] ?? null,
 'fecha_fin' => $datos['fecha_fin'] ?? null,
 'estado' => 'pendiente',
 ];

 $id = $this->evaluacionRepo->crear($crearDatos);
 AuditoriaService::registrar('crear_evaluacion', 'evaluaciones', $id);

 return $id;
 }

 public function crearParcial(int $evaluacionId, array $datos): int
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($evaluacionId);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 $motivo = $datos['motivo_parcial_eventual'] ?? null;
 if (!$motivo) {
 ResponseHelper::error('motivo_parcial_eventual es requerido', 422);
 }

 $motivosValidos = ['cambio_evaluador', 'lapso_ultima_evaluacion', 'periodo_prueba_otro_empleo', 'separacion_temporal_mas_30_dias', 'cambio_empleo_traslado'];
 if (!in_array($motivo, $motivosValidos)) {
 ResponseHelper::error('Motivo de evaluacion parcial eventual invalido', 422);
 }

 $nuevaEvaluacion = [
 'periodo_id' => $evaluacion['periodo_id'],
 'evaluado_id' => $evaluacion['evaluado_id'],
 'evaluador_id' => $datos['evaluador_id'] ?? $evaluacion['evaluador_id'],
 'concertacion_id' => $evaluacion['concertacion_id'],
 'tipo' => 'parcial_eventual',
 'motivo_parcial_eventual' => $motivo,
 'fecha_inicio' => $datos['fecha_inicio'] ?? date('Y-m-d'),
 'fecha_fin' => $datos['fecha_fin'] ?? null,
 ];

 $id = $this->evaluacionRepo->crear($nuevaEvaluacion);
 AuditoriaService::registrar('crear_evaluacion_parcial', 'evaluaciones', $id);

 return $id;
 }

 public function calificar(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 if (!in_array($evaluacion['estado'], ['pendiente', 'en_proceso'])) {
 ResponseHelper::error('La evaluacion no puede ser calificada en su estado actual', 400);
 }

 $permitidos = ['observaciones'];
 $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
 $datosFiltrados['estado'] = 'en_proceso';

 $this->evaluacionRepo->actualizar($id, $datosFiltrados);
 }

 public function calificarDefinitiva(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 $concertacionId = (int) $evaluacion['concertacion_id'];
 $pesoFunc = (int) Env::get('PESO_FUNCIONALES', 85);
 $pesoComp = (int) Env::get('PESO_COMPORTAMENTALES', 15);

 $sumaCalifFunc = 0;
 $sumaPesoFunc = 0;
 $compromisos = $this->evaluacionRepo->compromisosPorEvaluacion($id);

 foreach ($compromisos as $c) {
 if ($c['tipo'] === 'funcional' && $c['calificacion'] !== null) {
 $sumaCalifFunc += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoFunc += (float) $c['peso'];
 }
 }

 $notaFunc = $sumaPesoFunc > 0 ? $sumaCalifFunc / $sumaPesoFunc : 0;

 $sumaCalifComp = 0;
 $sumaPesoComp = 0;
 foreach ($compromisos as $c) {
 if ($c['tipo'] === 'comportamental' && $c['calificacion'] !== null) {
 $sumaCalifComp += (float) $c['calificacion'] * (float) $c['peso'];
 $sumaPesoComp += (float) $c['peso'];
 }
 }
 $notaComp = $sumaPesoComp > 0 ? $sumaCalifComp / $sumaPesoComp : 0;

 $califDefinitiva = ($notaFunc * $pesoFunc / 100) + ($notaComp * $pesoComp / 100);

 $umbralSobresaliente = (float) Env::get('UMBRAL_SOBRESALIENTE', 90);
 $umbralSatisfactorio = (float) Env::get('UMBRAL_SATISFACTORIO', 65);

 $nivel = $califDefinitiva >= $umbralSobresaliente ? 'sobresaliente' : ($califDefinitiva >= $umbralSatisfactorio ? 'satisfactorio' : 'no_satisfactorio');

 $this->evaluacionRepo->actualizar($id, [
 'nota_funcionales' => round($notaFunc, 2),
 'nota_comportamentales' => round($notaComp, 2),
 'calificacion_definitiva' => round($califDefinitiva, 2),
 'nivel_resultado' => $nivel,
 'estado' => 'calificada',
 'fecha_calificacion' => date('Y-m-d'),
 ]);

 AuditoriaService::registrar('calificar_definitiva', 'evaluaciones', $id, null, [
 'calificacion_definitiva' => round($califDefinitiva, 2),
 'nivel_resultado' => $nivel,
 ]);
 }

 public function aprobarComision(int $id, array $datos): void
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($id);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }

 if ($evaluacion['estado'] !== 'calificada') {
 ResponseHelper::error('Solo se pueden aprobar evaluaciones en estado calificada', 400);
 }

 $user = AuthMiddleware::user();
 $accion = $datos['accion'] ?? 'aprobar';

 if ($accion === 'rechazar') {
 $this->evaluacionRepo->actualizar($id, [
 'estado' => 'rechazada_comision',
 'observaciones' => $datos['observaciones'] ?? 'Rechazada por Comision Evaluadora',
 ]);
 } else {
 $this->evaluacionRepo->actualizar($id, [
 'estado' => 'aprobada_comision',
 'es_comision_evaluadora' => 1,
 'comision_evaluadora_id' => $user['id'],
 ]);
 }

 AuditoriaService::registrar('comision_evaluadora_' . $accion, 'evaluaciones', $id);
 }

 public function compromisos(int $evaluacionId): array
 {
 $evaluacion = $this->evaluacionRepo->buscarPorId($evaluacionId);
 if (!$evaluacion) {
 ResponseHelper::notFound('Evaluacion no encontrada');
 }
 return $this->evaluacionRepo->compromisosPorEvaluacion($evaluacionId);
 }

 public function pendientesCalificar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
 {
 $user = AuthMiddleware::user();
 return $this->evaluacionRepo->pendientesPorEvaluador((int) $user['id'], $pagina, $porPagina);
 }
}
