<?php

namespace App\Controller;

use App\Config\Database;
use App\Helper\ResponseHelper;

class ConsultaFuncionarioController
{
    public function consultar(string $documento): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT u.id, u.documento, u.tipo_documento, u.nombres, u.apellidos, u.email, u.cargo, u.estado, e.nombre as entidad_nombre, d.nombre as dependencia_nombre FROM usuarios u LEFT JOIN entidades e ON e.id = u.entidad_id LEFT JOIN dependencias d ON d.id = u.dependencia_id WHERE u.documento = ? AND u.eliminado_en IS NULL");
        $stmt->execute([$documento]);
        $funcionario = $stmt->fetch();

        if (!$funcionario) {
            ResponseHelper::error('Funcionario no encontrado', 404);
        }

        $stmt = $pdo->prepare("SELECT r.codigo, r.nombre FROM usuario_rol ur INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.usuario_id = ?");
        $stmt->execute([$funcionario['id']]);
        $funcionario['roles'] = $stmt->fetchAll();

        ResponseHelper::success($funcionario);
    }
}
