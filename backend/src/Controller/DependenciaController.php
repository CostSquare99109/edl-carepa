<?php

namespace App\Controller;

use App\Service\DependenciaService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;

class DependenciaController
{
    private DependenciaService $service;

    public function __construct()
    {
        $this->service = new DependenciaService();
    }

	public function listar(): void
	{
		$filtros = SanitizerHelper::sanitizeArray($_GET);
		$pagina = (int) ($_GET['pagina'] ?? 1);
		$porPagina = (int) ($_GET['por_pagina'] ?? 20);
		// Limpiar parámetros de paginación y orden que no son columnas de filtro
		unset($filtros['pagina'], $filtros['por_pagina'], $filtros['orden'], $filtros['direccion'], $filtros['page'], $filtros['per_page']);
		$resultado = $this->service->listar($filtros, $pagina, $porPagina);
		ResponseHelper::success($resultado);
	}

    public function crear(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $id = $this->service->crear($input);
        ResponseHelper::success(['id' => $id], 'Dependencia creada', 201);
    }

    public function ver(int $id): void
    {
        $dep = $this->service->ver($id);
        ResponseHelper::success($dep);
    }

    public function actualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Dependencia actualizada');
    }

    public function eliminar(int $id): void
    {
        $this->service->eliminar($id);
        ResponseHelper::success(null, 'Dependencia eliminada');
    }
}
