<div align="center">

# EDL-CAREPA

### Sistema de Evaluacion del Desempeno Laboral

**Alcaldia de Carepa -- Antioquia, Colombia**

<img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php" alt="PHP 8.4" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />

---

</div>


## Descripcion

Plataforma web integral para la Evaluacion del Desempeno Laboral (EDL) de los servidores publicos de la Alcaldia de Carepa, implementada conforme al marco normativo colombiano (Acuerdo 6176 de 2018) y los lineamientos del Departamento Administrativo de la Funcion Publica.

Permite gestionar el ciclo completo de evaluacion: concertacion de compromisos, seguimiento, calificacion y retroalimentacion, con flujos de trabajo diferenciados por rol (evaluado, evaluador, comision evaluadora, administracion).


## Caracteristicas Principales

- **Autenticacion segura** -- JWT con refresh token, bloqueo por intentos fallidos, recuperacion por correo electronico via PHPMailer
- **Gestion de roles y permisos** -- Sistema granular con 3 roles, 51 permisos y 84 asignaciones rol-permiso
- **Concertacion de compromisos** -- Funcionales y comportamentales con aprobacion/rechazo por el evaluador, pesos porcentuales
- **Evaluaciones parciales y definitivas** -- Semestrales, eventuales y de comision evaluadora
- **Notificaciones en tiempo real** -- Alertas de compromisos pendientes, evaluaciones proximas
- **Carga masiva** -- Importacion de usuarios, concertaciones y evaluaciones desde archivos
- **Auditoria completa** -- Trazabilidad de todas las acciones del sistema
- **Identidad visual institucional** -- Colores y tipografia de la Alcaldia de Carepa


## Arquitectura

```
+-----------------------------------------------------+
| FRONTEND (React 19 SPA)                             |
| React 19 + TypeScript 5.8 + TailwindCSS 3 + Vite 6 |
| Puerto 5173 (desarrollo)                            |
+---------------------------+-------------------------+
                            | REST API (JSON)
                            v
+-----------------------------------------------------+
| BACKEND (PHP 8.4)                                   |
| Router propio · Controllers · Services · Repos      |
| PHPMailer 7 · Firebase JWT 6                        |
| Puerto 8000 (PHP built-in server)                   |
+---------------------------+-------------------------+
                            | PDO MySQL
                            v
+-----------------------------------------------------+
| MariaDB / MySQL 8.0                                 |
| Base de datos: edl_carepa                           |
| 23 tablas · Foreign Keys · Indices                  |
+-----------------------------------------------------+
```


## Estructura del Proyecto

