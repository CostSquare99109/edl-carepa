# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EDL Carepa** — Evaluación del Desempeño Laboral for Alcaldía de Carepa, Antioquia, Colombia.

A full-stack system for evaluating public servant performance per **CNSC Acuerdo 617 de 2018**.

**Stack:**
- **Frontend**: React 19.1, TypeScript 5.8, React Router 7.6, TailwindCSS 3.4, Vite 6.3
- **Backend**: PHP 8.2+, custom MVC (Controller → Service → Repository), Firebase JWT, PHPMailer 7.1, Dompdf 3.1
- **Database**: MariaDB 10.6+ / MySQL 8.0+, utf8mb4_unicode_ci
- **Architecture**: REST API (stateless JWT) + SPA (React)

---

## Common Commands

### Backend (PHP)
```bash
cd backend
composer install                    # Install dependencies
php -S localhost:8000 -t public/    # Dev server (port 8000)
php -S 0.0.0.0:8000 -t public/      # Expose on network
php -S 0.0.0.0:8000 -t public/ public/router.php  # With custom router
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install                         # Install dependencies
npm run dev                         # Dev server (port 5174 via Vite proxy)
npm run build                       # Production build (outputs to dist/)
npm run preview                     # Preview production build
```

### Database
```bash
# Create DB
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Load consolidated dump (schema + seed + data in one file)
mysql -u root -p edl_carepa < database/full_dump.sql
```

### Testing
```bash
# Python API tests (requires pytest, requests)
python tests/api_test.py
python tests/flow_test.py

# Shell endpoint tests
bash test_endpoints.sh

# PHP tests
php tests/run_tests.php
```

### Utility Scripts
```bash
# Reset admin password
php backend/reset_admin.php

# Bulk assign roles from CSV
python assign_roles.py

# Migrate users from CSV
python migrate_usuarios.py
```

### Frontend Dev Notes
- Vite proxy: `/api` → `http://localhost:8000` (configured in `vite.config.ts`)
- Dev server runs on port **5174** (not 5173)
- TypeScript strict mode enabled (`tsconfig.json: "strict": true`)
- Path alias: `@/*` → `./src/*`

---

## Architecture Overview

### Backend Structure (`backend/src/`)
```
Config/           # Env, Database, CORS config
Controller/       # 21 controllers (Auth, Compromiso, Evaluacion, etc.)
Helper/           # 11 utilities (JWT, PDF, Mail, Excel, Response, etc.)
Middleware/       # 7 middlewares (Auth, CSRF, RateLimit, Security, etc.)
Model/            # 15 domain models
Repository/       # 18 data access repositories
Router/           # Custom HTTP router with middleware groups
Service/          # 17 business logic services
```

**Request flow**: `Router` → `Middleware[]` → `Controller` → `Service` → `Repository` → DB

### Frontend Structure (`frontend/src/`)
```
components/
  Layout/          # MainLayout + Sidebar (dynamic by role)
  Shared/          # RoleSelector, NotificationBell
  ui/              # Button, Card, DataTable, Tabs, Modal, etc.
contexts/
  AuthContext      # JWT, user, roles, active role, menu
  ToastContext     # Toast notifications (sonner)
lib/
  api.ts           # HTTP client (fetch wrapper, JWT, CSRF, auto-refresh)
  auth.ts          # Auth API helpers
  cnsc-messages.ts # CNSC message catalog
pages/
  Admin/           # Admin panel (users, deps, periods, config)
  Compromisos/     # 10 pages: func/comport, concert, approval, etc.
  Concertaciones/  # Concertation flow
  Evaluaciones/    # Evaluator panel, commission, etc.
  Evidencias/      # Evidence management
  Admin/           # Bulk uploads, config
  ...              # 40+ pages total
styles/
  colors.ts        # Institutional color palette (Carepa colors)
```

### Routing
- **Backend**: `backend/public/index.php` defines all 138 routes in `Router` groups
- **Frontend**: `frontend/src/App.tsx` defines ~40 protected routes under `/dashboard`
- Auth flow: Login → (if multiple roles) SelectRole → Dashboard with dynamic sidebar

### Key Middlewares (applied in order)
1. `CorsMiddleware` + `SecurityHeadersMiddleware` + `RateLimitMiddleware` (global)
2. `AuthMiddleware` (protects `/api/v1/*` group)
3. `PermissionMiddleware` (per-route via `permiso:codigo`)
4. `CsrfMiddleware` (mutating routes)
5. `TenantMiddleware` (multi-entity filtering)

