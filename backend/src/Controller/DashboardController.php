<?php

namespace App\Controller;

use App\Helper\ResponseHelper;
use App\Config\Database;

class DashboardController
{
    public function resumen(): void
    {
        $db = Database::getInstance();
        
        $entidades = $db->query("SELECT COUNT(*) as c FROM entidades")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
        $usuarios = $db->query("SELECT COUNT(*) as c FROM usuarios")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
        $evaluaciones = $db->query("SELECT COUNT(*) as c FROM evaluaciones")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;
        $periodos = $db->query("SELECT COUNT(*) as c FROM periodos WHERE estado = 'activo'")->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0;

        ResponseHelper::success([
            'entidades' => (int)$entidades,
            'usuarios' => (int)$usuarios,
            'evaluaciones' => (int)$evaluaciones,
            'periodos' => (int)$periodos,
        ]);
    }

    public function actividad(): void
    {
        $db = Database::getInstance();
        $porPagina = min((int)($_GET['por_pagina'] ?? 10), 50);

        $stmt = $db->prepare("SELECT id, accion as descripcion, fecha, tabla_afectada as tipo FROM auditoria ORDER BY fecha DESC LIMIT ?");
        $stmt->execute([$porPagina]);
        $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        ResponseHelper::success([
            'data' => $data ?: [],
            'total' => count($data),
            'pagina' => 1,
            'por_pagina' => $porPagina,
            'total_paginas' => 1,
        ]);
    }
}
