<?php

namespace App\Repository;

use App\Config\Database;
use PDO;

class CompetenciaRepository extends BaseRepository
{
 protected string $table = 'competencias';
 protected string $primaryKey = 'codigo';

 public function listarTodas(): array
 {
 $stmt = $this->pdo->prepare("SELECT * FROM competencias ORDER BY codigo");
 $stmt->execute();
 return $stmt->fetchAll();
 }
}