```
edl-carepa/
|
+-- .github/
|   +-- workflows/
|       +-- deploy.yml                          # Pipeline CI/CD para despliegue
|
+-- backend/                                    # API REST PHP 8.4
|   +-- composer.json                           # Dependencias: firebase/php-jwt ^6.11, phpmailer/phpmailer ^7.1
|   +-- composer.lock                           # Bloqueo de versiones
|   +-- .env                                    # Variables de entorno (no versionado)
|   +-- .env.example                            # Plantilla de configuracion
|   +-- .htaccess                               # Reglas Apache para reescritura
|   +-- reset_admin.php                         # Script para restablecer clave del administrador
|   |
|   +-- public/                                 # Document root del servidor
|   |   +-- index.php                           # Entry point: carga env, DB, registra rutas, despacha
|   |
|   +-- src/                                    # Codigo fuente (PSR-4: App\)
|   |   |
|   |   +-- Config/                             # Configuracion de la aplicacion
|   |   |   +-- Database.php                    # Singleton PDO con conexion a MariaDB/MySQL
|   |   |   +-- Env.php                         # Cargador de archivo .env
|   |   |
|   |   +-- Controller/                         # Capa de controladores HTTP
|   |   |   +-- AusentismoController.php        # CRUD ausentismos (licencias, permisos, incapacidades)
|   |   |   +-- AuthController.php              # Login, registro, recuperar, verificar-codigo, reset, perfil, logout
|   |   |   +-- CargaMasivaController.php       # Carga masiva: usuarios, concertaciones, evaluaciones, cursos
|   |   |   +-- CompromisoController.php        # Enviar, aprobar, rechazar, devolver, calificar compromisos
|   |   |   +-- ConcertacionController.php      # Listar y actualizar concertaciones
|   |   |   +-- ConsultaFuncionarioController.php # Consulta publica por documento
|   |   |   +-- DashboardController.php         # resumen, adminStats, actividad
|   |   |   +-- DependenciaController.php       # CRUD dependencias
|   |   |   +-- EntidadController.php           # CRUD entidades + jefes + dependencias anidadas
|   |   |   +-- EvaluacionController.php        # CRUD evaluaciones + compromisos + parciales + definitiva + comision
|   |   |   +-- EvidenciaController.php         # Subir, listar, verificar evidencias
|   |   |   +-- MenuController.php              # Menu dinamico por rol del usuario
|   |   |   +-- MetaController.php              # CRUD metas + evidencias + concertacion
|   |   |   +-- MovilidadController.php         # CRUD movilidades (ascensos, traslados, encargos)
|   |   |   +-- NotificacionController.php      # Listar y marcar leidas
|   |   |   +-- ParametroController.php         # CRUD parametros + upsert + masivo
|   |   |   +-- PeriodoController.php           # CRUD periodos + metas + evaluaciones anidadas
|   |   |   +-- ReporteController.php           # Reportes: concertacion, evaluaciones, funcionario
|   |   |   +-- UsuarioController.php           # CRUD usuarios
|   |   |
|   |   +-- Helper/                             # Utilidades transversales
|   |   |   +-- JwtHelper.php                   # Generacion y validacion de tokens JWT
|   |   |   +-- MailHelper.php                  # Envio de correo via PHPMailer + SMTP Gmail
|   |   |   +-- ResponseHelper.php              # Respuestas JSON estandarizadas (success, error, paginacion)
|   |   |   +-- SanitizerHelper.php             # Sanitizacion de entrada (strip tags, trim, etc.)
|   |   |   +-- ValidatorHelper.php             # Validacion de datos (email, longitud, formato, etc.)
|   |   |
|   |   +-- Middleware/                          # Middleware HTTP
|   |   |   +-- AuthMiddleware.php              # Verifica JWT en header Authorization
|   |   |   +-- CorsMiddleware.php              # Cross-Origin Resource Sharing configurable
|   |   |   +-- PermissionMiddleware.php        # Verifica permisos por rol (permiso:modulo.accion)
|   |   |   +-- RateLimitMiddleware.php         # Limita peticiones por IP/usuario
|   |   |   +-- SecurityHeadersMiddleware.php   # Headers de seguridad (X-Frame-Options, CSP, etc.)
|   |   |   +-- TenantMiddleware.php            # Aislamiento multi-entidad
|   |   |
|   |   +-- Model/                              # Entidades del dominio
|   |   |   +-- Ausentismo.php                  # Modelo de ausentismos
|   |   |   +-- CargaMasiva.php                 # Modelo de cargas masivas
|   |   |   +-- Compromiso.php                  # Modelo de compromisos (funcional/comportamental)
|   |   |   +-- Concertacion.php                # Modelo de concertaciones
|   |   |   +-- Dependencia.php                 # Modelo de dependencias
|   |   |   +-- Entidad.php                     # Modelo de entidades
|   |   |   +-- Evaluacion.php                  # Modelo de evaluaciones
|   |   |   +-- Evidencia.php                   # Modelo de evidencias
|   |   |   +-- Meta.php                        # Modelo de metas de desempeno
|   |   |   +-- Movilidad.php                   # Modelo de movilidades
|   |   |   +-- Notificacion.php                # Modelo de notificaciones
|   |   |   +-- Periodo.php                     # Modelo de periodos evaluativos
|   |   |   +-- Usuario.php                     # Modelo de usuarios
|   |   |
|   |   +-- Repository/                         # Capa de acceso a datos (PDO)
|   |   |   +-- BaseRepository.php              # CRUD generico: listar, obtener, crear, actualizar, eliminar + paginacion
|   |   |   +-- AusentismoRepository.php        # Queries de ausentismos
|   |   |   +-- CargaMasivaRepository.php       # Queries de cargas masivas
|   |   |   +-- CompromisoRepository.php        # Queries de compromisos
|   |   |   +-- ConcertacionRepository.php      # Queries de concertaciones
|   |   |   +-- DependenciaRepository.php       # Queries de dependencias
|   |   |   +-- EntidadRepository.php           # Queries de entidades
|   |   |   +-- EvaluacionRepository.php        # Queries de evaluaciones
|   |   |   +-- EvidenciaRepository.php         # Queries de evidencias
|   |   |   +-- MetaRepository.php              # Queries de metas
|   |   |   +-- MovilidadRepository.php         # Queries de movilidades
|   |   |   +-- NotificacionRepository.php      # Queries de notificaciones
|   |   |   +-- ParametroRepository.php         # Queries de parametros
|   |   |   +-- PeriodoRepository.php           # Queries de periodos
|   |   |   +-- SesionRepository.php            # Queries de sesiones JWT
|   |   |   +-- UsuarioRepository.php           # Queries de usuarios
|   |   |
|   |   +-- Router/                             # Enrutador HTTP personalizado
|   |   |   +-- Router.php                      # Registro y despacho de rutas con grupos, prefijos y middleware
|   |   |
|   |   +-- Service/                            # Logica de negocio
|   |       +-- AuditoriaService.php            # Registro de acciones en tabla auditoria
|   |       +-- AusentismoService.php           # Logica de ausentismos
|   |       +-- AuthService.php                 # Login, registro, JWT, recuperar contraseña, bloqueo
|   |       +-- CargaMasivaService.php          # Procesamiento de archivos CSV/XLSX
|   |       +-- CompromisoService.php           # Enviar, aprobar, rechazar, devolver, calificar compromisos
|   |       +-- ConcertacionService.php         # Logica de concertaciones
|   |       +-- DependenciaService.php          # Logica de dependencias
|   |       +-- EntidadService.php              # Logica de entidades
|   |       +-- EvaluacionService.php           # Crear, calificar, definitiva, comision evaluadora
|   |       +-- EvidenciaService.php            # Subida y verificacion de evidencias
|   |       +-- MetaService.php                 # Logica de metas de desempeno
|   |       +-- MovilidadService.php            # Logica de movilidades
|   |       +-- NotificacionService.php         # Creacion y envio de notificaciones
|   |       +-- PeriodoService.php              # Logica de periodos evaluativos
|   |       +-- ReporteService.php              # Generacion de reportes
|   |       +-- UsuarioService.php              # CRUD usuarios, asignacion de roles
|   |
|   +-- storage/                                # Almacenamiento de archivos
|   |   +-- cargas/                             # Archivos de carga masiva procesados
|   |   +-- evidencias/                         # Evidencias subidas por funcionarios
|   |
|   +-- vendor/                                 # Dependencias Composer (no versionado)
|       +-- autoload.php                        # Autoloader PSR-4
|       +-- composer/                           # Metadatos internos de Composer
|       +-- firebase/                           # Firebase PHP-JWT v6.11
|       |   +-- php-jwt/
|       |       +-- src/
|       |           +-- JWT.php                 # Codificacion/decodificacion de tokens
|       |           +-- Key.php                 # Representacion de clave de firma
|       |           +-- JWK.php                 # JSON Web Key
|       |           +-- CachedKeySet.php        # Set de claves en cache
|       |           +-- BeforeValidException.php
|       |           +-- ExpiredException.php
|       |           +-- SignatureInvalidException.php
|       |
|       +-- phpmailer/                          # PHPMailer v7.1
|           +-- phpmailer/
|               +-- src/
|                   +-- PHPMailer.php           # Clase principal de envio de correo
|                   +-- SMTP.php                # Cliente SMTP con TLS
|                   +-- POP3.php                # Autenticacion POP3 antes de SMTP
|               +-- OAuth.php                   # Autenticacion OAuth2
|               +-- DSNConfigurator.php         # Configuracion via DSN
|               +-- Exception.php               # Excepcion base PHPMailer
|               +-- language/                   # Traducciones de mensajes (es, en, 40+ idiomas)
|
+-- database/                                   # Scripts SQL
|   +-- schema.sql                              # Esquema completo: 23 tablas, foreign keys, indices
|   +-- seeds.sql                               # Datos semilla: 3 roles, 51 permisos, 84 rol-permiso, 7 parametros
|   +-- seed_usuarios.sql                       # Datos de demostracion: entidad, dependencias, periodo, 9 usuarios, 5 evaluaciones
|   +-- migration_compromisos.sql               # Migracion: peso, evaluador_id, observaciones, nuevos estados en compromisos
|   +-- migration_edl_carepa.sql                # Migracion: adaptacion al Acuerdo 6176 (roles, permisos, enums evaluacion/compromiso/periodo)
|
+-- docs/                                       # Documentacion estatica (GitHub Pages)
|   +-- index.html                              # Sitio de documentacion
|   +-- 404.html                                # Pagina de error
|   +-- escudo.png                              # Escudo del municipio
|   +-- assets/
|       +-- index-9XPqLtX6.css                  # Estilos del sitio
|       +-- index-CcJknvJ3.js                   # JS del sitio
|
+-- frontend/                                   # SPA React 19
|   +-- index.html                              # HTML base con montaje React
|   +-- package.json                            # Dependencias: react 19, react-router-dom 7, tailwindcss 3, vite 6
|   +-- package-lock.json                       # Bloqueo de versiones npm
|   +-- postcss.config.js                       # PostCSS con TailwindCSS y Autoprefixer
|   +-- tailwind.config.js                      # Colores institucionales, fuentes, tema personalizado
|   +-- tsconfig.json                           # Configuracion TypeScript (strict, ESNext)
|   +-- vite.config.ts                          # Proxy /api/v1 a localhost:8000, React plugin
|   |
|   +-- public/
|   |   +-- escudo.png                          # Escudo del municipio de Carepa (1983)
|   |
|   +-- dist/                                   # Build de produccion (generado por vite build)
|   |   +-- index.html
|   |   +-- assets/
|   |       +-- index-BSM6pOMR.css
|   |       +-- index-juIJf-6i.js
|   |
|   +-- src/                                    # Codigo fuente del frontend
|       +-- main.tsx                            # Punto de entrada: renderiza App en #root
|       +-- App.tsx                             # Router principal con rutas protegidas
|       +-- index.css                           # TailwindCSS directives + estilos institucionales
|       +-- vite-env.d.ts                       # Declaraciones de tipos de Vite
|       |
|       +-- components/                         # Componentes reutilizables
|       |   +-- Layout/
|       |       +-- Layout.tsx                  # Layout principal con sidebar + contenido + header
|       |       +-- Sidebar.tsx                 # Menu lateral con navegacion por rol
|       |
|       +-- contexts/                           # Contextos de React
|       |   +-- AuthContext.tsx                  # Estado de autenticacion global, login, logout, permisos
|       |
|       +-- lib/                                # Utilidades y clientes
|       |   +-- api.ts                          # Cliente HTTP con interceptor JWT y refresh
|       |   +-- auth.ts                         # Funciones auxiliares de autenticacion
|       |
|       +-- pages/                              # Paginas de la aplicacion
|           +-- Login.tsx                       # Inicio de sesion, registro, recuperar contraseña
|           +-- Dashboard.tsx                   # Panel principal del funcionario
|           +-- SelectRolePage.tsx              # Seleccion de rol cuando el usuario tiene multiples
|           +-- NuevaContrasena.tsx             # Formulario de nueva contraseña post-verificacion
|           +-- VerificarCodigo.tsx             # Verificacion de codigo de recuperacion
|           |
|           +-- Admin/                          # Paginas de administracion
|           |   +-- AdminHome.tsx               # Home del panel administrativo
|           |   +-- AdminDashboard.tsx           # Dashboard con estadisticas generales
|           |   +-- AdminUsuarios.tsx            # Gestion de usuarios
|           |   +-- AdminEvaluaciones.tsx        # Gestion de evaluaciones
|           |   +-- AdminDependencias.tsx        # Gestion de dependencias
|           |   +-- AdminNotificaciones.tsx      # Centro de notificaciones
|           |   +-- AdminReportes.tsx            # Generacion de reportes
|           |   +-- AdminConfiguracion.tsx       # Parametros del sistema
|           |
|           +-- Compromisos/                    # Modulo de compromisos
|           |   +-- MisCompromisos.tsx           # Compromisos del evaluado (proponer, ver estado)
|           |   +-- AprobarCompromisos.tsx       # Aprobacion de compromisos por evaluador
|           |   +-- CompromisosYCompetencias.tsx # Vista de compromisos + competencias
|           |
|           +-- Concertaciones/                 # Modulo de concertacion
|           |   +-- ConcertacionList.tsx         # Listado de concertaciones
|           |
|           +-- Entidades/                      # Modulo de entidades
|           |   +-- EntidadList.tsx              # Listado y CRUD de entidades
|           |
|           +-- Evaluaciones/                   # Modulo de evaluaciones
|           |   +-- EvaluacionList.tsx           # Listado de evaluaciones
|           |   +-- EvaluarPage.tsx             # Formulario de calificacion de evaluacion
|           |   +-- PanelEvaluador.tsx           # Panel del evaluador con pendientes
|           |
|           +-- Evidencias/                     # Modulo de evidencias
|           |   +-- EvidenciaList.tsx            # Listado y subida de evidencias
|           |
|           +-- Metas/                          # Modulo de metas
|           |   +-- MetaList.tsx                 # Listado y CRUD de metas
|           |
|           +-- Periodos/                       # Modulo de periodos
|           |   +-- PeriodoList.tsx              # Listado y CRUD de periodos evaluativos
|           |
|           +-- Reportes/                       # Modulo de reportes
|           |   +-- ReportesPage.tsx             # Pagina de generacion y descarga de reportes
|           |
|           +-- Usuarios/                       # Modulo de usuarios
|               +-- UsuarioList.tsx              # Listado y CRUD de usuarios
|
+-- .gitignore                                  # Archivos excluidos del control de versiones
+-- README.md                                   # Este documento
```