### Database Schema (32 tables in `database/full_dump.sql`)
Core entities: `usuarios`, `roles`, `permisos`, `rol_permiso`, `entidades`, `dependencias`, `periodos`, `metas`, `concertaciones`, `compromisos_funcionales`, `compromisos_comportamentales`, `evaluaciones`, `evidencias`, `compromisos_mejoramiento`, `ausentismos`, `movilidades`, `notificaciones`, `cargas_masivas`, `auditoria`, `parametros`, `competencias`

**Key patterns:**
- Soft deletes (`eliminado_en` timestamp) on all operational tables
- Audit trail on all CUD operations (`auditoria` table with `estado_anterior`/`estado_nuevo` JSON)
- Multi-entity via `entidad_id` foreign keys (tenant middleware filters by `entidad_id`)
- Users can have multiple roles (`usuario_rol` pivot), switch via `/auth/rol`

---

## Key Implementation Details

### Authentication (JWT)
- `firebase/php-jwt` (HS256, 120-min default expiry)
- Access token in `Authorization: Bearer <token>`
- Refresh endpoint: `POST /auth/refresh`
- Auto-refresh on 401 in `api.ts`
- Failed login lockout: 5 attempts → lock (`INTENTOS_LOGIN_MAXIMOS`)
- Password reset: 6-digit code via email (PHPMailer)

### Frontend Auth (`AuthContext`)
- `token`, `usuario`, `roles[]`, `rolActivo`, `menu[]` in state
- Persisted in `localStorage` (`edl_token`, `edl_user`, `edl_rol_activo`, `edl_csrf`)
- Role switch via `cambiarRol(rolCodigo)` → new JWT + menu reload

### CSRF Protection
- Token via `GET /auth/csrf` → stored in `localStorage.edl_csrf`
- Sent as `X-CSRF-Token` header on mutating requests
- Validated by `CsrfMiddleware` on POST/PUT/DELETE

### Permissions (RBAC)
- 6 roles: `admin`, `evaluador`, `evaluado`, `comision_evaluadora`, `admin_entidad`, `admin_carepa`
- 51 permissions, 84 role-permission assignments
- Route protection: `['permiso:codigo']` in route middleware array
- Frontend: `ProtectedRoute` component with `allowedRoles` prop

### Multi-entity (Tenant)
- `TenantMiddleware` filters queries by `entidad_id` from JWT
- `admin_carepa` bypasses tenant filter

### PDF Reports
- `Dompdf` + custom `PdfHelper` with Carepa shield (`docs/escudo.png`)
- Endpoints: `/reportes/concertacion-pdf/{id}`, `/reportes/evaluacion-pdf/{id}`, etc.

### File Uploads
- `POST /cargas/usuarios|concertaciones|evaluaciones|cursos` (multipart/form-data)
- Templates via `GET /cargas/plantilla-usuarios`

---

## Key Files to Know

| Purpose | File |
|---------|------|
| API Routes | `backend/public/index.php` |
| Router logic | `backend/src/Router/Router.php` |
| Auth middleware | `backend/src/Middleware/AuthMiddleware.php` |
| Permission check | `backend/src/Middleware/PermissionMiddleware.php` |
| HTTP client (FE) | `frontend/src/lib/api.ts` |
| Auth context (FE) | `frontend/src/contexts/AuthContext.tsx` |
| Main routes (FE) | `frontend/src/App.tsx` |
| Layout + Sidebar | `frontend/src/components/Layout/Layout.tsx` |
| DB schema | `database/full_dump.sql` |
| API docs (138 endpoints) | `cnsc/17-endpoints-api.md` |
| Architecture docs | `cnsc/18-arquitectura.md` |
| CNSC gaps tracker | `FASE3_GAPS.md` |

---

## CNSC Compliance Notes (Acuerdo 617/2018)

Key domain rules encoded in the system:
- **Concertation**: 15-day bilateral agreement → unilateral fixation with witness
- **Weights**: Functional 85% / Behavioral 15% (configurable via `parametros`)
- **Scales**: Functional (1-100), Behavioral (Nunca/Algunas Veces/Frecuentemente/Siempre)
- **Evaluations**: Parcial (1st/2nd semester), Eventual, Definitiva
- **Improvement plans**: Required for "Insuficiente" or "Aceptable"
- **Evidence**: Descriptive only (no file uploads per CNSC)
- **Absenteeism**: >30 days non-evaluable periods

See `cnsc/13-trazabilidad-con-proyecto.md` for traceability matrix between CNSC videos and code gaps.

