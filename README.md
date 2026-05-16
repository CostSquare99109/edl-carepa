# EDL-CNSC — Evaluación del Desempeño Laboral

Sistema de Evaluación del Desempeño Laboral para la **Comisión Nacional del Servicio Civil (CNSC)** de Colombia.

Desarrollado bajo los lineamientos de la **Resolución 2023310009394** para la gestión integral del desempeño de los servidores públicos.

---

## Arquitectura

- **Backend**: PHP 8.2+ — Arquitectura hexagonal (Controllers → Services → Repositories → Models)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Base de datos**: MariaDB 10.6+ / MySQL 8.0+ (23 tablas)
- **Autenticación**: JWT (firebase/php-jwt) con refresh y recuperación
- **Despliegue**: GitHub Pages (frontend) + XAMPP/Apache (backend)

---

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total al sistema |
| `evaluador` | Realiza evaluaciones de desempeño |
| `comision_evaluadora` | Aprueba evaluaciones como Comisión Evaluadora |
| `funcionario` | Consulta, autoevaluación y gestión de compromisos |
| `jefe_entidad` | Administra usuarios y procesos de su entidad |
| `jefe_dependencia` | Gestiona dependencia y evaluaciones |

---

## Flujo del Sistema

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│  Funcionario │────▶│  Evaluador   │────▶│ Comisión Evaluadora│────▶│   Definitiva  │
│              │     │              │     │                    │     │              │
│ Autoevalúa   │     │ Heteroevalúa │     │ Aprueba/Rechaza   │     │ Calificación │
│ Compromisos  │     │ Califica     │     │ Comisión          │     │   Final      │
│ Evidencias   │     │ Pesos 100%   │     │                   │     │              │
└─────────────┘     └──────────────┘     └───────────────────┘     └──────────────┘
```

### Flujo de Compromisos

1. **Funcionario** crea compromisos y los envía (`estado='enviado'`)
2. **Evaluador** recibe notificación → aprueba con peso% (deben sumar 100% por evaluación) o rechaza
3. Al final del periodo, el **Evaluador** califica cada compromiso (0-100)
   - Puntaje ≥ 60 → `cumplido`
   - Puntaje < 60 → `incumplido`
4. **Comisión Evaluadora** aprueba la evaluación definitiva

---

## Pantallas del Frontend

### Públicas
- **Login** — 3 pestañas: Iniciar Sesión, Registrarse, Recuperar Contraseña
  - Alertas visibles 10 segundos con fade-out suave y botón de cerrar
  - Sin correo de soporte

### Protegidas
- **Dashboard** — Resumen con tarjetas por rol (evaluaciones pendientes, compromisos, etc.)
- **Entidades** — CRUD con lápiz de edición (código, nombre, tipo, NIT, municipio, estado)
- **Usuarios** — CRUD con lápiz de edición (documento, nombres, email, cargo, estado, bloqueo)
- **Periodos** — CRUD con lápiz de edición (fechas, estado, concertación, evaluación)
- **Metas** — CRUD con lápiz de edición (descripción, tipo, peso, indicador, meta numérica)
- **Evaluaciones** — CRUD con lápiz + **EvaluarPage** (calificar compromisos, aprobar comisión)
- **Concertaciones** — CRUD con lápiz de edición
- **Evidencias** — CRUD con lápiz de edición
- **Compromisos y Competencias** — Vista consolidada
- **Mis Compromisos** — Gestión del funcionario (crear, enviar)
- **Aprobar Compromisos** — Evaluador aprueba con pesos
- **Reportes** — Concertación, evaluaciones, funcionario individual

### Selector de Rol
El sidebar muestra un selector de rol cuando el usuario tiene múltiples roles asignados, permitiendo cambiar contexto sin cerrar sesión.

---

## Requisitos

- PHP 8.2+ con extensiones: `pdo_mysql`, `mbstring`, `json`
- MariaDB 10.6+ / MySQL 8.0+
- Node.js 18+ y npm
- Composer

---

## Instalación

### 1. Base de Datos

```bash
# Crear la base de datos y tablas
mysql -u root -p < database/schema.sql

# Insertar datos iniciales (roles, permisos, parámetros)
mysql -u root -p edl_cnsc < database/seeds.sql

# Insertar usuarios de prueba
mysql -u root -p edl_cnsc < database/seed_usuarios.sql

# (Opcional) Migración de compromisos
mysql -u root -p edl_cnsc < database/migration_compromisos.sql
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
# Editar .env con credenciales de base de datos
```

Iniciar servidor de desarrollo:

```bash
php -S localhost:8000 -t public/
```

Restablecer contraseña admin:

```bash
php reset_admin.php
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acceder en: `http://localhost:5173`

Build de producción:

```bash
npm run build
```

---

## Credenciales por Defecto