## Base de Datos

La base de datos `edl_carepa` contiene **23 tablas** con foreign keys, indices optimizados y constraints de integridad:

| Tabla | Descripcion | Relaciones principales |
|-------|-------------|----------------------|
| `usuarios` | Servidores publicos del municipio | FK a entidades, dependencias |
| `roles` | Roles del sistema (admin, evaluador, evaluado) | -- |
| `permisos` | Permisos granulares por modulo (51 total) | -- |
| `rol_permiso` | Asignacion permiso-rol (84 registros) | FK a roles, permisos |
| `usuario_rol` | Asignacion rol-usuario (con entidad) | FK a usuarios, roles |
| `entidades` | Entidades organizacionales | -- |
| `dependencias` | Dependencias por entidad | FK a entidades, usuarios (jefe) |
| `periodos` | Periodos evaluativos con fases | -- |
| `metas` | Metas de desempeno por periodo | FK a periodos, usuarios |
| `concertaciones` | Concertaciones de metas | FK a metas, usuarios |
| `evaluaciones` | Evaluaciones de desempeno | FK a periodos, usuarios |
| `compromisos` | Compromisos funcionales y comportamentales | FK a evaluaciones, usuarios |
| `evidencias` | Archivos de evidencia | FK a metas, compromisos, usuarios |
| `ausentismos` | Registros de ausentismo | FK a usuarios |
| `movilidades` | Movimientos de personal | FK a usuarios, entidades, dependencias |
| `notificaciones` | Alertas del sistema | FK a usuarios |
| `cargas_masivas` | Historial de cargas por archivo | FK a usuarios |
| `parametros` | Configuracion del sistema (clave-valor) | -- |
| `auditoria` | Registro de acciones del sistema | FK a usuarios |
| `sesiones` | Sesiones JWT activas | FK a usuarios |
| `recuperaciones` | Tokens de recuperacion de contrasena | FK a usuarios |
| `cursos_induccion` | Cursos de induccion programados | FK a entidades |
| `curso_participantes` | Participantes en cursos | FK a cursos, usuarios |


