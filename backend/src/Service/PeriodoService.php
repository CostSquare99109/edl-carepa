<?php

namespace App\Service;

use App\Repository\PeriodoRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class PeriodoService
{
    private PeriodoRepository $repo;

    public function __construct()
    {
        $this->repo = new PeriodoRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listar($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
        'nombre' => 'required|max:100',
        'fecha_inicio' => 'required',
        'fecha_fin' => 'required'
        ]);

        $estadosValidos = ['configuracion','concertacion','seguimiento','evaluacion','calificacion','cerrado'];
        if (!isset($datos['estado']) || !in_array($datos['estado'], $estadosValidos)) {
        $datos['estado'] = 'configuracion';
        }

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'periodos', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $periodo = $this->repo->buscarPorId($id);
        if (!$periodo) {
            ResponseHelper::error('Periodo no encontrado', 404);
        }
        return $periodo;
    }

    public function actualizar(int $id, array $datos): void
    {
        $periodo = $this->repo->buscarPorId($id);
        if (!$periodo) {
            ResponseHelper::error('Periodo no encontrado', 404);
        }
        $permitidos = ['nombre','fecha_inicio','fecha_fin','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'periodos', $id, $periodo, $datosFiltrados);
    }

    public function metas(int $periodoId, int $pagina, int $porPagina): array
    {
        $this->ver($periodoId);
        return $this->repo->metasPorPeriodo($periodoId, $pagina, $porPagina);
    }

    public function evaluaciones(int $periodoId, int $pagina, int $porPagina): array
    {
        $this->ver($periodoId);
        return $this->repo->evaluacionesPorPeriodo($periodoId, $pagina, $porPagina);
    }
}
