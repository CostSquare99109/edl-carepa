<?php

namespace App\Controller;

use App\Service\CargaMasivaService;
use App\Helper\ResponseHelper;

class CargaMasivaController
{
    private CargaMasivaService $service;

    public function __construct()
    {
        $this->service = new CargaMasivaService();
    }

    public function historial(): void
    {
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->historial($pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function usuarios(): void
    {
        $id = $this->service->usuarios($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de usuarios recibida', 201);
    }

    public function concertaciones(): void
    {
        $id = $this->service->concertaciones($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de concertaciones recibida', 201);
    }

    public function evaluaciones(): void
    {
        $id = $this->service->evaluaciones($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de evaluaciones recibida', 201);
    }

    public function cursos(): void
    {
        $id = $this->service->cursos($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de cursos recibida', 201);
    }
}