## Roles del Sistema

| Rol | Codigo | Permisos | Descripcion |
|-----|--------|----------|-------------|
| Administrador | `admin` | 51 (todos) | Superadministrador global. Habilita entidades, gestiona parametros y soporte |
| Evaluador | `evaluador` | 22 | Evalua el desempeno de funcionarios. Aprueba compromisos y califica resultados |
| Evaluado | `evaluado` | 11 | Servidor publico sujeto a evaluacion. Propone compromisos y registra evidencias |


## API Endpoints

### Autenticacion (publicas)

```
POST   /api/v1/auth/login              # Iniciar sesion
POST   /api/v1/auth/registro           # Registrar cuenta nueva
POST   /api/v1/auth/recuperar          # Solicitar codigo de recuperacion por correo
POST   /api/v1/auth/verificar-codigo   # Verificar codigo de 6 digitos
PUT    /api/v1/auth/recuperar/{token}  # Establecer nueva contrasena
```

### Autenticacion (protegidas)

```
POST   /api/v1/auth/logout             # Cerrar sesion
GET    /api/v1/auth/perfil             # Datos del usuario actual
PUT    /api/v1/auth/perfil             # Actualizar perfil
PUT    /api/v1/auth/password           # Cambiar contrasena
PUT    /api/v1/auth/rol                # Cambiar rol activo
```

