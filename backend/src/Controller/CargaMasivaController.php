<?php

namespace App\Controller;

use App\Service\CargaMasivaService;
use App\Helper\ResponseHelper;

class CargaMasivaController
{
    private CargaMasivaService $service;

    public function __construct()
    {
        $this->service = new CargaMasivaService();
    }

    public function plantillaUsuarios(): void
 {
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename=plantilla_usuarios.csv');
  echo "tipo_documento,documento,nombres,apellidos,email,cargo,dependencia,genero,es_evaluador,es_contratista\n";
  echo "CC,12345678,Juan,Perez,juan@example.com,Profesional,Planeacion,Hombre,Si,No\n";
  exit;
 }

 public function historial(): void
    {
        $pagina = (int) ($_GET['pagina'] ?? 1);
        $porPagina = (int) ($_GET['por_pagina'] ?? 20);
        $resultado = $this->service->historial($pagina, $porPagina);
        ResponseHelper::success($resultado);
    }

    public function usuarios(): void
    {
        $id = $this->service->usuarios($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de usuarios recibida', 201);
    }

    public function concertaciones(): void
    {
        $id = $this->service->concertaciones($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de concertaciones recibida', 201);
    }

    public function evaluaciones(): void
    {
        $id = $this->service->evaluaciones($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de evaluaciones recibida', 201);
    }

    public function cursos(): void
    {
        $id = $this->service->cursos($_FILES['archivo']);
        ResponseHelper::success(['carga_id' => $id], 'Carga de cursos recibida', 201);
    }
}
