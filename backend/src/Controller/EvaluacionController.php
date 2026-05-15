<?php

namespace App\Controller;

use App\Service\EvaluacionService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class EvaluacionController
{
    private EvaluacionService $service;

    public function __construct()
    {
        $this->service = new EvaluacionService();
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
        ResponseHelper::success(['id' => $id], 'Evaluacion creada', 201);
    }

    public function ver(int $id): void
    {
        $eval = $this->service->ver($id);
        ResponseHelper::success($eval);
    }

    public function calificar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->calificar($id, $input);
        ResponseHelper::success(null, 'Evaluacion calificada');
    }

    public function compromisos(int $id): void
    {
        $compromisos = $this->service->compromisos($id);
        ResponseHelper::success($compromisos);
    }

    public function crearCompromiso(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $compId = $this->service->crearCompromiso($id, $input);
        ResponseHelper::success(['id' => $compId], 'Compromiso creado', 201);
    }
}
