<?php

namespace App\Service;

use App\Repository\AusentismoRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class AusentismoService
{
    private AusentismoRepository $repo;

    public function __construct()
    {
        $this->repo = new AusentismoRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        $user = AuthMiddleware::user();
        $roles = $user['roles'] ?? [];

        if (in_array('funcionario', $roles) && !in_array('admin', $roles) && !in_array('jefe_entidad', $roles)) {
            $filtros['funcionario_id'] = $user['id'];
        }

        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'funcionario_id' => 'required',
            'tipo' => 'required',
            'fecha_inicio' => 'required',
            'fecha_fin' => 'required',
            'dias_habiles' => 'required'
        ]);

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'ausentismos', $id, null, $datos);
        return $id;
    }

    public function actualizar(int $id, array $datos): void
    {
        $aus = $this->repo->buscarPorId($id);
        if (!$aus) {
            ResponseHelper::error('Ausentismo no encontrado', 404);
        }
        $permitidos = ['tipo','fecha_inicio','fecha_fin','dias_habiles','justificado','observaciones','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'ausentismos', $id, $aus, $datosFiltrados);
    }
}
