<?php

namespace App;

use App\Config\Env;
use App\Config\Database;
use App\Router\Router;
use App\Middleware\CorsMiddleware;
use App\Middleware\SecurityHeadersMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Helper\ResponseHelper;

define('EDL_ROOT', dirname(__DIR__));

require EDL_ROOT . '/vendor/autoload.php';

/* =========================================================================
 * HANDLERS GLOBALES DE ERROR
 * Garantizan que NINGUN error 500 muestre trazas, SQL o rutas al usuario.
 * En su lugar siempre se devuelve el mensaje institucional y HTTP 500.
 * Solo se registra el detalle en el log del servidor (backend/backend.log).
 * ========================================================================= */
set_exception_handler(function (\Throwable $e): void {
    error_log('[EDL FATAL] ' . get_class($e) . ': ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    error_log('[EDL FATAL TRACE] ' . $e->getTraceAsString());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'code' => '02',
        'message' => ResponseHelper::SERVER_ERROR_MESSAGE,
        'data' => null,
    ], JSON_UNESCAPED_UNICODE);
    exit;
});

set_error_handler(function (int $errno, string $errstr, string $errfile, int $errline): bool {
    // Respetar el operador @ y errores suprimidos.
    if ((error_reporting() & $errno) === 0) {
        return false;
    }
    error_log("[EDL PHP ERROR] nivel={$errno} {$errstr} en {$errfile}:{$errline}");
    // No devolver true: dejar que PHP siga su manejo normal para no enmascarar
    // el flujo, pero el registro queda asegurado.
    return false;
});

register_shutdown_function(function (): void {
    $err = error_get_last();
    if ($err !== null && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        error_log('[EDL SHUTDOWN] ' . $err['message'] . ' en ' . $err['file'] . ':' . $err['line']);
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'code' => '02',
            'message' => ResponseHelper::SERVER_ERROR_MESSAGE,
            'data' => null,
        ], JSON_UNESCAPED_UNICODE);
    }
});

Env::load(EDL_ROOT . '/.env');
date_default_timezone_set(Env::get('APP_TIMEZONE', 'UTC'));
try {
    Database::getInstance();
} catch (\Throwable $e) {
    // Falla de BD durante el bootstrap: log interno + respuesta institucional.
    error_log('[EDL BOOTSTRAP DB] ' . $e->getMessage());
    ResponseHelper::serverError();
}

$dirs = [EDL_ROOT . '/uploads'];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

$router = new Router();

