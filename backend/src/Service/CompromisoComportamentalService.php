<?php

namespace App\Service;

use App\Repository\CompromisoComportamentalRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

/**
 * Service para Paquete 2: Compromisos Comportamentales.
 *
 * Lógica, validaciones, registros y comportamiento completamente
 * independientes del Paquete 1 (Compromisos Funcionales).
 *
 * Diferencias con CompromisoService:
 *   - No valida estructura CNSC verbo+objeto+condición (los comportamentales
 *     son nombres de competencias predefinidas).
 *   - El campo `peso` por defecto es 1 (cada comportamiento vale 1).
 *   - La `calificación` se mide en escala 4-15 (no 0-100).
 *   - Tiene campos únicos: nivel_comportamental, puntaje_comportamental,
 *     frecuencia, impacto_aporta, impacto_excede, justificacion_excede,
 *     conductas_json.
 */
class CompromisoComportamentalService
{
    private CompromisoComportamentalRepository $repo;
    private ConcertacionRepository $concertacionRepo;

    public function __construct()
    {
        $pdo = Database::getInstance();
        $this->repo = new CompromisoComportamentalRepository($pdo);
        $this->concertacionRepo = new ConcertacionRepository($pdo);
    }

    public function listar(array $filtros = [], int $pagina = 1, int $porPagina = 20): array
    {
        $user = AuthMiddleware::user();
        $rolActivo = AuthMiddleware::rolActivo();

        if ($rolActivo === 'evaluador') {
            $filtros['evaluador_id'] = $user['id'];
        } elseif ($rolActivo === 'evaluado') {
            $filtros['evaluado_id'] = $user['id'];
        }

        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function crear(array $datos): int
    {
        $user = AuthMiddleware::user();
        $rolActivo = AuthMiddleware::rolActivo();

        $evaluacionId = $datos['evaluacion_id'] ?? null;
        if (!$evaluacionId) {
            ResponseHelper::error('evaluacion_id es requerido', 422);
        }

        $competenciaCodigo = $datos['competencia_codigo'] ?? null;
        if (!$competenciaCodigo) {
            ResponseHelper::error('competencia_codigo es requerido para un compromiso comportamental', 422);
        }

        $concertacionId = $this->repo->resolverConcertacionId((int) $evaluacionId);
        if (!$concertacionId) {
            $pdo = Database::getInstance();
            $stmt = $pdo->prepare("SELECT evaluado_id, periodo_id FROM evaluaciones WHERE id = :eid AND eliminado_en IS NULL");
            $stmt->execute(['eid' => $evaluacionId]);
            $evalData = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$evalData) {
                ResponseHelper::error('Evaluacion no encontrada', 404);
            }
            $concertacionService = new ConcertacionService();
            $concertacionId = $concertacionService->crear([
                'periodo_id' => $evalData['periodo_id'],
                'evaluado_id' => $evalData['evaluado_id'],
                'evaluador_id' => $user['id'],
                'tipo_concertacion' => $datos['tipo_concertacion'] ?? 'concertacion_bilateral',
                'evaluacion_id' => $evaluacionId,
            ]);
        }

        $this->validarLimites($concertacionId);

        $crearDatos = [
            'concertacion_id' => $concertacionId,
            'tipo' => 'comportamental',
            'competencia_codigo' => $competenciaCodigo,
            'descripcion' => $datos['descripcion'] ?? $competenciaCodigo,
            'peso' => $datos['peso'] ?? 1,
            'propuesto_por_jefe_entidad' => $rolActivo === 'evaluador' ? 1 : 0,
            'estado' => 'propuesto',
        ];

        $id = $this->repo->crear($crearDatos);
        AuditoriaService::registrar('crear_compromiso_comportamental', 'compromisos', $id);

        return $id;
    }