| Campo | Valor |
|-------|-------|
| Tipo documento | CC |
| Número | 12345678 |
| Contraseña | Admin2026! |

---

## Estructura del Proyecto

```
edl-app/
├── backend/
│   ├── public/
│   │   └── index.php              # Entry point + rutas API
│   ├── src/
│   │   ├── Config/                # Env, Database
│   │   ├── Controller/            # 18 controladores REST
│   │   │   ├── AuthController     # login, registro, recuperar, perfil, rol
│   │   │   ├── CompromisoController # CRUD + enviar, aprobar, rechazar, calificar
│   │   │   ├── EvaluacionController # CRUD + calificar, comisión, parcial
│   │   │   ├── MenuController     # Menú dinámico por rol
│   │   │   ├── DashboardController # Resumen + actividad
│   │   │   └── ...                # Entidades, Usuarios, Periodos, Metas, etc.
│   │   ├── Helper/                # JwtHelper, ResponseHelper, ValidatorHelper, SanitizerHelper
│   │   ├── Middleware/            # Auth, CORS, RateLimit, SecurityHeaders, Permission, Tenant
│   │   ├── Model/                 # 15 modelos de dominio
│   │   ├── Repository/            # 17 repositorios (CRUD con prepared statements)
│   │   ├── Router/                # Router con middleware pipeline
│   │   └── Service/               # 16 servicios de negocio
│   ├── reset_admin.php            # Script para restablecer admin
│   └── vendor/                    # Dependencias Composer
├── database/
│   ├── schema.sql                 # 23 tablas (DDL completo)
│   ├── seeds.sql                  # Roles, permisos, parámetros
│   ├── seed_usuarios.sql          # Usuarios y entidades de prueba
│   ├── migration_edl_cnsc.sql     # Migración inicial
│   └── migration_compromisos.sql  # Migración de compromisos
├── frontend/
│   ├── src/
│   │   ├── components/Layout/     # Header institucional + Sidebar con selector de rol
│   │   ├── contexts/AuthContext   # Auth state + login/logout/cambiarRol
│   │   ├── lib/                   # API client (axios), auth service
│   │   └── pages/                 # 13+ páginas
│   │       ├── Login.tsx          # 3 pestañas: Login, Registro, Recuperar
│   │       ├── Dashboard.tsx      # Resumen por rol
│   │       ├── Entidades/         # CRUD + editar con lápiz
│   │       ├── Usuarios/          # CRUD + editar con lápiz
│   │       ├── Periodos/          # CRUD + editar con lápiz
│   │       ├── Metas/             # CRUD + editar con lápiz
│   │       ├── Evaluaciones/      # Lista + EvaluarPage
│   │       ├── Compromisos/       # MisCompromisos + AprobarCompromisos
│   │       ├── Concertaciones/    # CRUD + editar con lápiz
│   │       ├── Evidencias/        # CRUD + editar con lápiz
│   │       └── Reportes/          # ReportesPage
│   ├── index.css                  # Tailwind + estilos institucionales
│   ├── tailwind.config.js         # Colores CNSC: #0A2B5E, #C4282B, #1E5A3C
│   └── vite.config.ts             # Proxy API + config GitHub Pages
├── .github/workflows/deploy.yml   # GitHub Pages auto-deploy
└── README.md
```

---

## API Endpoints

### Autenticación (públicas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/registro` | Registrar nuevo funcionario |
| POST | `/api/v1/auth/recuperar` | Solicitar token de recuperación |
| PUT | `/api/v1/auth/recuperar/{token}` | Restablecer contraseña |

### Autenticación (protegidas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/perfil` | Obtener perfil |
| PUT | `/api/v1/auth/perfil` | Actualizar perfil |
| PUT | `/api/v1/auth/password` | Cambiar contraseña |
| PUT | `/api/v1/auth/rol` | Cambiar rol activo |

