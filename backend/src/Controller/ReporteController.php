<?php

namespace App\Controller;

use App\Service\ReporteService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class ReporteController
{
    private ReporteService $service;

    public function __construct()
    {
        $this->service = new ReporteService();
    }

    public function concertacion(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $resultado = $this->service->concertacion($filtros);
        ResponseHelper::success($resultado);
    }

    public function evaluaciones(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $resultado = $this->service->evaluaciones($filtros);
        ResponseHelper::success($resultado);
    }

    public function funcionario(int $id): void
    {
        $resultado = $this->service->funcionario($id);
        ResponseHelper::success($resultado);
    }
}