    public function enviar(array $datos, array $user): int
    {
        $evaluacionId = $datos['evaluacion_id'] ?? null;
        $concertacionIdDirecto = $datos['concertacion_id'] ?? null;

        if (!$evaluacionId && !$concertacionIdDirecto) {
            ResponseHelper::error('evaluacion_id o concertacion_id es requerido', 422);
        }

        $competenciaCodigo = $datos['competencia_codigo'] ?? null;
        if (!$competenciaCodigo) {
            ResponseHelper::error('competencia_codigo es requerido', 422);
        }

        $concertacionId = null;
        $evaluadoId = null;
        $periodoId = null;
        $pdo = Database::getInstance();

        if ($concertacionIdDirecto) {
            $stmt = $pdo->prepare("SELECT id, evaluador_id, evaluado_id, periodo_id FROM concertaciones WHERE id = ? AND eliminado_en IS NULL");
            $stmt->execute([(int) $concertacionIdDirecto]);
            $conData = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$conData) {
                ResponseHelper::error('Concertacion no encontrada', 404);
            }
            $concertacionId = (int) $conData['id'];
            $evaluadoId = (int) $conData['evaluado_id'];
            $periodoId = (int) $conData['periodo_id'];
        } else {
            $concertacionId = $this->repo->resolverConcertacionId((int) $evaluacionId);
            if (!$concertacionId) {
                $stmt = $pdo->prepare("SELECT evaluado_id, periodo_id FROM evaluaciones WHERE id = :eid AND eliminado_en IS NULL");
                $stmt->execute(['eid' => $evaluacionId]);
                $evalData = $stmt->fetch(\PDO::FETCH_ASSOC);
                if (!$evalData) {
                    ResponseHelper::error('Evaluacion no encontrada', 404);
                }
                $concertacionService = new ConcertacionService();
                $concertacionId = $concertacionService->crear([
                    'periodo_id' => $evalData['periodo_id'],
                    'evaluado_id' => $evalData['evaluado_id'],
                    'evaluador_id' => $user['id'],
                    'tipo_concertacion' => $datos['tipo_concertacion'] ?? 'concertacion_bilateral',
                    'evaluacion_id' => $evaluacionId,
                ]);
            }
        }

        $this->validarLimites($concertacionId);

        $crearDatos = [
            'concertacion_id' => $concertacionId,
            'tipo' => 'comportamental',
            'competencia_codigo' => $competenciaCodigo,
            'descripcion' => $datos['descripcion'] ?? $competenciaCodigo,
            'peso' => $datos['peso'] ?? 1,
            'propuesto_por_jefe_entidad' => 0,
            'es_propuesto_evaluado' => 1,
            'estado' => 'propuesto',
            'observaciones_evaluado' => $datos['observaciones_evaluado'] ?? null,
        ];

        $id = $this->repo->crear($crearDatos);
        AuditoriaService::registrar('enviar_compromiso_comportamental', 'compromisos', $id);

        $pdo = \App\Config\Database::getInstance();
        $stmtNotif = $pdo->prepare("SELECT con.evaluador_id, u.primer_nombre, u.primer_apellido, u.segundo_apellido
            FROM concertaciones con
            INNER JOIN usuarios u ON u.id = con.evaluado_id
            WHERE con.id = ?");
        $stmtNotif->execute([$concertacionId]);
        $info = $stmtNotif->fetch(\PDO::FETCH_ASSOC);
        if ($info && !empty($info['evaluador_id'])) {
            $nombre = trim(($info['primer_nombre'] ?? '') . ' ' . ($info['primer_apellido'] ?? '') . ' ' . ($info['segundo_apellido'] ?? ''));
            $notif = new NotificacionService();
            $notif->notificarCompromisoPendiente((int) $info['evaluador_id'], $nombre, $id);
        }

        return $id;
    }

    public function aprobar(int $id, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden aprobar compromisos en estado propuesto', 400);
        }

        $this->repo->actualizar($id, [
            'estado' => 'aprobado',
            'observaciones_evaluador' => $observaciones ?: null,
        ]);

