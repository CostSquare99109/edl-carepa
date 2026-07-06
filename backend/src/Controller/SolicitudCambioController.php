<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\SolicitudCambioService;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class SolicitudCambioController
{
    private SolicitudCambioService $service;

    public function __construct()
    {
        $this->service = new SolicitudCambioService();
    }

    public function crear(): void
    {
        $user = AuthMiddleware::user();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $evaluadorActualId = (int) ($input['evaluador_actual_id'] ?? 0);
        if (!$evaluadorActualId) {
            ResponseHelper::validationError(['evaluador_actual_id' => 'El evaluador actual es requerido']);
        }

        $resultado = $this->service->crear($input, (int) $user['id'], $evaluadorActualId);
        ResponseHelper::success($resultado, 'Solicitud creada correctamente');
    }

    public function misSolicitudes(): void
    {
        $user = AuthMiddleware::user();
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->misSolicitudes((int) $user['id'], $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function pendientesJefe(): void
    {
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->pendientesJefe($pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function decidir(int $id): void
    {
        $user = AuthMiddleware::user();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $decision = $input['decision'] ?? '';
        if (!in_array($decision, ['aprobar', 'rechazar'])) {
            ResponseHelper::validationError(['decision' => 'Decision debe ser aprobar o rechazar']);
        }

        $nuevoEvaluadorId = !empty($input['nuevo_evaluador_id']) ? (int) $input['nuevo_evaluador_id'] : null;
        $comentario = $input['decision_comentario'] ?? null;

        if ($decision === 'aprobar' && !$nuevoEvaluadorId) {
            ResponseHelper::validationError(['nuevo_evaluador_id' => 'Debe seleccionar un nuevo evaluador para aprobar']);
        }

        $resultado = $this->service->decidir($id, $decision, $nuevoEvaluadorId, $comentario, (int) $user['id']);
        ResponseHelper::success($resultado, 'Solicitud ' . ($resultado['estado'] === 'aprobada' ? 'aprobada' : 'rechazada'));
    }
}