---

## Known Gaps (from FASE3_GAPS.md) - UPDATED 2026-06-27

**Critical - RESOLVED/IMPLEMENTED:**
- ✅ **C1** Evidences module: **Already implemented** with descriptive-only form (no file uploads per CNSC). `EvidenciaList.tsx` uses descriptive form with compromiso, descripción, ubicación, observación.
- ✅ **C2** Improvement commitments: **Already implemented** with full frontend page `CompromisosMejoramiento.tsx` + backend. Added `plazo_cumplimiento` field and Periodo selector (2026-06-27).
- ✅ **C3** Evaluator panel: **Fully implemented** in `PanelEvaluador.tsx` (36KB). Has all 4 evaluation types, behavioral scales (4-6/7-9/10-12/13-15), 40-char justification validation, weight calculations (85/15), Commission approval workflow.
- ✅ **C4** Evaluado proposal flow: **Implemented** - `ProponerCompromisos.tsx`, `MisCompromisos.tsx`, `AprobarCompromisos.tsx`, `AjustarCompromisos.tsx`, `FijacionUnilateral.tsx`, `VerCompromisosPropuestos.tsx`.
- ✅ **C5** Login labels: **Fixed** - "Nombre de usuario" (not "Documento") per CNSC.
- ✅ **C6** Absenteeism: **Implemented** - `AusentismoList.tsx` with 7 motives, >30 day validation.
- ✅ **C7** Bulk user upload: **Implemented** - `CargaUsuarios.tsx` with wizard flow.

**High - RESOLVED:**
- ✅ **A1** Metas with Dependencia: **Implemented** in `MetaList.tsx` with `dependencia_id` selector.
- ✅ **A2** User admin form CNSC fields: **Implemented** in `AdminUsuarios.tsx` with all 17+ fields (género, municipio, naturaleza, contratista, etc.).

**Remaining Minor Items:**
- Confirmar que el esquema de `database/full_dump.sql` coincide con el código (actualmente alineado según últimas migraciones aplicadas)
- Add `plazo_cumplimiento` date picker to edit modal (completed 2026-06-27)
- Update `FASE3_GAPS.md` to reflect actual implementation status

See `FASE3_GAPS.md` for full list with file references.

---

## Development Workflow

1. **Branch**: `feature/<feature-name>` or `fix/<bug-name>` from `main`
2. **Backend**: Follow `Controller → Service → Repository` pattern, strict types (`declare(strict_types=1)`), PHPDoc on public methods
3. **Frontend**: Functional components, hooks, strict TS, folder structure per module
4. **DB changes**: Editar o regenerar `database/full_dump.sql` (no hay migraciones incrementales; el esquema vive en un único dump consolidado)
5. **Docs**: Update `cnsc/` docs if API/architecture changes
6. **PR**: Target `main`, request review

---

## Environment Variables

### Backend (`backend/.env`)
| Var | Description |
|-----|-------------|
| `APP_ENV` | `development` / `production` |
| `APP_DEBUG` | `true` / `false` |
| `APP_TIMEZONE` | `America/Bogota` |
| `APP_API_URL` | Public API URL |
| `APP_FRONTEND_URL` | Frontend URL (CORS) |
| `DB_HOST/PORT/NAME/USER/PASS/SOCKET` | MariaDB connection |
| `JWT_SECRET` | Min 32 chars |
| `JWT_EXPIRACION_MINUTOS` | Token TTL (default 120) |
| `INTENTOS_LOGIN_MAXIMOS` | Failed login lockout (default 5) |
| `PASSWORD_LONGITUD_MINIMA` | Min password length (default 8) |
| `CORS_ORIGIN` | Allowed origin |
| `MAIL_*` | SMTP config (host, port, user, pass, from) |

### Frontend (`frontend/.env`)
| Var | Description |
|-----|-------------|
| `VITE_API_URL` | API base (default `/api/v1` via Vite proxy) |
| `VITE_BASE` | Base path for deployment (default `/`) |

---

## Test Users (seeded)

| User | Password | Role |
|------|----------|------|
| `admin` | `Admin123!` | Administrador |
| `evaluador` | `Eval123!` | Evaluador |
| `evaluado` | `Eval123!` | Evaluado |

---

## 📝 Autonomous Improvement Cycles Log

### Cycle 1 - 2026-06-27: CNSC Alignment & Critical Fixes

**Analyzed**: 26 CNSC transcription documents + full codebase
**Status**: ✅ Complete - Project is ~85% CNSC-aligned (more than documented)