### Dashboard

```
GET    /api/v1/dashboard/resumen       # Resumen general del usuario
GET    /api/v1/dashboard/admin-stats   # Estadisticas administrativas
GET    /api/v1/dashboard/actividad     # Actividad reciente
```

### Usuarios

```
GET    /api/v1/usuarios                # Listar usuarios (paginado)
POST   /api/v1/usuarios                # Crear usuario
GET    /api/v1/usuarios/{id}           # Ver detalle de usuario
PUT    /api/v1/usuarios/{id}           # Actualizar usuario
DELETE /api/v1/usuarios/{id}           # Eliminar usuario
```

### Entidades

```
GET    /api/v1/entidades               # Listar entidades
POST   /api/v1/entidades               # Crear entidad
GET    /api/v1/entidades/{id}          # Ver entidad
PUT    /api/v1/entidades/{id}          # Actualizar entidad
DELETE /api/v1/entidades/{id}          # Eliminar entidad
GET    /api/v1/entidades/{id}/jefes    # Jefes de la entidad
GET    /api/v1/entidades/{id}/dependencias  # Dependencias de la entidad
```

### Dependencias

```
GET    /api/v1/dependencias            # Listar dependencias
POST   /api/v1/dependencias            # Crear dependencia
GET    /api/v1/dependencias/{id}       # Ver dependencia
PUT    /api/v1/dependencias/{id}       # Actualizar dependencia
DELETE /api/v1/dependencias/{id}       # Eliminar dependencia
```

