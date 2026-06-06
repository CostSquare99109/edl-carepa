<?php

namespace App\Controller;

use App\Repository\CompetenciaRepository;
use App\Helper\ResponseHelper;

class CompetenciaController
{
 private CompetenciaRepository $repo;

 public function __construct()
 {
  $this->repo = new CompetenciaRepository();
 }

 public function listar(): void
 {
  $decreto = $_GET['decreto'] ?? null;

  if ($decreto) {
   $data = $this->repo->listarPorDecreto($decreto);
  } else {
   $data = $this->repo->listarTodas();
  }

  ResponseHelper::success($data);
 }

 public function decretos(): void
 {
  $decretos = $this->repo->decretosDisponibles();
  ResponseHelper::success($decretos);
 }
}
