<div align="center">

# EDL-Carepa

### Sistema de Evaluacion del Desempeno Laboral

**Alcaldia de Carepa -- Antioquia, Colombia**

<img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php" alt="PHP 8.2+" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5.8" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS 3" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL 8.0" />

---

</div>


## Descripcion

Plataforma web para la Evaluacion del Desempeno Laboral (EDL) de los servidores publicos de la Alcaldia de Carepa, implementada conforme al Acuerdo 6176 de 2018 y los lineamientos del Departamento Administrativo de la Funcion Publica.

Gestiona el ciclo completo de evaluacion: concertacion de compromisos funcionales y comportamentales, seguimiento mediante evidencias, calificacion parcial y definitiva, aprobacion por comision evaluadora, y retroalimentacion. Los flujos de trabajo se diferencian por rol: evaluado propone compromisos, evaluador aprueba y califica, administrador gestiona el sistema.


## Caracteristicas Principales

- Autenticacion JWT con bloqueo automatico por intentos fallidos y recuperacion de contraseña por correo
- Control de acceso granular: 3 roles base, 51 permisos, 84 asignaciones rol-permiso
- Concertacion de compromisos funcionales y comportamentales con pesos porcentuales (maximo 100% por evaluacion)
- Evaluaciones parciales (semestrales/eventuales) y definitivas, con aprobacion de comision evaluadora
- Carga masiva de usuarios, concertaciones, evaluaciones y cursos desde archivos
- Notificaciones en tiempo real con polling cada 30 segundos
- Auditoria completa de todas las operaciones CUD del sistema
- Identidad visual institucional de la Alcaldia de Carepa (colores, tipografia, escudo)
- Soft delete global en todas las tablas operativas
- Headers de seguridad HTTP (CSP, X-Frame-Options, HSTS, etc.)


## Arquitectura

```
+------------------------------------------------------+
| FRONTEND (React 19 SPA)                              |
| React 19 + TypeScript 5.8 + TailwindCSS 3 + Vite 6  |
| Puerto 5173 (desarrollo)                             |
| fetch nativo · JWT en localStorage · Context API     |
+----------------------------+-------------------------+
                             | REST API (JSON)
                             v
+------------------------------------------------------+
| BACKEND (PHP 8.2+)                                   |
| Router propio · Controller · Service · Repository    |
| Firebase JWT 6.11 · PHPMailer 7.1                    |
| Puerto 8000 (PHP built-in server)                    |
+----------------------------+-------------------------+
                             | PDO MySQL
                             v
+------------------------------------------------------+
| MariaDB >= 10.6 / MySQL >= 8.0                       |
| Base de datos: edl_carepa                            |
| 23 tablas · Foreign Keys · Indices · Soft delete     |
+------------------------------------------------------+
```

Patron arquitectonico del backend: Controller -> Service -> Repository en tres capas, sin framework. El Router propio registra rutas con grupos, prefijos y middleware acumulativo. BaseRepository provee CRUD generico con paginacion y soft delete. Todos los controllers delegan logica a services, y los services a repositories.


## Estructura del Proyecto