### Periodos

```
GET    /api/v1/periodos                # Listar periodos
POST   /api/v1/periodos                # Crear periodo
GET    /api/v1/periodos/{id}           # Ver periodo
PUT    /api/v1/periodos/{id}           # Actualizar periodo
GET    /api/v1/periodos/{id}/metas     # Metas del periodo
GET    /api/v1/periodos/{id}/evaluaciones  # Evaluaciones del periodo
```

### Metas

```
GET    /api/v1/metas                   # Listar metas
POST   /api/v1/metas                   # Crear meta
GET    /api/v1/metas/{id}              # Ver meta
PUT    /api/v1/metas/{id}              # Actualizar meta
GET    /api/v1/metas/{id}/evidencias   # Evidencias de la meta
POST   /api/v1/metas/{id}/concertacion # Crear concertacion para la meta
```

### Concertaciones

```
GET    /api/v1/concertaciones          # Listar concertaciones
PUT    /api/v1/concertaciones/{id}     # Actualizar concertacion
```

### Evaluaciones

```
GET    /api/v1/evaluaciones            # Listar evaluaciones
POST   /api/v1/evaluaciones            # Crear evaluacion
GET    /api/v1/evaluaciones/{id}       # Ver detalle
PUT    /api/v1/evaluaciones/{id}       # Calificar evaluacion
GET    /api/v1/evaluaciones/{id}/compromisos   # Compromisos de la evaluacion
POST   /api/v1/evaluaciones/{id}/compromisos   # Crear compromiso en la evaluacion
POST   /api/v1/evaluaciones/{id}/parcial       # Crear evaluacion parcial
PUT    /api/v1/evaluaciones/{id}/definitiva    # Calificar evaluacion definitiva
PUT    /api/v1/evaluaciones/{id}/comision      # Aprobar por comision evaluadora
GET    /api/v1/evaluaciones/pendientes-calificar  # Evaluaciones pendientes
```

### Compromisos

```
GET    /api/v1/compromisos             # Listar compromisos
POST   /api/v1/compromisos/enviar      # Proponer compromiso (evaluado)
GET    /api/v1/compromisos/pendientes  # Pendientes de aprobacion (evaluador)
PUT    /api/v1/compromisos/{id}/aprobar    # Aprobar compromiso
PUT    /api/v1/compromisos/{id}/rechazar   # Rechazar compromiso
PUT    /api/v1/compromisos/{id}/devolver   # Devolver compromiso al evaluado
PUT    /api/v1/compromisos/{id}/calificar  # Calificar cumplimiento
GET    /api/v1/compromisos/{id}/pesos      # Resumen de pesos por evaluacion
PUT    /api/v1/compromisos/{id}            # Actualizar compromiso
```

### Evidencias