        AuditoriaService::registrar('aprobar_compromiso_comportamental', 'compromisos', $id);
    }

    public function rechazar(int $id, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden rechazar compromisos en estado propuesto', 400);
        }

        $this->repo->actualizar($id, [
            'estado' => 'rechazado',
            'observaciones_evaluador' => $observaciones ?: null,
        ]);

        AuditoriaService::registrar('rechazar_compromiso_comportamental', 'compromisos', $id);
    }

    public function devolver(int $id, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden devolver compromisos en estado propuesto', 400);
        }

        $this->repo->actualizar($id, [
            'estado' => 'devuelto',
            'observaciones_evaluador' => $observaciones,
        ]);

        AuditoriaService::registrar('devolver_compromiso_comportamental', 'compromisos', $id);
    }

    /**
     * Califica un compromiso comportamental.
     *
     * Escala CNSC: 4 (Bajo), 7 (Aceptable), 10 (Alto), 13 (Muy Alto).
     * Rango válido: 4-15. Estados: >=4 cumplido, <4 incumplido.
     */
    public function calificar(
        int $id,
        float $puntaje,
        string $observaciones,
        ?array $conductas = null,
        array $user = [],
        ?string $impactoAporta = null,
        ?string $impactoExcede = null,
        ?string $justificacionExcede = null
    ): void {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }

        if (!in_array($compromiso['estado'], ['propuesto', 'pendiente_aprobacion', 'aprobado', 'en_progreso', 'cumplido', 'incumplido'], true)) {
            ResponseHelper::error('Solo se pueden calificar compromisos en estados habilitados', 400);
        }

        if ($puntaje < 4 || $puntaje > 15) {
            ResponseHelper::error(
                "Para compromisos comportamentales la calificacion debe estar entre 4 y 15 puntos (escala CNSC: Bajo 4-6, Aceptable 7-9, Alto 10-12, Muy Alto 13-15). Recibido: {$puntaje}",
                422
            );
        }

        $estadosPermitidos = ['pendiente', 'en_proceso', 'cerrada'];
        $stmt = $this->repo->getPdo()->prepare(
            "SELECT ev.estado FROM evaluaciones ev
             INNER JOIN concertaciones con ON con.id = ev.concertacion_id
             WHERE con.id = :cid AND ev.eliminado_en IS NULL
             LIMIT 1"
        );
        $stmt->execute(['cid' => $compromiso['concertacion_id']]);
        $estadoEval = $stmt->fetchColumn();
        if ($estadoEval && !in_array($estadoEval, $estadosPermitidos, true)) {
            ResponseHelper::error(
                "La evaluacion asociada no admite nuevas calificaciones (estado: {$estadoEval}).",
                422
            );
        }

        if ($impactoExcede && in_array(strtolower($impactoExcede), ['si', '1', 'true'], true)) {
            $justif = trim((string) ($justificacionExcede ?? ''));
            if (mb_strlen($justif) < 40) {
                ResponseHelper::error(
                    "La justificacion de \"excede lo estipulado\" debe tener minimo 40 caracteres. Actual: " . mb_strlen($justif),
                    422
                );
            }
        }

        if (!empty($impactoAporta) && !in_array(strtolower((string) $impactoAporta), ['si', 'moderadamente', 'no'], true)) {
            ResponseHelper::error('El valor de "aporta a los compromisos" debe ser Si, Moderadamente o No.', 422);
        }
        if (!empty($impactoExcede) && !in_array(strtolower((string) $impactoExcede), ['si', 'no'], true)) {
            ResponseHelper::error('El valor de "excede lo estipulado" debe ser Si o No.', 422);
        }

        if ($conductas && is_array($conductas)) {
            foreach ($conductas as $cond) {
                $excede = strtolower((string) ($cond['impacto_excede_estipulado'] ?? ''));
                $justif = trim((string) ($cond['justificacion_excede'] ?? ''));
                if (in_array($excede, ['si', '1', 'true'], true) && mb_strlen($justif) < 40) {
                    ResponseHelper::error(
                        "La justificacion de \"excede lo estipulado\" debe tener minimo 40 caracteres por conducta. Actual: " . mb_strlen($justif),
                        422
                    );
                }
            }
        }

        $conductasJson = null;
        if ($conductas !== null) {
            $conductasJson = json_encode($conductas, JSON_UNESCAPED_UNICODE);
        } elseif ($impactoAporta || $impactoExcede || $justificacionExcede) {
            $conductasJson = json_encode([
                'impacto_aporta_compromisos' => $impactoAporta,
                'impacto_excede_estipulado' => $impactoExcede,
                'justificacion_excede' => $justificacionExcede,
            ], JSON_UNESCAPED_UNICODE);
        }

        $estadoCalif = $puntaje >= 4 ? 'cumplido' : 'incumplido';
        if ($puntaje >= 13) {
            $nivel = 'muy_alto';
        } elseif ($puntaje >= 10) {
            $nivel = 'alto';
        } elseif ($puntaje >= 7) {
            $nivel = 'aceptable';
        } else {
            $nivel = 'bajo';
        }

        $actualizar = [
            'calificacion' => $puntaje,
            'puntaje_comportamental' => $puntaje,
            'nivel_comportamental' => $nivel,
            'estado' => $estadoCalif,
            'observaciones_evaluador' => $observaciones ?: null,
            'impacto_aporta_compromisos' => $impactoAporta,
            'impacto_excede_estipulado' => $impactoExcede,
            'justificacion_excede' => $justificacionExcede,
        ];
        if ($conductasJson !== null) {
            $actualizar['conductas_json'] = $conductasJson;
        }

        $this->repo->actualizar($id, $actualizar);
        AuditoriaService::registrar('calificar_compromiso_comportamental', 'compromisos', $id);
    }

    private function validarLimites(int $concertacionId): void
    {
        $count = $this->repo->contarPorConcertacion($concertacionId);
        $max = (int) Env::get('MAX_COMPROMISOS_COMPORTAMENTALES', 5);

        if ($count >= $max) {
            ResponseHelper::error(
                "No se pueden agregar mas compromisos comportamentales. Maximo permitido: {$max}",
                422
            );
        }
    }

    public function compromisosConConductas(int $evaluacionId): array
    {
        return $this->repo->buscarConConductas($evaluacionId);
    }

    public function resumenPesos(int $concertacionId): array
    {
        $suma = $this->repo->sumPesosPorConcertacion($concertacionId);
        $count = $this->repo->contarPorConcertacion($concertacionId);
        return [
            'concertacion_id' => $concertacionId,
            'suma_pesos' => $suma,
            'cantidad' => $count,
            'maximo_permitido' => 15,
        ];
    }

    public function pendientesAprobacion(array $user, int $pagina = 1, int $porPagina = 20): array
    {
        return $this->repo->pendientesPorEvaluador((int) $user['id'], $pagina, $porPagina);
    }

    public function actualizar(int $id, array $datos): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }

        $permitidos = [
            'descripcion', 'peso',
            'observaciones_evaluador', 'observaciones_evaluado',
            'nivel_comportamental', 'puntaje_comportamental', 'frecuencia',
            'impacto_aporta_compromisos', 'impacto_excede_estipulado',
            'justificacion_excede', 'conductas_json',
        ];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

        if (!empty($datosFiltrados)) {
            $this->repo->actualizar($id, $datosFiltrados);
            AuditoriaService::registrar('actualizar_compromiso_comportamental', 'compromisos', $id);
        }
    }

    public function validarCompromisosAntesDeFirmar(int $concertacionId, int $evaluadoId): array
    {
        $count = $this->repo->contarPorConcertacion($concertacionId);
        $min = (int) Env::get('MIN_COMPROMISOS_COMPORTAMENTALES', 3);
        $max = (int) Env::get('MAX_COMPROMISOS_COMPORTAMENTALES', 5);

        $errores = [];
        if ($count < $min) {
            $errores[] = "Faltan compromisos comportamentales. Minimo requerido: {$min}, actual: {$count}";
        }
        if ($count > $max) {
            $errores[] = "Exceso de compromisos comportamentales. Maximo permitido: {$max}, actual: {$count}";
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
            'comportamentales' => ['cantidad' => $count, 'minimo' => $min, 'maximo' => $max],
        ];
    }

    public function eliminar(int $id, array $user = []): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso comportamental no encontrado');
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar_compromiso_comportamental', 'compromisos', $id);
    }
}