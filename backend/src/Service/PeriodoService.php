<?php
declare(strict_types=1);

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
		'nombre' => 'max:100',
		'fecha_inicio' => 'required',
		'fecha_fin' => 'required'
		]);

		// Auto-generar nombre y anio como "Año-Año+1" desde fecha_inicio
		if (!empty($datos['fecha_inicio'])) {
		$anio = (int) date('Y', strtotime($datos['fecha_inicio']));
		$datos['nombre'] = $anio . '-' . ($anio + 1);
		$datos['anio'] = $anio . '-' . ($anio + 1);
		}

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
        $permitidos = [
            'nombre','anio','fecha_inicio','fecha_fin','estado',
            'fecha_inicio_concertacion','fecha_fin_concertacion',
            'fecha_inicio_seguimiento','fecha_fin_seguimiento',
            'fecha_inicio_evaluacion','fecha_fin_evaluacion',
            'fecha_inicio_calificacion_parcial','fecha_fin_calificacion_parcial',
            'fecha_inicio_calificacion','fecha_fin_calificacion',
            'fecha_inicio_evaluacion_segundo','fecha_fin_evaluacion_segundo',
            'fecha_inicio_calificacion_definitiva','fecha_fin_calificacion_definitiva',
        ];
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
