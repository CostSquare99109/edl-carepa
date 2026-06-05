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
 $resultado = $this->repo->listar([], 1, 50);
 ResponseHelper::success($resultado['data']);
 }
}
