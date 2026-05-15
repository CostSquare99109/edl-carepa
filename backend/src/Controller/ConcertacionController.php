<?php

namespace App\Controller;

use App\Service\ConcertacionService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class ConcertacionController
{
    private ConcertacionService $service;

    public function __construct()
    {
        $this->service = new ConcertacionService();
    }

    public function listar(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->listar($filtros, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Concertacion actualizada');
    }
}
