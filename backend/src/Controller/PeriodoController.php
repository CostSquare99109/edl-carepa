<?php

namespace App\Controller;

use App\Service\PeriodoService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class PeriodoController
{
    private PeriodoService $service;

    public function __construct()
    {
        $this->service = new PeriodoService();
    }

    public function listar(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->listar($filtros, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function crear(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $id = $this->service->crear($input);
        ResponseHelper::success(['id' => $id], 'Periodo creado', 201);
    }

    public function ver(int $id): void
    {
        $periodo = $this->service->ver($id);
        ResponseHelper::success($periodo);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Periodo actualizado');
    }

    public function metas(int $id): void
    {
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->metas($id, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function evaluaciones(int $id): void
    {
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->evaluaciones($id, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }
}
