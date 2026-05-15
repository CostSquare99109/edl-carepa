<?php

namespace App\Controller;

use App\Service\MetaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class MetaController
{
    private MetaService $service;

    public function __construct()
    {
        $this->service = new MetaService();
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
        ResponseHelper::success(['id' => $id], 'Meta creada', 201);
    }

    public function ver(int $id): void
    {
        $meta = $this->service->ver($id);
        ResponseHelper::success($meta);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Meta actualizada');
    }

    public function evidencias(int $id): void
    {
        $evidencias = $this->service->evidencias($id);
        ResponseHelper::success($evidencias);
    }

    public function crearConcertacion(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $concertacionId = $this->service->crearConcertacion($id, $input);
        ResponseHelper::success(['id' => $concertacionId], 'Concertacion creada', 201);
    }
}
