<?php

namespace App\Controller;

use App\Service\EvaluacionService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Middleware\AuthMiddleware;

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

	/** Crear evaluación parcial (semestral o eventual) - EDL-CAREPA Acuerdo 6176 */
    public function crearParcial(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $user = AuthMiddleware::user();

        $tipo = $input['tipo_parcial'] ?? '';
        if (!in_array($tipo, ['parcial_semestral', 'parcial_eventual'])) {
            ResponseHelper::error('tipo_parcial es requerido y debe ser: parcial_semestral o parcial_eventual', 422);
        }

        $idNuevo = $this->service->crearParcial($id, $tipo, $user);
        ResponseHelper::success(['id' => $idNuevo], 'Evaluacion parcial creada', 201);
    }

    /** Calificación definitiva del evaluador */
    public function calificarDefinitiva(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);
        $user = AuthMiddleware::user();

        $puntaje = isset($input['puntaje']) ? (float) $input['puntaje'] : null;
        if ($puntaje === null) {
            ResponseHelper::error('El puntaje es requerido', 400);
        }

        $this->service->calificarDefinitiva($id, $puntaje, $user);
        ResponseHelper::success(null, 'Evaluacion calificada definitivamente');
    }

    /** Comisión Evaluadora aprueba calificación */
    public function aprobarComision(int $id): void
    {
        $user = AuthMiddleware::user();
        $this->service->aprobarComision($id, $user);
        ResponseHelper::success(null, 'Calificacion aprobada por la Comision Evaluadora');
    }

    /** Evaluaciones pendientes de calificar por el evaluador */
    public function pendientesCalificar(): void
    {
        $user = AuthMiddleware::user();
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->pendientesCalificar($user, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }
}
