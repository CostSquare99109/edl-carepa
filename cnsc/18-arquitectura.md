# 🏗️ Arquitectura del Sistema — EDL Carepa

> **Propósito:** Documentar la arquitectura técnica del aplicativo EDL Carepa: capas, flujo de datos, componentes, stack tecnológico y decisiones arquitectónicas.
>
> **Versión del sistema:** 1.0.0 (commit `51c0bd6`)
> **Stack:** PHP 8.2 + React 19 + MySQL 8.0 / MariaDB 10.6+

---

## 1. Visión general

EDL Carepa es una aplicación web **full-stack SPA** (Single Page Application) con una arquitectura de **tres capas en el backend** (Controller → Service → Repository) y frontend React con enrutamiento del lado del cliente. La comunicación es vía **REST API** con autenticación JWT.

```
┌──────────────┐       HTTP/JSON       ┌──────────────────┐      SQL       ┌─────────┐
│   Frontend   │ ◄───────────────────► │     Backend      │ ◄─────────────► │  MySQL  │
│   (React 19) │     JWT Bearer Auth   │   (PHP 8.2 MVC)  │   (PDO/MySQL)  │ MariaDB │
└──────────────┘                       └──────────────────┘                └─────────┘
```

---

## 2. Stack tecnológico

### 2.1 Frontend

| Componente | Tecnología | Versión |
|---|---|---|
| Lenguaje | TypeScript | 5.8 |
| UI Framework | React | 19.1 |
| Router | react-router-dom | 7.6 |
| Bundler | Vite | 6.3 |
| Estilos | TailwindCSS | 3.4 |
| Charts | Recharts | 3.8 |
| Notificaciones | Sonner (toast) | 2.0 |
| Estado UI | AuthContext + hooks locales | — |

### 2.2 Backend

| Componente | Tecnología | Versión |
|---|---|---|
| Lenguaje | PHP | ≥ 8.2 |
| JWT | firebase/php-jwt | 6.11 |
| PDF | dompdf/dompdf | 3.1 |
| Email | phpmailer/phpmailer | 7.1 |
| Base de datos | MySQL / MariaDB | 8.0+ / 10.6+ |
| Servidor embebido | PHP built-in | desarrollo |

### 2.3 DevOps

| Componente | Detalle |
|---|---|
| CI/CD | GitHub Actions |
| Deploy frontend | GitHub Pages |
| Control de versiones | Git + GitHub |
| Servidor backend | Apache/Nginx con PHP-FPM |

---

## 3. Arquitectura del backend (PHP)

### 3.1 Capas

```
┌────────────────────────────────────────────────┐
│                 index.php (entry point)          │
│  ┌──────────────────┐                           │
│  │    Router.php     │  Dispatcher de rutas     │
│  └────────┬─────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                           │
│  │     Middleware    │ Auth, CORS, CSRF,         │
│  │                   │ RateLimit, Security       │
│  │                   │ Headers, Permission       │
│  └────────┬─────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                           │
│  │    Controller    │  Valida input, coordina   │
│  └────────┬─────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                           │
│  │     Service      │  Lógica de negocio        │
│  └────────┬─────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                           │
│  │   Repository     │  Acceso a datos (SQL)     │
│  └────────┬─────────┘                           │
│           ▼                                      │
│  ┌──────────────────┐                           │
│  │   Database.php   │  Conexión PDO singleton   │
│  └──────────────────┘                           │
└────────────────────────────────────────────────┘
```

### 3.2 Funcionamiento del Router

El `Router.php` es un dispatcher secuencial:

1. Registra rutas en orden de aparición (GET/POST/PUT/DELETE).
2. En cada `dispatch()`, itera `$this->routes` en orden.
3. La primera coincidencia de método HTTP + patrón regex es ejecutada.
4. Aplica middleware en cadena (permisos primero).
5. Si no hay match → HTTP 404.

**⚠️ Importante:** las rutas fijas (como `/evaluaciones/pendientes-calificar`) deben registrarse **ANTES** que las rutas con parámetros (como `/evaluaciones/{id}`) para evitar que el parámetro capture la ruta fija.

### 3.3 Helpers (19 archivos)

