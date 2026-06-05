-- ============================================================================
-- EDL-CAREPA - Datos Semilla
-- Sistema de Evaluacion del Desempeno Laboral
-- Alcaldia de Carepa, Antioquia
-- ============================================================================
-- Roles segun EDL APP CNSC:
--   jefe_personal: Administrador de entidad
--   evaluador: Concerta/fija compromisos, califica
--   evaluado: Propone compromisos, acepta/rechaza
--   cargador: Apoyo contratista para cargue de info
--   comision_evaluadora: Aprueba/rechaza evaluaciones
--   admin: Administrador tecnico del sistema
-- ============================================================================

USE edl_carepa;

-- ============================================================================
-- ROLES
-- ============================================================================
INSERT INTO `roles` (`id`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 'jefe_personal', 'Jefe de Personal', 'Administrador principal de la entidad. Gestiona dependencias, metas, usuarios, ausentismos y reportes.'),
(2, 'evaluador', 'Evaluador', 'Concerta o fija compromisos funcionales y comportamentales, realiza seguimiento, registra evidencias y califica desempeno.'),
(3, 'evaluado', 'Evaluado', 'Servidor publico sujeto a evaluacion. Propone compromisos y acepta/rechaza compromisos concertados.'),
(4, 'cargador', 'Cargador', 'Apoyo para cargue de informacion, registro de dependencias, metas y ausentismos. Asignado automaticamente a contratistas.'),
(5, 'comision_evaluadora', 'Comision Evaluadora', 'Servidor de libre nombramiento y remocion que aprueba o rechaza las evaluaciones realizadas por el evaluador.'),
(12, 'admin', 'Administrador del Sistema', 'Administrador tecnico. Gestion completa de configuracion y parametrizacion.');