```
GET    /api/v1/evidencias              # Listar evidencias
POST   /api/v1/evidencias              # Subir evidencia (multipart)
PUT    /api/v1/evidencias/{id}/verificar  # Verificar o rechazar evidencia
```

### Ausentismos

```
GET    /api/v1/ausentismos             # Listar ausentismos
POST   /api/v1/ausentismos             # Registrar ausentismo
PUT    /api/v1/ausentismos/{id}        # Actualizar ausentismo
```

### Movilidades

```
GET    /api/v1/movilidades             # Listar movilidades
POST   /api/v1/movilidades             # Registrar movilidad
PUT    /api/v1/movilidades/{id}        # Actualizar movilidad
```

### Reportes

```
GET    /api/v1/reportes/concertacion       # Reporte de concertaciones
GET    /api/v1/reportes/evaluaciones       # Reporte de evaluaciones
GET    /api/v1/reportes/funcionario/{id}   # Reporte individual de funcionario
```

### Carga Masiva

```
POST   /api/v1/cargas/usuarios        # Cargar usuarios desde archivo
POST   /api/v1/cargas/concertaciones  # Cargar concertaciones desde archivo
POST   /api/v1/cargas/evaluaciones    # Cargar evaluaciones desde archivo
POST   /api/v1/cargas/cursos          # Cargar cursos desde archivo
GET    /api/v1/cargas                  # Historial de cargas masivas
```

### Otros

```
GET    /api/v1/menu                    # Menu dinamico por rol
GET    /api/v1/notificaciones          # Listar notificaciones
PUT    /api/v1/notificaciones/{id}/leer  # Marcar como leida
GET    /api/v1/parametros             # Listar parametros
GET    /api/v1/parametros/{clave}     # Ver parametro por clave
POST   /api/v1/parametros             # Crear o actualizar parametro
PUT    /api/v1/parametros/masivo      # Actualizar parametros en lote
PUT    /api/v1/parametros/{id}        # Actualizar parametro
DELETE /api/v1/parametros/{id}        # Eliminar parametro
GET    /api/v1/consulta-funcionario/{documento}  # Consulta publica
```


## Instalacion

### Requisitos

- PHP >= 8.2 con extensiones: pdo_mysql, mbstring, openssl, json
- MariaDB >= 10.6 o MySQL >= 8.0
- Node.js >= 18 y npm >= 9
- Composer >= 2

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Base de datos

```bash
# Crear esquema y tablas (23 tablas con foreign keys e indices)
sudo mysql < database/schema.sql

# Cargar datos semilla: roles, permisos, rol-permiso, parametros
sudo mysql edl_carepa < database/seeds.sql

# Cargar datos de demostracion (opcional)
sudo mysql edl_carepa < database/seed_usuarios.sql

# Aplicar migraciones incrementales
sudo mysql edl_carepa < database/migration_compromisos.sql
sudo mysql edl_carepa < database/migration_edl_carepa.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con credenciales de BD y SMTP
composer install
php -S localhost:8000 -t public/
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Acceder

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/v1


## Credenciales de Demostracion

Los datos de demostracion se crean con `database/seed_usuarios.sql`. Las contrasenas deben regenerarse con `php password_hash()` antes de usarlas en produccion.

| Usuario | Correo | Contrasena | Rol |
|---------|--------|-----------|-----|
| Admin | Crear con `reset_admin.php` | -- | admin |
| Maria Rodriguez | maria.rodriguez@carepa.gov.co | Eval2026! | Evaluador |
| Andrea Sanchez | andrea.sanchez@carepa.gov.co | Jefe2026! | Evaluador |
| Juan Gomez | juan.gomez@carepa.gov.co | Func2026! | Evaluado |


## Identidad Visual

| Elemento | Valor |
|----------|-------|
| Azul institucional | `#003366` / `#0A2B5E` |
| Rojo institucional | `#C4282B` |
| Verde institucional | `#1E5A3C` |
| Tipografia titulos | Montserrat (700, 800) |
| Tipografia cuerpo | Inter (300--700) |
| Escudo | Escudo del Municipio de Carepa (1983) |


## Licencia

Proyecto de uso interno -- Alcaldia de Carepa, Antioquia

"Trabajo y Teson" -- Lema del Municipio de Carepa, 1983

---

<div align="center">

**Alcaldia de Carepa** -- Carepa, Antioquia, Colombia

</div>
