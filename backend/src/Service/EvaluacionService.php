<?php

namespace App\Service;

use App\Repository\EvaluacionRepository;
use App\Repository\CompromisoRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class EvaluacionService
{
    private EvaluacionRepository $repo;
    private CompromisoRepository $compromisoRepo;

    public function __construct()
    {
        $this->repo = new EvaluacionRepository();
        $this->compromisoRepo = new CompromisoRepository();
    }

 public function listar(array $filtros, int $pagina, int $porPagina): array
 {
 $user = AuthMiddleware::user();
 $roles = $user['roles'] ?? [];

 // Evaluado solo ve sus propias evaluaciones
 if (in_array('evaluado', $roles) && !in_array('evaluador', $roles) && !in_array('admin_entidad', $roles)) {
 $filtros['evaluado_id'] = $user['id'];
 }

 return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
 }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'periodo_id' => 'required',
            'evaluado_id' => 'required',
            'tipo' => 'required'
        ]);

        $user = AuthMiddleware::user();
        $datos['evaluador_id'] = $user['id'];
        $datos['estado'] = $datos['estado'] ?? 'pendiente';

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'evaluaciones', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $eval = $this->repo->buscarPorId($id);
        if (!$eval) {
            ResponseHelper::error('Evaluacion no encontrada', 404);
        }
        return $eval;
    }

    public function calificar(int $id, array $datos): void
    {
        $eval = $this->repo->buscarPorId($id);
        if (!$eval) {
            ResponseHelper::error('Evaluacion no encontrada', 404);
        }
        $permitidos = ['puntaje','estado','observaciones','fecha_evaluacion'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('calificar', 'evaluaciones', $id, $eval, $datosFiltrados);
    }

    public function compromisos(int $evaluacionId): array
    {
        $this->ver($evaluacionId);
        return $this->repo->compromisosPorEvaluacion($evaluacionId);
    }

 public function crearCompromiso(int $evaluacionId, array $datos): int
 {
 $this->ver($evaluacionId);
 $v = new ValidatorHelper();
 $v->validate($datos, [
 'tipo' => 'required',
 'descripcion' => 'required',
 'responsable_id' => 'required'
 ]);

 $datos['evaluacion_id'] = $evaluacionId;
 $id = $this->compromisoRepo->crear($datos);
 AuditoriaService::registrar('crear', 'compromisos', $id, null, $datos);
 return $id;
 }

 /** Crear evaluación parcial (semestral o eventual) - EDL-CNSC Acuerdo 6176 */
 public function crearParcial(int $evaluacionId, string $tipoParcial, array $evaluador): int
 {
 if (!in_array($tipoParcial, ['parcial_semestral', 'parcial_eventual'])) {
 ResponseHelper::error('Tipo de evaluacion parcial invalido. Debe ser: parcial_semestral o parcial_eventual', 422);
 }

 $eval = $this->repo->buscarPorId($evaluacionId);
 if (!$eval) {
 ResponseHelper::error('Evaluacion no encontrada', 404);
 }

 $user = AuthMiddleware::user();
 $datos = [
 'periodo_id' => $eval['periodo_id'],
 'evaluado_id' => $eval['evaluado_id'],
 'tipo' => $tipoParcial,
 'evaluador_id' => $user['id'],
 'estado' => 'en_proceso',
 'es_comision_evaluadora' => ($user['rol_activo'] ?? '') === 'comision_evaluadora' ? 1 : 0,
 ];

 $id = $this->repo->crear($datos);
 AuditoriaService::registrar('crear_parcial', 'evaluaciones', $id, null, $datos);
 return $id;
 }

 /** Calificación definitiva del evaluador - cierra ciclo anual */
 public function calificarDefinitiva(int $id, float $puntaje, array $evaluador): void
 {
 $eval = $this->repo->buscarPorId($id);
 if (!$eval) {
 ResponseHelper::error('Evaluacion no encontrada', 404);
 }
 if ($eval['tipo'] !== 'definitiva') {
 ResponseHelper::error('Solo se puede calificar definitivamente una evaluacion de tipo definitiva', 400);
 }
 if ($puntaje < 0 || $puntaje > 100) {
 ResponseHelper::error('La calificacion definitiva debe estar entre 0 y 100', 422);
 }

 $this->repo->actualizar($id, [
 'calificacion_definitiva' => $puntaje,
 'estado' => 'calificada',
 'fecha_calificacion' => date('Y-m-d'),
 ]);
 AuditoriaService::registrar('calificar_definitiva', 'evaluaciones', $id, $eval, ['calificacion_definitiva' => $puntaje]);
 }

 /** Comisión Evaluadora aprueba calificación definitiva */
 public function aprobarComision(int $id, array $comision): void
 {
 $eval = $this->repo->buscarPorId($id);
 if (!$eval) {
 ResponseHelper::error('Evaluacion no encontrada', 404);
 }
 if ($eval['estado'] !== 'calificada') {
 ResponseHelper::error('Solo se pueden aprobar evaluaciones en estado calificada', 400);
 }

 $pdo = \App\Config\Database::getInstance();
 $stmt = $pdo->prepare("
 UPDATE evaluaciones 
 SET estado = 'aprobada_comision', 
     es_comision_evaluadora = 1, 
     comision_evaluadora_id = ?,
     fecha_calificacion = COALESCE(fecha_calificacion, CURDATE())
 WHERE id = ?
 ");
 $stmt->execute([$comision['id'], $id]);
 AuditoriaService::registrar('aprobar_comision', 'evaluaciones', $id, $eval, ['estado' => 'aprobada_comision']);
 }

 /** Obtener evaluaciones pendientes de calificar para el evaluador */
 public function pendientesCalificar(array $evaluador, int $pagina = 1, int $porPagina = 20): array
 {
 $filtros = [
 'evaluador_id' => $evaluador['id'],
 'estado' => 'en_proceso',
 ];
 return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
 }
}
