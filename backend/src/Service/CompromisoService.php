<?php

namespace App\Service;

use App\Repository\CompromisoRepository;
use App\Helper\ResponseHelper;

class CompromisoService
{
    private CompromisoRepository $repo;

    public function __construct()
    {
        $this->repo = new CompromisoRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function actualizar(int $id, array $datos): void
    {
        $comp = $this->repo->buscarPorId($id);
        if (!$comp) {
            ResponseHelper::error('Compromiso no encontrado', 404);
        }
        $permitidos = ['descripcion','plazo','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'compromisos', $id, $comp, $datosFiltrados);
    }
}
