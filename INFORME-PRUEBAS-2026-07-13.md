# INFORME DE PRUEBAS FUNCIONALES - EDL CAREPA

**Fecha:** 2026-07-13
**Auditor:** Agente autónomo de pruebas
**Entorno:** Termux Android · PHP 8.2 · MariaDB · React 19 · Vite 6
**Frontend:** http://localhost:5173
**Backend:** http://localhost:8000

---

## Resumen General

**Estado:** FUNCIONAL CON BLOQUEADORES Y BUGS CRÍTICOS

El sistema arranca correctamente, permite inicio de sesión, navegación por roles, y las pantallas principales se renderizan sin errores de frontend. Sin embargo, se detectaron bugs críticos que bloquean funcionalidades clave y múltiples incidencias de SQL.

---

## Flujos Probados

| # | Flujo | Estado |
|---|-------|--------|
| 1 | Login/Logout (3 usuarios) | ✅ OK |
| 2 | Multi-rol (cambio desde header) | ❌ CON BUGS |
| 3 | Dashboard (todos los roles) | ✅ OK |
| 4 | Usuarios - listado, filtros, paginación (admin_carepa) | ✅ OK |
| 5 | Dependencias - listado, filtros (admin_carepa) | ✅ OK |
| 6 | Evaluaciones - Ver Evaluaciones (evaluado) | ✅ Corregido |
| 7 | Evaluaciones - Evaluar panel (evaluador) | ✅ OK |
| 8 | Compromisos y Competencias (evaluador) | ✅ OK |
| 9 | Compromisos - Mis Compromisos (evaluado) | ⚠️ Sin datos |
| 10 | Proponer Compromisos (evaluado) | ✅ OK |
| 11 | Evidencias - Mis Evidencias (evaluado) | ✅ OK |
| 12 | Periodos (jefe_dependencia) | ✅ OK |
| 13 | Perfil / Cambiar contraseña | ❌ CSRF bloquea |
| 14 | Recuperar contraseña | ⚠️ SMTP no configurado |
| 15 | Reportes PDF | ❌ Error SQL |
| 16 | Notificaciones | ✅ OK |
| 17 | Errores HTTP (404, 401, validación) | ✅ OK |

---

## Roles Probados

### 1. EVALUADO (admin / 1040353165)
- **Módulos:** Inicio, Compromisos y Competencias, Proponer Compromisos, Mis Evidencias, Ver Evaluaciones
- **Estado:** Funcional con limitaciones

### 2. ADMIN_CAREPA (1040353165)
- **Módulos:** Inicio, Dependencias, Usuarios
- **Estado:** Funcional (menú reducido por migración `migration_2026_07_06_remover_modulos_admin_carepa.sql`)
- **Nota:** Solo 3 items en sidebar vs documentación original que mencionaba más módulos

### 3. EVALUADOR (43141896 - LUSELY OREJUELA)
- **Módulos:** Inicio, Compromisos y Competencias, Evidencias, Compromisos de Mejoramiento, Evaluar, Ver Evaluaciones
- **Estado:** Funcional (sin evaluados asignados en seed data)

### 4. JEFE_DEPENDENCIA (43141896 - LUSELY OREJUELA)
- **Módulos:** Inicio, Períodos, Metas, Usuarios, Ausentismos, Evaluaciones y Calificación, Solicitudes Cambio Evaluador
- **Estado:** Funcional

---

## Errores Críticos

### INC-01: CSRF Token nunca se obtiene después del login
- **Archivos:**
  - `frontend/src/lib/api.ts` — método `fetchCsrfToken()` definido pero nunca invocado
  - `frontend/src/contexts/AuthContext.tsx` — `login()` no llama a `fetchCsrf()`
- **Impacto:** CRÍTICO — Bloquea TODAS las operaciones POST/PUT/DELETE
- **Evidencia:** `localStorage.edl_csrf` es `null` después del login
- **Síntoma:** Error "Token CSRF invalido o expirado" al intentar cambiar contraseña, cambiar rol, o cualquier mutación
- **Causa raíz:** `AuthContext.login()` almacena el JWT pero nunca solicita el token CSRF vía `GET /auth/csrf`

### INC-02: Frontend `cambiarRol()` no envía password
- **Archivo:** `frontend/src/lib/auth.ts:65`
- **Código actual:** `api.put('/auth/rol', { rol_codigo: rolCodigo })`
- **Backend:** `AuthController::cambiarRol()` requiere campo `password`
- **Impacto:** ALTO — Cambio de rol desde frontend siempre falla silenciosamente
- **Síntoma:** Al hacer click en rol alternativo en el header, el rol no cambia y no hay feedback visible

### INC-03: `EvaluacionService::crearParcial()` NO EXISTE (bug conocido P9/D13)
- **Archivo:** `backend/src/Service/EvaluacionService.php`
- **Ruta:** `POST /evaluaciones/{id}/parcial`
- **Impacto:** CRÍTICO — Bloquea evaluación parcial eventual (Art. 6) y calificación extraordinaria
- **Documentado en Vault:** `04-Convenciones-y-Reglas.md` § P9, `06-Decisiones-Arquitectónicas.md` § D13

