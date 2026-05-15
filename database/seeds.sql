USE edl_cnsc;

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('admin', 'Administrador', 'Acceso total al sistema'),
('evaluador', 'Evaluador', 'Realiza evaluaciones de desempeno'),
('funcionario', 'Funcionario', 'Consulta y autoevaluacion'),
('jefe_entidad', 'Jefe de Entidad', 'Administra usuarios y procesos de su entidad'),
('jefe_dependencia', 'Jefe de Dependencia', 'Gestiona dependencia y evaluaciones');

INSERT INTO permisos (codigo, nombre, modulo, descripcion) VALUES
('entidades.listar', 'Listar entidades', 'entidades', 'Ver listado de entidades'),
('entidades.crear', 'Crear entidad', 'entidades', 'Registrar nueva entidad'),
('entidades.editar', 'Editar entidad', 'entidades', 'Modificar datos de entidad'),
('entidades.eliminar', 'Eliminar entidad', 'entidades', 'Inactivar entidad'),
('dependencias.listar', 'Listar dependencias', 'dependencias', 'Ver dependencias'),
('dependencias.crear', 'Crear dependencia', 'dependencias', 'Registrar dependencia'),
('dependencias.editar', 'Editar dependencia', 'dependencias', 'Modificar dependencia'),
('usuarios.listar', 'Listar usuarios', 'usuarios', 'Ver listado de usuarios'),
('usuarios.crear', 'Crear usuario', 'usuarios', 'Registrar nuevo usuario'),
('usuarios.editar', 'Editar usuario', 'usuarios', 'Modificar datos de usuario'),
('usuarios.cargar', 'Carga masiva usuarios', 'usuarios', 'Cargar usuarios via archivo'),
('periodos.listar', 'Listar periodos', 'periodos', 'Ver periodos evaluativos'),
('periodos.crear', 'Crear periodo', 'periodos', 'Abrir nuevo periodo'),
('periodos.editar', 'Editar periodo', 'periodos', 'Modificar periodo'),
('metas.listar', 'Listar metas', 'metas', 'Ver metas de desempeno'),
('metas.crear', 'Crear meta', 'metas', 'Definir meta de desempeno'),
('metas.editar', 'Editar meta', 'metas', 'Modificar meta'),
('concertaciones.listar', 'Listar concertaciones', 'concertaciones', 'Ver concertaciones'),
('concertaciones.crear', 'Crear concertacion', 'concertaciones', 'Registrar concertacion'),
('concertaciones.cargar', 'Carga masiva concertaciones', 'concertaciones', 'Cargar concertaciones via archivo'),
('evaluaciones.listar', 'Listar evaluaciones', 'evaluaciones', 'Ver evaluaciones'),
('evaluaciones.crear', 'Crear evaluacion', 'evaluaciones', 'Iniciar evaluacion'),
('evaluaciones.evaluar', 'Evaluar', 'evaluaciones', 'Calificar evaluacion'),
('evaluaciones.cargar', 'Carga masiva evaluaciones', 'evaluaciones', 'Cargar evaluaciones via archivo'),
('compromisos.listar', 'Listar compromisos', 'compromisos', 'Ver compromisos'),
('compromisos.crear', 'Crear compromiso', 'compromisos', 'Registrar compromiso'),
('compromisos.editar', 'Editar compromiso', 'compromisos', 'Modificar compromiso'),
('evidencias.listar', 'Listar evidencias', 'evidencias', 'Ver evidencias'),
('evidencias.subir', 'Subir evidencia', 'evidencias', 'Cargar archivo de evidencia'),
('evidencias.verificar', 'Verificar evidencia', 'evidencias', 'Aprobar o rechazar evidencia'),
('ausentismos.listar', 'Listar ausentismos', 'ausentismos', 'Ver ausentismos'),
('ausentismos.crear', 'Registrar ausentismo', 'ausentismos', 'Crear registro de ausentismo'),
('ausentismos.editar', 'Editar ausentismo', 'ausentismos', 'Modificar ausentismo'),
('movilidades.listar', 'Listar movilidades', 'movilidades', 'Ver movilidades'),
('movilidades.crear', 'Registrar movilidad', 'movilidades', 'Crear registro de movilidad'),
('movilidades.editar', 'Editar movilidad', 'movilidades', 'Modificar movilidad'),
('reportes.ver', 'Ver reportes', 'reportes', 'Acceder a reportes'),
('reportes.generar', 'Generar reportes', 'reportes', 'Generar reportes del sistema'),
('cargas.listar', 'Ver cargas masivas', 'cargas', 'Ver historial de cargas masivas'),
('cargas.ejecutar', 'Ejecutar carga masiva', 'cargas', 'Procesar archivos de carga'),
('auditoria.ver', 'Ver auditoria', 'auditoria', 'Consultar registro de auditoria'),
('parametros.editar', 'Editar parametros', 'parametros', 'Modificar configuracion del sistema');

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.codigo = 'admin';

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'evaluador' AND p.codigo IN (
    'entidades.listar','dependencias.listar','usuarios.listar',
    'periodos.listar','metas.listar','metas.crear','metas.editar',
    'concertaciones.listar','concertaciones.crear',
    'evaluaciones.listar','evaluaciones.crear','evaluaciones.evaluar',
    'compromisos.listar','compromisos.crear',
    'evidencias.listar','evidencias.subir','evidencias.verificar',
    'reportes.ver'
);

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'funcionario' AND p.codigo IN (
    'metas.listar','concertaciones.listar',
    'evaluaciones.listar','evaluaciones.crear',
    'compromisos.listar','evidencias.listar','evidencias.subir',
    'ausentismos.listar','movilidades.listar','reportes.ver'
);

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'jefe_entidad' AND p.codigo IN (
    'entidades.listar','dependencias.listar','dependencias.crear','dependencias.editar',
    'usuarios.listar','usuarios.crear','usuarios.editar','usuarios.cargar',
    'periodos.listar','metas.listar','metas.crear','metas.editar',
    'concertaciones.listar','concertaciones.crear','concertaciones.cargar',
    'evaluaciones.listar','evaluaciones.crear','evaluaciones.evaluar','evaluaciones.cargar',
    'compromisos.listar','compromisos.crear','compromisos.editar',
    'evidencias.listar','evidencias.subir','evidencias.verificar',
    'ausentismos.listar','ausentismos.crear','ausentismos.editar',
    'movilidades.listar','movilidades.crear',
    'reportes.ver','reportes.generar','cargas.listar','cargas.ejecutar'
);

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.codigo = 'jefe_dependencia' AND p.codigo IN (
    'dependencias.listar','usuarios.listar',
    'periodos.listar','metas.listar','metas.crear','metas.editar',
    'concertaciones.listar','concertaciones.crear',
    'evaluaciones.listar','evaluaciones.crear','evaluaciones.evaluar',
    'compromisos.listar','compromisos.crear','compromisos.editar',
    'evidencias.listar','evidencias.subir','evidencias.verificar',
    'ausentismos.listar','ausentismos.crear',
    'reportes.ver'
);

INSERT INTO parametros (clave, valor, tipo, descripcion) VALUES
('jwt_secret', '', 'texto', 'Clave secreta para JWT (generar con openssl rand -hex 32)'),
('jwt_expiracion_minutos', '120', 'numero', 'Tiempo de expiracion del token JWT en minutos'),
('intentos_login_maximos', '5', 'numero', 'Maximo de intentos de login antes de bloquear cuenta'),
('password_longitud_minima', '8', 'numero', 'Longitud minima de contrasena'),
('cors_origen_permitido', 'http://localhost:5173', 'texto', 'Origen permitido para CORS'),
('upload_tamano_maximo_mb', '10', 'numero', 'Tamano maximo de archivo en megabytes'),
('upload_extensiones_permitidas', 'pdf,doc,docx,xls,xlsx,jpg,png', 'texto', 'Extensiones permitidas para carga de archivos');