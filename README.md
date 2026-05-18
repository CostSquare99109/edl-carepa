<div align="center">

# 🏛️ EDL-CAREPA

### Sistema de Evaluación del Desempeño Laboral

**Alcaldía de Carepa — Antioquia, Colombia**

<img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php" alt="PHP 8.4" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
<img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
<img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />

---

</div>

## 📋 Descripción

Plataforma web integral para la **Evaluación del Desempeño Laboral (EDL)** de los servidores públicos de la **Alcaldía de Carepa**, implementada conforme al marco normativo colombiano y los lineamientos del Departamento Administrativo de la Función Pública.

Permite gestionar el ciclo completo de evaluación: **concertación de compromisos**, **seguimiento**, **calificación** y **retroalimentación**, con flujos de trabajo diferenciados por rol (evaluado, evaluador, comisión evaluadora, administración).

---

## ⚡ Características Principales

- 🔐 **Autenticación segura** — JWT con refresh token, bloqueo por intentos fallidos, recuperación por correo
- 👥 **Gestión de roles** — Evaluado, Evaluador, Comisión Evaluadora, Administrador Entidad, Administrador CAREPA
- 📝 **Concertación de compromisos** — Funcionales y comportamentales con aprobación/rechazo por el evaluador
- 📊 **Evaluaciones parciales y definitivas** — Semestrales, eventuales y de comisión evaluadora
- 🔔 **Notificaciones en tiempo real** — Alertas de compromisos pendientes, evaluaciones próximas
- 📤 **Carga masiva** — Importación de usuarios, concertaciones y evaluaciones desde archivos
- 📋 **Auditoría completa** — Trazabilidad de todas las acciones del sistema
- 🎨 **Identidad visual institucional** — Colores y tipografía de la Alcaldía de Carepa

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│    React 19 + TypeScript + TailwindCSS 4 + Vite     │
│              Puerto 5173 (desarrollo)                │
└────────────────────┬────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────┐
│                  BACKEND (PHP 8.4)                   │
│     Router propio · Controllers · Services · Repos   │
│              Puerto 8000 (built-in server)           │
└────────────────────┬────────────────────────────────┘
                     │ PDO MySQL
                     ▼
┌─────────────────────────────────────────────────────┐
│                    MySQL 8.0                         │
│           Base de datos: edl_carepa                 │
│        18 tablas · Triggers · Foreign Keys          │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Proyecto

```
edl-carepa/
├── backend/                    # API REST PHP 8.4
│   ├── public/
│   │   └── index.php           # Entry point + Router
│   ├── src/
│   │   ├── Config/             # Env, Database, CORS
│   │   ├── Controller/         # Auth, Usuarios, Evaluaciones, Compromisos...
│   │   ├── Middleware/         # Auth, CORS, Permisos
│   │   ├── Model/              # Entidades del dominio
│   │   ├── Repository/         # Capa de acceso a datos
│   │   ├── Service/            # Lógica de negocio
│   │   ├── Router/             # Enrutador personalizado
│   │   └── Helper/             # Response, Mail, JWT, Auditoría
│   ├── vendor/                 # Dependencias Composer
│   └── composer.json
│
├── frontend/                   # SPA React 19
│   ├── src/
│   │   ├── pages/              # Login, Dashboard, Admin, Compromisos, Evaluaciones...
│   │   ├── components/         # Layout, Sidebar, Cards
│   │   ├── lib/                # API client, Auth context
│   │   └── index.css           # Tailwind + estilos institucionales
│   ├── public/
│   │   └── escudo.png          # Escudo de Carepa
│   └── package.json
│
├── database/                   # Scripts SQL
│   ├── schema.sql              # Esquema completo (18 tablas)
│   ├── seeds.sql               # Roles, permisos, parámetros
│   ├── seed_usuarios.sql       # Datos de demostración
│   ├── migration_compromisos.sql
│   └── migration_edl_carepa.sql
│
└── README.md
```

---

## 🚀 Instalación Rápida

### Requisitos

- **PHP** ≥ 8.2 con extensiones: pdo_mysql, mbstring, openssl, json
- **MySQL** ≥ 8.0 o **MariaDB** ≥ 10.6
- **Node.js** ≥ 18 y **npm** ≥ 9
- **Composer** ≥ 2

