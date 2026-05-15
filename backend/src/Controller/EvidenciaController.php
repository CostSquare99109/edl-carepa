<?php

namespace App\Controller;

use App\Service\EvidenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class EvidenciaController
{
    private EvidenciaService $service;

    public function __construct()
    {
        $this->service = new EvidenciaService();
    }

    public function listar(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->listar($filtros, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function subir(): void
    {
        $datos = SanitizerHelper::sanitizeArray($_POST);
        $id = $this->service->subir($datos, $_FILES['archivo']);
        ResponseHelper::success(['id' => $id], 'Evidencia subida', 201);
    }

    public function verificar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $estado = $input['estado'] ?? '';
        $this->service->verificar($id, $estado);
        ResponseHelper::success(null, 'Evidencia verificada');
    }
}
