<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\CompromisoComportamentalService;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Helper\ValidatorHelper;

/**
 * Controller para Paquete 2: Compromisos Comportamentales.
 *
 * Endpoints completamente independientes del Paquete 1.
 * Ruta base: /compromisos-comportamentales/*
 */
class CompromisoComportamentalController
{
    private CompromisoComportamentalService $service;

    public function __construct()
    {
        $this->service = new CompromisoComportamentalService();
    }

    public function listar(): void
    {
        $filtros = SanitizerHelper::sanitizeArray($_GET);
        $pagina = max(1, (int) ($_GET['pagina'] ?? 1));
        $porPagina = max(1, min(100, (int) ($_GET['por_pagina'] ?? 20)));
        $resultado = $this->service->listar($filtros, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function crear(): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        ValidatorHelper::requireFields($input, ['evaluacion_id', 'competencia_codigo']);

        $id = $this->service->crear($input);
        ResponseHelper::success(['id' => $id], 'Compromiso comportamental creado', 201);
    }

    public function enviar(): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        ValidatorHelper::requireFields($input, ['competencia_codigo']);
        if (empty($input['evaluacion_id']) && empty($input['concertacion_id'])) {
            ResponseHelper::error('Debe indicar evaluacion_id o concertacion_id', 400);
        }
        $user = \App\Middleware\AuthMiddleware::user();

        $id = $this->service->enviar($input, $user);
        ResponseHelper::success(['id' => $id], 'Compromiso comportamental enviado', 201);
    }

    public function ver(int $id): void
    {
        $compromiso = $this->service->listar(['id' => $id])['data'] ?? null;
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }
        ResponseHelper::success($compromiso);
    }

    public function actualizar(int $id): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        $this->service->actualizar($id, $input);
        ResponseHelper::success(null, 'Compromiso comportamental actualizado');
    }

    public function eliminar(int $id): void
    {
        $user = \App\Middleware\AuthMiddleware::user();
        $this->service->eliminar($id, $user);
        ResponseHelper::success(null, 'Compromiso comportamental eliminado');
    }

    public function aprobar(int $id): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        $observaciones = $input['observaciones'] ?? '';
        $user = \App\Middleware\AuthMiddleware::user();
        $this->service->aprobar($id, (string) $observaciones, $user);
        ResponseHelper::success(null, 'Compromiso comportamental aprobado');
    }

    public function rechazar(int $id): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        $observaciones = $input['observaciones'] ?? '';
        $user = \App\Middleware\AuthMiddleware::user();
        $this->service->rechazar($id, (string) $observaciones, $user);
        ResponseHelper::success(null, 'Compromiso comportamental rechazado');
    }

    public function devolver(int $id): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        $observaciones = $input['observaciones'] ?? '';
        $user = \App\Middleware\AuthMiddleware::user();
        $this->service->devolver($id, (string) $observaciones, $user);
        ResponseHelper::success(null, 'Compromiso comportamental devuelto');
    }

    public function calificar(int $id): void
    {
        $input = SanitizerHelper::sanitizeArray($this->jsonInput());
        ValidatorHelper::requireFields($input, ['calificacion']);

        $puntaje = (float) $input['calificacion'];
        $observaciones = (string) ($input['observaciones'] ?? '');
        $conductas = $input['conductas'] ?? null;
        $impactoAporta = $input['impacto_aporta_compromisos'] ?? null;
        $impactoExcede = $input['impacto_excede_estipulado'] ?? null;
        $justificacionExcede = $input['justificacion_excede'] ?? null;
        $user = \App\Middleware\AuthMiddleware::user();

        $this->service->calificar(
            $id,
            $puntaje,
            $observaciones,
            $conductas,
            $user,
            $impactoAporta,
            $impactoExcede,
            $justificacionExcede
        );
        ResponseHelper::success(null, 'Compromiso comportamental calificado');
    }

    public function resumenPesos(int $id): void
    {
        $user = \App\Middleware\AuthMiddleware::user();
        $resultado = $this->service->resumenPesos($id);
        ResponseHelper::success($resultado);
    }

    public function pendientesAprobacion(): void
    {
        $user = \App\Middleware\AuthMiddleware::user();
        $pagina = max(1, (int) ($_GET['pagina'] ?? 1));
        $porPagina = max(1, min(100, (int) ($_GET['por_pagina'] ?? 20)));
        $resultado = $this->service->pendientesAprobacion($user, $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function listarPorEvaluacion(int $id): void
    {
        $data = $this->service->compromisosConConductas($id);
        ResponseHelper::success($data);
    }

    /**
     * Catálogo de competencias comportamentales (Decretos 2539/2005 y 815/2018).
     * Usado por el frontend para poblar el selector de competencias
     * al crear compromisos comportamentales.
     */
    public function competenciasComportamentales(): void
    {
        $pdo = \App\Config\Database::getInstance();
        $stmt = $pdo->query("SELECT codigo AS id, nombre, decreto, descripcion FROM competencias ORDER BY decreto, nombre");
        $competencias = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        ResponseHelper::success($competencias);
    }

    public function validarAntesDeFirmar(int $id): void
    {
        $user = \App\Middleware\AuthMiddleware::user();
        $concertacion = (new \App\Repository\ConcertacionRepository(\App\Config\Database::getInstance()))
            ->buscarPorEvaluacionId($id);
        if (!$concertacion) {
            ResponseHelper::notFound('Concertacion no encontrada para la evaluacion');
        }
        $resultado = $this->service->validarCompromisosAntesDeFirmar((int) $concertacion['id'], $user['id']);
        ResponseHelper::success($resultado);
    }

    private function jsonInput(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}