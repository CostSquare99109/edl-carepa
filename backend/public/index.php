<?php

namespace App;

use App\Config\Env;
use App\Config\Database;
use App\Router\Router;
use App\Middleware\CorsMiddleware;
use App\Middleware\SecurityHeadersMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;

define('EDL_ROOT', dirname(__DIR__));

require EDL_ROOT . '/vendor/autoload.php';

Env::load(EDL_ROOT . '/.env');
Database::getInstance();

$router = new Router();

$router->group('/api/v1', function (Router $r) {

 $r->post('/auth/login', [\App\Controller\AuthController::class, 'login']);
 $r->post('/auth/registro', [\App\Controller\AuthController::class, 'registro']);
 $r->post('/auth/recuperar', [\App\Controller\AuthController::class, 'recuperar']);
 $r->post('/auth/verificar-codigo', [\App\Controller\AuthController::class, 'verificarCodigo']);
 $r->put('/auth/recuperar/{token}', [\App\Controller\AuthController::class, 'resetPassword']);

 $r->group('', function (Router $r) {
  $r->post('/auth/logout', [\App\Controller\AuthController::class, 'logout']);
  $r->get('/auth/perfil', [\App\Controller\AuthController::class, 'perfil']);
  $r->put('/auth/perfil', [\App\Controller\AuthController::class, 'actualizarPerfil']);
  $r->put('/auth/password', [\App\Controller\AuthController::class, 'cambiarPassword']);
  $r->put('/auth/forzar-password', [\App\Controller\AuthController::class, 'forzarCambioPassword']);
  $r->put('/auth/rol', [\App\Controller\AuthController::class, 'cambiarRol']);
  $r->post('/auth/refresh', [\App\Controller\AuthController::class, 'refreshToken']);
  $r->get('/auth/csrf', [\App\Controller\AuthController::class, 'csrfToken']);
  $r->get('/menu', [\App\Controller\MenuController::class, 'obtener']);
  $r->get('/notificaciones', [\App\Controller\NotificacionController::class, 'listar']);
  $r->put('/notificaciones/{id}/leer', [\App\Controller\NotificacionController::class, 'marcarLeida']);

  $r->get('/dashboard/resumen', [\App\Controller\DashboardController::class, 'resumen']);
  $r->get('/dashboard/admin-stats', [\App\Controller\DashboardController::class, 'adminStats']);
  $r->get('/dashboard/actividad', [\App\Controller\DashboardController::class, 'actividad']);

  $r->get('/parametros', [\App\Controller\ParametroController::class, 'listar'], ['permiso:parametros.listar']);
  $r->get('/parametros/{clave}', [\App\Controller\ParametroController::class, 'verPorClave'], ['permiso:parametros.listar']);
  $r->post('/parametros', [\App\Controller\ParametroController::class, 'upsert'], ['permiso:parametros.editar']);
  $r->put('/parametros/masivo', [\App\Controller\ParametroController::class, 'actualizarMasivo'], ['permiso:parametros.editar']);
  $r->put('/parametros/{id}', [\App\Controller\ParametroController::class, 'upsert'], ['permiso:parametros.editar']);
  $r->delete('/parametros/{id}', [\App\Controller\ParametroController::class, 'eliminar'], ['permiso:parametros.editar']);

  $r->get('/usuarios', [\App\Controller\UsuarioController::class, 'listar'], ['permiso:usuarios.listar']);
  $r->post('/usuarios', [\App\Controller\UsuarioController::class, 'crear'], ['permiso:usuarios.crear']);
  $r->get('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'ver'], ['permiso:usuarios.listar']);
  $r->put('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'actualizar'], ['permiso:usuarios.editar']);
  $r->delete('/usuarios/{id}', [\App\Controller\UsuarioController::class, 'eliminar'], ['permiso:usuarios.editar']);
  $r->put('/usuarios/{id}/restablecer-password', [\App\Controller\UsuarioController::class, 'restablecerPassword'], ['permiso:usuarios.restablecer']);
  $r->put('/usuarios/{id}/roles', [\App\Controller\UsuarioController::class, 'asignarRoles'], ['permiso:usuarios.editar']);

  $r->get('/entidades', [\App\Controller\EntidadController::class, 'listar'], ['permiso:entidades.listar']);
  $r->post('/entidades', [\App\Controller\EntidadController::class, 'crear'], ['permiso:entidades.crear']);
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
  $r->get('/metas/{id}/evidencias', [\App\Controller\MetaController::class, 'evidencias'], ['permiso:evidencias.listar']);

  $r->get('/concertaciones', [\App\Controller\ConcertacionController::class, 'listar'], ['permiso:concertaciones.listar']);
  $r->post('/concertaciones', [\App\Controller\ConcertacionController::class, 'crear'], ['permiso:concertaciones.crear']);
  $r->get('/concertaciones/{id}', [\App\Controller\ConcertacionController::class, 'ver'], ['permiso:concertaciones.listar']);
  $r->put('/concertaciones/{id}', [\App\Controller\ConcertacionController::class, 'actualizar'], ['permiso:concertaciones.crear']);
  $r->put('/concertaciones/{id}/fijar', [\App\Controller\ConcertacionController::class, 'fijarCompromisos'], ['permiso:concertaciones.crear']);
  $r->get('/concertaciones/{id}/compromisos', [\App\Controller\ConcertacionController::class, 'compromisos'], ['permiso:compromisos.listar']);
 $r->get('/concertaciones/{id}/validar-compromisos', [\App\Controller\CompromisoController::class, 'validarAntesDeFirmar'], ['permiso:compromisos.listar']);
  $r->post('/concertaciones/{id}/compromisos', [\App\Controller\CompromisoController::class, 'crear'], ['permiso:compromisos.crear']);
  $r->post('/concertaciones/{id}/compromisos-mejoramiento', [\App\Controller\CompromisoMejoramientoController::class, 'crear'], ['permiso:mejoramiento.crear']);
  $r->get('/concertaciones/{id}/compromisos-mejoramiento', [\App\Controller\CompromisoMejoramientoController::class, 'listar'], ['permiso:mejoramiento.listar']);

  $r->get('/evaluaciones', [\App\Controller\EvaluacionController::class, 'listar'], ['permiso:evaluaciones.listar']);
  $r->post('/evaluaciones', [\App\Controller\EvaluacionController::class, 'crear'], ['permiso:evaluaciones.crear']);
  $r->get('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'ver'], ['permiso:evaluaciones.listar']);
  $r->put('/evaluaciones/{id}', [\App\Controller\EvaluacionController::class, 'calificar'], ['permiso:evaluaciones.evaluar']);
  $r->get('/evaluaciones/{id}/compromisos', [\App\Controller\EvaluacionController::class, 'compromisos'], ['permiso:compromisos.listar']);
  $r->post('/evaluaciones/{id}/parcial', [\App\Controller\EvaluacionController::class, 'crearParcial'], ['permiso:evaluaciones.crear']);
  $r->put('/evaluaciones/{id}/definitiva', [\App\Controller\EvaluacionController::class, 'calificarDefinitiva'], ['permiso:evaluaciones.evaluar']);
  $r->put('/evaluaciones/{id}/comision', [\App\Controller\EvaluacionController::class, 'aprobarComision'], ['permiso:evaluaciones.comision']);
  $r->get('/evaluaciones/pendientes-calificar', [\App\Controller\EvaluacionController::class, 'pendientesCalificar'], ['permiso:evaluaciones.evaluar']);

  $r->get('/compromisos', [\App\Controller\CompromisoController::class, 'listar'], ['permiso:compromisos.listar']);
  $r->get('/compromisos/buscar-evaluado', [\App\Controller\CompromisoController::class, 'buscarEvaluado'], ['permiso:compromisos.listar']);
  $r->get('/compromisos/competencias-comportamentales', [\App\Controller\CompromisoController::class, 'competenciasComportamentales'], ['permiso:compromisos.listar']);
  $r->post('/compromisos/enviar', [\App\Controller\CompromisoController::class, 'enviar'], ['permiso:compromisos.enviar']);
  $r->post('/compromisos/funcional', [\App\Controller\CompromisoController::class, 'guardarFuncional'], ['permiso:compromisos.crear']);
  $r->post('/compromisos/comportamental', [\App\Controller\CompromisoController::class, 'guardarComportamental'], ['permiso:compromisos.crear']);
  $r->delete('/compromisos/funcional/{id}', [\App\Controller\CompromisoController::class, 'eliminarFuncional'], ['permiso:compromisos.editar']);
  $r->delete('/compromisos/comportamental/{id}', [\App\Controller\CompromisoController::class, 'eliminarComportamental'], ['permiso:compromisos.editar']);
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

  $r->get('/evidencias', [\App\Controller\EvidenciaController::class, 'listar'], ['permiso:evidencias.listar']);
  $r->post('/evidencias', [\App\Controller\EvidenciaController::class, 'registrar'], ['permiso:evidencias.crear']);
  $r->get('/evidencias/{id}', [\App\Controller\EvidenciaController::class, 'ver'], ['permiso:evidencias.listar']);
  $r->put('/evidencias/{id}', [\App\Controller\EvidenciaController::class, 'actualizar'], ['permiso:evidencias.editar']);

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

  $r->get('/reportes/concertacion', [\App\Controller\ReporteController::class, 'concertacion'], ['permiso:reportes.generar']);
  $r->get('/reportes/evaluaciones', [\App\Controller\ReporteController::class, 'evaluaciones'], ['permiso:reportes.generar']);
  $r->get('/reportes/funcionario/{id}', [\App\Controller\ReporteController::class, 'funcionario'], ['permiso:reportes.generar']);
  $r->get('/reportes/resumen', [\App\Controller\ReporteController::class, 'resumen'], ['permiso:reportes.generar']);
  $r->get('/reportes/entidad/{id}', [\App\Controller\ReporteController::class, 'porEntidad'], ['permiso:reportes.generar']);
  $r->get('/reportes/dependencia/{id}', [\App\Controller\ReporteController::class, 'porDependencia'], ['permiso:reportes.generar']);
  $r->get('/reportes/compromisos', [\App\Controller\ReporteController::class, 'compromisos'], ['permiso:reportes.generar']);
  $r->get('/reportes/excel/{tipo}', [\App\Controller\ReporteController::class, 'descargarExcel'], ['permiso:reportes.generar']);
  $r->get('/reportes/concertacion-pdf/{id}', [\App\Controller\ReporteController::class, 'pdfConcertacion'], ['permiso:reportes.generar']);
  $r->get('/reportes/evaluacion-pdf/{id}', [\App\Controller\ReporteController::class, 'pdfEvaluacion'], ['permiso:reportes.generar']);

  $r->post('/cargas/usuarios', [\App\Controller\CargaMasivaController::class, 'usuarios'], ['permiso:cargas.ejecutar']);
  $r->post('/cargas/concertaciones', [\App\Controller\CargaMasivaController::class, 'concertaciones'], ['permiso:cargas.ejecutar']);
  $r->post('/cargas/evaluaciones', [\App\Controller\CargaMasivaController::class, 'evaluaciones'], ['permiso:cargas.ejecutar']);
  $r->post('/cargas/cursos', [\App\Controller\CargaMasivaController::class, 'cursos'], ['permiso:cargas.ejecutar']);
  $r->get('/cargas', [\App\Controller\CargaMasivaController::class, 'historial'], ['permiso:cargas.listar']);
  $r->get('/cargas/plantilla-usuarios', [\App\Controller\CargaMasivaController::class, 'plantillaUsuarios'], ['permiso:cargas.ejecutar']);

  $r->get('/consulta-funcionario/{documento}', [\App\Controller\ConsultaFuncionarioController::class, 'consultar']);

  $r->get('/competencias', [\App\Controller\CompetenciaController::class, 'listar'], ['permiso:compromisos.listar']);
  $r->get('/competencias/decretos', [\App\Controller\CompetenciaController::class, 'decretos'], ['permiso:compromisos.listar']);

 }, [AuthMiddleware::class]);
}, [CorsMiddleware::class, SecurityHeadersMiddleware::class, RateLimitMiddleware::class]);

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

CorsMiddleware::handle();

if ($method !== 'OPTIONS') {
 $router->dispatch($method, $uri);
}