```
edl-carepa/
|
+-- .github/
|   +-- workflows/
|       +-- deploy.yml            # CI/CD: build + deploy frontend a GitHub Pages
|
+-- backend/                      # API REST PHP
|   +-- composer.json             # Dependencias: firebase/php-jwt ^6.11, phpmailer/phpmailer ^7.1
|   +-- .env                      # Variables de entorno (no versionado)
|   +-- .env.example              # Plantilla de configuracion
|   +-- .htaccess                 # Reglas Apache: reescritura a public/index.php
|   +-- reset_admin.php           # Script CLI: restablecer clave del administrador
|   |
|   +-- public/                   # Document root del servidor web
|   |   +-- index.php             # Entry point: carga env, DB, registra rutas, despacha
|   |
|   +-- src/                      # Codigo fuente (PSR-4: App\ -> src/)
|   |   +-- Config/               # Database.php (Singleton PDO), Env.php (cargador .env)
|   |   +-- Controller/           # 16 controladores HTTP
|   |   +-- Helper/               # JwtHelper, MailHelper, ResponseHelper, SanitizerHelper, ValidatorHelper, IpHelper, HttpException
|   |   +-- Middleware/            # Auth, CORS, Permission, RateLimit, SecurityHeaders, Tenant
|   |   +-- Model/                # 12 modelos de dominio (Usuario, Evaluacion, Compromiso, etc.)
|   |   +-- Repository/           # BaseRepository + 15 repositorios especificos
|   |   +-- Router/               # Router.php: registro y despacho con grupos y middleware
|   |   +-- Service/              # 16 servicios de logica de negocio
|   |
|   +-- storage/                  # Archivos subidos (cargas masivas, evidencias)
|   +-- vendor/                   # Dependencias Composer (no versionado)
|
+-- database/                     # Scripts SQL
|   +-- schema.sql                # Esquema completo: 23 tablas, FK, indices, triggers
|   +-- seeds.sql                 # Datos semilla: roles, permisos, parametros
|   +-- seed_usuarios.sql         # Datos de demostracion: entidad, dependencias, usuarios
|   +-- migration_compromisos.sql # Migracion: campos de peso y estados en compromisos
|   +-- migration_edl_carepa.sql  # Migracion: adaptacion al Acuerdo 6176 (roles, enums)
|
+-- docs/                         # Documentacion estatica (GitHub Pages)
|
+-- frontend/                     # SPA React 19
    +-- index.html                # HTML base con montaje React
    +-- package.json              # Dependencias: react 19, react-router-dom 7, tailwindcss 3, vite 6
    +-- vite.config.ts            # Proxy /api/v1 -> localhost:8000
    +-- tailwind.config.js        # Colores institucionales, fuentes, tema custom
    +-- tsconfig.json             # TypeScript strict + ESNext + path alias @/
    |
    +-- public/
    |   +-- escudo.png            # Escudo del municipio de Carepa
    |
    +-- src/
        +-- main.tsx              # Punto de entrada
        +-- App.tsx               # Router principal con rutas protegidas
        +-- index.css             # TailwindCSS + componentes CSS institucionales
        +-- contexts/AuthContext.tsx  # Estado global de autenticacion
        +-- lib/api.ts            # Cliente HTTP con interceptor JWT
        +-- lib/auth.ts           # Funciones auxiliares de autenticacion
        +-- components/Layout/    # Layout.tsx, Sidebar.tsx
        +-- components/Shared/    # DataTable.tsx, AppHeader.tsx, NotificationBell.tsx, RoleSelector.tsx
        +-- pages/                # Paginas organizadas por modulo
            +-- Login.tsx, Dashboard.tsx, SelectRolePage.tsx
            +-- Admin/            # AdminHome, AdminDashboard, AdminUsuarios, AdminEvaluaciones, AdminDependencias, AdminNotificaciones, AdminReportes, AdminConfiguracion
            +-- Compromisos/      # MisCompromisos, AprobarCompromisos, CompromisosYCompetencias
            +-- Concertaciones/   # ConcertacionList
            +-- Entidades/        # EntidadList
            +-- Evaluaciones/     # EvaluacionList, EvaluarPage, PanelEvaluador
            +-- Evidencias/       # EvidenciaList
            +-- Metas/            # MetaList
            +-- Periodos/         # PeriodoList
            +-- Reportes/         # ReportesPage
            +-- Usuarios/         # UsuarioList
```


## Base de Datos

La base de datos `edl_carepa` contiene 23 tablas con foreign keys, indices optimizados y soft delete (`eliminado_en`) en todas las tablas operativas.

| Tabla | Descripcion | Relaciones |
|-------|-------------|------------|
| `usuarios` | Servidores publicos del municipio | FK a entidades, dependencias |
| `roles` | Roles del sistema (admin, evaluador, evaluado) | -- |
| `permisos` | Permisos granulares por modulo (51 total) | -- |
| `rol_permiso` | Asignacion permiso-rol (84 registros) | FK a roles, permisos |
| `usuario_rol` | Asignacion rol-usuario con entidad | FK a usuarios, roles |
| `entidades` | Entidades organizaciónales | -- |
| `dependencias` | Dependencias por entidad | FK a entidades, usuarios (jefe) |
| `periodos` | Periodos evaluativos con fases de concertacion, seguimiento y evaluacion | -- |
| `metas` | Metas de desempeño por periodo | FK a periodos, usuarios |
| `concertaciones` | Concertaciones de metas | FK a metas, usuarios |
| `evaluaciones` | Evaluaciones de desempeño (parcial/definitiva) | FK a periodos, usuarios |
| `compromisos` | Compromisos funcionales y comportamentales | FK a evaluaciones, usuarios |
| `evidencias` | Archivos de evidencia | FK a metas, compromisos, usuarios |
| `ausentismos` | Registros de ausentismo | FK a usuarios |
| `movilidades` | Movimientos de personal | FK a usuarios, entidades, dependencias |
| `notificaciones` | Alertas del sistema | FK a usuarios |
| `cargas_masivas` | Historial de cargas por archivo | FK a usuarios |
| `parametros` | Configuracion del sistema (clave-valor) | -- |
| `auditoria` | Registro de acciones del sistema | Sin FK formal (indice sobre usuario_id) |
| `sesiones` | Sesiones JWT activas (hash SHA256) | FK a usuarios |
| `recuperaciones` | Tokens de recuperacion de contraseña | FK a usuarios |
| `cursos_induccion` | Cursos de induccion programados | FK a entidades |
| `curso_participantes` | Participantes en cursos | FK a cursos, usuarios |

