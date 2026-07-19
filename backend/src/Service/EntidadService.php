<?php
declare(strict_types=1);

namespace App\Service;

use App\Repository\EntidadRepository;
use App\Helper\ValidatorHelper;
use App\Helper\ResponseHelper;

class EntidadService
{
    private EntidadRepository $repo;

    public function __construct()
    {
        $this->repo = new EntidadRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listar($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'codigo' => 'required|max:20',
            'nombre' => 'required|max:200',
            'tipo' => 'required|max:50'
        ]);

        if ($this->repo->existe('codigo', $datos['codigo'])) {
            ResponseHelper::error('Ya existe una entidad con ese codigo', 409);
        }

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('crear', 'entidades', $id, null, $datos);
        return $id;
    }

    public function ver(int $id): ?array
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        return $entidad;
    }

    public function actualizar(int $id, array $datos): void
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        $permitidos = ['codigo','nombre','tipo','nit','municipio','departamento','estado'];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));
        $this->repo->actualizar($id, $datosFiltrados);
        AuditoriaService::registrar('actualizar', 'entidades', $id, $entidad, $datosFiltrados);
    }

    public function eliminar(int $id): void
    {
        $entidad = $this->repo->buscarPorId($id);
        if (!$entidad) {
            ResponseHelper::error('Entidad no encontrada', 404);
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar', 'entidades', $id, $entidad);
    }

    public function jefes(int $entidadId): array
    {
        $this->ver($entidadId);
        return $this->repo->listarJefes($entidadId);
    }

    public function dependencias(int $entidadId): array
    {
    $this->ver($entidadId);
    return $this->repo->listarDependencias($entidadId);
    }

    public function habilitar(int $id): void
    {
    $entidad = $this->repo->buscarPorId($id);
    if (!$entidad) {
    ResponseHelper::error('Entidad no encontrada', 404);
    }
    $this->repo->actualizar($id, ['estado' => 'activa']);
    AuditoriaService::registrar('habilitar', 'entidades', $id);
    }

    /**
     * Crea una entidad y su primer Jefe de Personal (jefe_dependencia) en una transaccion.
     * Segun CNSC: la CNSC habilita al jefe de personal con usuario/contraseña.
     * Aqui el superadmin (jefe_personal) crea la entidad y el usuario jefe de personal.
     */
    public function crearConJefePersonal(array $datos): array
    {
        $v = new ValidatorHelper();
        $v->validate($datos, [
            'entidad' => 'required|array',
            'entidad.codigo' => 'max:20',
            'entidad.nombre' => 'required|max:200',
            'entidad.tipo' => 'required|max:50',
            'jefe_personal' => 'required|array',
        ]);

        $entidadDatos = $datos['entidad'];
        $jefeDatos = $datos['jefe_personal'];

        if (!empty($entidadDatos['codigo']) && $this->repo->existe('codigo', $entidadDatos['codigo'])) {
            ResponseHelper::error('Ya existe una entidad con ese codigo', 409);
        }

        $pdo = Database::getInstance();
        try {
            $pdo->beginTransaction();

            $entidadId = $this->repo->crear($entidadDatos);
            AuditoriaService::registrar('crear', 'entidades', $entidadId, null, $entidadDatos);

            $usuarioRepo = new UsuarioRepository($pdo);

            // Si se envio usuario_id, asignar rol a usuario existente
            if (!empty($jefeDatos['usuario_id'])) {
                $usuarioId = (int) $jefeDatos['usuario_id'];

                $stmtRol = $pdo->prepare("SELECT id FROM roles WHERE codigo = 'jefe_dependencia'");
                $stmtRol->execute();
                $rol = $stmtRol->fetch();
                if ($rol) {
                    $usuarioRepo->asignarRol($usuarioId, $rol['id'], $entidadId);
                }

                $pdo->commit();

                AuditoriaService::registrar('crear_entidad_con_jefe', 'entidades', $entidadId, null, [
                    'entidad' => $entidadDatos,
                    'jefe_personal_id' => $usuarioId,
                ]);

                $usuario = $usuarioRepo->buscarPorId($usuarioId);

                return [
                    'entidad_id' => $entidadId,
                    'entidad' => $this->repo->buscarPorId($entidadId),
                    'jefe_personal' => [
                        'id' => $usuarioId,
                        'documento' => $usuario['documento'] ?? '',
                        'nombre_completo' => trim(($usuario['primer_nombre'] ?? '') . ' ' . ($usuario['primer_apellido'] ?? '')),
                        'email' => $usuario['email'] ?? '',
                    ],
                ];
            }

            // Si no hay usuario_id, crear usuario nuevo
            $v->validate($datos, [
                'jefe_personal.documento' => 'required|max:30',
                'jefe_personal.tipo_documento' => 'required',
                'jefe_personal.primer_nombre' => 'required|max:100',
                'jefe_personal.primer_apellido' => 'required|max:100',
                'jefe_personal.email' => 'required|email|max:150',
                'jefe_personal.password' => 'required|min:8',
            ]);

            if ($usuarioRepo->existe('documento', $jefeDatos['documento'])) {
                throw new \Exception('Ya existe un usuario con ese documento');
            }
            if ($usuarioRepo->existe('email', $jefeDatos['email'])) {
                throw new \Exception('Ya existe un usuario con ese email');
            }

            $passwordHash = password_hash($jefeDatos['password'], PASSWORD_BCRYPT);

            $usuarioId = $usuarioRepo->crear([
                'tipo_documento' => $jefeDatos['tipo_documento'],
                'documento' => $jefeDatos['documento'],
                'genero' => $jefeDatos['genero'] ?? null,
                'primer_nombre' => $jefeDatos['primer_nombre'],
                'segundo_nombre' => $jefeDatos['segundo_nombre'] ?? null,
                'primer_apellido' => $jefeDatos['primer_apellido'],
                'segundo_apellido' => $jefeDatos['segundo_apellido'] ?? null,
                'email' => $jefeDatos['email'],
                'telefono1' => $jefeDatos['telefono1'] ?? null,
                'telefono2' => $jefeDatos['telefono2'] ?? null,
                'password_hash' => $passwordHash,
                'estado' => 'activo',
                'entidad_id' => $entidadId,
                'es_contratista' => 0,
                'naturaleza' => 'libre_nombramiento',
                'tipo_nombramiento' => 'hecho_en_carrera',
                'denominacion_empleo' => 'Jefe de Personal',
                'codigo_empleo' => 'JP001',
                'grado_empleo' => '25',
                'es_evaluador_y_evaluado' => 0,
                'evaluacion_inicio_febrero' => 1,
            ]);

            // 3. Asignar rol jefe_dependencia (Jefe de Personal)
            $stmtRol = $pdo->prepare("SELECT id FROM roles WHERE codigo = 'jefe_dependencia'");
            $stmtRol->execute();
            $rol = $stmtRol->fetch();
            if ($rol) {
                $usuarioRepo->asignarRol($usuarioId, $rol['id'], $entidadId);
            }

            $pdo->commit();

            AuditoriaService::registrar('crear_entidad_con_jefe', 'entidades', $entidadId, null, [
                'entidad' => $entidadDatos,
                'jefe_personal_id' => $usuarioId,
            ]);

            return [
                'entidad_id' => $entidadId,
                'entidad' => $this->repo->buscarPorId($entidadId),
                'jefe_personal' => [
                    'id' => $usuarioId,
                    'documento' => $jefeDatos['documento'],
                    'nombre_completo' => trim(($jefeDatos['primer_nombre'] ?? '') . ' ' . ($jefeDatos['primer_apellido'] ?? '')),
                    'email' => $jefeDatos['email'],
                ],
            ];
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
