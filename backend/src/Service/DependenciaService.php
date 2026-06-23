<?php

namespace App\Service;

use App\Repository\DependenciaRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class DependenciaService
{
    private DependenciaRepository $repo;

    public function __construct()
    {
        $this->repo = new DependenciaRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listarConConteoUsuarios($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
    if (empty($datos['entidad_id'])) {
    $pdo = \App\Config\Database::getInstance();
    $stmt = $pdo->query("SELECT id FROM entidades WHERE eliminado_en IS NULL ORDER BY id LIMIT 1");
    $ent = $stmt->fetch();
    $datos['entidad_id'] = $ent ? (int) $ent['id'] : 1;
    }

    $v = new ValidatorHelper();
    $v->validate($datos, [
    'entidad_id' => 'required',
    'codigo' => 'required|max:30',
    'nombre' => 'required|max:200'
    ]);

    $id = $this->repo->crear($datos);
    AuditoriaService::registrar('crear', 'dependencias', $id, null, $datos);
    return $id;
    }

    public function ver(int $id): ?array
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        return $dep;
    }

    public function actualizar(int $id, array $datos): void
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        $permitidos = ['codigo','nombre','jefe_id','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'dependencias', $id, $dep, $datosFiltrados);
    }

    public function eliminar(int $id): void
    {
        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar', 'dependencias', $id, $dep);
    }

    /**
     * Cambia el estado de una dependencia (activa/inactiva).
     *
     * Regla CNSC (Acuerdo 617 de 2018, Anexo Tecnico): una dependencia
     * solo puede pasar a 'inactiva' cuando no tenga usuarios activos
     * asociados. Si se intenta inactivar con usuarios activos, devuelve
     * HTTP 422 con mensaje literal.
     *
     * @param int $id ID de la dependencia.
     * @param string $nuevoEstado 'activa' o 'inactiva'.
     * @return void
     * @throws void Termina con HTTP 422 o 404 si no se cumplen las precondiciones.
     */
    public function cambiarEstado(int $id, string $nuevoEstado): void
    {
        if (!in_array($nuevoEstado, ['activa', 'inactiva'], true)) {
            ResponseHelper::error('Estado invalido. Use "activa" o "inactiva".', 422);
        }

        $dep = $this->repo->buscarPorId($id);
        if (!$dep) {
            ResponseHelper::error('Dependencia no encontrada', 404);
        }

        // Si ya esta en el estado solicitado, no hacer nada (idempotente).
        if (($dep['estado'] ?? null) === $nuevoEstado) {
            ResponseHelper::success(
                ['id' => $id, 'estado' => $nuevoEstado],
                'La dependencia ya se encuentra en el estado solicitado.'
            );
            return;
        }

        // Regla CNSC: no se puede inactivar con usuarios activos asociados.
        if ($nuevoEstado === 'inactiva') {
            $pdo = \App\Config\Database::getInstance();
            $stmt = $pdo->prepare(
                "SELECT COUNT(*) FROM usuarios
                 WHERE dependencia_id = :id
                   AND estado = 'activo'
                   AND eliminado_en IS NULL"
            );
            $stmt->execute([':id' => $id]);
            $usuariosActivos = (int) $stmt->fetchColumn();

            if ($usuariosActivos > 0) {
                ResponseHelper::error(
                sprintf(
                    'No se puede inactivar la dependencia porque tiene %d usuario(s) activo(s) asociado(s). Conforme al Anexo Tecnico del Acuerdo 617 de 2018, solo se permite inactivar dependencias sin usuarios asociados.',
                    $usuariosActivos
                ),
                422
                );
            }
        }

        $estadoAnterior = $dep['estado'] ?? null;
        $this->repo->actualizar($id, ['estado' => $nuevoEstado]);

        AuditoriaService::registrar(
            'cambiar_estado',
            'dependencias',
            $id,
            ['estado' => $estadoAnterior],
            ['estado' => $nuevoEstado]
        );

        ResponseHelper::success(
            ['id' => $id, 'estado' => $nuevoEstado],
            $nuevoEstado === 'activa'
                ? 'Dependencia activada correctamente.'
                : 'Dependencia inactivada correctamente.'
        );
    }
}
