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

        if (in_array('funcionario', $roles) && !in_array('evaluador', $roles) && !in_array('admin', $roles)) {
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
}