| Helper | Función |
|---|---|
| `JwtHelper.php` | Crear, verificar y refrescar tokens JWT |
| `AuthMiddleware.php` | Extraer y validar JWT del header |
| `PermissionMiddleware.php` | RBAC: verificar permiso del usuario |
| `ResponseHelper.php` | Formato JSON unificado (`{code, message, data}`) |
| `SanitizerHelper.php` | Sanitización de strings y arrays |
| `ValidatorHelper.php` | Validación de campos requeridos, longitudes, formatos |
| `PdfHelper.php` | Generar PDF (DOMPDF) |
| `MailHelper.php` | Envío de correos (PHPMailer) |
| `UploadHelper.php` | Subida de archivos |
| `CsrfHelper.php` | Tokens CSRF |
| `IpHelper.php` | Geolocalización IP |
| `HttpException.php` | Excepción personalizada HTTP |
| `MensajesCNSC.php` | Mensajes literales CNSC (backend) |
| `SecurityHeadersMiddleware.php` | CSP, HSTS, X-Frame-Options |
| `CorsMiddleware.php` | CORS headers |
| `RateLimitMiddleware.php` | Rate limiting por IP |
| `CsrfMiddleware.php` | Validación CSRF |
| `TenantMiddleware.php` | Filtro multientidad |
| `AuditoriaService.php` | Log de operaciones CUD |

### 3.4 Modelos (14 entidades)

`Ausentismo`, `CargaMasiva`, `Competencia`, `Compromiso`, `CompromisoMejoramiento`, `Concertacion`, `Dependencia`, `Entidad`, `Evaluacion`, `Evidencia`, `Meta`, `Movilidad`, `Notificacion`, `Periodo`, `Usuario`.

---

## 4. Arquitectura del frontend (React)

### 4.1 Estructura

```
frontend/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router principal (105 líneas, ~40 rutas protegidas)
├── index.css                   # TailwindCSS + estilos globales
├── vite-env.d.ts
│
├── components/
│   ├── Layout/                 # Layout principal + Sidebar
│   ├── Shared/                 # AppHeader, NotificationBell, RoleSelector
│   └── ui/                     # 10 componentes primitivos (Button, Card, DataTable, etc.)
│
├── contexts/
│   ├── AuthContext.tsx          # Estado de autenticación global
│   └── ToastContext.tsx         # Sistema de notificaciones toast
│
├── lib/
│   ├── api.ts                  # Cliente HTTP base (fetch con JWT)
│   ├── auth.ts                 # Helpers de autenticación
│   ├── mensajesCNSC.ts         # Mensajes literales CNSC
│   └── hooks/                  # Custom hooks (useContadores, etc.)
│
├── pages/                      # 43 páginas TSX
│   ├── Admin/                  # 10 páginas
│   ├── Ausentismos/            # 1 página
│   ├── Compromisos/            # 11 páginas
│   ├── Concertaciones/         # 1 página
│   ├── Entidades/              # 1 página
│   ├── Evaluaciones/           # 3 páginas
│   ├── Evidencias/             # 2 páginas
│   ├── Metas/                  # 1 página
│   ├── Periodos/               # 1 página
│   ├── Reportes/               # 1 página
│   ├── Usuarios/               # 1 página
│   └── (raíz)                  # Login, Dashboard, Perfil, etc. (8 páginas)
│
└── styles/
    └── colors.ts               # Paleta institucional (azul Carepa #0A2B5E)
```

### 4.2 Flujo de autenticación

1. Usuario ingresa documento + contraseña en `Login.tsx`.
2. `AuthController::login` valida credenciales y devuelve JWT.
3. `AuthContext` almacena el token en `localStorage`.
4. `ProtectedRoute` verifica existencia de token antes de renderizar rutas hijas.
5. `api.ts` adjunta `Authorization: Bearer <token>` a cada request.
6. Si el token expira → `AuthContext` redirige a `/login`.

### 4.3 Flujo de navegación por roles

El menú es dinámico: `MenuController::obtener` devuelve las opciones según el rol activo del usuario. El `Sidebar.tsx` renderiza esas opciones.

---

## 5. Base de datos

### 5.1 Estructura

**9 archivos SQL** en `database/`:

| Archivo | Propósito |
|---|---|
| `schema.sql` | Schema principal (migraciones acumuladas) |
| `schema_fixed.sql` | Correcciones posteriores al schema |
| `seeds.sql` | Datos de prueba y configuración inicial |
| `seed_usuarios.sql` | Usuarios de prueba |
| `migration_edl_carepa.sql` | Migraciones adicionales |
| `migration_compromisos.sql` | Migraciones tabla compromisos |
| `migration_competencias_comportamentales.sql` | Catálogo competencias |
| `migration_evidencias_descriptivas.sql` | Migración evidencias (descriptivo, sin archivos) |
| `migration_debe_cambiar_password.sql` | Columna `debe_cambiar_password` |

