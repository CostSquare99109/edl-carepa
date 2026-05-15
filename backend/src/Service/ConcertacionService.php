<?php

namespace App\Service;

use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;

class ConcertacionService
{
    private ConcertacionRepository $repo;

    public function __construct()
    {
        $this->repo = new ConcertacionRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function actualizar(int $id, array $datos): void
    {
        $concertacion = $this->repo->buscarPorId($id);
        if (!$concertacion) {
            ResponseHelper::error('Concertacion no encontrada', 404);
        }
        $permitidos = ['estado','observaciones','fecha_concertacion'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'concertaciones', $id, $concertacion, $datosFiltrados);
    }
}
