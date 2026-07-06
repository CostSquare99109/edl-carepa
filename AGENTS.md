# AGENTS.md — EDL Carepa

> Guía para agentes IA que operen sobre este repositorio. Solo hechos verificables; lo que un agente probablemente fallaría sin ayuda.

## Quick start

```bash
# Backend (PHP 8.2+)
cd backend && cp .env.example .env
# Editar .env: DB_*, JWT_SECRET (min 32 chars), CORS_ORIGIN, MAIL_*
composer install
php -S localhost:8000 -t public/ public/router.php

# Frontend (Node 20, React 19, Vite 6)
cd frontend && echo "VITE_API_URL=/api/v1" > .env
npm install && npm run dev        # :5173, proxy /api -> :8000
npm run build                     # producción -> dist/
```

## Comandos frecuentes

| Tarea | Comando |
|---|---|
| BD (reload completo) | `mysql -u root -p edl_carepa < database/full_dump.sql` |
| BD socket alternativo | `mysql -u root -p --socket=/var/run/mysqld/mysqld.sock edl_carepa < …` |
| Reset admin password | `php backend/reset_admin.php` |
| Tests API | `python tests/api_test.py` (pytest + requests) |
| Tests bash | `bash test_endpoints.sh` |
| Tests PHP | `php tests/run_tests.php` |

## Arquitectura esencial

### Backend PHP

- **Router** secuencial por regex en `backend/public/index.php`. 138 rutas. **Rutas fijas SIEMPRE antes de parametricas** (ej. `/evaluaciones/pendientes-calificar` antes de `/evaluaciones/{id}`).
- **Auth**: JWT HS256. Token en `Authorization: Bearer` o `?token=` (query param). Middleware: `Cors` → `SecurityHeaders` → `RateLimit` → `Auth` → `Permission` → `Csrf` → `Tenant`.
- **Respuesta**: `{ "code": "01", "message": "...", "data": {} }`. Códigos: 01 OK, 02 Error, 42 Validación, 43 Unauthorized, 44 Forbidden, 45 NotFound.
- **Soft delete**: todas las tablas tienen `eliminado_en`. **SIEMPRE** filtrar `WHERE eliminado_en IS NULL` en repositorios.
- **Patrón**: `Controller → Service → Repository`. Ningún Controller toca BD directo.
- **Multi-rol**: `rolActivo` en el JWT (no `roles[]`). Cambiar rol via `POST /api/v1/auth/rol` sin logout.

### Frontend React

- JWT en `localStorage` (`edl_token`). `AuthContext` inyecta Bearer + CSRF en todos los requests.
- Proxy Vite: `/api` → `http://localhost:8000`. En producción usar `VITE_API_URL` directo.

### Base de datos

- Un solo archivo: `database/full_dump.sql` (esquema + seed + datos). Regenerar con `mysqldump` para cualquier cambio.
- Charset `utf8mb4_unicode_ci`. FK naming: `fk_<tabla_origen>_<tabla_destino>`.
- Tablas con `eliminado_en`: soft delete obligatorio, nunca `DELETE` directo.

## Generacion de PDFs

- **`backend/public/escudo.png`** debe existir y ser legible. `PdfHelper` lo convierte a base64 y lo embebe en el HTML antes de enviar a Dompdf.
- **No expresiones PHP en heredocs HTML**: todas las variables de formato se pre-calculan en PHP y se interpolan como `{$variable}` simple. Expresiones como `(is_numeric($x) ? $x : 0)` deben resolverse ANTES del heredoc.
- **Dompdf no soporta `position: fixed`** consistentemente para headers/footers en todas las páginas. El header va inline al inicio del body (solo pág. 1) y el footer inline al final (solo última página).
- **conductas en PDFs**: `ReporteService::datosConcertacionPdf()` y `datosEvaluacionPdf()` hacen JOIN a `conductas` via `competencia_codigo` para mostrar las conductas de cada compromiso.

## Gotchas críticos

1. **Orden de rutas**: `/evaluaciones/pendientes-calificar` debe estar ANTES de `/evaluaciones/{id}` en `backend/public/index.php`. El router hace match secuencial.
2. **PDO DECIMAL → string**: PDO retorna columnas DECIMAL como strings. `toFixed()` falla en strings. En `VerEvaluaciones.tsx` usar `formatearNota(valor)` y `formatearPuntaje(valor)` que coercionean a número. En `PdfHelper` usar `formatoNumero($valor, 2)`.
3. **Bug P1 `Database.php`**: ya usa `PDO::MYSQL_ATTR_FOUND_ROWS`. Si regeneras el archivo, mantener este formato exacto.
4. **Bug P2**: la ruta `/evaluaciones/pendientes-calificar` debe estar ANTES de `/evaluaciones/{id}` en el router.
5. **Socket BD**: `.env.example` usa `/tmp/mysql.sock`. En otros sistemas puede ser `/var/run/mysqld/mysqld.sock`. Ajustar según el entorno.
6. **`declare(strict_types=1)`** obligatorio en todo archivo PHP.
7. **CNSC literales**: usar `MensajesCNSC.php` y `mensajesCNSC.ts`. No inventar textos.
8. **No es Laravel/Symfony**: MVC propio. Ningún archivo de vendor en repos.
9. **Tests FE**: no hay framework de tests frontend. Verificaciones manuales contra la API.

## Convenciones

- PHP: PSR-12, `declare(strict_types=1)`, prepared statements PDO, PHPDoc en públicos.
- TS/React: `strict: true`, hooks, interfaces para props, `@/*` alias → `./src/*`.
- SQL: `snake_case`, `utf8mb4_unicode_ci`.
- Paleta institucional azul Carepa `#0A2B5E` en `frontend/src/styles/colors.ts`.

## Usuarios de prueba

Contraseña de todos: `12345678`.

| Documento | Nombre | Roles |
|---|---|---|
| `admin` | Admin | `admin_carepa` |
| `43141896` | LUSELY OREJUELA | `evaluador`, `jefe_dependencia` |
| `1040353165` | YEISON ROMAÑA | `evaluado`, `admin_carepa` |

200+ usuarios disponibles en el dump.

## Archivos clave

| Propósito | Archivo |
|---|---|
| Rutas API | `backend/public/index.php` |
| Router | `backend/src/Router/Router.php` |
| Auth middleware (acepta `?token=`) | `backend/src/Middleware/AuthMiddleware.php` |
| Permisos | `backend/src/Middleware/PermissionMiddleware.php` |
| Generación PDF | `backend/src/Helper/PdfHelper.php` |
| Reportes PDF (datos + conductas) | `backend/src/Service/ReporteService.php` |
| Cliente HTTP FE | `frontend/src/lib/api.ts` |
| Auth context | `frontend/src/contexts/AuthContext.tsx` |
| VerEvaluaciones (formatearNota) | `frontend/src/pages/Evaluaciones/VerEvaluaciones.tsx` |
| Esquema BD | `database/full_dump.sql` |
| Guía API (138 endpoints) | `cnsc/17-endpoints-api.md` |
| Arquitectura | `cnsc/18-arquitectura.md` |
| Matriz CNSC | `cnsc/13-trazabilidad-con-proyecto.md` |

## Documentación

- `README.md` — visión, instalación, configuración.
- `cnsc/` — documentación técnica CNSC.
- `cnsc/17-endpoints-api.md` — referencia completa de endpoints.
- `cnsc/18-arquitectura.md` — arquitectura detallada.