**Enums principales:**

| Tabla.Columna | Valores |
|---------------|---------|
| `usuarios.estado` | activo, inactivo, bloqueado |
| `usuarios.tipo_vinculacion` | planta, contrato, provisional, encargo, comision |
| `evaluaciones.tipo` | parcial_semestral, parcial_eventual, definitiva |
| `evaluaciones.estado` | pendiente, concertacion, en_proceso, calificada, aprobada_comision, cerrada |
| `compromisos.tipo` | funcional, comportamental |
| `compromisos.estado` | propuesto, aprobado, devuelto, en_progreso, cumplido, incumplido, vencido |
| `periodos.estado` | configuracion, concertacion, seguimiento, evaluacion, calificacion, cerrado |
| `entidades.tipo` | entidad, organismo, instituto, superintendencia, agencia, otro |


## Roles del Sistema

| Rol | Codigo | Permisos | Descripcion |
|-----|--------|----------|-------------|
| Administrador | `admin` | 52 (casi todos) | Gestion global del sistema: usuarios, parametros, entidades, soporte |
| Evaluador | `evaluador` | 22 | Evalua desempeño de funcionarios. Aprueba compromisos y califica resultados |
| Evaluado | `evaluado` | 11 | Servidor publico sujeto a evaluacion. Propone compromisos y registra evidencias |

Nota: El modelo de roles contempla adicionalmente `admin_entidad`, `admin_carepa` y `comision_evaluadora` en la migracion `migration_edl_carepa.sql` y en el frontend (RoleSelector), pero no estan activos en los datos semilla base. Pendiente de activacion segun requerimiento.


## API Endpoints

Prefijo base: `/api/v1`. Formato de respuesta: `{ "code": "01"|"02", "message": "...", "data": ... }` donde `01` = exito, `02` = error. Paginacion con parametros `pagina` y `por_pagina`.

### Autenticacion (publicas, sin token)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesion (documento + contraseña) |
| POST | `/api/v1/auth/registro` | Registrar cuenta nueva |
| POST | `/api/v1/auth/recuperar` | Solicitar codigo de recuperacion por correo |
| POST | `/api/v1/auth/verificar-codigo` | Verificar codigo de 6 digitos |
| PUT | `/api/v1/auth/recuperar/{token}` | Establecer nueva contraseña |

### Autenticacion (protegidas)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/v1/auth/logout` | Cerrar sesion (revoca token) |
| GET | `/api/v1/auth/perfil` | Datos del usuario actual |
| PUT | `/api/v1/auth/perfil` | Actualizar perfil |
| PUT | `/api/v1/auth/password` | Cambiar contraseña |
| PUT | `/api/v1/auth/rol` | Cambiar rol activo |

### Dashboard

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/dashboard/resumen` | Resumen general del usuario |
| GET | `/api/v1/dashboard/admin-stats` | Estadisticas administrativas |
| GET | `/api/v1/dashboard/actividad` | Actividad reciente |

### Usuarios

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/usuarios` | `usuarios.listar` | Listar usuarios (paginado) |
| POST | `/api/v1/usuarios` | `usuarios.crear` | Crear usuario |
| GET | `/api/v1/usuarios/{id}` | `usuarios.listar` | Ver detalle |
| PUT | `/api/v1/usuarios/{id}` | `usuarios.editar` | Actualizar usuario |
| DELETE | `/api/v1/usuarios/{id}` | `usuarios.editar` | Eliminar usuario (soft delete) |

### Entidades

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/entidades` | `entidades.listar` | Listar entidades |
| POST | `/api/v1/entidades` | `entidades.crear` | Crear entidad |
| GET | `/api/v1/entidades/{id}` | `entidades.listar` | Ver entidad |
| PUT | `/api/v1/entidades/{id}` | `entidades.editar` | Actualizar entidad |
| DELETE | `/api/v1/entidades/{id}` | `entidades.eliminar` | Eliminar entidad |
| GET | `/api/v1/entidades/{id}/jefes` | `entidades.listar` | Jefes de la entidad |
| GET | `/api/v1/entidades/{id}/dependencias` | `dependencias.listar` | Dependencias de la entidad |

### Dependencias

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/dependencias` | `dependencias.listar` | Listar dependencias |
| POST | `/api/v1/dependencias` | `dependencias.crear` | Crear dependencia |
| GET | `/api/v1/dependencias/{id}` | `dependencias.listar` | Ver dependencia |
| PUT | `/api/v1/dependencias/{id}` | `dependencias.editar` | Actualizar dependencia |
| DELETE | `/api/v1/dependencias/{id}` | `dependencias.editar` | Eliminar dependencia |