-- ============================================================================
-- PERMISOS
-- ============================================================================
INSERT INTO `permisos` (`id`, `codigo`, `nombre`, `modulo`, `descripcion`) VALUES
(1, 'entidades.listar', 'Listar entidades', 'entidades', 'Ver listado de entidades'),
(2, 'entidades.crear', 'Crear entidad', 'entidades', 'Registrar nueva entidad'),
(3, 'entidades.editar', 'Editar entidad', 'entidades', 'Modificar datos de entidad'),
(4, 'entidades.eliminar', 'Eliminar entidad', 'entidades', 'Inactivar entidad'),
(5, 'dependencias.listar', 'Listar dependencias', 'dependencias', 'Ver dependencias'),
(6, 'dependencias.crear', 'Crear dependencia', 'dependencias', 'Registrar dependencia'),
(7, 'dependencias.editar', 'Editar dependencia', 'dependencias', 'Modificar dependencia'),
(8, 'usuarios.listar', 'Listar usuarios', 'usuarios', 'Ver listado de usuarios'),
(9, 'usuarios.crear', 'Crear usuario', 'usuarios', 'Registrar nuevo usuario'),
(10, 'usuarios.editar', 'Editar usuario', 'usuarios', 'Modificar datos de usuario'),
(11, 'usuarios.cargar', 'Carga masiva usuarios', 'usuarios', 'Cargar usuarios via archivo'),
(12, 'periodos.listar', 'Listar periodos', 'periodos', 'Ver periodos evaluativos'),
(13, 'periodos.crear', 'Crear periodo', 'periodos', 'Abrir nuevo periodo'),
(14, 'periodos.editar', 'Editar periodo', 'periodos', 'Modificar periodo'),
(15, 'metas.listar', 'Listar metas', 'metas', 'Ver metas de desempeno'),
(16, 'metas.crear', 'Crear meta', 'metas', 'Definir meta de desempeno'),
(17, 'metas.editar', 'Editar meta', 'metas', 'Modificar meta'),
(18, 'concertaciones.listar', 'Listar concertaciones', 'concertaciones', 'Ver concertaciones'),
(19, 'concertaciones.crear', 'Crear concertacion', 'concertaciones', 'Registrar concertacion'),
(20, 'concertaciones.cargar', 'Carga masiva concertaciones', 'concertaciones', 'Cargar concertaciones via archivo'),
(21, 'evaluaciones.listar', 'Listar evaluaciones', 'evaluaciones', 'Ver evaluaciones'),
(22, 'evaluaciones.crear', 'Crear evaluacion', 'evaluaciones', 'Iniciar evaluacion'),
(23, 'evaluaciones.evaluar', 'Evaluar', 'evaluaciones', 'Calificar evaluacion'),
(24, 'evaluaciones.cargar', 'Carga masiva evaluaciones', 'evaluaciones', 'Cargar evaluaciones via archivo'),
(25, 'compromisos.listar', 'Listar compromisos', 'compromisos', 'Ver compromisos'),
(26, 'compromisos.crear', 'Crear compromiso', 'compromisos', 'Registrar compromiso'),
(27, 'compromisos.editar', 'Editar compromiso', 'compromisos', 'Modificar compromiso'),
(28, 'evidencias.listar', 'Listar evidencias', 'evidencias', 'Ver evidencias'),
(29, 'evidencias.crear', 'Registrar evidencia', 'evidencias', 'Registrar evidencia descriptiva'),
(30, 'evidencias.editar', 'Editar evidencia', 'evidencias', 'Modificar evidencia propia'),
(31, 'ausentismos.listar', 'Listar ausentismos', 'ausentismos', 'Ver ausentismos'),
(32, 'ausentismos.crear', 'Registrar ausentismo', 'ausentismos', 'Crear registro de ausentismo'),
(33, 'ausentismos.editar', 'Editar ausentismo', 'ausentismos', 'Modificar ausentismo'),
(34, 'movilidades.listar', 'Listar movilidades', 'movilidades', 'Ver movilidades'),
(35, 'movilidades.crear', 'Registrar movilidad', 'movilidades', 'Crear registro de movilidad'),
(36, 'movilidades.editar', 'Editar movilidad', 'movilidades', 'Modificar movilidad'),
(37, 'reportes.ver', 'Ver reportes', 'reportes', 'Acceder a reportes'),
(38, 'reportes.generar', 'Generar reportes', 'reportes', 'Generar reportes del sistema'),
(39, 'cargas.listar', 'Ver cargas masivas', 'cargas', 'Ver historial de cargas masivas'),
(40, 'cargas.ejecutar', 'Ejecutar carga masiva', 'cargas', 'Procesar archivos de carga'),
(41, 'auditoria.ver', 'Ver auditoria', 'auditoria', 'Consultar registro de auditoria'),
(42, 'parametros.editar', 'Editar parametros', 'parametros', 'Modificar configuracion del sistema'),
(43, 'evaluaciones.aprobar', 'Aprobar calificacion definitiva', 'evaluaciones', 'Aprobar evaluacion calificada'),
(44, 'compromisos.devolver', 'Devolver compromiso al evaluado', 'compromisos', 'Devolver compromiso en concertacion'),
(45, 'compromisos.aprobar', 'Aprobar compromiso en concertacion', 'compromisos', 'Aprobar compromiso propuesto'),
(46, 'usuarios.restablecer', 'Restablecer contrasena de usuario', 'usuarios', 'Resetear clave de usuario'),
(47, 'entidades.habilitar', 'Habilitar entidad en el sistema', 'entidades', 'Habilitar entidad'),
(48, 'parametros.listar', 'Listar parametros del sistema', 'parametros', 'Ver parametros'),
(49, 'compromisos.enviar', 'Proponer compromiso', 'compromisos', 'Evaluado propone compromiso'),
(50, 'mejoramiento.crear', 'Registrar compromiso de mejoramiento', 'mejoramiento', 'Crear compromiso de mejoramiento'),
(51, 'mejoramiento.listar', 'Listar compromisos de mejoramiento', 'mejoramiento', 'Ver compromisos de mejoramiento'),
(70, 'evaluaciones.comision', 'Aprobar Comision Evaluadora', 'evaluaciones', 'Comision Evaluadora aprueba calificaciones definitivas');

