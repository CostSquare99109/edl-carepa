<?php

namespace App\Controller;

use App\Repository\NotificacionRepository;
use App\Helper\ResponseHelper;
use App\Middleware\AuthMiddleware;

class NotificacionController
{
    private NotificacionRepository $repo;

    public function __construct()
    {
        $this->repo = new NotificacionRepository();
    }

    public function listar(): void
    {
        $user = AuthMiddleware::user();
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->repo->listarPorUsuario($user['id'], $pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function marcarLeida(int $id): void
    {
        $user = AuthMiddleware::user();
        $this->repo->marcarLeida($id, $user['id']);
        ResponseHelper::success(null, 'Notificacion marcada como leida');
    }
}