### Compromisos

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/compromisos` | Listar compromisos | `compromisos.listar` |
| POST | `/api/v1/compromisos/enviar` | Enviar compromisos | `compromisos.enviar` |
| GET | `/api/v1/compromisos/pendientes` | Pendientes de aprobación | `compromisos.aprobar` |
| PUT | `/api/v1/compromisos/{id}/aprobar` | Aprobar compromiso | `compromisos.aprobar` |
| PUT | `/api/v1/compromisos/{id}/rechazar` | Rechazar compromiso | `compromisos.aprobar` |
| PUT | `/api/v1/compromisos/{id}/devolver` | Devolver compromiso | `compromisos.aprobar` |
| PUT | `/api/v1/compromisos/{id}/calificar` | Calificar compromiso (0-100) | `evaluaciones.evaluar` |
| GET | `/api/v1/compromisos/{id}/pesos` | Resumen pesos por evaluación | `compromisos.listar` |
| PUT | `/api/v1/compromisos/{id}` | Editar compromiso | `compromisos.editar` |

### Evaluaciones

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/evaluaciones` | Listar evaluaciones | `evaluaciones.listar` |
| POST | `/api/v1/evaluaciones` | Crear evaluación | `evaluaciones.crear` |
| GET | `/api/v1/evaluaciones/{id}` | Ver evaluación | `evaluaciones.listar` |
| PUT | `/api/v1/evaluaciones/{id}` | Calificar evaluación | `evaluaciones.evaluar` |
| GET | `/api/v1/evaluaciones/{id}/compromisos` | Compromisos de evaluación | `compromisos.listar` |
| POST | `/api/v1/evaluaciones/{id}/compromisos` | Crear compromiso en evaluación | `compromisos.crear` |
| POST | `/api/v1/evaluaciones/{id}/parcial` | Crear evaluación parcial | `evaluaciones.crear` |
| PUT | `/api/v1/evaluaciones/{id}/definitiva` | Calificar definitiva | `evaluaciones.evaluar` |
| PUT | `/api/v1/evaluaciones/{id}/comision` | Aprobar como Comisión | `evaluaciones.comision` |
| GET | `/api/v1/evaluaciones/pendientes-calificar` | Pendientes de calificar | `evaluaciones.evaluar` |

### Entidades

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/entidades` | Listar | `entidades.listar` |
| POST | `/api/v1/entidades` | Crear | `entidades.crear` |
| GET | `/api/v1/entidades/{id}` | Ver detalle | `entidades.listar` |
| PUT | `/api/v1/entidades/{id}` | Actualizar | `entidades.editar` |
| DELETE | `/api/v1/entidades/{id}` | Eliminar | `entidades.eliminar` |
| GET | `/api/v1/entidades/{id}/jefes` | Jefes de entidad | `entidades.listar` |
| GET | `/api/v1/entidades/{id}/dependencias` | Dependencias | `dependencias.listar` |

### Usuarios

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/usuarios` | Listar | `usuarios.listar` |
| POST | `/api/v1/usuarios` | Crear | `usuarios.crear` |
| GET | `/api/v1/usuarios/{id}` | Ver | `usuarios.listar` |
| PUT | `/api/v1/usuarios/{id}` | Actualizar | `usuarios.editar` |
| DELETE | `/api/v1/usuarios/{id}` | Eliminar | `usuarios.editar` |

### Periodos

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/periodos` | Listar | `periodos.listar` |
| POST | `/api/v1/periodos` | Crear | `periodos.crear` |
| GET | `/api/v1/periodos/{id}` | Ver | `periodos.listar` |
| PUT | `/api/v1/periodos/{id}` | Actualizar | `periodos.editar` |
| GET | `/api/v1/periodos/{id}/metas` | Metas del periodo | `metas.listar` |
| GET | `/api/v1/periodos/{id}/evaluaciones` | Evaluaciones del periodo | `evaluaciones.listar` |

### Metas

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/metas` | Listar | `metas.listar` |
| POST | `/api/v1/metas` | Crear | `metas.crear` |
| GET | `/api/v1/metas/{id}` | Ver | `metas.listar` |
| PUT | `/api/v1/metas/{id}` | Actualizar | `metas.editar` |
| GET | `/api/v1/metas/{id}/evidencias` | Evidencias de la meta | `evidencias.listar` |
| POST | `/api/v1/metas/{id}/concertacion` | Crear concertación | `concertaciones.crear` |

### Dependencias

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/dependencias` | Listar | `dependencias.listar` |
| POST | `/api/v1/dependencias` | Crear | `dependencias.crear` |
| GET | `/api/v1/dependencias/{id}` | Ver | `dependencias.listar` |
| PUT | `/api/v1/dependencias/{id}` | Actualizar | `dependencias.editar` |
| DELETE | `/api/v1/dependencias/{id}` | Eliminar | `dependencias.editar` |

### Evidencias

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/evidencias` | Listar | `evidencias.listar` |
| POST | `/api/v1/evidencias` | Subir archivo | `evidencias.subir` |
| PUT | `/api/v1/evidencias/{id}/verificar` | Verificar (aprobar/rechazar) | `evidencias.verificar` |

### Concertaciones

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/concertaciones` | Listar | `concertaciones.listar` |
| PUT | `/api/v1/concertaciones/{id}` | Actualizar | `concertaciones.crear` |

### Ausentismos

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/ausentismos` | Listar | `ausentismos.listar` |
| POST | `/api/v1/ausentismos` | Crear | `ausentismos.crear` |
| PUT | `/api/v1/ausentismos/{id}` | Actualizar | `ausentismos.editar` |

