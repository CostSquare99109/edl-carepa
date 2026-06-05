<?php

namespace App\Service;

use App\Repository\EntidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class EntidadService
{
    private EntidadRepository $repo;

    public function __construct()
    {
        $this->repo = new EntidadRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listar($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'codigo' => 'required|max:20',
            'nombre' => 'required|max:200',
            'tipo' => 'required|max:50'
        ]);

        if ($this->repo->existe('codigo', $datos['codigo'])) {
            ResponseHelper::error('Ya existe una entidad con ese codigo', 409);
        }

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'entidades', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        return $entidad;
    }

    public function actualizar(int $id, array $datos): void
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        $permitidos = ['codigo','nombre','tipo','nit','municipio','departamento','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'entidades', $id, $entidad, $datosFiltrados);
    }

    public function eliminar(int $id): void
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar', 'entidades', $id, $entidad);
    }

    public function jefes(int $entidadId): array
    {
        $this->ver($entidadId);
        return $this->repo->listarJefes($entidadId);
    }

    public function dependencias(int $entidadId): array
    {
    $this->ver($entidadId);
    return $this->repo->listarDependencias($entidadId);
    }

    public function habilitar(int $id): void
    {
    $entidad = $this->repo->buscarPorId($id);
    if (!$entidad) {
    ResponseHelper::error('Entidad no encontrada', 404);
    }
    $this->repo->actualizar($id, ['estado' => 'activa']);
    AuditoriaService::registrar('habilitar', 'entidades', $id);
    }
    }