### Periodos

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/periodos` | `periodos.listar` | Listar periodos |
| POST | `/api/v1/periodos` | `periodos.crear` | Crear periodo |
| GET | `/api/v1/periodos/{id}` | `periodos.listar` | Ver periodo |
| PUT | `/api/v1/periodos/{id}` | `periodos.editar` | Actualizar periodo |
| GET | `/api/v1/periodos/{id}/metas` | `metas.listar` | Metas del periodo |
| GET | `/api/v1/periodos/{id}/evaluaciones` | `evaluaciones.listar` | Evaluaciones del periodo |

### Metas

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/metas` | `metas.listar` | Listar metas |
| POST | `/api/v1/metas` | `metas.crear` | Crear meta |
| GET | `/api/v1/metas/{id}` | `metas.listar` | Ver meta |
| PUT | `/api/v1/metas/{id}` | `metas.editar` | Actualizar meta |
| GET | `/api/v1/metas/{id}/evidencias` | `evidencias.listar` | Evidencias de la meta |
| POST | `/api/v1/metas/{id}/concertacion` | `concertaciones.crear` | Crear concertacion |

### Concertaciones

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/concertaciones` | `concertaciones.listar` | Listar concertaciones |
| PUT | `/api/v1/concertaciones/{id}` | `concertaciones.crear` | Actualizar concertacion |

### Evaluaciones

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/evaluaciones` | `evaluaciones.listar` | Listar evaluaciones |
| POST | `/api/v1/evaluaciones` | `evaluaciones.crear` | Crear evaluacion |
| GET | `/api/v1/evaluaciones/{id}` | `evaluaciones.listar` | Ver detalle |
| PUT | `/api/v1/evaluaciones/{id}` | `evaluaciones.evaluar` | Calificar evaluacion |
| GET | `/api/v1/evaluaciones/{id}/compromisos` | `compromisos.listar` | Compromisos de la evaluacion |
| POST | `/api/v1/evaluaciones/{id}/compromisos` | `compromisos.crear` | Crear compromiso |
| POST | `/api/v1/evaluaciones/{id}/parcial` | `evaluaciones.crear` | Crear evaluacion parcial |
| PUT | `/api/v1/evaluaciones/{id}/definitiva` | `evaluaciones.evaluar` | Calificar definitiva (puntaje 0-100) |
| PUT | `/api/v1/evaluaciones/{id}/comision` | `evaluaciones.comision` | Aprobar por comision evaluadora |
| GET | `/api/v1/evaluaciones/pendientes-calificar` | `evaluaciones.evaluar` | Evaluaciones pendientes del evaluador |

### Compromisos

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/compromisos` | `compromisos.listar` | Listar compromisos |
| POST | `/api/v1/compromisos/enviar` | `compromisos.enviar` | Proponer compromiso (evaluado) |
| GET | `/api/v1/compromisos/pendientes` | `compromisos.aprobar` | Pendientes de aprobacion |
| PUT | `/api/v1/compromisos/{id}/aprobar` | `compromisos.aprobar` | Aprobar compromiso (asigna peso) |
| PUT | `/api/v1/compromisos/{id}/rechazar` | `compromisos.aprobar` | Rechazar compromiso |
| PUT | `/api/v1/compromisos/{id}/devolver` | `compromisos.aprobar` | Devolver compromiso al evaluado |
| PUT | `/api/v1/compromisos/{id}/calificar` | `evaluaciones.evaluar` | Calificar cumplimiento (>=60 cumplido) |
| GET | `/api/v1/compromisos/{id}/pesos` | `compromisos.listar` | Resumen de pesos por evaluacion |
| PUT | `/api/v1/compromisos/{id}` | `compromisos.editar` | Actualizar compromiso |

### Evidencias

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/evidencias` | `evidencias.listar` | Listar evidencias |
| POST | `/api/v1/evidencias` | `evidencias.subir` | Subir evidencia (multipart) |
| PUT | `/api/v1/evidencias/{id}/verificar` | `evidencias.verificar` | Verificar o rechazar evidencia |

### Ausentismos

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/ausentismos` | `ausentismos.listar` | Listar ausentismos |
| POST | `/api/v1/ausentismos` | `ausentismos.crear` | Registrar ausentismo |
| PUT | `/api/v1/ausentismos/{id}` | `ausentismos.editar` | Actualizar ausentismo |

### Movilidades

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/movilidades` | `movilidades.listar` | Listar movilidades |
| POST | `/api/v1/movilidades` | `movilidades.crear` | Registrar movilidad |
| PUT | `/api/v1/movilidades/{id}` | `movilidades.editar` | Actualizar movilidad |

