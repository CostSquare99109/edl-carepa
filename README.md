# EDL Carepa — Evaluacion del Desempeno Laboral

> Sistema integral de Evaluacion del Desempeno Laboral para la Alcaldia de Carepa, Antioquia, Colombia. Implementa el ciclo completo de evaluacion de servidores publicos conforme al **Acuerdo CNSC 617 de 2018**.

[![Stack](https://img.shields.io/badge/PHP-8.2-777BB4)](https://www.php.net)
[![Stack](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![Stack](https://img.shields.io/badge/TypeScript-5.8-3178C6)](https://www.typescriptlang.org)
[![Stack](https://img.shields.io/badge/MariaDB-10.6-003545)](https://mariadb.org)
[![License](https://img.shields.io/badge/Uso-Institucional-0A2B5E)](#licencia)

---

## Tabla de contenidos

1. [Acerca del proyecto](#acerca-del-proyecto)
2. [Funcionalidades](#funcionalidades)
3. [Stack tecnologico](#stack-tecnologico)
4. [Estructura del repositorio](#estructura-del-repositorio)
5. [Requisitos](#requisitos)
6. [Instalacion](#instalacion)
7. [Configuracion](#configuracion)
8. [Ejecucion](#ejecucion)
9. [Usuarios de prueba](#usuarios-de-prueba)
10. [API REST](#api-rest)
11. [Arquitectura y convenciones](#arquitectura-y-convenciones)
12. [Pruebas](#pruebas)
13. [Despliegue](#despliegue)
14. [Contribucion](#contribucion)
15. [Documentacion complementaria](#documentacion-complementaria)
16. [Licencia y autor](#licencia-y-autor)

---

## Acerca del proyecto

**EDL Carepa** es una aplicacion web full-stack que automatiza el ciclo anual de evaluacion del desempeno laboral de los servidores publicos de carrera administrativa del municipio de Carepa. Digitaliza las cuatro fases obligatorias del Sistema Tipo de la CNSC: concertacion de compromisos, seguimiento, evaluaciones parciales y calificacion definitiva, con traf administrativos (dependencias, metas, usuarios, ausentismos, cargue masivo y reportes).

El proyecto esta alineado con:

- **Acuerdo 617 de 2018** (CNSC) y su Anexo Tecnico, regimen vigente desde el 1 de febrero de 2019.
- **Decreto 1083 de 2015** (regimen de carrera administrativa y EDL).
- **Decretos 2539/2005 y 815/2018** (competencias comportamentales).

### Proposito

Brindar a la Alcaldia de Carepa una herramienta agil, trazable y consistente con la normativa, que:

- Garantice la bilateralidad y los plazos 15+3 de la concertacion.
- Aplique las escalas funcionales (0-100) y comportamentales (4-15).
- Calcule la calificacion definitiva con la ponderacion 85% funcionales + 15% comportamentales.
- Produzca escalas finales Sobresaliente / Satisfactorio / No satisfactorio segun Acuerdo 617/2018.
- Genere evidencias descriptivas (sin cargue de archivos) y planes de mejoramiento.

---

## Funcionalidades

### Nucleo del proceso EDL

- Concertacion bilateral de compromisos funcionales (metas) y comportamentales (competencias) con pesos porcentuales.
- Fijacion unilateral por el evaluador con testigo cuando no hay acuerdo a los 15 dias.
- Calificacion por tipos: parcial eventual, parcial 1.er semestre, parcial 2.do semestre y calificacion definitiva.
- Validacion de fechas del 2.do semestre (01-08 a 31-01 del ano siguiente).
- Escala comportamental de cuatro niveles (nunca, algunas veces, frecuentemente, siempre) con preguntas de aporte y justificacion >= 40 caracteres.
- Compromisos de mejoramiento para resultados insuficientes o aceptables.

### Plataforma

- Autenticacion JWT con bloqueo a 5 intentos fallidos y recuperacion de password por codigo de 6 digitos al correo.
- Control de acceso por roles (RBAC) con 6 roles, 51 permisos y 84 asignaciones rol-permiso.
- Multi-rol por usuario con cambio de rol activo sin cerrar sesion.
- Menu dinamico segun el rol activo.
- Auditoria completa de operaciones CUD con estado anterior y nuevo.
- Soft delete (`eliminado_en`) en todas las tablas operacionales.
- Proteccion CSRF por sesion, rate limiting por IP y cabeceras de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
- Notificaciones en tiempo real con sondeos periodicos y envio por SMTP.
- Generacion de reportes PDF con dompdf y la identidad institucional de Carepa.

### Administracion

- Gestion de entidades, dependencias, periodos, metas y usuarios.
- Carga masiva de usuarios desde archivos CSV/Excel con plantilla.
- Control de ausentismos con validacion de periodos no evaluables superiores a 30 dias.
- Movilidad de funcionarios entre dependencias.
- Modulo de parametros configurables del sistema.


---

## Stack tecnologico

| Capa | Tecnologia | Version |
| --- | --- | --- |
| Lenguaje backend | PHP | 8.2+ |
| Lenguaje frontend | TypeScript | 5.8 |
| UI | React | 19.1 |
| Enrutamiento frontend | react-router-dom | 7.6 |
| Bundler | Vite | 6.3 |
| Estilos | TailwindCSS | 3.4 |
| Notificaciones toast | sonner | 2.0 |
| JWT | firebase/php-jwt | 6.11 |
| Correo | phpmailer/phpmailer | 7.1 |
| PDF | dompdf/dompdf | 3.1 |
| Base de datos | MariaDB / MySQL | 10.6+ / 8.0+ |
| Driver SQL | PDO (PHP) | nativo |
| Servidor dev | PHP built-in (`php -S`) | embebido |

Patrones clave:

- **Backend**: arquitectura por capas Controller -> Service -> Repository con middlewares centralizados.
- **Frontend**: SPA con AuthContext (JWT en localStorage) y rutas protegidas por componente `ProtectedRoute`.
- **BD**: soft delete + auditoria + multi-entidad por `entidad_id`.

---

## Estructura del repositorio

```
edl-carepa/
|-- backend/
|   |-- public/
|   |   |-- index.php              # Punto de entrada unico y registro de 138 rutas
|   |   `-- router.php             # Router para el servidor embebido de desarrollo
|   |-- src/
|   |   |-- Config/                # Database, Env, CORS
|   |   |-- Controller/            # 21 controladores HTTP
|   |   |-- Helper/                # JWT, PDF, Mail, CSRF, Response, Sanitizer, Validator, Upload, Ip, MensajesCNSC, HttpException
|   |   |-- Middleware/            # 7 middlewares (Cors, SecurityHeaders, RateLimit, Auth, Permission, Csrf, Tenant)
|   |   |-- Model/                 # 15 modelos de dominio
|   |   |-- Repository/            # 18 repositorios SQL (PDO)
|   |   |-- Router/                # Enrutador HTTP propio con grupos y permisos
|   |   `-- Service/               # 17 servicios con logica de negocio
|   |-- storage/                   # Sesiones locales y cache
|   |-- uploads/                   # Archivos subidos por usuarios
|   |-- var/                       # Logs y temporales
|   |-- .env.example               # Plantilla de variables de entorno
|   `-- composer.json              # Dependencias PHP (PSR-4: App\ -> src/)
|
|-- frontend/
|   |-- public/                    # Recursos estaticos y escudo institucional
|   |-- src/
|   |   |-- App.tsx                # ~40 rutas protegidas declaradas
|   |   |-- components/
|   |   |   |-- Layout/            # Layout principal + Sidebar dinamico
|   |   |   |-- Shared/            # RoleSelector, NotificationBell, AppHeader
|   |   |   `-- ui/                # 10 primitivas (Button, Card, DataTable, Tabs, Modal, ...)
|   |   |-- contexts/              # AuthContext, ToastContext
|   |   |-- lib/
|   |   |   |-- api.ts             # Fetch wrapper con JWT, CSRF y refresh
|   |   |   |-- auth.ts            # Helpers de autenticacion
|   |   |   |-- mensajesCNSC.ts    # Mensajes literales CNSC
|   |   |   `-- hooks/             # Custom hooks
|   |   |-- pages/                 # 44 paginas organizadas por modulo
|   |   `-- styles/colors.ts       # Paleta institucional Carepa #0A2B5E
|   |-- dist/                      # Compilado de produccion (`npm run build`)
|   |-- tailwind.config.js         # Colores institucionales configurados
|   |-- vite.config.ts             # Proxy `/api` -> http://localhost:8000
|   `-- tsconfig.json              # Strict mode + alias `@/*` -> `./src/*`
|
|-- database/
|   `-- full_dump.sql              # Dump consolidado: esquema + seed + datos de prueba
|
|-- docs/                          # Recursos graficos publicos (escudo, 404.html, index.html)
|-- tests/                         # Pruebas Python (pytest) y PHP
|-- cnsc/                          # Documentacion tecnica alineada con CNSC (15 capitulos + API + arquitectura + glosario + auditoria + changelog)
|-- .github/workflows/deploy.yml   # CI/CD de GitHub Pages para el frontend
|-- AGENTS.md                      # Convenciones en formato corto para agentes IA
|-- README.md                      # Este archivo
`-- LICENSE
```

---

## Requisitos

| Componente | Version |
| --- | --- |
| PHP | 8.2 o superior |
| Composer | 2.5 o superior |
| Node.js | 20 LTS |
| npm | 10 |
| MariaDB / MySQL | 10.6+ / 8.0+ |
| Extensiones PHP | pdo_mysql, mbstring, gd, xml, zip, openssl, json, fileinfo |
| Servidor web (produccion) | Apache 2.4 con mod_rewrite o Nginx 1.24+ con PHP-FPM |

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Preparar la base de datos

```bash
# Crear base de datos (charset utf8mb4 requerido)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Cargar el dump consolidado (esquema + seed + datos de prueba)
mysql -u root -p edl_carepa < database/full_dump.sql
```

> El esquema se mantiene en un unico dump consolidado. No existen migraciones incrementales; cualquier cambio de esquema se aplica regenerando el dump completo.

### 3. Configurar y arrancar el backend

```bash
cd backend
cp .env.example .env
# Editar .env: DB_*, JWT_SECRET (min 32 caracteres), CORS_ORIGIN, MAIL_*
composer install
php -S 0.0.0.0:8000 -t public/ backend/public/router.php
```

> El servidor queda escuchando en `http://localhost:8000`. La conexion a BD se hace por TCP por defecto; si tu MariaDB usa socket (`/tmp/mysql.sock` por convencion), ajusta `DB_SOCKET`.

### 4. Configurar y arrancar el frontend

```bash
cd ../frontend
npm install
npm run dev
```

Por defecto, el dev server se sirve en `http://localhost:5174` (Vite 6.3, puerto definido en `vite.config.ts`). El archivo `vite.config.ts` incluye un proxy que redirige todas las llamadas a `/api` hacia `http://localhost:8000`.

---

## Configuracion

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripcion | Ejemplo |
| --- | --- | --- |
| `APP_ENV` | Entorno de ejecucion | `development` / `production` |
| `APP_DEBUG` | Modo depuracion | `true` / `false` |
| `APP_TIMEZONE` | Zona horaria | `America/Bogota` |
| `APP_API_URL` | URL publica de la API | `http://localhost:8000` |
| `APP_FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5174` |
| `UPLOAD_DIR` | Directorio de archivos subidos | ruta absoluta |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | Conexion MariaDB/MySQL | `127.0.0.1` / `3306` / `edl_carepa` / `root` / vacio |
| `DB_SOCKET` | Socket MySQL opcional | `/tmp/mysql.sock` |
| `JWT_SECRET` | Secreto JWT (min 32 caracteres) | cadena aleatoria |
| `JWT_EXPIRACION_MINUTOS` | Vigencia del token | `120` |
| `INTENTOS_LOGIN_MAXIMOS` | Bloqueo tras N intentos | `5` |
| `PASSWORD_LONGITUD_MINIMA` | Longitud minima de password | `8` |
| `CORS_ORIGIN` | Origen permitido | `http://localhost:5174` |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` | Servidor SMTP | Gmail, SendGrid, SES, etc. |
| `MAIL_FROM` / `MAIL_FROM_NAME` | Remitente | `noreply@carepa-antioquia.gov.co` / `EDL-Carepa` |

> Si `MAIL_USER` y `MAIL_PASS` estan vacios, el helper de envio de correo retorna `false` sin lanzar excepciones. Esto permite desarrollo sin SMTP.

### Variables de entorno del frontend (`frontend/.env`)

```env
VITE_API_URL=/api/v1
VITE_BASE=/
```

`VITE_API_URL` acepta la URL absoluta de la API o una ruta relativa `"/api/v1"` que se enruta por el proxy de Vite en desarrollo.

---

## Ejecucion

### Comandos principales

| Tarea | Comando |
| --- | --- |
| Backend en desarrollo | `cd backend && php -S 0.0.0.0:8000 -t public/ backend/public/router.php` |
| Backend con servidor personalizado | `php -S 0.0.0.0:8000 -t backend/public/` |
| Frontend en desarrollo | `cd frontend && npm run dev` |
| Frontend build produccion | `cd frontend && npm run build` |
| Frontend preview produccion | `cd frontend && npm run preview` |
| Reiniciar password admin | `php backend/reset_admin.php` |
| Asignar roles masivamente (CSV) | `python assign_roles.py` |
| Importar funcionarios | `php backend/importar_funcionarios.php` |

### Flujo de peticion tipico

```
Frontend (React)            Backend (PHP)                Base de datos
   |                            |                              |
   |--- GET /api/v1/auth/login ---------------------------------|
   |                            |--- SELECT * FROM usuarios    --|
   |<-- 200 { token, usuario } --|                              |
   |--- GET /api/v1/evaluaciones  Authorization: Bearer <jwt> --|
   |                            |--- JWT verify + RBAC check    |
   |                            |--- SELECT ... WHERE activo    --|
   |<-- 200 JSON ----------------|                              |
```

---

## Usuarios de prueba

Todos los usuarios sembrados por el dump usan contrasena `12345678`.

| Documento | Nombre | Rol principal |
| --- | --- | --- |
| `admin` | Admin | `admin_carepa` |

> Usuarios adicionales de prueba (mas de 200)estan disponibles en el dump consolidado. Cualquier usuario puede cambiar de rol activo sin cerrar sesion mediante `POST /api/v1/auth/rol`.

---

## API REST

La API expone **138 endpoints** registrados en `backend/public/index.php`. Prefijo comun `/api/v1`. Todas las respuestas son JSON.

### Formato de respuesta

```json
{ "code": "01", "message": "...", "data": { } }
```

Codigos de respuesta: `01` OK, `02` Error, `42` Validacion, `43` Unauthorized, `44` Forbidden, `45` NotFound.

### Endpoints protegidos

Requieren cabecera `Authorization: Bearer <jwt>`, con opcion `X-CSRF-Token` para metodos mutantes (POST/PUT/DELETE).

### Grupos principales

| Grupo | Cantidad | Alcance |
| --- | ---: | --- |
| `auth/*` | 10 | Login, registro, recuperacion, perfil, refresh, csrf, rol activo |
| `usuarios/*` | 8 | CRUD, busqueda global, roles, reset password |
| `entidades/*` | 8 | CRUD, jefe de personal, jefes, dependencias, habilitar |
| `dependencias/*` | 6 | CRUD, cambio de estado, consultas |
| `periodos/*` | 6 | CRUD, metas, evaluaciones |
| `metas/*` | 5 | CRUD, evidencias |
| `concertaciones/*` | 10 | CRUD, fijar bilateral, fijar unilateral, verificar, validar |
| `evaluaciones/*` | 9 | Listar, crear, pendientes, buscar, ver, parcial, definitiva, comision, finalizar |
| `compromisos/*` | 21 | Funcionales y comportamentales, enviar, aceptar, rechazar, aprobar, devolver, calificar, pesos |
| `compromisos-mejoramiento/*` | 5 | CRUD, seguimiento, completar |
| `evidencias/*` | 4 | CRUD, registros descriptivos por evaluado |
| `reportes/*` | 10 | Concertacion, evaluaciones, funcionario, entidad, dependencia, PDF, Excel |
| `ausentismos/*` | 5 | CRUD, validacion > 30 dias |
| `movilidades/*` | 6 | Movilidad de funcionarios |
| `cargas/*` | 6 | Carga masiva CSV/Excel y plantillas |
| `competencias/*` | 2 | Catalogo CNSC |

La referencia completa esta en `cnsc/17-endpoints-api.md`.

---

## Arquitectura y convenciones

### Backend (PHP)

- Router secuencial por regex en `backend/public/index.php` con grupos, middlewares y permisos por ruta.
- Orden de middlewares global: `Cors` -> `SecurityHeaders` -> `RateLimit` -> `Auth` -> `Permission` -> `Csrf` (en mutaciones) -> `Tenant`.
- Cadena de accion: `Router` -> `Middleware[]` -> `Controller` -> `Service` -> `Repository` -> DB (PDO).
- **Orden de rutas**: las rutas fijas (`/evaluaciones/pendientes-calificar`) SIEMPRE deben declararse ANTES que las parametricas (`/evaluaciones/{id}`). El orden es relevante porque el match es secuencial.
- Soft delete via `eliminado_en` (timestamp nullable) en todas las tablas operacionales. **Nunca** hacer `DELETE` directo en repositorios.
- Multi-rol por usuario: el rol activo viaja en el JWT y se valida en cada request (`rolActivo`, no `roles[]`).
- Codigo en espanol para variables de dominio (`nombre`, `documento`, `compromisos`), pero nombres tecnicos (clases, metodos) en ingles.

Convenciones PHP:

```php
declare(strict_types=1);   // Obligatorio al inicio de cada archivo
// PSR-12
// PHPDoc en metodos publicos
// Prepared statements siempre (PDO)
// Sin acceso directo a BD desde Controllers
```

### Frontend (React)

- `AuthContext` guarda `token`, `usuario`, `roles[]`, `rolActivo`, `menu[]` en estado y los persiste en `localStorage` (`edl_token`, `edl_user`, `edl_rol_activo`, `edl_csrf`).
- Cambiar de rol se hace con `POST /api/v1/auth/rol` y dispara recarga del menu.
- `api.ts` envuelve `fetch`, inyecta el JWT, gestiona CSRF y hace auto-refresh ante 401.
- `Sidebar` se genera dinamicamente con el menu devuelto por `MenuController::obtener` segun el rol activo.
- Componentes funcionales y hooks; interfaces para props (`interface ButtonProps { }`).
- Alias de importacion `@/*` -> `./src/*`.

Convenciones TypeScript:

```typescript
// "strict": true
// Componentes nombrados (no default export)
// Paleta institucional via src/styles/colors.ts (azul Carepa #0A2B5E)
// Mensajes literales CNSC via src/lib/mensajesCNSC.ts
```

### Base de datos

- Charset `utf8mb4_unicode_ci`.
- Nombres en `snake_case`.
- FK nombradas `fk_<tabla_origen>_<tabla_destino>`.
- Tablas principales: `usuarios`, `dependencias`, `entidades`, `periodos`, `metas`, `concertaciones`, `evaluaciones`, `compromisos`, `compromisos_funcionales`, `compromisos_comportamentales`, `compromisos_mejoramiento`, `evidencias`, `ausentismos`, `movilidades`, `notificaciones`, `competencias`, `conductas`, `parametros`, `auditoria`, `roles`, `permisos`, `rol_permiso`, `usuario_rol`.
- Auditable: todas las operaciones CUD registran antes/despues en `auditoria`.

### Buenas practicas generales

- Antes de cualquier cambio de esquema: regenerar `database/full_dump.sql` (no hay migraciones incrementales).
- Mensajes al usuario: SIEMPRE literales CNSC desde `MensajesCNSC.php` (backend) o `mensajesCNSC.ts` (frontend).
- Nuevos endpoints: registrar en `backend/public/index.php` antes de las rutas parametricas equivalentes; actualizar `cnsc/17-endpoints-api.md`.
- Nuevos roles/permisos: sembrar en el dump consolidado y documentarlos en `cnsc/13-trazabilidad-con-proyecto.md` (matriz RBAC activa).
- Cambios en flujos: actualizar el capitulo correspondiente en `cnsc/` (idealmente `cnsc/13-trazabilidad-con-proyecto.md`).

---

## Pruebas

```bash
# Pruebas de API REST con Python (requiere pytest + requests)
python tests/api_test.py

# Pruebas de flujo completo (concertacion, evaluacion, comision)
python tests/flow_test.py

# Pruebas de endpoints en bash
bash test_endpoints.sh

# Pruebas en PHP
php tests/run_tests.php
```

> El frontend no incluye framework de pruebas montado; las verificaciones UI se hacen manualmente o contra los endpoints. Antes de cada PR se recomienda ejecutar `tests/api_test.py` y `tests/flow_test.py`.

---

## Despliegue

### Frontend

- CI/CD via `.github/workflows/deploy.yml` (GitHub Pages) en cada push a `main`.
- Salida: `frontend/dist/` (generada por `npm run build`).
- Configurar `VITE_API_URL` apuntando a la URL publica del backend.

### Backend

- Servidor Apache 2.4 con `mod_rewrite` o Nginx 1.24+ con PHP-FPM.
- `DocumentRoot` del virtualhost apuntando a `backend/public/`.
- Regla de reescritura unica al `index.php` (single entry point).
- Variables `APP_FRONTEND_URL`, `CORS_ORIGIN` y `APP_API_URL` apuntando a los hosts reales.
- Permisos de escritura para `backend/storage/`, `backend/uploads/`, `backend/var/`.

### Base de datos

- MariaDB 10.6+ o MySQL 8.0+ con `utf8mb4_unicode_ci`.
- Restaurar desde `database/full_dump.sql`.
- Regenerar dumps con:

```bash
mysqldump -u root -p --routines --triggers --single-transaction edl_carepa > database/full_dump.sql
```

---

## Contribucion

1. Bifurcar o crear una rama desde `main` con el formato `feature/<nombre>` o `fix/<nombre>`.
2. Mantener orden de archivos y convenciones del proyecto (ver seccion anterior).
3. Si el cambio toca la API, registrar el endpoint en `backend/public/index.php` y reflejarlo en `cnsc/17-endpoints-api.md`.
4. Si el cambio introduce una columna o tabla nueva, regenerar `database/full_dump.sql`.
5. Ejecutar las suites de pruebas antes de abrir el PR.
6. Abrir Pull Request hacia `main` con descripcion de la motivacion y resumen de cambios.

---

## Documentacion complementaria

- `AGENTS.md`: guia corta para agentes IA que operan sobre el repositorio (convenciones, gotchas, comandos clave).
- `cnsc/`: capitulos tecnicos alineados con el Acuerdo CNSC 617 de 2018.
  - `cnsc/00-indice-maestro.md`: indice de navegacion.
  - `cnsc/01-generalidades-y-marco-normativo.md` a `cnsc/12-cambio-administracion.md`: marco normativo y modulos.
  - `cnsc/13-trazabilidad-con-proyecto.md`: cruce entre transcripciones CNSC y codigo real.
  - `cnsc/14-futuro-del-proyecto.md`: hoja de ruta.
  - `cnsc/16-glosario-cnsc.md`: glosario A-Z de terminos CNSC.
  - `cnsc/17-endpoints-api.md`: referencia completa de la API REST.
  - `cnsc/18-arquitectura.md`: arquitectura detallada del sistema.
  - `cnsc/AUDITORIA-DIRIGIDA-2026-06-22.md`: auditoria del estado real.
  - `cnsc/CHANGELOG.md`: bitacora de cambios de la carpeta cnsc/.
- `docs/`: recursos graficos publicos (escudo institucional de Carepa, paginas estaticas).
- `tests/`: scripts de pruebas automatizadas.

---

## Licencia y autor

**Autor**: Jhon Fredy Montalvo Cuadrado (@CostSquare99109) - desarrollador principal y arquitecto del sistema.

**Licencia**: Uso institucional restringido. Este proyecto y todos sus componentes son de uso exclusivo de la Alcaldia de Carepa, Antioquia, Colombia. Prohibida su distribucion, modificacion o uso sin autorizacion escrita de la entidad contratante.

---

*EDL Carepa - Evaluacion del Desempeno Laboral - Alcaldia de Carepa, Antioquia.*
