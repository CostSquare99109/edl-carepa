# CLAUDE.md

> Guia operativa para Claude Code (o cualquier agente IA equivalente) cuando trabaje en este repositorio. Complementa a `AGENTS.md` y `README.md` con el set minimo de reglas que debe respetar antes de tocar codigo o documentacion.

## Que es este proyecto

EDL Carepa es el sistema de Evaluacion del Desempeno Laboral de la Alcaldia de Carepa (Antioquia, Colombia). Implementa el ciclo completo de evaluacion de servidores publicos conforme al **Acuerdo CNSC 617 de 2018**.

**Stack:**

- Frontend: React 19.1 + TypeScript 5.8 + React Router 7.6 + TailwindCSS 3.4 + Vite 6.3 + sonner 2.0.
- Backend: PHP 8.2+ con MVC propio (Controller -> Service -> Repository), firebase/php-jwt, PHPMailer 7.1, dompdf 3.1, PDO.
- BD: MariaDB 10.6+ o MySQL 8.0+ con `utf8mb4_unicode_ci`.
- Patron de arquitectura: API REST stateless con JWT + SPA React.

## Comandos esenciales

### Backend

```bash
cd backend
composer install
php -S 0.0.0.0:8000 -t public/ public/router.php
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # Dev en :5174 con proxy /api -> :8000 (vite.config.ts)
npm run build
npm run preview
```

### Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edl_carepa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p edl_carepa < database/full_dump.sql
```

### Tests

```bash
python tests/api_test.py
python tests/flow_test.py
bash test_endpoints.sh
php tests/run_tests.php
```

## Notas importantes del frontend

- Proxy: Vite redirige `/api` a `http://localhost:8000` (definido en `vite.config.ts`).
- Alias de importacion: `@/*` -> `./src/*`.
- TypeScript en strict mode (`tsconfig.json: "strict": true`).
- Mensajes literales CNSC en `src/lib/mensajesCNSC.ts`.

## Arquitectura backend

```
Router -> Middleware[] -> Controller -> Service -> Repository -> DB (PDO)
```

Middleware chain (orden estricto): `Cors` -> `SecurityHeaders` -> `RateLimit` -> `Auth` -> `Permission` -> `Csrf` (mutaciones) -> `Tenant`.

### Archivos clave

- 21 controllers, 17 services, 18 repositories, 15 modelos, 11 helpers, 7 middlewares.
- 138 rutas declaradas en `backend/public/index.php`.
- 44 paginas React en `frontend/src/pages/`.
- Esquema completo en `database/full_dump.sql`.

## Reglas inquebrantables

1. **Orden de rutas**: rutas fijas SIEMPRE antes que parametricas en `backend/public/index.php`.
2. **Soft delete**: todos los repositorios filtran `WHERE eliminado_en IS NULL`. Sin excepciones.
3. **Declarar strict types**: `declare(strict_types=1);` al inicio de cada archivo PHP.
4. **Mensajes literales**: usar `MensajesCNSC.php` (backend) y `mensajesCNSC.ts` (frontend). No inventar literales.
5. **Cambios de esquema**: regenerar `database/full_dump.sql` completo. No crear migraciones incrementales en el repo.
6. **Multi-rol**: validar `rolActivo`, no la lista de roles completa.
7. **CSRF**: token por sesion, cabecera `X-CSRF-Token` en cualquier POST/PUT/DELETE.
8. **Stack fijo**: no introducir nuevos frameworks. Si una dependencia no esta en `composer.json` o `package.json`, primero justificar y luego agregar.
9. **Estilo ASCII**: al escribir archivos .md del proyecto, usar ASCII puro (sin acentos, sin em-dash). El resto del repo es ASCII plano.
10. **No exponer secretos**: nunca hacer commit de `.env`, llaves, ni de tokens. Dejar `.env` solo en `.gitignore`.

## Estado actual (referencia rapida)

Los gaps historicos referenciados en `FASE3_GAPS.md` y `cnsc/13-trazabilidad-con-proyecto.md` fueron cerrados en su mayoria en el ciclo de trabajo 2026-06-27:

- Panel del Evaluador: completo (4 tipos de evaluacion, escalas 4-15, justificacion 40 chars, validacion 2.do semestre).
- Compromisos de Mejoramiento: periodo + `plazo_cumplimiento` agregados.
- Login: etiqueta "Nombre de usuario" corregida.
- Ruteo: `/evaluaciones/pendientes-calificar` movida antes de `/{id}`.
- DB: `PDO::MYSQL_ATTR_FOUND_ROWS` aplicado en `Database.php`.

Antes de iniciar una tarea que toque endpoints, modelos de dominio o RBAC: revisar `cnsc/17-endpoints-api.md`, `cnsc/18-arquitectura.md` y `cnsc/13-trazabilidad-con-proyecto.md`.

## Branching y PRs

- Ramas: `feature/<nombre>` o `fix/<nombre>` desde `main`.
- PR target: `main`. Pedir review antes de mergear.
- Trazabilidad: si el cambio cierra un gap conocido, referenciarlo en el cuerpo del PR.

## No hacer

- No regenerar dependencias masivamente sin justificacion.
- No renombrar archivos de `cnsc/` sin actualizar `cnsc/00-indice-maestro.md`.
- No crear carpetas de migraciones SQL incrementales (solo regenerar el dump).
- No instalar frameworks nuevos de UI (Tailwind y React Router son base estable).
- No commitear scripts generados en `_PYEZ`/outputs de IA en el repo.
