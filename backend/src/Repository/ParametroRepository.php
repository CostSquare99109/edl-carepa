<?php

namespace App\Repository;

class ParametroRepository extends BaseRepository
{
    protected string $table = 'parametros';

    public function obtenerValor(string $clave): ?string
    {
        $stmt = $this->pdo->prepare("SELECT valor FROM parametros WHERE clave = ?");
        $stmt->execute([$clave]);
        $result = $stmt->fetchColumn();
        return $result !== false ? $result : null;
    }

    public function establecerValor(string $clave, string $valor): bool
    {
        $stmt = $this->pdo->prepare("UPDATE parametros SET valor = ? WHERE clave = ?");
        return $stmt->execute([$valor, $clave]);
    }
}
