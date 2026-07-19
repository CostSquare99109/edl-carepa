<?php
declare(strict_types=1);

namespace App\Service;

use App\Repository\CompromisoRepository;
use App\Repository\ConcertacionRepository;
use App\Helper\ResponseHelper;
use App\Config\Database;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

/**
 * Service para Paquete 1: Compromisos Funcionales.
 *
 * A partir de la separación de paquetes (julio 2026), este service
 * SOLO maneja compromisos funcionales. Los compromisos comportamentales
 * se gestionan a través de CompromisoComportamentalService (Paquete 2).
 *
 * Esta clase NO contiene lógica, validaciones ni registros para
 * comportamientos. La columna `tipo` de la tabla `compromisos` ahora
 * es ENUM('funcional') por restricción de esquema.
 */
class CompromisoService
{
    private CompromisoRepository $repo;
    private ConcertacionRepository $concertacionRepo;

    public function __construct()
    {
        $pdo = Database::getInstance();
        $this->repo = new CompromisoRepository($pdo);
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

        $filtros['tipo'] = 'funcional';
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

        self::validarEstructuraVerboObjetoCondicion($datos['descripcion'] ?? '');

        $concertacionId = $this->repo->resolverConcertacionId((int) $evaluacionId);
        if (!$concertacionId) {
            ResponseHelper::error('La evaluacion no tiene concertacion asociada', 422);
        }

        $this->validarLimites($concertacionId);

        $crearDatos = [
            'concertacion_id' => $concertacionId,
            'tipo' => 'funcional',
            'meta_id' => $datos['meta_id'] ?? null,
            'descripcion' => $datos['descripcion'],
            'peso' => $datos['peso'] ?? 0,
            'propuesto_por_jefe_entidad' => $rolActivo === 'evaluador' ? 1 : 0,
            'estado' => 'propuesto',
        ];

        $id = $this->repo->crear($crearDatos);
        AuditoriaService::registrar('crear_compromiso_funcional', 'compromisos', $id);

        return $id;
    }