$router->group('/api/v1', function (Router $r) {

 $r->post('/auth/login', [\App\Controller\AuthController::class, 'login']);
 $r->post('/auth/registro', [\App\Controller\AuthController::class, 'registro']);
 $r->post('/auth/recuperar', [\App\Controller\AuthController::class, 'recuperar']);
 $r->post('/auth/recuperar-por-documento', [\App\Controller\AuthController::class, 'recuperarPorDocumento']);
 $r->post('/auth/verificar-codigo', [\App\Controller\AuthController::class, 'verificarCodigo']);
 $r->put('/auth/recuperar/{token}', [\App\Controller\AuthController::class, 'resetPassword']);
 $r->post('/auth/refresh', [\App\Controller\AuthController::class, 'refreshToken']);

 $r->get('/consulta-funcionario/{documento}', [\App\Controller\ConsultaFuncionarioController::class, 'consultar']);

 $r->group('', function (Router $r) {
 $r->post('/auth/logout', [\App\Controller\AuthController::class, 'logout']);
 $r->get('/auth/perfil', [\App\Controller\AuthController::class, 'perfil']);
 $r->put('/auth/perfil', [\App\Controller\AuthController::class, 'actualizarPerfil']);
 $r->put('/auth/password', [\App\Controller\AuthController::class, 'cambiarPassword']);
 $r->put('/auth/forzar-password', [\App\Controller\AuthController::class, 'forzarCambioPassword']);
 $r->put('/auth/rol', [\App\Controller\AuthController::class, 'cambiarRol']);
 $r->get('/auth/csrf', [\App\Controller\AuthController::class, 'csrfToken']);
 $r->get('/menu', [\App\Controller\MenuController::class, 'obtener']);
 $r->get('/notificaciones', [\App\Controller\NotificacionController::class, 'listar']);
 $r->put('/notificaciones/{id}/leer', [\App\Controller\NotificacionController::class, 'marcarLeida']);

 $r->get('/dashboard/resumen', [\App\Controller\DashboardController::class, 'resumen']);
 $r->get('/dashboard/admin-stats', [\App\Controller\DashboardController::class, 'adminStats']);
 $r->get('/dashboard/periodo-activo', [\App\Controller\DashboardController::class, 'periodoActivo']);
 $r->get('/dashboard/actividad', [\App\Controller\DashboardController::class, 'actividad']);
 $r->get('/dashboard/evaluado', [\App\Controller\DashboardController::class, 'evaluado']);

 $r->get('/parametros', [\App\Controller\ParametroController::class, 'listar'], ['permiso:parametros.listar']);
 $r->get('/parametros/{clave}', [\App\Controller\ParametroController::class, 'verPorClave'], ['permiso:parametros.listar']);
 $r->post('/parametros', [\App\Controller\ParametroController::class, 'upsert'], ['permiso:parametros.editar']);
 $r->put('/parametros/masivo', [\App\Controller\ParametroController::class, 'actualizarMasivo'], ['permiso:parametros.editar']);
 $r->put('/parametros/{id}', [\App\Controller\ParametroController::class, 'upsert'], ['permiso:parametros.editar']);
 $r->delete('/parametros/{id}', [\App\Controller\ParametroController::class, 'eliminar'], ['permiso:parametros.editar']);

 $r->get('/usuarios', [\App\Controller\UsuarioController::class, 'listar'], ['permiso:usuarios.listar']);
 $r->post('/usuarios', [\App\Controller\UsuarioController::class, 'crear'], ['permiso:usuarios.crear']);
 $r->get('/usuarios/buscar-global', [\App\Controller\UsuarioController::class, 'buscarGlobal'], ['permiso:usuarios.listar']);
  $r->get('/usuarios/evaluadores-por-dependencia', [\App\Controller\UsuarioController::class, 'evaluadoresPorDependencia'], ['permiso:compromisos.listar']);
  $r->get('/usuarios/evaluadores-buscar', [\App\Controller\UsuarioController::class, 'evaluadoresBuscar'], ['permiso:compromisos.listar']);
  $r->get('/usuarios/jefe-dependencia', [\App\Controller\UsuarioController::class, 'jefeDependencia'], ['permiso:compromisos.listar']);
 $r->get('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'ver'], ['permiso:usuarios.listar']);
 $r->put('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'actualizar'], ['permiso:usuarios.editar']);
 $r->delete('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'eliminar'], ['permiso:usuarios.editar']);
 $r->put('/usuarios/{id}/restablecer-password', [\App\Controller\UsuarioController::class, 'restablecerPassword'], ['permiso:usuarios.restablecer']);
 $r->put('/usuarios/{id}/roles', [\App\Controller\UsuarioController::class, 'asignarRoles'], ['permiso:usuarios.editar']);

 $r->get('/entidades', [\App\Controller\EntidadController::class, 'listar'], ['permiso:entidades.listar']);
 $r->post('/entidades', [\App\Controller\EntidadController::class, 'crear'], ['permiso:entidades.crear']);
 $r->post('/entidades/con-jefe-personal', [\App\Controller\EntidadController::class, 'crearConJefePersonal'], ['permiso:entidades.crear']);
 $r->get('/entidades/{id}', [\App\Controller\EntidadController::class, 'ver'], ['permiso:entidades.listar']);
 $r->put('/entidades/{id}', [\App\Controller\EntidadController::class, 'actualizar'], ['permiso:entidades.editar']);
 $r->delete('/entidades/{id}', [\App\Controller\EntidadController::class, 'eliminar'], ['permiso:entidades.eliminar']);
 $r->get('/entidades/{id}/jefes', [\App\Controller\EntidadController::class, 'jefes'], ['permiso:entidades.listar']);
 $r->get('/entidades/{id}/dependencias', [\App\Controller\EntidadController::class, 'dependencias'], ['permiso:dependencias.listar']);
 $r->put('/entidades/{id}/habilitar', [\App\Controller\EntidadController::class, 'habilitar'], ['permiso:entidades.habilitar']);

 $r->get('/dependencias', [\App\Controller\DependenciaController::class, 'listar'], ['permiso:dependencias.listar']);
 $r->post('/dependencias', [\App\Controller\DependenciaController::class, 'crear'], ['permiso:dependencias.crear']);
 $r->get('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'ver'], ['permiso:dependencias.listar']);
 $r->put('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'actualizar'], ['permiso:dependencias.editar']);
 $r->delete('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'eliminar'], ['permiso:dependencias.editar']);
 $r->put('/dependencias/{id}/estado', [\App\Controller\DependenciaController::class, 'cambiarEstado'], ['permiso:dependencias.editar']);

 $r->get('/periodos', [\App\Controller\PeriodoController::class, 'listar'], ['permiso:periodos.listar']);
 $r->post('/periodos', [\App\Controller\PeriodoController::class, 'crear'], ['permiso:periodos.crear']);
 $r->get('/periodos/{id}', [\App\Controller\PeriodoController::class, 'ver'], ['permiso:periodos.listar']);
 $r->put('/periodos/{id}', [\App\Controller\PeriodoController::class, 'actualizar'], ['permiso:periodos.editar']);
 $r->get('/periodos/{id}/metas', [\App\Controller\PeriodoController::class, 'metas'], ['permiso:metas.listar']);
 $r->get('/periodos/{id}/evaluaciones', [\App\Controller\PeriodoController::class, 'evaluaciones'], ['permiso:evaluaciones.listar']);

 $r->get('/metas', [\App\Controller\MetaController::class, 'listar'], ['permiso:metas.listar']);
 $r->post('/metas', [\App\Controller\MetaController::class, 'crear'], ['permiso:metas.crear']);
 $r->get('/metas/{id}', [\App\Controller\MetaController::class, 'ver'], ['permiso:metas.listar']);
 $r->put('/metas/{id}', [\App\Controller\MetaController::class, 'actualizar'], ['permiso:metas.editar']);
 $r->delete('/metas/{id}', [\App\Controller\MetaController::class, 'eliminar'], ['permiso:metas.editar']);
 $r->get('/metas/{id}/evidencias', [\App\Controller\MetaController::class, 'evidencias'], ['permiso:evidencias.listar']);

 $r->get('/concertaciones', [\App\Controller\ConcertacionController::class, 'listar'], ['permiso:concertaciones.listar']);
 $r->post('/concertaciones', [\App\Controller\ConcertacionController::class, 'crear'], ['permiso:concertaciones.crear']);
 $r->get('/concertaciones/pendientes-aprobacion', [\App\Controller\ConcertacionController::class, 'pendientesAprobacion'], ['permiso:compromisos.aprobar']);
 $r->put('/concertaciones/{id}/aprobar-pendientes', [\App\Controller\ConcertacionController::class, 'aprobarPendientes'], ['permiso:compromisos.aprobar']);
 $r->put('/concertaciones/{id}/rechazar-pendientes', [\App\Controller\ConcertacionController::class, 'rechazarPendientes'], ['permiso:compromisos.aprobar']);
 $r->get('/concertaciones/{id}', [\App\Controller\ConcertacionController::class, 'ver'], ['permiso:concertaciones.listar']);
 $r->put('/concertaciones/{id}', [\App\Controller\ConcertacionController::class, 'actualizar'], ['permiso:concertaciones.crear']);
 $r->put('/concertaciones/{id}/fijar', [\App\Controller\ConcertacionController::class, 'fijarCompromisos'], ['permiso:concertaciones.crear']);
 $r->get('/concertaciones/{id}/compromisos', [\App\Controller\ConcertacionController::class, 'compromisos'], ['permiso:compromisos.listar']);
 $r->get('/concertaciones/{id}/verificar-fijacion', [\App\Controller\ConcertacionController::class, 'verificarFijacionUnilateral'], ['permiso:compromisos.listar']);
 $r->put('/concertaciones/{id}/fijar-unilateral', [\App\Controller\ConcertacionController::class, 'fijarUnilateral'], ['permiso:concertaciones.crear']);
 $r->get('/concertaciones/{id}/validar-compromisos', [\App\Controller\CompromisoController::class, 'validarAntesDeFirmar'], ['permiso:compromisos.listar']);
 $r->post('/concertaciones/{id}/compromisos', [\App\Controller\CompromisoController::class, 'crear'], ['permiso:compromisos.crear']);
 $r->post('/concertaciones/{id}/compromisos-mejoramiento', [\App\Controller\CompromisoMejoramientoController::class, 'crear'], ['permiso:mejoramiento.crear']);
 $r->get('/concertaciones/{id}/compromisos-mejoramiento', [\App\Controller\CompromisoMejoramientoController::class, 'listar'], ['permiso:mejoramiento.listar']);

 $r->get('/evaluaciones', [\App\Controller\EvaluacionController::class, 'listar'], ['permiso:evaluaciones.listar']);
  $r->post('/evaluaciones', [\App\Controller\EvaluacionController::class, 'crear'], ['permiso:evaluaciones.crear']);
  $r->post('/evaluaciones/iniciar', [\App\Controller\EvaluacionController::class, 'iniciarParaEvaluado'], ['permiso:compromisos.enviar']);
 $r->get('/evaluaciones/pendientes-calificar', [\App\Controller\EvaluacionController::class, 'pendientesCalificar'], ['permiso:evaluaciones.evaluar']);
 $r->get('/evaluaciones/buscar-evaluado', [\App\Controller\EvaluacionController::class, 'buscarEvaluado'], ['permiso:evaluaciones.evaluar']);
 $r->get('/evaluaciones/mias', [\App\Controller\EvaluacionController::class, 'misEvaluaciones'], ['permiso:evaluaciones.listar']);
 $r->get('/evaluaciones/mias/historial', [\App\Controller\EvaluacionController::class, 'miHistorial'], ['permiso:evaluaciones.listar']);
 $r->get('/evaluaciones/evaluador/evaluados', [\App\Controller\EvaluacionController::class, 'evaluadosPorDependencia'], ['permiso:evaluaciones.evaluar']);
 $r->get('/evaluaciones/evaluado/{id}/previas', [\App\Controller\EvaluacionController::class, 'verEvaluacionesPorEvaluado'], ['permiso:evaluaciones.listar']);
 $r->get('/evaluaciones/evaluado/{id}/primer-semestre-existe', [\App\Controller\EvaluacionController::class, 'existePrimerSemestre'], ['permiso:evaluaciones.evaluar']);
 $r->get('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'ver'], ['permiso:evaluaciones.listar']);
$r->get('/evaluaciones/{id}/evaluaciones-previas', [\App\Controller\EvaluacionController::class, 'verEvaluacionesPrevias'], ['permiso:evaluaciones.listar']);
  $r->post('/evaluaciones/{id}/parcial', [\App\Controller\EvaluacionController::class, 'crearParcial'], ['permiso:evaluaciones.crear']);
  $r->put('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
 $r->get('/evaluaciones/{id}/compromisos', [\App\Controller\EvaluacionController::class, 'compromisos'], ['permiso:compromisos.listar']);
 $r->put('/evaluaciones/{id}/definitiva', [\App\Controller\EvaluacionController::class, 'calificarDefinitiva'], ['permiso:evaluaciones.evaluar']);
 $r->put('/evaluaciones/{id}/comision', [\App\Controller\EvaluacionController::class, 'aprobarComision'], ['permiso:evaluaciones.comision']);
 $r->put('/evaluaciones/{id}/guardar', [\App\Controller\EvaluacionController::class, 'guardar'], ['permiso:evaluaciones.evaluar']);
 $r->put('/evaluaciones/{id}/solicitar-revision', [\App\Controller\EvaluacionController::class, 'solicitarRevision'], ['permiso:evaluaciones.evaluar']);
 $r->put('/evaluaciones/{id}/finalizar', [\App\Controller\EvaluacionController::class, 'finalizar'], ['permiso:evaluaciones.evaluar']);
 $r->put('/evaluaciones/{id}/anular', [\App\Controller\EvaluacionController::class, 'anular'], ['permiso:evaluaciones.evaluar']);

 $r->get('/compromisos', [\App\Controller\CompromisoController::class, 'listar'], ['permiso:compromisos.listar']);
 $r->get('/compromisos/buscar-evaluado', [\App\Controller\CompromisoController::class, 'buscarEvaluado'], ['permiso:compromisos.listar']);
 $r->get('/compromisos/competencias-comportamentales', [\App\Controller\CompromisoComportamentalController::class, 'competenciasComportamentales'], ['permiso:compromisos.listar']);
 $r->post('/compromisos/enviar', [\App\Controller\CompromisoController::class, 'enviar'], ['permiso:compromisos.enviar']);
 $r->post('/compromisos/funcional', [\App\Controller\CompromisoController::class, 'guardarFuncional'], ['permiso:compromisos.crear']);
 $r->delete('/compromisos/funcional/{id}', [\App\Controller\CompromisoController::class, 'eliminarFuncional'], ['permiso:compromisos.editar']);
 $r->put('/compromisos/{id}/aceptar-evaluado', [\App\Controller\CompromisoController::class, 'aceptarEvaluado'], ['permiso:compromisos.aceptar']);
 $r->put('/compromisos/{id}/rechazar-evaluado', [\App\Controller\CompromisoController::class, 'rechazarEvaluado'], ['permiso:compromisos.aceptar']);
 $r->put('/evaluaciones/{id}/aceptar-concertacion', [\App\Controller\CompromisoController::class, 'aceptarConcertacionEvaluado'], ['permiso:compromisos.enviar']);
 $r->put('/evaluaciones/{id}/rechazar-concertacion', [\App\Controller\CompromisoController::class, 'rechazarConcertacionEvaluado'], ['permiso:compromisos.enviar']);
 $r->get('/compromisos/evaluacion/{id}', [\App\Controller\CompromisoController::class, 'listarPorEvaluacion'], ['permiso:compromisos.listar']);
 $r->put('/compromisos/confirmar-concertacion/{id}', [\App\Controller\CompromisoController::class, 'confirmarConcertacion'], ['permiso:compromisos.crear']);
 $r->get('/compromisos/pendientes', [\App\Controller\CompromisoController::class, 'pendientesAprobacion'], ['permiso:compromisos.aprobar']);
 $r->get('/compromisos/propuestos-evaluado', [\App\Controller\CompromisoController::class, 'propuestosPorEvaluado'], ['permiso:compromisos.listar']);
 $r->put('/compromisos/{id}/aprobar', [\App\Controller\CompromisoController::class, 'aprobar'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos/{id}/rechazar', [\App\Controller\CompromisoController::class, 'rechazar'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos/{id}/devolver', [\App\Controller\CompromisoController::class, 'devolver'], ['permiso:compromisos.devolver']);
 $r->put('/compromisos/{id}/calificar', [\App\Controller\CompromisoController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
 $r->get('/compromisos/{id}/pesos', [\App\Controller\CompromisoController::class, 'resumenPesos'], ['permiso:compromisos.listar']);
 $r->put('/compromisos/{id}', [\App\Controller\CompromisoController::class, 'actualizar'], ['permiso:compromisos.editar']);

 $r->get('/compromisos-mejoramiento', [\App\Controller\CompromisoMejoramientoController::class, 'listarGlobal'], ['permiso:mejoramiento.listar']);
 $r->get('/compromisos-mejoramiento/{id}', [\App\Controller\CompromisoMejoramientoController::class, 'ver'], ['permiso:mejoramiento.listar']);
 $r->put('/compromisos-mejoramiento/{id}', [\App\Controller\CompromisoMejoramientoController::class, 'actualizar'], ['permiso:mejoramiento.editar']);
 $r->post('/compromisos-mejoramiento/{id}/seguimiento', [\App\Controller\CompromisoMejoramientoController::class, 'seguimiento'], ['permiso:mejoramiento.editar']);
 $r->put('/compromisos-mejoramiento/{id}/completar', [\App\Controller\CompromisoMejoramientoController::class, 'completar'], ['permiso:mejoramiento.editar']);

 // Paquete 2: Compromisos Comportamentales (independiente del Paquete 1).
 // Las rutas fijas se registran ANTES de las paramétricas para evitar
 // que el router las capture por error (regla del AGENTS.md).
 $r->get('/compromisos-comportamentales', [\App\Controller\CompromisoComportamentalController::class, 'listar'], ['permiso:compromisos.listar']);
 $r->post('/compromisos-comportamentales', [\App\Controller\CompromisoComportamentalController::class, 'crear'], ['permiso:compromisos.crear']);
 $r->post('/compromisos-comportamentales/enviar', [\App\Controller\CompromisoComportamentalController::class, 'enviar'], ['permiso:compromisos.enviar']);
 $r->get('/compromisos-comportamentales/competencias', [\App\Controller\CompromisoComportamentalController::class, 'competenciasComportamentales'], ['permiso:compromisos.listar']);
 $r->get('/compromisos-comportamentales/pendientes', [\App\Controller\CompromisoComportamentalController::class, 'pendientesAprobacion'], ['permiso:compromisos.aprobar']);
 $r->post('/compromisos-comportamentales/guardar', [\App\Controller\CompromisoComportamentalController::class, 'guardar'], ['permiso:compromisos.crear']);
 $r->get('/compromisos-comportamentales/evaluacion/{id}', [\App\Controller\CompromisoComportamentalController::class, 'listarPorEvaluacion'], ['permiso:compromisos.listar']);
 $r->get('/compromisos-comportamentales/{id}', [\App\Controller\CompromisoComportamentalController::class, 'ver'], ['permiso:compromisos.listar']);
 $r->put('/compromisos-comportamentales/{id}', [\App\Controller\CompromisoComportamentalController::class, 'actualizar'], ['permiso:compromisos.editar']);
 $r->delete('/compromisos-comportamentales/{id}', [\App\Controller\CompromisoComportamentalController::class, 'eliminar'], ['permiso:compromisos.editar']);
 $r->put('/compromisos-comportamentales/{id}/aprobar', [\App\Controller\CompromisoComportamentalController::class, 'aprobar'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos-comportamentales/{id}/rechazar', [\App\Controller\CompromisoComportamentalController::class, 'rechazar'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos-comportamentales/{id}/devolver', [\App\Controller\CompromisoComportamentalController::class, 'devolver'], ['permiso:compromisos.devolver']);
 $r->put('/compromisos-comportamentales/{id}/calificar', [\App\Controller\CompromisoComportamentalController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
 $r->get('/compromisos-comportamentales/{id}/pesos', [\App\Controller\CompromisoComportamentalController::class, 'resumenPesos'], ['permiso:compromisos.listar']);
 $r->post('/concertaciones/{id}/compromisos-comportamentales/validar', [\App\Controller\CompromisoComportamentalController::class, 'validarAntesDeFirmar'], ['permiso:compromisos.listar']);
 $r->post('/compromisos-mejoramiento/{id}/seguimiento', [\App\Controller\CompromisoMejoramientoController::class, 'seguimiento'], ['permiso:mejoramiento.editar']);
 $r->put('/compromisos-mejoramiento/{id}/completar', [\App\Controller\CompromisoMejoramientoController::class, 'completar'], ['permiso:mejoramiento.editar']);

 $r->get('/evidencias', [\App\Controller\EvidenciaController::class, 'listar'], ['permiso:evidencias.listar']);
 $r->post('/evidencias', [\App\Controller\EvidenciaController::class, 'registrar'], ['permiso:evidencias.crear']);
 $r->get('/evidencias/plantilla-carga', [\App\Controller\EvidenciaController::class, 'plantillaCarga'], ['permiso:evidencias.crear']);
 $r->post('/evidencias/carga-masiva', [\App\Controller\EvidenciaController::class, 'cargaMasiva'], ['permiso:evidencias.crear']);
 $r->get('/evidencias/{id}/download-url', [\App\Controller\EvidenciaController::class, 'generarDownloadUrl'], ['permiso:evidencias.listar']);
 $r->get('/evidencias/archivo/{id}', [\App\Controller\EvidenciaController::class, 'descargarArchivo']);
 $r->get('/evidencias/compromisos-evaluado', [\App\Controller\EvidenciaController::class, 'compromisosEvaluado'], ['permiso:evidencias.listar']);
 $r->get('/evaluadores/mis-evaluados', [\App\Controller\EvidenciaController::class, 'evaluadosAsignados'], ['permiso:evidencias.listar']);
 $r->get('/evidencias/{id}', [\App\Controller\EvidenciaController::class, 'ver'], ['permiso:evidencias.listar']);
 $r->put('/evidencias/{id}', [\App\Controller\EvidenciaController::class, 'actualizar'], ['permiso:evidencias.editar']);
 $r->delete('/evidencias/{id}', [\App\Controller\EvidenciaController::class, 'eliminar'], ['permiso:evidencias.editar']);

 $r->get('/ausentismos', [\App\Controller\AusentismoController::class, 'listar'], ['permiso:ausentismos.listar']);
 $r->post('/ausentismos', [\App\Controller\AusentismoController::class, 'crear'], ['permiso:ausentismos.crear']);
 $r->get('/ausentismos/{id}', [\App\Controller\AusentismoController::class, 'ver'], ['permiso:ausentismos.listar']);
 $r->put('/ausentismos/{id}', [\App\Controller\AusentismoController::class, 'actualizar'], ['permiso:ausentismos.editar']);
 $r->delete('/ausentismos/{id}', [\App\Controller\AusentismoController::class, 'eliminar'], ['permiso:ausentismos.editar']);

 $r->get('/movilidades', [\App\Controller\MovilidadController::class, 'listar'], ['permiso:movilidades.listar']);
 $r->post('/movilidades', [\App\Controller\MovilidadController::class, 'crear'], ['permiso:movilidades.crear']);
 $r->get('/movilidades/{id}', [\App\Controller\MovilidadController::class, 'ver'], ['permiso:movilidades.listar']);
 $r->put('/movilidades/{id}', [\App\Controller\MovilidadController::class, 'actualizar'], ['permiso:movilidades.editar']);
 $r->delete('/movilidades/{id}', [\App\Controller\MovilidadController::class, 'eliminar'], ['permiso:movilidades.editar']);
 $r->put('/movilidades/{id}/ejecutar', [\App\Controller\MovilidadController::class, 'ejecutar'], ['permiso:movilidades.ejecutar']);

 $r->post('/solicitudes-cambio', [\App\Controller\SolicitudCambioController::class, 'crear'], ['permiso:compromisos.enviar']);
 $r->get('/solicitudes-cambio/mis-solicitudes', [\App\Controller\SolicitudCambioController::class, 'misSolicitudes'], ['permiso:compromisos.listar']);
 $r->get('/solicitudes-cambio/pendientes-jefe', [\App\Controller\SolicitudCambioController::class, 'pendientesJefe'], ['permiso:jefe_personal.solicitudes']);
 $r->put('/solicitudes-cambio/{id}/decidir', [\App\Controller\SolicitudCambioController::class, 'decidir'], ['permiso:jefe_personal.solicitudes']);

 $r->get('/reportes/concertacion', [\App\Controller\ReporteController::class, 'concertacion'], ['permiso:reportes.generar']);
 $r->get('/reportes/evaluaciones', [\App\Controller\ReporteController::class, 'evaluaciones'], ['permiso:reportes.generar']);
 $r->get('/reportes/funcionario/{id}', [\App\Controller\ReporteController::class, 'funcionario'], ['permiso:reportes.generar']);
 $r->get('/reportes/resumen', [\App\Controller\ReporteController::class, 'resumen'], ['permiso:reportes.generar']);
 $r->get('/reportes/entidad/{id}', [\App\Controller\ReporteController::class, 'porEntidad'], ['permiso:reportes.generar']);
 $r->get('/reportes/dependencia/{id}', [\App\Controller\ReporteController::class, 'porDependencia'], ['permiso:reportes.generar']);
 $r->get('/reportes/compromisos', [\App\Controller\ReporteController::class, 'compromisos'], ['permiso:reportes.generar']);
 $r->get('/reportes/concertaciones-aprobadas', [\App\Controller\ReporteController::class, 'concertacionesAprobadas'], ['permiso:reportes.generar']);
 $r->get('/reportes/tipo/{tipo}', [\App\Controller\ReporteController::class, 'concertacionesPorTipo'], ['permiso:reportes.generar']);
 $r->get('/reportes/excel/concertaciones-aprobadas', [\App\Controller\ReporteController::class, 'descargarExcelConcertaciones'], ['permiso:reportes.generar']);
 $r->get('/reportes/excel/{tipo}', [\App\Controller\ReporteController::class, 'descargarExcel'], ['permiso:reportes.generar']);
 $r->get('/reportes/concertacion-pdf/{id}', [\App\Controller\ReporteController::class, 'pdfConcertacion'], ['permiso:evaluaciones.listar']);
 $r->get('/reportes/evaluacion-pdf/{id}', [\App\Controller\ReporteController::class, 'pdfEvaluacion'], ['permiso:evaluaciones.listar']);


 $r->get('/competencias', [\App\Controller\CompetenciaController::class, 'listar'], ['permiso:compromisos.listar']);
 $r->get('/competencias/decretos', [\App\Controller\CompetenciaController::class, 'decretos'], ['permiso:compromisos.listar']);

 }, [AuthMiddleware::class, CsrfMiddleware::class]);
}, [CorsMiddleware::class, SecurityHeadersMiddleware::class, RateLimitMiddleware::class]);

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

CorsMiddleware::handle();

if ($method !== 'OPTIONS') {
 $router->dispatch($method, $uri);
}