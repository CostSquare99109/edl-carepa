<?php

namespace App\Controller;

use App\Service\EntidadService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class EntidadController
{
    private EntidadService $service;

    public function __construct()
    {
        $this->service = new EntidadService();
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
        ResponseHelper::success(['id' => $id], 'Entidad creada', 201);
    }

    public function ver(int $id): void
    {
        $entidad = $this->service->ver($id);
        ResponseHelper::success($entidad);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Entidad actualizada');
    }

    public function eliminar(int $id): void
    {
        $this->service->eliminar($id);
        ResponseHelper::success(null, 'Entidad eliminada');
    }

    public function jefes(int $id): void
    {
        $jefes = $this->service->jefes($id);
        ResponseHelper::success($jefes);
    }

    public function dependencias(int $id): void
    {
        $deps = $this->service->dependencias($id);
        ResponseHelper::success($deps);
    }
}
