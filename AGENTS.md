# AGENTS.md — EDL Carepa

## Quick Start

```bash
# Backend (PHP 8.2+)
cd backend
cp .env.example .env
# Edit .env with DB credentials, JWT_SECRET, SMTP
composer install
php -S localhost:8000 -t public/

# Frontend (Node 20, React 19, Vite 6)
cd frontend
# Create .env with VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev          # Dev server on :5173 (proxies /api to :8000)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

## Project Structure

```
edl-carepa/
├── backend/                    # PHP 8.2 MVC (Controller → Service → Repository)
│   ├── public/index.php        # Single entry point, all routes defined here
│   ├── src/
│   │   ├── Controller/         # 21 controllers
│   │   ├── Service/            # 17 services (business logic)
│   │   ├── Repository/         # 18 repositories (SQL via PDO)
│   │   ├── Model/              # 15 domain models
│   │   ├── Middleware/         # Auth, CORS, CSRF, RateLimit, SecurityHeaders, Permission, Tenant
│   │   ├── Helper/             # JWT, PDF, Mail, Upload, Validator, Sanitizer, etc.
│   │   ├── Router/             # Custom sequential router (regex-based)
│   │   └── Config/             # Database, Env
│   ├── storage/                # Local storage (sessions, cache)
│   └── uploads/                # User uploads
├── frontend/                   # React 19 + TypeScript + Vite 6 + TailwindCSS 3.4
│   ├── src/
│   │   ├── App.tsx             # ~105 lines, ~40 protected routes
│   │   ├── components/
│   │   │   ├── Layout/         # Layout + Sidebar (dynamic from MenuController)
│   │   │   ├── Shared/         # RoleSelector, NotificationBell, AppHeader
│   │   │   └── ui/             # 10 primitives (Button, Card, DataTable, Tabs, Modal, etc.)
│   │   ├── contexts/           # AuthContext (JWT in localStorage), ToastContext
│   │   ├── lib/
│   │   │   ├── api.ts          # Fetch wrapper with JWT auth
│   │   │   ├── auth.ts         # Auth helpers
│   │   │   ├── mensajesCNSC.ts # Literal CNSC messages
│   │   │   └── hooks/          # Custom hooks
│   │   ├── pages/              # 43 pages organized by module
│   │   └── styles/colors.ts    # Institutional palette (Carepa blue #0A2B5E)
│   ├── vite.config.ts          # Proxy /api → http://localhost:8000
│   └── tailwind.config.js      # Institutional colors configured
├── database/                   # 9 SQL files (schema + seeds + 6 migrations)
├── cnsc/                       # Technical docs aligned with CNSC Acuerdo 617/2018
│   ├── 17-endpoints-api.md     # 138 endpoints documented
│   ├── 18-arquitectura.md      # Architecture reference
│   └── FASE3_GAPS.md           # Current gap analysis (CRITICAL → LOW)
├── tests/                      # Python (pytest) + PHP test scripts
└── .github/workflows/deploy.yml # GitHub Pages deploy for frontend
```

## Key Commands

| Task | Command |
|------|---------|
| Backend dev server | `php -S localhost:8000 -t backend/public/` |
| Backend with router | `php -S 0.0.0.0:8000 -t backend/public/ backend/public/router.php` |
| Frontend dev | `cd frontend && npm run dev` |
| Frontend build | `cd frontend && npm run build` |
| DB setup | `mysql -u root -p edl_carepa < database/schema.sql && mysql -u root -p edl_carepa < database/seeds.sql` |
| Apply migrations | Run 6 migration_*.sql files in order (see README) |
| API tests | `python tests/api_test.py` (requires pytest, requests) |
| Flow tests | `python tests/flow_test.py` |
| Shell endpoint tests | `bash test_endpoints.sh` |
| PHP tests | `php tests/run_tests.php` |
| Reset admin password | `php backend/reset_admin.php` |
| Assign roles from CSV | `python assign_roles.py` |

## Architecture Essentials

### Backend (PHP)
- **Router**: Sequential regex matcher in `public/index.php` — fixed routes MUST precede param routes (e.g., `/evaluaciones/pendientes-calificar` before `/evaluaciones/{id}`)
- **Auth**: JWT (firebase/php-jwt), 120-min expiry, Bearer token in Authorization header
- **Middleware chain**: Cors → SecurityHeaders → RateLimit → Auth → Permission
- **Response format**: `{code: "01", message: "...", data: {...}}` — codes: 01=OK, 02=Error, 42=Validation, 43=Unauthorized, 44=Forbidden, 45=NotFound
- **Soft delete**: All operational tables have `eliminado_en` (nullable timestamp)
- **RBAC**: 6 roles, 51 permissions, 84 role-permission assignments
- **Multi-role**: Users can have multiple roles, switch via `/auth/rol` without logout

### Frontend (React)
- **Auth flow**: Login → JWT in localStorage → AuthContext → ProtectedRoute guards routes → api.ts attaches Bearer token
- **Dynamic menu**: `MenuController::obtener` returns options for active role; Sidebar renders them
- **Role switching**: SelectRolePage lets users pick active role; stored in AuthContext
- **Proxy**: Vite proxies `/api` to `http://localhost:8000` (see vite.config.ts)

### Database
- **Main tables**: usuarios, dependencias, entidades, periodos, metas, concertaciones, evaluaciones, compromisos, compromisos_mejoramiento, evidencias, ausentismos, movilidades, notificaciones, competencias, parametros
- **Charset**: utf8mb4_unicode_ci
- **FKs**: Enforced at DB level; soft delete via `eliminado_en`

## Critical Conventions