### Reportes

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| GET | `/api/v1/reportes/concertacion` | `reportes.generar` | Reporte de concertaciones |
| GET | `/api/v1/reportes/evaluaciones` | `reportes.generar` | Reporte de evaluaciones |
| GET | `/api/v1/reportes/funcionario/{id}` | `reportes.generar` | Reporte individual |

### Carga Masiva

| Metodo | Ruta | Permiso | Descripcion |
|--------|------|---------|-------------|
| POST | `/api/v1/cargas/usuarios` | `cargas.ejecutar` | Cargar usuarios desde archivo |
| POST | `/api/v1/cargas/concertaciones` | `cargas.ejecutar` | Cargar concertaciones |
| POST | `/api/v1/cargas/evaluaciones` | `cargas.ejecutar` | Cargar evaluaciones |
| POST | `/api/v1/cargas/cursos` | `cargas.ejecutar` | Cargar cursos |
| GET | `/api/v1/cargas` | `cargas.listar` | Historial de cargas |

### Otros

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/menu` | Menu dinamico segun rol activo |
| GET | `/api/v1/notificaciones` | Listar notificaciones del usuario |
| PUT | `/api/v1/notificaciones/{id}/leer` | Marcar como leida |
| GET | `/api/v1/parametros` | Listar parametros del sistema |
| GET | `/api/v1/parametros/{clave}` | Ver parametro por clave |
| POST | `/api/v1/parametros` | Crear o actualizar parametro |
| PUT | `/api/v1/parametros/masivo` | Actualizar parametros en lote |
| PUT | `/api/v1/parametros/{id}` | Actualizar parametro |
| DELETE | `/api/v1/parametros/{id}` | Eliminar parametro |
| GET | `/api/v1/consulta-funcionario/{documento}` | Consulta publica por documento |


## Requisitos Previos

| Componente | Version minima | Extensiones/modulos requeridos |
|------------|---------------|-------------------------------|
| PHP | 8.2+ | pdo_mysql, mbstring, openssl, json, ctype, filter, hash, fileinfo |
| MariaDB / MySQL | 10.6+ / 8.0+ | -- |
| Node.js | 18+ | npm >= 9 |
| Composer | 2+ | -- |
| Servidor web | Apache o PHP built-in | mod_rewrite (si se usa Apache) |

Dependencias PHP (composer): `firebase/php-jwt ^6.11`, `phpmailer/phpmailer ^7.1`

Dependencias frontend (npm): `react ^19.1`, `react-dom ^19.1`, `react-router-dom ^7.6`, `tailwindcss ^3.4`, `vite ^6.3`, `typescript ^5.8`


## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Base de datos

```bash
# Crear base de datos y esquema (23 tablas con FK e indices)
mysql -u root -p < database/schema.sql

# Cargar datos semilla: roles, permisos, parametros
mysql -u root -p edl_carepa < database/seeds.sql

# Cargar datos de demostracion (opcional, para desarrollo)
mysql -u root -p edl_carepa < database/seed_usuarios.sql

# Aplicar migraciones incrementales (orden requerido)
mysql -u root -p edl_carepa < database/migration_edl_carepa.sql
```

**Nota sobre migraciones:** `migration_compromisos.sql` contiene una version anterior del enum de compromisos que contradice el esquema final de `schema.sql`. Si se ejecuta sobre una base de datos ya migrada con `migration_edl_carepa.sql`, revertira estados del enum. Solo debe aplicarse sobre bases de datos que no hayan ejecutado `migration_edl_carepa.sql`. Para instalaciones nuevas, solo se necesita `schema.sql` + `seeds.sql` + `migration_edl_carepa.sql`.

**Nota sobre seeds:** El parametro `jwt_secret` en `seeds.sql` contiene el placeholder `{jwt_secret}` que debe reemplazarse con una clave aleatoria de 64 caracteres hexadecimales antes de ejecutar el script.

### 3. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con los valores reales (ver seccion Variables de Entorno)
composer install
php -S localhost:8000 -t public/
```

Para produccion con Apache, configurar el DocumentRoot apuntando a `backend/public/` y verificar que `.htaccess` este habilitado con `AllowOverride All`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Acceder

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/v1


## Variables de Entorno

Archivo: `backend/.env` (copiar desde `.env.example` y ajustar)

