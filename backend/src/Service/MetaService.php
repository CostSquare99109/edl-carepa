<?php

namespace App\Service;

use App\Repository\MetaRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class MetaService
{
    private MetaRepository $repo;
    private ConcertacionRepository $concertacionRepo;

    public function __construct()
    {
        $this->repo = new MetaRepository();
        $this->concertacionRepo = new ConcertacionRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        $user = AuthMiddleware::user();
        $roles = $user['roles'] ?? [];

        if (in_array('funcionario', $roles) && !in_array('evaluador', $roles) && !in_array('admin', $roles)) {
            $filtros['funcionario_id'] = $user['id'];
        }

        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'periodo_id' => 'required',
            'funcionario_id' => 'required',
            'evaluador_id' => 'required',
            'descripcion' => 'required',
            'peso' => 'required'
        ]);

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'metas', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $meta = $this->repo->buscarPorId($id);
        if (!$meta) {
            ResponseHelper::error('Meta no encontrada', 404);
        }
        return $meta;
    }

    public function actualizar(int $id, array $datos): void
    {
        $meta = $this->repo->buscarPorId($id);
        if (!$meta) {
            ResponseHelper::error('Meta no encontrada', 404);
        }
        $permitidos = ['descripcion','tipo','peso','indicador','meta_numerica','unidad_medida','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'metas', $id, $meta, $datosFiltrados);
    }

    public function evidencias(int $metaId): array
    {
        $this->ver($metaId);
        return $this->repo->evidenciasPorMeta($metaId);
    }

    public function crearConcertacion(int $metaId, array $datos): int
    {
        $meta = $this->repo->buscarPorId($metaId);
        if (!$meta) {
            ResponseHelper::error('Meta no encontrada', 404);
        }

        $user = AuthMiddleware::user();
        $datos['meta_id'] = $metaId;
        $datos['evaluador_id'] = $user['id'];
        $datos['funcionario_id'] = $meta['funcionario_id'];
        $datos['estado'] = $datos['estado'] ?? 'pendiente';

        $id = $this->concertacionRepo->crear($datos);
        AuditoriaService::registrar('crear', 'concertaciones', $id, null, $datos);
        return $id;
    }
}