-- ============================================================================
-- ROL-PERMISO: Jefe de Personal (todos los permisos operativos)
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),
(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),
(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30),
(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(1,40),
(1,41),(1,43),(1,44),(1,45),(1,46),(1,47),(1,49),(1,50),(1,51),(1,70);

-- ============================================================================
-- ROL-PERMISO: Evaluador
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(2,1),(2,5),(2,8),(2,12),(2,15),(2,16),(2,17),(2,18),(2,19),
(2,21),(2,22),(2,23),(2,25),(2,26),(2,28),(2,29),(2,30),
(2,37),(2,43),(2,44),(2,45),(2,49),(2,50),(2,51),(2,70);

-- ============================================================================
-- ROL-PERMISO: Evaluado
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(3,15),(3,18),(3,21),(3,25),(3,28),(3,29),(3,31),(3,34),(3,37),(3,49);

-- ============================================================================
-- ROL-PERMISO: Cargador (dependencias, metas, ausentismos, cargas)
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(4,5),(4,6),(4,7),(4,15),(4,16),(4,17),(4,31),(4,32),(4,33),(4,39),(4,40);

-- ============================================================================
-- ROL-PERMISO: Comision Evaluadora
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(5,21),(5,37),(5,70);

-- ============================================================================
-- ROL-PERMISO: Admin (todos)
-- ============================================================================
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(12,1),(12,2),(12,3),(12,4),(12,5),(12,6),(12,7),(12,8),(12,9),(12,10),(12,11),
(12,12),(12,13),(12,14),(12,15),(12,16),(12,17),(12,18),(12,19),(12,20),
(12,21),(12,22),(12,23),(12,24),(12,25),(12,26),(12,27),(12,28),(12,29),(12,30),
(12,31),(12,32),(12,33),(12,34),(12,35),(12,36),(12,37),(12,38),(12,39),(12,40),
(12,41),(12,42),(12,43),(12,44),(12,45),(12,46),(12,47),(12,48),(12,49),(12,50),(12,51),(12,70);

-- ============================================================================
-- PARAMETROS
-- ============================================================================
INSERT INTO `parametros` (`id`, `clave`, `valor`, `tipo`, `descripcion`) VALUES
(1, 'jwt_secret', 'cambiar_esto_por_un_secret_seguro_openssl_rand_hex_32', 'texto', 'Clave secreta para JWT'),
(2, 'jwt_expiracion_minutos', '120', 'numero', 'Tiempo de expiracion del token JWT en minutos'),
(3, 'intentos_login_maximos', '5', 'numero', 'Maximo de intentos de login antes de bloquear cuenta'),
(4, 'password_longitud_minima', '8', 'numero', 'Longitud minima de contrasena'),
(5, 'cors_origen_permitido', 'http://localhost:5174', 'texto', 'Origen permitido para CORS'),
(6, 'peso_funcionales', '85', 'numero', 'Peso porcentual de compromisos funcionales en calificacion definitiva'),
(7, 'peso_comportamentales', '15', 'numero', 'Peso porcentual de compromisos comportamentales en calificacion definitiva'),
(8, 'min_compromisos_funcionales', '1', 'numero', 'Minimo de compromisos funcionales por periodo anual'),
(9, 'max_compromisos_funcionales', '5', 'numero', 'Maximo de compromisos funcionales por periodo anual'),
(10, 'min_compromisos_comportamentales', '3', 'numero', 'Minimo de compromisos comportamentales'),
(11, 'max_compromisos_comportamentales', '5', 'numero', 'Maximo de compromisos comportamentales'),
(12, 'umbral_sobresaliente', '90', 'numero', 'Porcentaje minimo para nivel Sobresaliente'),
(13, 'umbral_satisfactorio', '65', 'numero', 'Porcentaje minimo para nivel Satisfactorio'),
(14, 'min_dias_ausentismo_no_evaluable', '30', 'numero', 'Dias minimos de ausentismo para periodo no evaluable');

-- ============================================================================
-- COMPETENCIAS COMPORTAMENTALES (Decreto 815)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `competencias` (
 `codigo` varchar(60) NOT NULL,
 `nombre` varchar(200) NOT NULL,
 `descripcion` text DEFAULT NULL,
 `decreto` varchar(20) NOT NULL DEFAULT '815',
 PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `competencias` (`codigo`, `nombre`, `descripcion`, `decreto`) VALUES
('APR_CONT', 'Aprendizaje continuo', 'Capacidad para adquirir y aplicar nuevos conocimientos de forma permanente', '815'),
('ORI_RES', 'Orientacion a resultados', 'Capacidad para alcanzar los objetivos propuestos con calidad y oportunidad', '815'),
('ORI_USU', 'Orientacion al usuario y al ciudadano', 'Compromiso con la satisfaccion de las necesidades de usuarios y ciudadanos', '815'),
('CMP_ORG', 'Compromiso con la organizacion', 'Identificacion y alineacion con los objetivos institucionales', '815'),
('TRB_EQP', 'Trabajo en equipo', 'Capacidad para colaborar y coordinar con otros para el logro de metas comunes', '815'),
('ADP_CAM', 'Adaptacion al cambio', 'Capacidad para ajustarse a nuevas condiciones y transformaciones', '815'),
('APR_TEC', 'Aporte tecnico profesional', 'Contribucion especializada al desarrollo de los procesos de la entidad', '815');

-- ============================================================================
-- ENTIDAD CAREPA
-- ============================================================================
INSERT INTO `entidades` (`id`, `codigo`, `nombre`, `tipo`, `nit`, `municipio`, `departamento`) VALUES
(1, 'CARE-001', 'Alcaldia de Carepa', 'entidad', '890001234', 'Carepa', 'Antioquia');

-- ============================================================================
-- DEPENDENCIAS CAREPA
-- ============================================================================
INSERT INTO `dependencias` (`id`, `entidad_id`, `codigo`, `nombre`) VALUES
(1, 1, 'DEP-001', 'Despacho del Alcalde'),
(2, 1, 'DEP-002', 'Oficina de Talento Humano'),
(3, 1, 'DEP-003', 'Oficina de Planeacion'),
(4, 1, 'DEP-004', 'Secretaria de Educacion'),
(5, 1, 'DEP-005', 'Oficina de Informatica');

-- ============================================================================
-- PERIODO 2025-2026
-- ============================================================================
INSERT INTO `periodos` (`id`, `nombre`, `anio`, `fecha_inicio`, `fecha_fin`, `estado`, `fecha_inicio_concertacion`, `fecha_fin_concertacion`, `fecha_inicio_seguimiento`, `fecha_fin_seguimiento`, `fecha_inicio_evaluacion`, `fecha_fin_evaluacion`) VALUES
(1, 'Periodo Evaluativo 2025-2026', '2025-2026', '2025-02-01', '2026-01-31', 'concertacion', '2025-02-01', '2025-02-21', '2025-02-22', '2025-07-15', '2025-07-16', '2026-01-31');

-- ============================================================================
-- METAS INSTITUCIONALES
-- ============================================================================
INSERT INTO `metas` (`id`, `periodo_id`, `dependencia_id`, `descripcion`) VALUES
(1, 1, 2, 'Implementar el sistema de evaluacion del desempeno laboral en la entidad'),
(2, 1, 3, 'Formular y actualizar el plan de desarrollo del municipio'),
(3, 1, 4, 'Mejorar los indicadores de calidad educativa en las instituciones del municipio'),
(4, 1, 1, 'Fortalecer la gestion administrativa y financiera de la alcaldia'),
(5, 1, 5, 'Modernizar los procesos y servicios digitales de la entidad');