    public function enviar(array $datos, array $user): int
    {
        $evaluacionId = $datos['evaluacion_id'] ?? null;
        $concertacionIdDirecto = $datos['concertacion_id'] ?? null;

        if (!$evaluacionId && !$concertacionIdDirecto) {
            ResponseHelper::error('evaluacion_id o concertacion_id es requerido', 422);
        }

        self::validarEstructuraVerboObjetoCondicion($datos['descripcion'] ?? '');

        if ($concertacionIdDirecto) {
            $concertacionId = (int) $concertacionIdDirecto;
        } else {
            $concertacionId = $this->repo->resolverConcertacionId((int) $evaluacionId);
            if (!$concertacionId) {
                ResponseHelper::error('La evaluacion no tiene concertacion asociada', 422);
            }
        }

        $this->validarLimites($concertacionId);

        $crearDatos = [
            'concertacion_id' => $concertacionId,
            'tipo' => 'funcional',
            'descripcion' => $datos['descripcion'],
            'peso' => $datos['peso'] ?? 0,
            'propuesto_por_jefe_entidad' => 0,
            'es_propuesto_evaluado' => 1,
            'estado' => 'propuesto',
            'observaciones_evaluado' => $datos['observaciones_evaluado'] ?? null,
        ];

        $id = $this->repo->crear($crearDatos);
        AuditoriaService::registrar('enviar_compromiso_funcional', 'compromisos', $id);

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

    /**
     * Valida la estructura recomendada por la CNSC para redactar un compromiso funcional:
     * verbo en infinitivo + objeto + condicion de resultado.
     * Referencia: Tutorial_EDL_APP_Concertacion_de_Compromisos.md lineas 65-69.
     */
    public static function validarEstructuraVerboObjetoCondicion(string $descripcion): void
    {
        $descripcion = trim($descripcion);
        if ($descripcion === '') {
            ResponseHelper::error('La descripcion del compromiso es obligatoria', 422);
        }

        static $verbos = [
            'elaborar', 'redactar', 'realizar', 'ejecutar', 'implementar', 'gestionar',
            'administrar', 'coordinar', 'supervisar', 'monitorear', 'analizar',
            'evaluar', 'diseñar', 'planificar', 'planear', 'organizar', 'dirigir',
            'producir', 'generar', 'desarrollar', 'construir', 'formular', 'proponer',
            'presentar', 'entregar', 'tramitar', 'revisar', 'verificar', 'controlar',
            'resolver', 'atender', 'brindar', 'prestar', 'mantener', 'actualizar',
            'capacitar', 'formar', 'asesorar', 'apoyar', 'informar', 'reportar',
            'consolidar', 'archivar', 'registrar', 'documentar', 'medir', 'calcular',
            'levantar', 'inspeccionar', 'auditar', 'promover', 'difundir', 'socializar',
            'articular', 'liderar', 'representar', 'convocar', 'participar',
        ];

        $palabrasCondicion = [
            'con', 'segun', 'cumpliendo', 'cumple', 'para', 'que', 'indicadores',
            'semestral', 'mensual', 'anual', 'trimestral', 'plazo', 'meta',
            'resultado', 'evidencia', 'cronograma', 'indicador', 'estandar',
            'norma', 'procedimiento', 'protocolo', 'formato', 'reporte',
        ];

        $descLower = mb_strtolower($descripcion, 'UTF-8');
        $primeraPalabra = explode(' ', $descLower)[0] ?? '';
        $primeraLimpia = preg_replace('/[^a-záéíóúñü]/u', '', $primeraPalabra) ?? '';

        $iniciaConVerbo = in_array($primeraLimpia, $verbos, true);
        $longitudOk = mb_strlen($descripcion) >= 20;
        $contieneCondicion = false;
        foreach ($palabrasCondicion as $palabra) {
            if (mb_strpos($descLower, $palabra, 0, 'UTF-8') !== false) {
                $contieneCondicion = true;
                break;
            }
        }

        if (!$longitudOk || (!$iniciaConVerbo && !$contieneCondicion)) {
            $inicioVerbo = $iniciaConVerbo ? 'OK' : 'falta verbo';
            $cond = $contieneCondicion ? 'OK' : 'falta condicion de resultado';
            ResponseHelper::error(
                'La descripcion del compromiso no cumple la estructura CNSC: verbo + objeto + condicion de resultado. Sugerencia: redactar iniciando con un verbo en infinitivo (Elaborar, Redactar, Gestionar, ...) y agregando la condicion de resultado esperada. Estado actual -> ' . $inicioVerbo . ' | ' . $cond,
                422
            );
        }
    }

    public function aprobar(int $id, float $peso, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden aprobar compromisos en estado propuesto', 400);
        }

        $concertacionId = (int) $compromiso['concertacion_id'];

        $sumaActual = $this->repo->sumPesosPorConcertacion($concertacionId);
        $pesoActual = (float) $compromiso['peso'];
        $nuevaSuma = $sumaActual - $pesoActual + $peso;

        if ($peso <= 0 || $peso > 100) {
            ResponseHelper::error(
                "El peso del compromiso funcional debe estar entre 0 y 100. Indicado: {$peso}",
                422
            );
        }

        if (abs($nuevaSuma - 100) > 0.01) {
            ResponseHelper::error(
                "La suma de pesos funcionales debe ser exactamente 100. Actual: " . round($sumaActual, 2) . "%, nuevo: " . round($nuevaSuma, 2) . "%",
                422
            );
        }

        $this->repo->actualizar($id, [
            'peso' => $peso,
            'estado' => 'aprobado',
            'observaciones_evaluador' => $observaciones ?: null,
        ]);

        AuditoriaService::registrar('aprobar_compromiso_funcional', 'compromisos', $id);
    }

    public function rechazar(int $id, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden rechazar compromisos en estado propuesto', 400);
        }

        $this->repo->actualizar($id, [
            'estado' => 'rechazado',
            'observaciones_evaluador' => $observaciones ?: null,
        ]);