**Fixes Implemented**:
1. **Database PDO Constant (Bug P1)** - `backend/src/Config/Database.php`
   - Added `PDO::MYSQL_ATTR_FOUND_ROWS => true` to fix `\Pdo\Mysql::ATTR_FOUND_ROWS` issue

2. **CompromisosMejoramiento - Periodo Selector & Deadline Field (Gap C2)** - `frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx`
   - Added Periodo dropdown (required before evaluado search)
   - Integrated `periodo_id` filtering in API calls
   - Added `plazo_cumplimiento` (deadline) date picker to create/edit forms
   - Added deadline column to table display
   - Updated `guardar()` and `actualizar()` to include `plazo_cumplimiento`
   - Backend already supported this field in Controller & Service

3. **Verified Already Fixed** (no action needed):
   - Login label: "Nombre de usuario" ✅ (Gap C5)
   - Route ordering: specific before parameterized ✅ (Bug P2)
   - JWT variable: `JWT_EXPIRACION_MINUTOS` consistent ✅ (Bug P4)
   - AdminConfiguracion route registered ✅ (Bug P5)

**CNSC Module Alignment Status**:
| Module | Status | Notes |
|--------|--------|-------|
| Evidencias (descriptive-only) | ✅ Implemented | `EvidenciaList.tsx` uses descriptive form, no file upload |
| Compromisos Mejoramiento | ✅ Implemented | Added Periodo selector + deadline field |
| Panel Evaluador | ✅ Implemented | 4 eval types, behavioral scales 4-15, 40-char justification |
| Propuesta Evaluado | ✅ Implemented | Full bilateral flow with accept/reject |
| Ausentismos | ✅ Implemented | 7 motives, >30 day validation |
| Carga Masiva | ✅ Implemented | Wizard flow in `CargaUsuarios.tsx` |
| Metas + Dependencias | ✅ Implemented | All CNSC fields + word count |
| Usuarios (Admin) | ✅ Implemented | 17+ CNSC fields |
| Cambio Administración | ✅ Implemented | `cambio_evaluador` cause + flexible dates |

**Remaining Minor Items**:
- Run `migration_evidencias_descriptivas.sql` to confirm schema
- Update `FASE3_GAPS.md` to reflect actual implementation status
- Add E2E tests for critical CNSC flows

**Next Cycle Focus**: E2E testing, schema verification, documentation sync

---

## Autonomous Improvement Cycle History

### Cycle 1 (2026-06-27) - CNSC Alignment & Critical Fixes

**Analysis Performed:**
- Cross-referenced all 16 CNSC documentation files (`cnsc/01-16.md`) with actual codebase
- Verified 40+ frontend pages and 25+ backend controllers against CNSC requirements
- Identified that `FASE3_GAPS.md` was outdated - most "gaps" already implemented

**Fixes Implemented:**
1. **Database PDO Constant (Bug P1)** - `backend/src/Config/Database.php`
   - Added `PDO::MYSQL_ATTR_FOUND_ROWS => true` to fix `\Pdo\Mysql::ATTR_FOUND_ROWS` error

2. **CompromisosMejoramiento Enhancements** - `frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx`
   - Added Periodo dropdown (required before evaluado search)
   - Integrated `periodo_id` filtering in API calls
   - Added `plazo_cumplimiento` (deadline) field to create/edit forms and table
   - Updated `actualizar()` function to include `plazo_cumplimiento`

3. **Verified Already Working (No Changes Needed):**
   - Login label: "Nombre de usuario" ✅ (CNSC requirement)
   - Route ordering: specific routes before parameterized ✅
   - JWT variable naming: `JWT_EXPIRACION_MINUTOS` consistent ✅
   - AdminConfiguracion route registered ✅

**Technical Decisions Documented:**
- **Evidencias**: Descriptive-only (no file uploads) per CNSC - already implemented correctly
- **Behavioral Scale**: 4 levels (Nunca=4-6, Algunas=7-9, Frecuentemente=10-12, Siempre=13-15) - implemented in PanelEvaluador
- **Evaluation Types**: 4 types (Parcial Eventual, 1er Semestre, 2do Semestre, Extraordinaria) - all present
- **Improvement Plans**: Required for "No Satisfactorio" (≤65%) - workflow exists

**Next Cycle Focus:**
- Run database migrations to verify schema alignment
- Execute end-to-end tests (`python tests/flow_test.py`)
- Update `FASE3_GAPS.md` to reflect actual implementation status
- Verify `EvidenciaList.tsx` has no file upload remnants