<?php

namespace App;

use App\Config\Env;
use App\Config\Database;
use App\Router\Router;
use App\Middleware\CorsMiddleware;
use App\Middleware\SecurityHeadersMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Helper\ResponseHelper;

define('EDL_ROOT', dirname(__DIR__));

require EDL_ROOT . '/vendor/autoload.php';

Env::load(EDL_ROOT . '/.env');
Database::getInstance();

$router = new Router();

$router->group('/api/v1', function (Router $r) {

 // Rutas públicas
 $r->post('/auth/login', [\App\Controller\AuthController::class, 'login']);
 $r->post('/auth/registro', [\App\Controller\AuthController::class, 'registro']);
 $r->post('/auth/recuperar', [\App\Controller\AuthController::class, 'recuperar']);
 $r->put('/auth/recuperar/{token}', [\App\Controller\AuthController::class, 'resetPassword']);

    // Rutas protegidas
    $r->group('', function (Router $r) {
        $r->post('/auth/logout', [\App\Controller\AuthController::class, 'logout']);
        $r->get('/auth/perfil', [\App\Controller\AuthController::class, 'perfil']);
        $r->put('/auth/perfil', [\App\Controller\AuthController::class, 'actualizarPerfil']);
        $r->put('/auth/password', [\App\Controller\AuthController::class, 'cambiarPassword']);
        $r->put('/auth/rol', [\App\Controller\AuthController::class, 'cambiarRol']);
        $r->get('/menu', [\App\Controller\MenuController::class, 'obtener']);
        $r->get('/notificaciones', [\App\Controller\NotificacionController::class, 'listar']);
        $r->put('/notificaciones/{id}/leer', [\App\Controller\NotificacionController::class, 'marcarLeida']);

 // Dashboard
 $r->get('/dashboard/resumen', [\App\Controller\DashboardController::class, 'resumen']);
 $r->get('/dashboard/admin-stats', [\App\Controller\DashboardController::class, 'adminStats']);
 $r->get('/dashboard/actividad', [\App\Controller\DashboardController::class, 'actividad']);

 // Parámetros / Configuración
 $r->get('/parametros', [\App\Controller\ParametroController::class, 'listar']);
 $r->get('/parametros/{clave}', [\App\Controller\ParametroController::class, 'verPorClave']);
 $r->post('/parametros', [\App\Controller\ParametroController::class, 'upsert']);
 $r->put('/parametros/masivo', [\App\Controller\ParametroController::class, 'actualizarMasivo']);
 $r->put('/parametros/{id}', [\App\Controller\ParametroController::class, 'upsert']);
 $r->delete('/parametros/{id}', [\App\Controller\ParametroController::class, 'eliminar']);

        // Usuarios
        $r->get('/usuarios', [\App\Controller\UsuarioController::class, 'listar'], ['permiso:usuarios.listar']);
        $r->post('/usuarios', [\App\Controller\UsuarioController::class, 'crear'], ['permiso:usuarios.crear']);
        $r->get('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'ver'], ['permiso:usuarios.listar']);
        $r->put('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'actualizar'], ['permiso:usuarios.editar']);
        $r->delete('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'eliminar'], ['permiso:usuarios.editar']);

        // Entidades
        $r->get('/entidades', [\App\Controller\EntidadController::class, 'listar'], ['permiso:entidades.listar']);
        $r->post('/entidades', [\App\Controller\EntidadController::class, 'crear'], ['permiso:entidades.crear']);
        $r->get('/entidades/{id}', [\App\Controller\EntidadController::class, 'ver'], ['permiso:entidades.listar']);
        $r->put('/entidades/{id}', [\App\Controller\EntidadController::class, 'actualizar'], ['permiso:entidades.editar']);
        $r->delete('/entidades/{id}', [\App\Controller\EntidadController::class, 'eliminar'], ['permiso:entidades.eliminar']);
        $r->get('/entidades/{id}/jefes', [\App\Controller\EntidadController::class, 'jefes'], ['permiso:entidades.listar']);
        $r->get('/entidades/{id}/dependencias', [\App\Controller\EntidadController::class, 'dependencias'], ['permiso:dependencias.listar']);

        // Dependencias
        $r->get('/dependencias', [\App\Controller\DependenciaController::class, 'listar'], ['permiso:dependencias.listar']);
        $r->post('/dependencias', [\App\Controller\DependenciaController::class, 'crear'], ['permiso:dependencias.crear']);
        $r->get('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'ver'], ['permiso:dependencias.listar']);
        $r->put('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'actualizar'], ['permiso:dependencias.editar']);
        $r->delete('/dependencias/{id}', [\App\Controller\DependenciaController::class, 'eliminar'], ['permiso:dependencias.editar']);

        // Periodos
        $r->get('/periodos', [\App\Controller\PeriodoController::class, 'listar'], ['permiso:periodos.listar']);
        $r->post('/periodos', [\App\Controller\PeriodoController::class, 'crear'], ['permiso:periodos.crear']);
        $r->get('/periodos/{id}', [\App\Controller\PeriodoController::class, 'ver'], ['permiso:periodos.listar']);
        $r->put('/periodos/{id}', [\App\Controller\PeriodoController::class, 'actualizar'], ['permiso:periodos.editar']);
        $r->get('/periodos/{id}/metas', [\App\Controller\PeriodoController::class, 'metas'], ['permiso:metas.listar']);
        $r->get('/periodos/{id}/evaluaciones', [\App\Controller\PeriodoController::class, 'evaluaciones'], ['permiso:evaluaciones.listar']);

        // Metas
        $r->get('/metas', [\App\Controller\MetaController::class, 'listar'], ['permiso:metas.listar']);
        $r->post('/metas', [\App\Controller\MetaController::class, 'crear'], ['permiso:metas.crear']);
        $r->get('/metas/{id}', [\App\Controller\MetaController::class, 'ver'], ['permiso:metas.listar']);
        $r->put('/metas/{id}', [\App\Controller\MetaController::class, 'actualizar'], ['permiso:metas.editar']);
        $r->get('/metas/{id}/evidencias', [\App\Controller\MetaController::class, 'evidencias'], ['permiso:evidencias.listar']);
        $r->post('/metas/{id}/concertacion', [\App\Controller\MetaController::class, 'crearConcertacion'], ['permiso:concertaciones.crear']);

        // Concertaciones
        $r->get('/concertaciones', [\App\Controller\ConcertacionController::class, 'listar'], ['permiso:concertaciones.listar']);
        $r->put('/concertaciones/{id}', [\App\Controller\ConcertacionController::class, 'actualizar'], ['permiso:concertaciones.crear']);

        // Evaluaciones (EDL-CNSC Acuerdo 6176)
        $r->get('/evaluaciones', [\App\Controller\EvaluacionController::class, 'listar'], ['permiso:evaluaciones.listar']);
        $r->post('/evaluaciones', [\App\Controller\EvaluacionController::class, 'crear'], ['permiso:evaluaciones.crear']);
        $r->get('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'ver'], ['permiso:evaluaciones.listar']);
        $r->put('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
        $r->get('/evaluaciones/{id}/compromisos', [\App\Controller\EvaluacionController::class, 'compromisos'], ['permiso:compromisos.listar']);
        $r->post('/evaluaciones/{id}/compromisos', [\App\Controller\EvaluacionController::class, 'crearCompromiso'], ['permiso:compromisos.crear']);
        $r->post('/evaluaciones/{id}/parcial', [\App\Controller\EvaluacionController::class, 'crearParcial'], ['permiso:evaluaciones.crear']);
        $r->put('/evaluaciones/{id}/definitiva', [\App\Controller\EvaluacionController::class, 'calificarDefinitiva'], ['permiso:evaluaciones.evaluar']);
        $r->put('/evaluaciones/{id}/comision', [\App\Controller\EvaluacionController::class, 'aprobarComision'], ['permiso:evaluaciones.comision']);
        $r->get('/evaluaciones/pendientes-calificar', [\App\Controller\EvaluacionController::class, 'pendientesCalificar'], ['permiso:evaluaciones.evaluar']);

        // Compromisos (EDL-CNSC: concertación compromisos funcionales + comportamentales)
        $r->get('/compromisos', [\App\Controller\CompromisoController::class, 'listar'], ['permiso:compromisos.listar']);
        $r->post('/compromisos/enviar', [\App\Controller\CompromisoController::class, 'enviar'], ['permiso:compromisos.enviar']);
        $r->get('/compromisos/pendientes', [\App\Controller\CompromisoController::class, 'pendientesAprobacion'], ['permiso:compromisos.aprobar']);
        $r->put('/compromisos/{id}/aprobar', [\App\Controller\CompromisoController::class, 'aprobar'], ['permiso:compromisos.aprobar']);
        $r->put('/compromisos/{id}/rechazar', [\App\Controller\CompromisoController::class, 'rechazar'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos/{id}/devolver', [\App\Controller\CompromisoController::class, 'devolver'], ['permiso:compromisos.aprobar']);
 $r->put('/compromisos/{id}/calificar', [\App\Controller\CompromisoController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
 $r->get('/compromisos/{id}/pesos', [\App\Controller\CompromisoController::class, 'resumenPesos'], ['permiso:compromisos.listar']);
 $r->put('/compromisos/{id}', [\App\Controller\CompromisoController::class, 'actualizar'], ['permiso:compromisos.editar']);

        // Evidencias
        $r->get('/evidencias', [\App\Controller\EvidenciaController::class, 'listar'], ['permiso:evidencias.listar']);
        $r->post('/evidencias', [\App\Controller\EvidenciaController::class, 'subir'], ['permiso:evidencias.subir']);
        $r->put('/evidencias/{id}/verificar', [\App\Controller\EvidenciaController::class, 'verificar'], ['permiso:evidencias.verificar']);

        // Ausentismos
        $r->get('/ausentismos', [\App\Controller\AusentismoController::class, 'listar'], ['permiso:ausentismos.listar']);
        $r->post('/ausentismos', [\App\Controller\AusentismoController::class, 'crear'], ['permiso:ausentismos.crear']);
        $r->put('/ausentismos/{id}', [\App\Controller\AusentismoController::class, 'actualizar'], ['permiso:ausentismos.editar']);

        // Movilidades
        $r->get('/movilidades', [\App\Controller\MovilidadController::class, 'listar'], ['permiso:movilidades.listar']);
        $r->post('/movilidades', [\App\Controller\MovilidadController::class, 'crear'], ['permiso:movilidades.crear']);
        $r->put('/movilidades/{id}', [\App\Controller\MovilidadController::class, 'actualizar'], ['permiso:movilidades.editar']);

        // Reportes
        $r->get('/reportes/concertacion', [\App\Controller\ReporteController::class, 'concertacion'], ['permiso:reportes.generar']);
        $r->get('/reportes/evaluaciones', [\App\Controller\ReporteController::class, 'evaluaciones'], ['permiso:reportes.generar']);
        $r->get('/reportes/funcionario/{id}', [\App\Controller\ReporteController::class, 'funcionario'], ['permiso:reportes.generar']);

        // Cargas masivas
        $r->post('/cargas/usuarios', [\App\Controller\CargaMasivaController::class, 'usuarios'], ['permiso:cargas.ejecutar']);
        $r->post('/cargas/concertaciones', [\App\Controller\CargaMasivaController::class, 'concertaciones'], ['permiso:cargas.ejecutar']);
        $r->post('/cargas/evaluaciones', [\App\Controller\CargaMasivaController::class, 'evaluaciones'], ['permiso:cargas.ejecutar']);
        $r->post('/cargas/cursos', [\App\Controller\CargaMasivaController::class, 'cursos'], ['permiso:cargas.ejecutar']);
        $r->get('/cargas', [\App\Controller\CargaMasivaController::class, 'historial'], ['permiso:cargas.listar']);

        // Consulta funcionario
        $r->get('/consulta-funcionario/{documento}', [\App\Controller\ConsultaFuncionarioController::class, 'consultar']);

    }, [AuthMiddleware::class]);
}, [CorsMiddleware::class, SecurityHeadersMiddleware::class, RateLimitMiddleware::class]);

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$router->dispatch($method, $uri);