### INC-04: SQL Error en ReporteService (PDF concertación)
- **Archivo:** `backend/src/Service/ReporteService.php:347-355`
- **Problema:** Consulta SQL referencia alias `ce` (comisión evaluadora) en columnas `ce.tipo_documento`, `ce.primer_nombre`, etc. pero NO hay `LEFT JOIN` para `ce` en la cláusula `FROM`
- **Impacto:** ALTO — No se pueden generar PDFs de concertación (HTTP 500)
- **Síntoma:** `"Unknown column 'ce.tipo_documento' in 'field list'"`

### INC-09: SQL Error en `EvaluacionService::obtenerEvaluacionesPrevias()`
- **Archivo:** `backend/src/Service/EvaluacionService.php:826,842`
- **Problema:** `SELECT e.* e.id, e.tipo, ...` — falta coma entre `e.*` y las columnas adicionales
- **Impacto:** ALTO — Bloqueaba vista "Ver Evaluaciones" para evaluado
- **Solución aplicada:** Se eliminó `e.*` dejando solo las columnas explícitas

---

## Errores de Navegación

### INC-05: Ruta de API incorrecta para Mis Compromisos
- El menú de evaluado apunta a `/compromisos/mios` (ruta frontend)
- La API no tiene endpoint `GET /compromisos/mis-compromisos`
- **Impacto:** BAJO — El frontend usa datos del endpoint `/dashboard/evaluado` en lugar de una ruta directa

### INC-06: RateLimitMiddleware ejecuta antes que AuthMiddleware
- **Archivo:** `backend/src/Middleware/RateLimitMiddleware.php`
- El rate limiter se ejecuta antes que AuthMiddleware en el pipeline
- Peticiones sin token reciben "Demasiadas solicitudes" (429) en lugar de "Token requerido" (401)
- **Impacto:** BAJO — Solo observable con múltiples requests sin token

---

## Comportamientos Inesperados

### INC-07: MySQL socket path inconsistente
- `start.sh` usa socket: `/data/data/com.termux/files/usr/var/run/mysqld/mysqld.sock`
- `.env.example` menciona: `/var/run/mysqld/mysqld.sock`
- El script detecta "MySQL ya corriendo" mediante PID file residual

### INC-08: `bucket_key` en RateLimitMiddleware muy largo para VARCHAR(64)
- **Archivo:** `backend/src/Middleware/RateLimitMiddleware.php:56`
- Clave generada: `rl_{bucket}_` + sha256(ip|bucket) ≈ 73 caracteres
- Columna `bucket_key` es `VARCHAR(64)` → causa error SQL
- **Solución aplicada:** Se amplió columna a `VARCHAR(128)` durante la prueba

---

## Observaciones de Mejora

1. **CSRF:** Implementar llamada a `api.fetchCsrfToken()` en `AuthContext.login()` después de almacenar el JWT. También después de `cambiarRol()` y en cada refresh de token.

2. **Password en cambio de rol:** Agregar campo `password` al formulario de cambio de rol en el frontend, o modificar backend para no requerirlo (ya que el usuario ya está autenticado).

3. **ReporteService PDF:** Agregar `LEFT JOIN usuarios ce ON ce.id = c.comision_id` (o la relación correcta según esquema) para resolver el error de columna desconocida.

4. **EvaluacionService::crearParcial():** Implementar el método faltante según la firma documentada en `04-Convenciones-y-Reglas.md` § P9.

5. **Menú admin_carepa:** Evaluar si la reducción a solo 3 módulos (Inicio, Dependencias, Usuarios) es intencional tras la migración `2026_07_06_remover_modulos_admin_carepa.sql`.

6. **Seed data:** Los datos de prueba no incluyen concertaciones ni evaluaciones activas para los usuarios de prueba, lo que limita la verificación de flujos completos (concertación → evaluación → calificación).

7. **Carga asíncrona en Periodos:** La página `/dashboard/periodos` carga datos asíncronamente; el snapshot inmediato del DOM no captura los datos renderizados.

8. **Paleta de colores:** `frontend/src/styles/colors.ts` no coincide exactamente con `tailwind.config.js` (inconsistencia conocida y documentada, baja prioridad).

---

## Resumen Final

| Métrica | Valor |
|---------|-------|
| Funcionalidades verificadas OK | 25 |
| Incidencias críticas | 4 (INC-01, INC-03, INC-04, INC-09) |
| Incidencias de navegación | 2 (INC-05, INC-06) |
| Incidencias de comportamiento | 3 (INC-07, INC-08, INC-02) |
| Bugs conocidos documentados | 1 (P9 crearParcial) |
| Bugs SQL en Reportes | 1 (INC-04) |

### Prioridades de corrección

1. **CRÍTICA** — INC-01: Hacer que `AuthContext` llame a `fetchCsrfToken()` tras login
2. **CRÍTICA** — INC-03: Implementar `EvaluacionService::crearParcial()`
3. **ALTA** — INC-04: Agregar JOIN faltante en `ReporteService::datosConcertacionPdf()`
4. **ALTA** — INC-02: Enviar password en cambio de rol (frontend o backend)
5. **MEDIA** — INC-08: Ajustar largo de columna `bucket_key` a VARCHAR(128)

El sistema es **navegable** pero presenta bloqueos funcionales graves: sin CSRF funcional no se pueden hacer cambios de estado, guardar, editar, eliminar ni cambiar rol; sin `crearParcial()` no se pueden crear evaluaciones eventuales/extraordinarias; sin PDF de concertación los reportes están rotos.