### PHP
- `declare(strict_types=1)` at top of every file
- PSR-12 coding style
- Controller → Service → Repository layering (no DB in controllers)
- PHPDoc on public methods
- All SQL via prepared statements (PDO)

### TypeScript/React
- Strict mode (`tsconfig.json`: `"strict": true`)
- Functional components + hooks
- Interfaces for props (e.g., `interface ButtonProps { ... }`)
- Path alias `@/*` → `./src/*`
- Institutional colors via `colors.ts` / Tailwind config

### SQL
- snake_case table/column names
- FK naming: `fk_<tabla_origen>_<tabla_destino>`
- Migrations as incremental `.sql` files in `database/`

## API Endpoints (138 total)

Key groups (base: `/api/v1`):
- `auth/*` (10): login, registro, recuperar, verificar-codigo, reset, logout, perfil, password, rol, refresh, csrf
- `usuarios/*` (8): CRUD + buscar-global + roles + reset-password
- `entidades/*` (8): CRUD + con-jefe-personal + jefes + dependencias + habilitar
- `dependencias/*` (6): CRUD + estado
- `periodos/*` (6): CRUD + metas + evaluaciones
- `metas/*` (5): CRUD + evidencias
- `concertaciones/*` (10): CRUD + fijar + fijar-unilateral + verificar-fijacion + validar-compromisos + compromisos
- `evaluaciones/*` (9): listar, crear, pendientes-calificar, buscar-evaluado, ver, calificar, parcial, definitiva, comision, guardar, solicitar-revision, finalizar
- `compromisos/*` (21): CRUD func/comport, enviar, aceptar/rechazar evaluado, concertacion, pendientes, propuestos, aprobar/rechazar/devolver, calificar, pesos
- `compromisos-mejoramiento/*` (5): CRUD + seguimiento + completar
- `evidencias/*` (4): CRUD + compromisos-evaluado
- `reportes/*` (10): concertacion, evaluaciones, funcionario, resumen, entidad, dependencia, compromisos, excel, pdf
- `ausentismos/*` (5), `movilidades/*` (6), `cargas/*` (6), `competencias/*` (2)

## Test Users (from seed_usuarios.sql)

| User | Password | Role |
|------|----------|------|
| admin | Admin123! | admin_carepa |
| evaluador | Eval123! | evaluador |
| evaluado | Eval123! | evaluado |

## Current Known Gaps (from FASE3_GAPS.md)

**CRITICAL** (block basic functionality):
- C1: Evidencias module — wrong design (should be descriptive, not file upload)
- C2: Compromisos de Mejoramiento — missing frontend page
- C3: PanelEvaluador — missing evaluation type dropdown, motivo/razón, datepicker, behavioral scale, justification validation, summary
- C4: Evaluado proposal flow — missing "Proponer compromisos" page
- C5: Login labels — "Documento" → "Nombre de usuario"
- C6: Ausentismos — missing frontend page
- C7: Carga Masiva Usuarios — missing frontend page

**HIGH** (significant functionality):
- A1: Metas missing dependencia field
- A2: AdminUsuarios missing many CNSC-required fields
- A3: Dependencias missing "cambiar estado" with validation
- A4: Periodos should be read-only informational
- A5: Commission evaluadora approval flow incomplete
- A6: Calification scales logic missing (85/15 split, behavioral scale, final scale)
- A7: Menu evaluado missing "Proponer compromisos"

## Environment Variables

### Backend (.env)
Required: `APP_ENV`, `APP_DEBUG`, `APP_TIMEZONE`, `APP_API_URL`, `APP_FRONTEND_URL`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET` (min 32 chars), `JWT_EXPIRACION_MINUTOS`, `CORS_ORIGIN`
Optional: `DB_SOCKET`, `INTENTOS_LOGIN_MAXIMOS`, `PASSWORD_LONGITUD_MINIMA`, `MAIL_*` (for email features)

### Frontend (.env)
Required: `VITE_API_URL` (default: `http://localhost:8000/api/v1`)

## Deployment

- **Frontend**: GitHub Pages via `.github/workflows/deploy.yml` (triggers on push to main)
- **Backend**: Apache/Nginx + PHP-FPM, document root = `backend/public/`
- **Database**: MariaDB 10.6+ / MySQL 8.0+

## Documentation References

- `cnsc/00-indice-maestro.md` — Master index of all CNSC docs
- `cnsc/17-endpoints-api.md` — Full API reference (138 endpoints)
- `cnsc/18-arquitectura.md` — Architecture deep dive
- `cnsc/13-trazabilidad-con-proyecto.md` — Gap traceability to CNSC norm
- `cnsc/14-futuro-del-proyecto.md` — Roadmap
- `FASE3_GAPS.md` — Prioritized gap list with file references
- `README.md` — Full project overview, install, usage, contribution

## Gotchas for Agents

1. **Router order matters**: Fixed routes before param routes in `public/index.php`
2. **Multi-role auth**: Check `rolActivo` not just roles array; user switches roles via `/auth/rol`
3. **Soft delete**: Always filter `WHERE eliminado_en IS NULL` in repositories
4. **CNSC messages**: Use `MensajesCNSC` helper (backend) / `mensajesCNSC.ts` (frontend) for literal strings
5. **Proxy in dev**: Frontend calls `/api` → Vite proxies to `:8000`; production uses direct API URL
6. **No PHP framework**: Custom MVC — don't expect Laravel/Symfony patterns
7. **No frontend tests configured**: Only Python/Shell API tests exist
8. **DB socket**: Default `.env.example` uses `/tmp/mysql.sock` — may need adjustment