| Variable | Ejemplo | Descripcion |
|----------|---------|-------------|
| `APP_ENV` | `development` | Entorno de ejecucion (development/production) |
| `DB_HOST` | `localhost` | Host de la base de datos |
| `DB_PORT` | `3306` | Puerto de la base de datos |
| `DB_NAME` | `edl_carepa` | Nombre de la base de datos |
| `DB_USER` | `edl_user` | Usuario de la base de datos |
| `DB_PASS` | `(contraseña segura)` | Contrasena del usuario de BD |
| `JWT_SECRET` | `(clave hex 64 chars)` | Clave de firma de tokens JWT HS256 |
| `JWT_EXPIRACION_MINUTOS` | `120` | Tiempo de expiracion del token en minutos |
| `APP_TIMEZONE` | `America/Bogota` | Zona horaria de la aplicacion |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido para CORS |
| `APP_API_URL` | `http://localhost:8000` | URL base de la API |
| `APP_FRONTEND_URL` | `http://localhost:5173` | URL base del frontend |
| `APP_DEBUG` | `false` | Modo debug (true/false) |
| `SMTP_HOST` | `smtp.gmail.com` | Host del servidor SMTP |
| `SMTP_PORT` | `587` | Puerto SMTP (587 para TLS) |
| `SMTP_USER` | `(correo)` | Usuario SMTP |
| `SMTP_PASS` | `(app password)` | Contrasena de aplicacion SMTP |
| `SMTP_FROM` | `noreply@carepa.gov.co` | Correo remitente |
| `SMTP_FROM_NAME` | `EDL Carepa` | Nombre del remitente |
| `UPLOAD_MAX_SIZE` | `50` | Tamano maximo de archivos en MB |
| `UPLOAD_ALLOWED_EXTENSIONS` | `pdf,doc,docx,xls,xlsx,jpg,png` | Extensiones permitidas |

**Nota sobre inconsistencia:** `.env.example` define `JWT_EXPIRATION=3600` (en segundos), pero el codigo del backend lee `JWT_EXPIRACION_MINUTOS` (en minutos, default 120). Los nombres y unidades no coinciden. Usar `JWT_EXPIRACION_MINUTOS` en el `.env` real, que es lo que lee `JwtHelper`.

**Variables faltantes en .env.example:** El archivo `.env.example` actual no incluye `DB_PORT`, `CORS_ORIGIN`, `APP_API_URL`, `APP_FRONTEND_URL`, `APP_DEBUG`, ni las variables SMTP. Deben agregarse manualmente al `.env` de produccion. Pendiente de actualizacion en `.env.example`.


## Ejecucion en Desarrollo

### Backend (PHP built-in server)

```bash
cd backend
php -S localhost:8000 -t public/
```

El servidor queda escuchando en `http://localhost:8000`. Las rutas API estan bajo `/api/v1/`.

### Frontend (Vite dev server)

```bash
cd frontend
npm run dev
```

El servidor de Vite corre en `http://localhost:5173` y proxy automaticamente las peticiones a `/api/v1/*` hacia `http://localhost:8000` (configurado en `vite.config.ts`).

### Orden de inicio

1. Asegurar que MySQL/MariaDB este corriendo
2. Iniciar el backend en el puerto 8000
3. Iniciar el frontend en el puerto 5173


## Build de Produccion

### Frontend

```bash
cd frontend
npm run build
```

Genera archivos estaticos en `frontend/dist/`. Servir con cualquier servidor web (Nginx, Apache, Caddy) configurado para SPA (todas las rutas redirigen a `index.html`).

### Backend

No requiere build. El codigo PHP se sirve directamente. Para produccion:

- Usar PHP-FPM con Nginx o Apache + mod_php
- Configurar `APP_ENV=production` y `APP_DEBUG=false` en `.env`
- Deshabilitar `display_errors` en `php.ini`
- Configurar opcache para rendimiento


## Pruebas

### Pruebas manuales de API

El archivo `test_api.py` en la raiz del proyecto contiene un script Python con pruebas funcionales de los endpoints principales. Requiere `requests` instalado.

```bash
pip install requests
python3 test_api.py
```

### Pruebas del frontend

No hay suite de pruebas automatizadas configurada para el frontend. Pendiente de implementar.


## Despliegue

### GitHub Pages (frontend unicamente)

El workflow `.github/workflows/deploy.yml` despliega automaticamente el frontend a GitHub Pages en cada push a `main`. Realiza:

1. Checkout del codigo
2. Instalacion de dependencias con `npm ci`
3. Build con `npm run build`
4. Subida del artefacto desde `frontend/dist/`
5. Deploy a GitHub Pages

**Limitaciones conocidas del CI/CD:**
- Solo despliega el frontend. El backend y la base de datos requieren despliegue manual.
- No hay pipeline para el backend PHP.
- No hay pipeline para migraciones de base de datos.
- El nombre del workflow dice "Deploy EDL-CNSC Frontend" en lugar de "Deploy EDL-Carepa" (error pendiente de correccion).

### Despliegue manual del backend

