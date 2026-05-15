# EDL-CNSC — Evaluación del Desempeño Laboral

Sistema de Evaluación del Desempeño Laboral para la Comisión Nacional del Servicio Civil (CNSC) de Colombia.

## Arquitectura

- **Backend**: PHP 8.2+ — Arquitectura hexagonal, REST API
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Base de datos**: MariaDB/MySQL
- **Autenticación**: JWT (firebase/php-jwt)

## Requisitos

- PHP 8.2+ con extensiones: pdo_mysql, mbstring, json
- MariaDB 10.6+ / MySQL 8.0+
- Node.js 18+ y npm
- Composer

## Instalación rápida

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
# Editar .env con credenciales de base de datos
```

Crear la base de datos:

```bash
mysql -u root -p < database/schema.sql
```

Insertar datos iniciales:

```bash
mysql -u root -p edl_cnsc < database/seed.sql
```

Iniciar servidor:

```bash
php -S localhost:8000 -t public/
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acceder en: http://localhost:5173

## Credenciales por defecto

- **Documento**: 12345678
- **Tipo**: CC
- **Contraseña**: Admin2026!

## Estructura del proyecto

```
edl-app/
├── backend/
│   ├── public/index.php          # Entry point
│   ├── src/
│   │   ├── Config/               # Env, Database
│   │   ├── Controller/           # 17 controladores REST
│   │   ├── Helper/               # JwtHelper, ResponseHelper, ValidatorHelper
│   │   ├── Middleware/            # Auth, CORS, RateLimit, SecurityHeaders
│   │   ├── Model/                # 15 modelos de dominio
│   │   ├── Repository/           # 16 repositorios (CRUD)
│   │   ├── Router/               # Router con middleware pipeline
│   │   └── Service/              # 15 servicios de negocio
│   ├── database/                 # Schema SQL y seeds
│   └── vendor/                   # Dependencias Composer
├── frontend/
│   ├── src/
│   │   ├── components/Layout/    # Header institucional + Sidebar
│   │   ├── contexts/AuthContext  # Auth state management
│   │   ├── lib/                  # API client, auth service
│   │   └── pages/                # 8+ páginas (Login, Dashboard, CRUD)
│   └── dist/                     # Build de producción
└── README.md
```

## API Endpoints

| Módulo | Ruta | Métodos |
|--------|------|---------|
| Auth | `/api/v1/auth/*` | POST login/logout, GET perfil |
| Dashboard | `/api/v1/dashboard/*` | GET resumen/actividad |
| Usuarios | `/api/v1/usuarios` | CRUD completo |
| Entidades | `/api/v1/entidades` | CRUD + jefes + dependencias |
| Periodos | `/api/v1/periodos` | CRUD + metas + evaluaciones |
| Metas | `/api/v1/metas` | CRUD + evidencias + concertación |
| Evaluaciones | `/api/v1/evaluaciones` | CRUD + calificar + compromisos |
| Evidencias | `/api/v1/evidencias` | Listar, subir, verificar |
| Reportes | `/api/v1/reportes/*` | Concertación, evaluaciones, funcionario |
| Cargas | `/api/v1/cargas/*` | Carga masiva usuarios/concertaciones |

## Licencia

Uso interno — CNSC
