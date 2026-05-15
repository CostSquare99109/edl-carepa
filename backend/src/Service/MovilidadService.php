<?php

namespace App\Service;

use App\Repository\MovilidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class MovilidadService
{
    private MovilidadRepository $repo;

    public function __construct()
    {
        $this->repo = new MovilidadRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'funcionario_id' => 'required',
            'tipo' => 'required',
            'fecha_movimiento' => 'required'
        ]);

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'movilidades', $id, null, $datos);
        return $id;
    }

    public function actualizar(int $id, array $datos): void
    {
        $mov = $this->repo->buscarPorId($id);
        if (!$mov) {
            ResponseHelper::error('Movilidad no encontrada', 404);
        }
        $permitidos = ['tipo','entidad_origen_id','dependencia_origen_id','entidad_destino_id','dependencia_destino_id','fecha_movimiento','acto_administrativo','observaciones','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'movilidades', $id, $mov, $datosFiltrados);
    }
}