1. Copiar archivos del backend al servidor
2. Ejecutar `composer install --no-dev --optimize-autoloader`
3. Configurar `.env` con credenciales de produccion
4. Configurar el servidor web (Apache/Nginx) con DocumentRoot en `backend/public/`
5. Ejecutar migraciones SQL pendientes
6. Crear el usuario admin con `php backend/reset_admin.php` o via SQL

### Despliegue de base de datos

Orden para instalaciones nuevas:
1. `schema.sql` (crea tablas)
2. `seeds.sql` (inserta roles, permisos, parametros)
3. `migration_edl_carepa.sql` (adapta al Acuerdo 6176)

Para actualizaciones sobre una BD existente, evaluar las migraciones pendientes segun el estado actual de los enums y datos.


## Credenciales de Demostracion

Los datos de demostracion se cargan con `database/seed_usuarios.sql`. El usuario admin se crea manualmente o con `backend/reset_admin.php`.

| Usuario | Documento | Email | Contrasena | Rol |
|---------|-----------|-------|-----------|-----|
| Administrador | 1234567890 | admin@carepa.gov.co | Admin2026! | admin |
| Maria Rodriguez | 1000000002 | maria.rodriguez@carepa.gov.co | (ver seed) | Evaluador |
| Juan Gomez | 1000000004 | juan.gomez@carepa.gov.co | (ver seed) | Evaluado |

**Advertencia:** Las contraseñas del archivo `seed_usuarios.sql` estan hasheadas con bcrypt. El usuario admin se creo con `reset_admin.php` o insercion directa. Cambiar todas las contraseñas antes de desplegar en produccion.


## Convenciones del Proyecto

### Backend

- Autoloading PSR-4: namespace `App\` mapeado a `src/`
- Patron Controller -> Service -> Repository (3 capas)
- Respuestas JSON uniformes: `ResponseHelper::success()` / `ResponseHelper::error()` con estructura `{code, message, data}`
- Codigos de respuesta: `01` = exito, `02` = error
- Paginacion estandar: parametros `pagina` y `por_pagina`, respuesta incluye `total_paginas`
- Soft delete global: campo `eliminado_en` en todas las tablas operativas, `BaseRepository::eliminar()` hace UPDATE, no DELETE
- Sanitizacion de entrada: `SanitizerHelper::sanitizeArray()` (trim + stripslashes) en todos los requests
- Validacion tipo Laravel: `ValidatorHelper` con reglas como `required|email|min:6`
- Auditoria automatica: `AuditoriaService::registrar()` en cada operacion CUD
- JWT HS256 con sesion en BD (tabla `sesiones`, hash SHA256 del token)
- Middleware acumulativo por grupo: CORS + SecurityHeaders + RateLimit (global), Auth (protegidas), Permission (por ruta)
- Rate limiting: 60 peticiones / 60 segundos por IP (almacenado en filesystem temporal)
- Zona horaria: America/Bogota, mensajes en espanol
- Sin comentarios en el codigo PHP

### Frontend

- TypeScript strict mode con ESNext + path alias `@/` -> `src/`
- Componentes funcionales con export default
- Estado global via React Context (AuthContext)
- Variables en espanol (cargando, guardando, modalAbierto, etc.)
- Cliente HTTP con `fetch` nativo (sin axios)
- JWT almacenado en localStorage (`edl_token`, `edl_user`, `edl_rol_activo`)
- Componentes CSS institucionales en `index.css` (`@layer components`): `.edl-card`, `.edl-btn`, `.edl-input`, `.edl-table`, `.edl-badge`
- Navegacion con react-router-dom v7 (BrowserRouter)
- Sin ESLint ni Prettier configurados (pendiente)

### Base de datos

- Tablas en minusculas, plural en espanol
- PK: `id` (bigint autoincrement)
- Timestamps: `creado_en`, `actualizado_en` (datetime), `elimado_en` (datetime, nullable para soft delete)
- Enums para estados y tipos
- Unique keys con prefijo `uk_`, indices con prefijo `idx_`


## Identidad Visual

| Elemento | Token Tailwind | Valor Hex | Uso |
|----------|---------------|-----------|-----|
| Azul institucional | `inst-azul` | `#0A2B5E` | Color primario, fondos oscuros, botones principales |
| Rojo institucional | `inst-rojo` | `#C4282B` | Acento, peligro, separadores decorativos |
| Verde institucional | `inst-verde` | `#1E5A3C` | Exito, indicadores positivos |
| Fondo principal | `inst-fondo` | `#FFFFFF` | Fondos de tarjetas y paginas |
| Fondo alternativo | `inst-gris` | `#F8FAFC` | Fondos de secciones alternas |
| Bordes | `inst-borde` | `#E2E8F0` | Bordes de tarjetas y tablas |
| Texto principal | `inst-texto` | `#334155` | Texto de parrafos y contenido |
| Texto secundario | `inst-texto-claro` | `#64748B` | Subtitulos, labels, placeholders |

