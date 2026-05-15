<?php

namespace App\Repository;

class EntidadRepository extends BaseRepository
{
    protected string $table = 'entidades';

    public function listarJefes(int $entidadId): array
    {
        $stmt = $this->pdo->prepare("SELECT u.id, u.documento, u.nombres, u.apellidos, u.cargo, r.nombre as rol_nombre FROM usuario_rol ur INNER JOIN usuarios u ON u.id = ur.usuario_id INNER JOIN roles r ON r.id = ur.rol_id WHERE ur.entidad_id = ? AND u.eliminado_en IS NULL ORDER BY u.nombres");
        $stmt->execute([$entidadId]);
        return $stmt->fetchAll();
    }

    public function listarDependencias(int $entidadId): array
    {
        $stmt = $this->pdo->prepare("SELECT d.*, (SELECT CONCAT(u.nombres, ' ', u.apellidos) FROM usuarios u WHERE u.id = d.jefe_id AND u.eliminado_en IS NULL) as jefe_nombre FROM dependencias d WHERE d.entidad_id = ? AND d.eliminado_en IS NULL ORDER BY d.nombre");
        $stmt->execute([$entidadId]);
        return $stmt->fetchAll();
    }
}