### 5.2 Tablas principales

| Tabla | Propósito |
|---|---|
| `usuarios` | Servidores públicos y roles |
| `dependencias` | Unidades organizacionales |
| `entidades` | Entidades (multientidad futuro) |
| `periodos` | Períodos de evaluación |
| `metas` | Metas institucionales |
| `concertaciones` | Proceso de concertación |
| `evaluaciones` | Evaluaciones (parcial, semestral, definitiva, extraordinaria) |
| `compromisos` | Compromisos funcionales y comportamentales |
| `compromisos_mejoramiento` | Compromisos de mejoramiento |
| `evidencias` | Registro descriptivo de evidencias |
| `ausentismos` | Separaciones temporales |
| `movilidades` | Cambios de dependencia/cargo |
| `notificaciones` | Notificaciones del sistema |

### 5.3 Convenciones

- **Soft delete:** todas las tablas operacionales tienen `eliminado_en` (timestamp nullable).
- **Timestamps:** `creado_en` y `actualizado_en` automáticos.
- **FKs:** claves foráneas entre tablas relacionadas.
- **Enums:** validados a nivel de aplicación y base de datos.

---

## 6. API REST

**138 endpoints** organizados en **21 módulos**. Documentación detallada: `cnsc/17-endpoints-api.md`.

### 6.1 Formato de respuesta

```json
// Éxito
{ "code": "01", "message": "...", "data": { ... } }

// Error
{ "code": "02", "message": "Descripción del error" }

// Error de validación
{ "code": "42", "message": "Campo estado es obligatorio" }
```

### 6.2 Códigos de error

| Código | Significado |
|---|---|
| `01` | OK / Success |
| `02` | Error general |
| `42` | Error de validación (422) |
| `43` | No autorizado (401) |
| `44` | Prohibido (403) |
| `45` | No encontrado (404) |

---

## 7. Seguridad

| Capa | Medida |
|---|---|
| Transporte | HTTPS (recomendado en producción) |
| Autenticación | JWT con expiración (120 min por defecto) |
| Contraseñas | Hash bcrypt |
| Headers HTTP | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CORS | Restringido a orígenes conocidos |
| CSRF | Tokens CSRF para mutaciones |
| Rate limiting | Por IP en auth endpoints |
| Soft delete | Ninguna operación destruye datos permanentemente |
| SQL Injection | PDO prepared statements |
| XSS | Sanitización de input en backend y frontend |

---

## 8. Decisiones arquitectónicas (ADRs)

| ID | Decisión | Justificación |
|---|---|---|
| ADR-1 | SPA + REST API | Separación clara frontend/backend. Permite escalar cada capa independientemente. |
| ADR-2 | PHP sin framework | Custom MVC ligero. Control total sobre el código sin dependencia externa. |
| ADR-3 | Single-entity por ahora | Carepa es una sola entidad. La arquitectura soporta multientidad (tabla `entidades`, middleware `TenantMiddleware`). |
| ADR-4 | Evidencias descriptivas | Según CNSC: no se suben archivos. Solo descripción y ubicación. Decisión D1 (híbrido: descriptivo + archivo opcional). |
| ADR-5 | Soft delete global | Trazabilidad completa. Ninguna baja es irreversible. |
| ADR-6 | JWT sin sesión server-side | Escalable. No requiere almacenamiento de sesión. |
| ADR-7 | RBAC con 51 permisos | Granularidad suficiente para todos los roles CNSC. |

---

## 9. Diagrama de despliegue (producción)

```
Internet
   │
   ▼
┌──────────────────┐
│  GitHub Pages     │  ← Frontend estático (SPA)
│  (CDN)            │
└──────────────────┘
        │ API calls (HTTPS)
        ▼
┌──────────────────┐
│  Apache / Nginx   │  ← Reverse proxy + PHP-FPM
│  (VPS / Shared)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  PHP 8.2 FPM     │  ← Backend app
│  (index.php)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  MariaDB 10.6+   │  ← Base de datos
└──────────────────┘
```

---

**Versión:** 1.0.0 (2026-06-22)