        AuditoriaService::registrar('rechazar_compromiso_funcional', 'compromisos', $id);
    }

    public function devolver(int $id, string $observaciones, array $user): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }

        if ($compromiso['estado'] !== 'propuesto') {
            ResponseHelper::error('Solo se pueden devolver compromisos en estado propuesto', 400);
        }

        $this->repo->actualizar($id, [
            'estado' => 'devuelto',
            'observaciones_evaluador' => $observaciones,
        ]);

        AuditoriaService::registrar('devolver_compromiso_funcional', 'compromisos', $id);
    }

    public function calificar(int $id, float $puntaje, string $observaciones, array $user = []): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }

        if (!in_array($compromiso['estado'], ['propuesto', 'pendiente_aprobacion', 'aprobado', 'en_progreso', 'cumplido', 'incumplido'], true)) {
            ResponseHelper::error('Solo se pueden calificar compromisos en estados habilitados', 400);
        }

        if ($puntaje < 0 || $puntaje > 100) {
            ResponseHelper::error(
                "La calificacion del compromiso funcional debe estar entre 0 y 100. Recibido: {$puntaje}",
                422
            );
        }

        $estadoCalif = $puntaje >= 65 ? 'cumplido' : 'incumplido';
        $this->repo->actualizar($id, [
            'calificacion' => $puntaje,
            'estado' => $estadoCalif,
            'observaciones_evaluador' => $observaciones ?: null,
        ]);

        AuditoriaService::registrar('calificar_compromiso_funcional', 'compromisos', $id);
    }

    private function validarLimites(int $concertacionId): void
    {
        $count = $this->repo->contarPorConcertacion($concertacionId);

        $esPrueba = false;
        $stmtEval = $this->repo->getPdo()->prepare(
            "SELECT u.en_periodo_prueba
             FROM concertaciones con
             INNER JOIN usuarios u ON u.id = con.evaluado_id
             WHERE con.id = :cid AND con.eliminado_en IS NULL"
        );
        $stmtEval->execute(['cid' => $concertacionId]);
        $pruebaVal = $stmtEval->fetchColumn();
        $esPrueba = !empty($pruebaVal) && (bool) $pruebaVal;

        $max = $esPrueba
            ? (int) Env::get('MAX_COMPROMISOS_FUNCIONALES_PRUEBA', 3)
            : (int) Env::get('MAX_COMPROMISOS_FUNCIONALES', 5);

        if ($count >= $max) {
            $periodoLabel = $esPrueba ? 'periodo de prueba' : 'evaluacion anual';
            ResponseHelper::error(
                "No se pueden agregar mas compromisos funcionales. Maximo permitido para {$periodoLabel}: {$max}",
                422
            );
        }
    }

    public function resumenPesos(int $concertacionId): array
    {
        $suma = $this->repo->sumPesosPorConcertacion($concertacionId);
        $count = $this->repo->contarPorConcertacion($concertacionId);
        return [
            'concertacion_id' => $concertacionId,
            'suma_pesos' => $suma,
            'cantidad' => $count,
            'maximo_permitido' => 85,
        ];
    }

    public function pendientesAprobacion(array $user, int $pagina = 1, int $porPagina = 20, ?string $estado = 'propuesto'): array
    {
        return $this->repo->pendientesPorEvaluador((int) $user['id'], $pagina, $porPagina, $estado);
    }

    public function actualizar(int $id, array $datos): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }

        $permitidos = [
            'descripcion', 'peso', 'meta_id', 'resultado_esperado',
            'medio_verificacion', 'plazo', 'observaciones_evaluador',
            'observaciones_evaluado',
            'motivo_ajuste', 'fecha_ajuste',
        ];
        $datosFiltrados = array_intersect_key($datos, array_flip($permitidos));

        if (isset($datosFiltrados['motivo_ajuste'])) {
            $motivosValidos = [
                'cambios_planes_metas',
                'separacion_temporal_30_dias',
                'asignacion_funciones',
                'cambio_empleo_traslado_reubicacion',
                'decision_comision_personal',
            ];
            if (!in_array($datosFiltrados['motivo_ajuste'], $motivosValidos, true)) {
                ResponseHelper::error(
                    'Motivo de ajuste invalido. Valores permitidos: ' . implode(', ', $motivosValidos),
                    422
                );
            }
            $datosFiltrados['fecha_ajuste'] = $datosFiltrados['fecha_ajuste'] ?? date('Y-m-d H:i:s');
        }

        if (!empty($datosFiltrados)) {
            $this->repo->actualizar($id, $datosFiltrados);
            AuditoriaService::registrar('actualizar_compromiso_funcional', 'compromisos', $id);
        }
    }

    public function validarCompromisosAntesDeFirmar(int $concertacionId, int $evaluadoId): array
    {
        $usuario = (new \App\Repository\UsuarioRepository(Database::getInstance()))->buscarPorId($evaluadoId);
        $esPrueba = !empty($usuario['en_periodo_prueba']) && (bool) $usuario['en_periodo_prueba'];

        $count = $this->repo->contarPorConcertacion($concertacionId);

        $min = $esPrueba
            ? (int) Env::get('MIN_COMPROMISOS_FUNCIONALES_PRUEBA', 1)
            : (int) Env::get('MIN_COMPROMISOS_FUNCIONALES', 1);
        $max = $esPrueba
            ? (int) Env::get('MAX_COMPROMISOS_FUNCIONALES_PRUEBA', 3)
            : (int) Env::get('MAX_COMPROMISOS_FUNCIONALES', 5);

        $errores = [];
        if ($count < $min) {
            $errores[] = "Faltan compromisos funcionales. Minimo requerido: {$min}, actual: {$count}";
        }
        if ($count > $max) {
            $errores[] = "Exceso de compromisos funcionales. Maximo permitido: {$max}, actual: {$count}";
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
            'funcionales' => ['cantidad' => $count, 'minimo' => $min, 'maximo' => $max],
            'periodo_prueba' => $esPrueba,
        ];
    }

    public static function validarEstructuraVerboObjetoCondicionStatic(string $descripcion): void
    {
        self::validarEstructuraVerboObjetoCondicion($descripcion);
    }

    public function eliminar(int $id, array $user = []): void
    {
        $compromiso = $this->repo->buscarPorId($id);
        if (!$compromiso) {
            ResponseHelper::notFound('Compromiso funcional no encontrado');
        }
        $this->repo->eliminar($id);
        AuditoriaService::registrar('eliminar_compromiso_funcional', 'compromisos', $id);
    }
}