### 1. Clonar el repositorio

```bash
git clone https://github.com/CostSquare99109/edl-carepa.git
cd edl-carepa
```

### 2. Base de datos

```bash
# Crear esquema y tablas
sudo mysql < database/schema.sql

# Cargar roles, permisos y parámetros
sudo mysql edl_carepa < database/seeds.sql

# Cargar datos de demostración (opcional)
sudo mysql edl_carepa < database/seed_usuarios.sql

# Aplicar migraciones
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

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api/v1

---

## 🔑 Roles del Sistema

| Rol | Código | Descripción |
|-----|--------|-------------|
| Administrador CAREPA | `admin_carepa` | Superadministrador global. Habilita entidades, gestiona parámetros y soporte |
| Administrador Entidad | `admin_entidad` | Jefe de Personal. Crea/gestiona usuarios de su entidad |
| Evaluador | `evaluador` | Aprueba compromisos, califica evaluaciones |
| Evaluado | `evaluado` | Propone compromisos, registra evidencias, autoevaluación |
| Comisión Evaluadora | `comision_evaluadora` | Órgano colegiado. Evalúa y aprueba calificaciones definitivas |
| Jefe de Dependencia | `jefe_dependencia` | Gestiona dependencia y evaluaciones de su área |

---

## 🔐 Credenciales de Demostración

> ⚠️ **Regenerar los hashes de contraseña antes de producción**

| Usuario | Email | Clave | Rol |
|---------|-------|-------|-----|
| Admin | (crear con reset_admin.php) | — | admin_carepa |
| María Rodríguez | maria.rodriguez@carepa.gov.co | Eval2026! | Evaluador |
| Andrea Sánchez | andrea.sanchez@carepa.gov.co | Jefe2026! | Jefe de Entidad |
| Juan Gómez | juan.gomez@carepa.gov.co | Func2026! | Evaluado |

---

## 🎨 Identidad Visual

| Elemento | Valor |
|----------|-------|
| Azul institucional | `#003366` / `#0A2B5E` |
| Rojo institucional | `#C4282B` |
| Verde institucional | `#1E5A3C` |
| Tipografía títulos | Montserrat (700, 800) |
| Tipografía cuerpo | Inter (300–700) |
| Escudo | Escudo del Municipio de Carepa (1983) |

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/v1/auth/login           # Iniciar sesión
POST   /api/v1/auth/registro        # Registrar cuenta
POST   /api/v1/auth/recuperar       # Solicitar código de recuperación
POST   /api/v1/auth/verificar-codigo # Verificar código
POST   /api/v1/auth/nueva-contrasena # Cambiar contraseña
GET    /api/v1/auth/me              # Datos del usuario actual
POST   /api/v1/auth/logout          # Cerrar sesión
```

### Compromisos (Concertación)
```
GET    /api/v1/compromisos           # Listar compromisos
POST   /api/v1/compromisos/enviar    # Proponer compromiso
GET    /api/v1/compromisos/pendientes # Pendientes de aprobación
PUT    /api/v1/compromisos/{id}/aprobar  # Aprobar compromiso
PUT    /api/v1/compromisos/{id}/rechazar # Devolver compromiso
PUT    /api/v1/compromisos/{id}/calificar # Calificar cumplimiento
```

### Evaluaciones
```
GET    /api/v1/evaluaciones          # Listar evaluaciones
POST   /api/v1/evaluaciones          # Crear evaluación
GET    /api/v1/evaluaciones/{id}     # Ver detalle
PUT    /api/v1/evaluaciones/{id}/calificar # Calificar
PUT    /api/v1/evaluaciones/{id}/comision  # Aprobar comisión
```

### Administración
```
GET    /api/v1/dashboard/admin-stats # Estadísticas del dashboard
GET    /api/v1/entidades             # Gestionar entidades
GET    /api/v1/usuarios              # Gestionar usuarios
POST   /api/v1/cargas                # Carga masiva
```

---

## 📄 Licencia

Proyecto de uso interno — **Alcaldía de Carepa, Antioquia**

> _"Trabajo y Tesón"_ — Lema del Municipio de Carepa, 1983

---

<div align="center">

**Alcaldía de Carepa** · Carepa, Antioquia, Colombia

</div>