### Movilidades

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/movilidades` | Listar | `movilidades.listar` |
| POST | `/api/v1/movilidades` | Crear | `movilidades.crear` |
| PUT | `/api/v1/movilidades/{id}` | Actualizar | `movilidades.editar` |

### Reportes

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/v1/reportes/concertacion` | Reporte concertación | `reportes.generar` |
| GET | `/api/v1/reportes/evaluaciones` | Reporte evaluaciones | `reportes.generar` |
| GET | `/api/v1/reportes/funcionario/{id}` | Reporte por funcionario | `reportes.generar` |

### Cargas Masivas

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/api/v1/cargas/usuarios` | Carga masiva usuarios | `cargas.ejecutar` |
| POST | `/api/v1/cargas/concertaciones` | Carga masiva concertaciones | `cargas.ejecutar` |
| POST | `/api/v1/cargas/evaluaciones` | Carga masiva evaluaciones | `cargas.ejecutar` |
| POST | `/api/v1/cargas/cursos` | Carga masiva cursos | `cargas.ejecutar` |
| GET | `/api/v1/cargas` | Historial de cargas | `cargas.listar` |

### Dashboard y Otros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/dashboard/resumen` | Resumen del dashboard |
| GET | `/api/v1/dashboard/actividad` | Actividad reciente |
| GET | `/api/v1/menu` | Menú dinámico por rol |
| GET | `/api/v1/notificaciones` | Listar notificaciones |
| PUT | `/api/v1/notificaciones/{id}/leer` | Marcar como leída |
| GET | `/api/v1/consulta-funcionario/{documento}` | Consulta pública funcionario |

---

## Base de Datos — 23 Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Servidores públicos (documento, nombres, email, cargo, vinculación) |
| `roles` | Roles del sistema (admin, evaluador, funcionario, jefe_entidad, jefe_dependencia) |
| `permisos` | Permisos granulares por módulo |
| `rol_permiso` | Asignación permisos → roles |
| `usuario_rol` | Asignación roles → usuarios (múltiples roles por usuario) |
| `entidades` | Entidades del Estado (código, nombre, tipo, NIT, municipio) |
| `dependencias` | Dependencias por entidad |
| `periodos` | Periodos evaluativos (fechas, estados: en_concertacion, en_evaluacion, cerrado) |
| `metas` | Metas de desempeño por periodo y funcionario |
| `concertaciones` | Concertación de metas |
| `evaluaciones` | Evaluaciones (heteroevaluacion, coevaluacion, autoevaluacion, definitiva) |
| `compromisos` | Compromisos con peso%, estado (pendiente→enviado→aprobado→cumplido/incumplido) |
| `evidencias` | Archivos de evidencia (PDF, DOC, XLS, JPG, PNG) |
| `ausentismos` | Registros de ausentismo |
| `movilidades` | Registros de movilidad laboral |
| `sesiones` | Sesiones JWT activas |
| `recuperaciones` | Tokens de recuperación de contraseña |
| `auditoria` | Registro de auditoría |
| `cargas_masivas` | Historial de cargas masivas |
| `cursos_induccion` | Cursos de inducción |
| `curso_participantes` | Participantes en cursos |
| `notificaciones` | Notificaciones internas del sistema |
| `parametros` | Parámetros de configuración (JWT, CORS, uploads) |

---

## Identidad Visual CNSC

| Elemento | Valor |
|----------|-------|
| Azul institucional | `#0A2B5E` |
| Rojo institucional | `#C4282B` |
| Verde institucional | `#1E5A3C` |
| Tipografía títulos | Montserrat (font-heading) |
| Tipografía cuerpo | Inter (font-sans) |
| Clases CSS | `edl-card`, `edl-btn-primary`, `edl-input`, `edl-divider`, `edl-divider-accent` |

---

## Seguridad

- **JWT** con expiración configurable (default: 120 min)
- **Rate limiting** por IP en endpoints de autenticación
- **Bloqueo de cuenta** después de 5 intentos fallidos
- **CORS** configurable por parámetro
- **Sanitización** de inputs (SanitizerHelper)
- **Validación** de datos (ValidatorHelper)
- **SecurityHeaders** middleware (X-Frame-Options, X-Content-Type-Options, etc.)
- **Middleware de permisos** granular por ruta
- **Middleware de tenant** para multi-entidad

---

## Despliegue

### GitHub Pages (Frontend)

El repositorio incluye un workflow `.github/workflows/deploy.yml` que automáticamente despliega el frontend a GitHub Pages en cada push a `main`.

### Backend (XAMPP/Apache)

1. Copiar `backend/` al directorio de XAMPP (`htdocs/`)
2. Importar `database/schema.sql` y `database/seeds.sql`
3. Configurar `.env` con credenciales locales
4. El archivo `.htaccess` redirige todas las peticiones a `public/index.php`

---

## Licencia

Uso interno — Comisión Nacional del Servicio Civil (CNSC)
