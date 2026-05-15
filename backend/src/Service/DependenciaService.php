<?php

namespace App\Service;

use App\Repository\DependenciaRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class DependenciaService
{
    private DependenciaRepository $repo;

    public function __construct()
    {
        $this->repo = new DependenciaRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listar($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'entidad_id' => 'required',
            'codigo' => 'required|max:30',
            'nombre' => 'required|max:200'
        ]);

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'dependencias', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        return $dep;
    }

    public function actualizar(int $id, array $datos): void
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        $permitidos = ['codigo','nombre','jefe_id','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'dependencias', $id, $dep, $datosFiltrados);
    }

    public function eliminar(int $id): void
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar', 'dependencias', $id, $dep);
    }
}