| Tipografia | Fuente | Pesos | Uso |
|------------|--------|-------|-----|
| Titulos | Montserrat | 700, 800 | Encabezados, nombre del sistema |
| Cuerpo | Inter | 300--700 | Texto de contenido, formularios, tablas |

Iconos: Material Icons (cargado via Google Fonts en `index.html`).

Escudo: Escudo del Municipio de Carepa (1983), ubicado en `frontend/public/escudo.png`.


## Problemas Conocidos y Pendientes

### Criticos

1. **`Database.php` usa constante inexistente:** `\Pdo\Mysql::ATTR_FOUND_ROWS` no existe en PHP. La constante correcta es `PDO::MYSQL_ATTR_FOUND_ROWS`. Provoca Fatal Error en runtime.
2. **Conflicto de rutas en evaluaciones:** `GET /evaluaciones/pendientes-calificar` se registra despues de `GET /evaluaciones/{id}`, por lo que el patron `{id}` captura "pendientes-calificar" como un ID. La ruta estatica nunca se alcanza.
3. **Modelos PHP incompletos:** `Evaluacion` y `Compromiso` no incluyen todas las propiedades que usan sus respectivos Services y Controllers (campos agregados en migraciones posteriores).
4. **Inconsistencia en variable JWT:** `.env.example` define `JWT_EXPIRATION` (segundos), pero `JwtHelper` lee `JWT_EXPIRACION_MINUTOS` (minutos). El nombre y la unidad no coinciden.

### Medios

5. **Rate limit en filesystem:** `RateLimitMiddleware` usa `sys_get_temp_dir()` para almacenar contadores. No funciona en entornos multi-servidor ni en contenedores efimeros.
6. **`reset_admin.php` accesible via web:** Contiene credenciales hardcodeadas y esta en la raiz del backend. Deberia estar fuera del document root o protegido.
7. **CorsMiddleware se ejecuta dos veces:** Una en `index.php` antes del dispatch (para OPTIONS) y otra como middleware del grupo. La del grupo nunca se ejecuta para OPTIONS porque la primera hace `exit`.
8. **Rutas duplicadas en frontend:** `/evaluar` y `/panel-evaluador` apuntan al mismo componente `PanelEvaluador`.
9. **`AdminConfiguracion.tsx` no tiene ruta** en `App.tsx`. Pagina huerfana.
10. **Colores hardcoded en Admin:** Las paginas de administracion usan `#003366` en vez del token `inst-azul` (`#0A2B5E`), causando inconsistencia visual.
11. **Redireccion 401 via `window.location.href`:** En `api.ts`, al recibir 401 se hace un reload completo de la app en vez de usar React Router, perdiendo todo el estado.
12. **Links hash en Dashboard:** Usa `<a href="#/compromisos/aprobar">` en vez de `<Link to="/compromisos/aprobar">` de React Router. No funcionan con BrowserRouter.
13. **Roles fantasma en ProtectedRoute:** `App.tsx` permite `jefe_entidad` y `jefe_dependencia` en la ruta `/admin`, pero estos roles no existen en los seeds ni en RoleSelector.
14. **DashboardController usa `query()` sin prepared statements** en algunas consultas.

### Menores

15. **`.env.example` incompleto:** Faltan variables SMTP, CORS_ORIGIN, DB_PORT, APP_API_URL, APP_FRONTEND_URL, APP_DEBUG.
16. **Password real en `.env.example`:** `DB_PASS=Edl2026!Secure` no deberia estar en el ejemplo.
17. **`.gitignore` incompleto:** Falta `backend/.env`, `.idea/`, `.vscode/`, `dist/`, `coverage/`, `storage/`, duplicados de `node_modules/` y `vendor/`.
18. **Indice duplicado en compromisos:** `idx_estado` y `idx_compromisos_estado` son identicos.
19. **No hay ESLint/Prettier** configurados en el frontend.
20. **No hay refresh token** implementado. Al expirar el JWT, el usuario es redirigido a login sin aviso previo.
21. **`seed_usuarios.sql` referencia `rol_id` 4 y 5** que no existen en `seeds.sql`.
22. **Nombre del workflow CI/CD:** Dice "Deploy EDL-CNSC Frontend" en vez de "Deploy EDL-Carepa".


## Licencia

Proyecto de uso interno -- Alcaldia de Carepa, Antioquia

"Trabajo y Teson" -- Lema del Municipio de Carepa, 1983

---

<div align="center">

**Alcaldia de Carepa** -- Carepa, Antioquia, Colombia

</div>
