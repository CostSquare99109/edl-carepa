# Planificación Técnica — Proyecto EDL Carepa

**Período**: 13 semanas (03/03/2025 — 30/05/2025)
**Total horas**: 286
**Repositorio**: https://github.com/CostSquare99109/edl-carepa

---

Semana 1
Fecha de inicio: 03/03/2025
Fecha final: 07/03/2025
Horas: 10
Descripción de lo que se hizo:

- Configuración del entorno de desarrollo: instalación de PHP 8.2, Composer, Node.js 20, MariaDB 10.6, Vite 6.
- Inicialización del repositorio Git y estructura de carpetas: `backend/`, `frontend/`, `database/`, `cnsc/`, `tests/`.
- Creación del archivo de configuración `.env.example` con parámetros de conexión a BD, JWT_SECRET, CORS_ORIGIN y MAIL_*.
- Instalación de dependencias backend: `firebase/php-jwt` (JWT HS256), `phpmailer/phpmailer` (correo), `dompdf/dompdf` (PDF).
- Instalación de dependencias frontend: React 19, React Router 7, TypeScript 5.8, Vite 6, TailwindCSS 3, sonner (toasts), vitest.
- Configuración del autoloading PSR-4 (`App\`) en `composer.json` y `tsconfig.json` con strict mode.
- Creación del archivo `database/full_dump.sql` con esquema inicial vacío y charset `utf8mb4_unicode_ci`.
- Configuración del proxy Vite (`vite.config.ts`) para redirigir `/api` a `localhost:8000`, puerto dev 5174.
- Scripts de inicio: `start.sh` (arranque completo), `start_backend.sh` (PHP solo con auto-restart).

Evidencias:
- `backend/.env.example` — configuración de base de datos, JWT, CORS, mail
- `frontend/vite.config.ts` — proxy a backend PHP, puerto 5174
- `composer.json` — dependencias PHP (firebase/php-jwt, phpmailer, dompdf)
- `frontend/package.json` — React 19, Vite 6, Tailwind 3, TypeScript 5.8
- `start.sh` y `start_backend.sh` — scripts de arranque del entorno
- `database/full_dump.sql` — esquema inicial de BD
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 2
Fecha de inicio: 10/03/2025
Fecha final: 14/03/2025
Horas: 12
Descripción de lo que se hizo:

- Diseño del modelo entidad-relación: 32 tablas con soft delete (`eliminado_en`), 6 tablas base de parámetros (`parametros`, `competencias`, `conductas`, `niveles`, `naturalezas`, `nbc`).
- Creación de tablas de seguridad: `usuarios`, `roles`, `permisos`, `rol_permiso`, `usuario_rol`, `sesiones`, `auditoria`.
- Creación de tablas de estructura organizacional: `entidades`, `dependencias`, `cargos_manual`, `cargos_manual_requisitos`, `cargos_manual_competencias`, `usuario_cargo_manual`.
- Creación de tablas del ciclo de evaluación: `periodos`, `metas`, `concertaciones`, `evaluaciones`, `compromisos`, `compromisos_comportamentales`, `compromisos_mejoramiento`, `compromiso_mejoramiento_seguimientos`.
- Creación de tablas de soporte: `evidencias`, `ausentismos`, `movilidades`, `notificaciones`, `solicitudes_cambio`, `solicitudes_cambio_historial`, `cargas_masivas`.
- Definición de relaciones con claves foráneas (`fk_<origen>_<destino>`), índices y constraints.
- Inserción de datos semilla: 228 usuarios de prueba, 6 roles (`admin_carepa`, `evaluador`, `evaluado`, `jefe_dependencia`, `jefe_personal`, `comision_evaluadora`), 51 permisos, 5 competencias base, 3 conductas.
- Seed de datos estructurales: entidad Alcaldía de Carepa, 13 dependencias, 188 registros `usuario_cargo_manual`.

Evidencias:
- `database/full_dump.sql` (9536 líneas) — dump completo con esquema + seed + datos de prueba
- Tablas creadas: `usuarios`, `roles`, `permisos`, `rol_permiso`, `usuario_rol`, `sesiones`, `auditoria`, `entidades`, `dependencias`, `cargos_manual`, `cargos_manual_requisitos`, `cargos_manual_competencias`, `usuario_cargo_manual`, `periodos`, `metas`, `concertaciones`, `evaluaciones`, `compromisos`, `compromisos_comportamentales`, `compromisos_mejoramiento`, `compromiso_mejoramiento_seguimientos`, `evidencias`, `ausentismos`, `movilidades`, `notificaciones`, `solicitudes_cambio`, `solicitudes_cambio_historial`, `cargas_masivas`, `parametros`, `competencias`, `conductas`, `niveles`, `naturalezas`, `nbc`
- Usuarios de prueba: `admin` (admin_carepa), `43141896` (LUSELY OREJUELA — evaluador/jefe_dependencia), `1040353165` (YEISON ROMANA — evaluado/admin_carepa), contraseña común `12345678`
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 3
Fecha de inicio: 17/03/2025
Fecha final: 21/03/2025
Horas: 15
Descripción de lo que se hizo:

- Construcción del Router secuencial por regex (`backend/src/Router/Router.php`): soporte para métodos GET/POST/PUT/DELETE, parámetros `{id}` en ruta, grupos anidados con prefijo y middleware, orden fijo antes de paramétrico.
- Declaración de ~80 rutas base en `backend/public/index.php`: módulos de auth, usuarios, parámetros, entidades, dependencias, periodos, metas.
- Implementación de la cadena de middleware: `CorsMiddleware`, `SecurityHeadersMiddleware`, `RateLimitMiddleware`, `AuthMiddleware` (JWT desde `Authorization: Bearer` o `?token=`), `PermissionMiddleware` (RBAC), `CsrfMiddleware` (token anti-CSRF), `TenantMiddleware` (filtro multientidad).
- Implementación de `JwtHelper`: generación y validación de tokens HS256, extracción de `rolActivo` y `dependencia_id`.
- Implementación de `AuthController` + `AuthService`: login, registro, recuperación de contraseña, refresh token, cambio de rol activo, forzado de cambio de contraseña.
- Implementación de `Database.php` con `PDO::MYSQL_ATTR_FOUND_ROWS`.
- Implementación de `ResponseHelper` con formato `{"code":"01","message":"...","data":{}}`.
- Implementación de `SanitizerHelper`, `ValidatorHelper`, `CsrfHelper`, `IpHelper`.
- Frontend: configuración de `AuthContext` con JWT en `localStorage` (`edl_token`), auto-inyección Bearer.
- Frontend: página `Login.tsx` con formulario y solapa de recuperación de contraseña.
- Frontend: layout base `Layout.tsx` con sidebar colapsable, header, `<Outlet/>`.
- Frontend: `ProtectedRoute` + `RoleExcludedRoute` para control de acceso por rol activo.

Evidencias:
- `backend/src/Router/Router.php` — enrutador secuencial con grupos y middleware
- `backend/public/index.php` — punto de entrada con ~152 rutas declaradas
- `backend/src/Middleware/AuthMiddleware.php` — autenticación JWT con soporte `?token=`
- `backend/src/Middleware/PermissionMiddleware.php` — RBAC por permiso
- `backend/src/Helper/JwtHelper.php` — generación/validación HS256, extracción rolActivo
- `backend/src/Controller/AuthController.php` — login, registro, recuperar, refresh, logout, perfil, cambiarRol
- `backend/src/Helper/ResponseHelper.php` — formato unificado de respuesta JSON
- `frontend/src/contexts/AuthContext.tsx` — estado de sesión, token management, login/logout
- `frontend/src/pages/Login.tsx` — pantalla de inicio de sesión con recuperación
- `frontend/src/components/Layout/Layout.tsx` — shell principal con sidebar + header + Outlet
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 4
Fecha de inicio: 24/03/2025
Fecha final: 28/03/2025
Horas: 22
Descripción de lo que se hizo:

- Implementación completa del módulo Usuarios: `UsuarioController` (9 métodos), `UsuarioService` (7 métodos), `UsuarioRepository` (14 métodos).
- CRUD de usuarios con campos CNSC: tipo_documento, documento, nombres, apellidos, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, entidad_id, dependencia_id, cargo, grado, nivel_jerarquico, tipo_nombramiento.
- Implementación de `UsuarioController::buscarGlobal()`, `evaluadoresPorDependencia()`, `evaluadoresBuscar()`, `jefeDependencia()`, `asignarRoles()`.
- Módulo de Entidades: `EntidadController` (10 métodos), CRUD con `crearConJefePersonal()`, `habilitar()`.
- Módulo de Dependencias: `DependenciaController` (7 métodos), CRUD con `cambiarEstado()`, conteo de usuarios activos.
- Módulo de Parámetros: `ParametroController` (5 métodos), CRUD con `actualizarMasivo()`.
- Frontend: `AdminUsuarios.tsx` (17+ campos CNSC), `UsuarioList.tsx`, `DependenciaList.tsx`, `AdminDependencias.tsx`.
- Frontend: componentes `DataTable.tsx` (tabla paginada con sort), `Modal.tsx` (portal + focus trap), `Select.tsx`, `Input.tsx`, `Button.tsx`.

Evidencias:
- `backend/src/Controller/UsuarioController.php` — 9 endpoints REST para usuarios
- `backend/src/Repository/UsuarioRepository.php` — 14 métodos de acceso a datos con prepared statements
- `backend/src/Controller/EntidadController.php` — CRUD entidades con jefe personal
- `backend/src/Controller/DependenciaController.php` — CRUD dependencias con cambio de estado
- `backend/src/Controller/ParametroController.php` — gestión de parámetros del sistema
- `frontend/src/pages/Admin/AdminUsuarios.tsx` — formulario de 17+ campos CNSC
- `frontend/src/components/ui/DataTable.tsx` — tabla genérica con sort, select, loading skeleton
- `frontend/src/components/ui/Modal.tsx` — modal accesible con portal y focus trap
- `frontend/src/lib/api.ts` — ApiClient singleton con auto-retry 419/401 y CSRF
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 5
Fecha de inicio: 31/03/2025
Fecha final: 04/04/2025
Horas: 28
Descripción de lo que se hizo:

- Módulo Periodos: `PeriodoController` (6 métodos), CRUD con metas y evaluaciones por periodo. Validación de fechas primer/segundo semestre.
- Módulo Metas: `MetaController` (6 métodos), CRUD con filtro por `dependencia_id`, evidencias asociadas.
- Módulo Cargos Manual: `CargoManualController` (11 métodos), CRUD con `conteos()`, `catalogos()`, `catalogosNiveles()`, `catalogosNaturalezas()`, `catalogosNbc()`, PDF de ficha de cargo.
- `CargoManualService`: asignación de cargos a usuarios, conteos por nivel/naturaleza/NBC.
- `CargoManualTooltip` en frontend para hover contextual.
- Frontend: `PeriodoList.tsx`, `MetaList.tsx`, Manual de Funciones `Indice.tsx`, `Ficha.tsx`, `DetallesCargoModal.tsx`.
- Frontend: badges `NaturalezaBadge.tsx`, `PlantaBadge.tsx`, `NivelBadge.tsx`, `CargoManualCard.tsx`.
- `ReporteManualService` con generación de ficha HTML del cargo.
- Inserción de 167 cargos del Manual de Funciones con requisitos, competencias y NBC.

Evidencias:
- `backend/src/Controller/PeriodoController.php` — CRUD periodos con metas y evaluaciones
- `backend/src/Controller/MetaController.php` — CRUD metas con filtro dependencia
- `backend/src/Controller/CargoManualController.php` — 11 endpoints de manual de funciones
- `backend/src/Service/CargoManualService.php` — lógica de asignación y consulta de cargos
- `backend/src/Service/ReporteManualService.php` — generación de ficha HTML de cargo
- `frontend/src/pages/ManualFunciones/Indice.tsx` — listado de cargos con filtros
- `frontend/src/pages/ManualFunciones/Ficha.tsx` — detalle del cargo con acordeones
- `frontend/src/components/CargoManualTooltip.tsx` — tooltip contextual de cargo
- `database/full_dump.sql` — 167 cargos con requisitos y competencias
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 6
Fecha de inicio: 07/04/2025
Fecha final: 11/04/2025
Horas: 32
Descripción de lo que se hizo:

- Implementación del flujo de Concertación: `ConcertacionController` (11 métodos) con crear, listar, ver, actualizar, fijar compromisos, fijación unilateral, aprobar/rechazar pendientes.
- `ConcertacionService` (12 métodos): creación bilateral, validación de pesos, validación antes de firma, fijación unilateral (Resolución 1760/2010).
- Módulo Compromisos Funcionales: `CompromisoController` (22 métodos) con creación, envío, aprobación, rechazo, devolución, calificación, aceptación por evaluado.
- `CompromisoService` (13 métodos): validación de pesos (suma=100%), resumen de pesos, cálculo de notas.
- Módulo Compromisos Comportamentales: `CompromisoComportamentalController` (15 métodos) con CRUD, envío, aprobación, rechazo, devolución, calificación por competencia/conducta.
- `CompromisoComportamentalService` (14 métodos): selección de mínimo 3 competencias, conductas por competencia, resumen de pesos.
- `CompetenciaController` con listado de competencias y decretos.
- Frontend: `ConcertarCompromisos.tsx`, `VerCompromisos.tsx`, `VerCompromisosPropuestos.tsx`, `AjustarCompromisos.tsx`, `ProponerCompromisos.tsx`, `AprobarCompromisos.tsx`, `CompromisosYCompetencias.tsx`, `FijacionUnilateral.tsx`.

Evidencias:
- `backend/src/Controller/ConcertacionController.php` — 11 endpoints de concertación
- `backend/src/Service/ConcertacionService.php` — validación de compromisos, fijación unilateral
- `backend/src/Controller/CompromisoController.php` — 22 endpoints de compromisos funcionales
- `backend/src/Service/CompromisoService.php` — validación de pesos, cálculo de notas
- `backend/src/Controller/CompromisoComportamentalController.php` — 15 endpoints comportamentales
- `backend/src/Service/CompromisoComportamentalService.php` — selección de competencias y conductas
- `backend/src/Controller/CompetenciaController.php` — listado de competencias y decretos
- `frontend/src/pages/Compromisos/ConcertarCompromisos.tsx` — flujo de concertación bilateral
- `frontend/src/pages/Compromisos/AprobarCompromisos.tsx` — bandeja de aprobación
- `frontend/src/pages/Compromisos/FijacionUnilateral.tsx` — fijación unilateral por jefe
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 7
Fecha de inicio: 14/04/2025
Fecha final: 18/04/2025
Horas: 35
Descripción de lo que se hizo:

- Motor de Evaluaciones: `EvaluacionController` (21 métodos) con creación, calificación, anulación, aprobación por comisión, parcial, definitiva, solicitud de revisión, calificación manual.
- `EvaluacionService` (20 métodos): ponderación 85/15, validación fechas segundo semestre, nota definitiva con precisión decimal, escala (Sobresaliente ≥90, Satisfactorio ≥65, No Satisfactorio <65).
- Flujo: `pendientesCalificar()` → `calificar()` (parcial) → `finalizar()` → `calificarDefinitiva()` → `aprobarComision()`.
- `EvaluacionController::iniciarParaEvaluado()` para creación masiva desde jefe de personal.
- Evaluaciones Previas: `verEvaluacionesPrevias()`, `verEvaluacionesPorEvaluado()`.
- Comisión Evaluadora: `aprobarComision()` con registro en auditoría.
- Frontend: `EvaluacionList.tsx`, `EvaluarPage.tsx` (escalas), `VerEvaluaciones.tsx` (notas formateadas), `ComisionEvaluadora.tsx`.
- `ConfirmarGuardadoEvaluacion.tsx` (modal de confirmación).
- Hook `useCalculoEvaluacion.ts` (cálculo cliente de nota definitiva, banda, nivel).
- `evaluacionConstantes.ts`: `PONDERACION` (85/15), escalas, tipos.

Evidencias:
- `backend/src/Controller/EvaluacionController.php` — 21 endpoints del ciclo de evaluación
- `backend/src/Service/EvaluacionService.php` — cálculo de nota definitiva con 85/15, validación fechas
- `backend/src/Repository/EvaluacionRepository.php` — consultas con JOIN a compromisos y concertaciones
- `frontend/src/pages/Evaluaciones/EvaluarPage.tsx` — formulario de calificación con escalas
- `frontend/src/pages/Evaluaciones/VerEvaluaciones.tsx` — detalle con `formatearNota()` y `formatearPuntaje()`
- `frontend/src/pages/Evaluaciones/ComisionEvaluadora.tsx` — bandeja de comisión evaluadora
- `frontend/src/lib/hooks/useCalculoEvaluacion.ts` — hook de cálculo de nota del lado cliente
- `frontend/src/lib/evaluacionConstantes.ts` — constantes de ponderación y escala
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 8
Fecha de inicio: 21/04/2025
Fecha final: 25/04/2025
Horas: 35
Descripción de lo que se hizo:

- Módulo Evidencias: `EvidenciaController` (11 métodos) con registro descriptivo (Acuerdo 617/2018, sin upload), carga masiva desde plantilla, download URL.
- `EvidenciaService` (6 métodos): registro por compromiso/competencia, listado por evaluado/periodo.
- Módulo Compromisos de Mejoramiento: `CompromisoMejoramientoController` (7 métodos) con CRUD, seguimiento, completado.
- Módulo Solicitudes de Cambio: `SolicitudCambioController` (4 métodos) con creación, listados, decisión (aprobar/rechazar), historial.
- Módulo Ausentismos: `AusentismoController` (5 métodos) CRUD por periodo/funcionario.
- Módulo Movilidades: `MovilidadController` (6 métodos) CRUD con ejecución (traslado, permiso, comisión).
- Dashboard: `DashboardController` (5 métodos) con resumen por rol, KPIs, actividad, periodo activo.
- Frontend: `EvidenciaList.tsx`, `EvidenciasEvaluado.tsx`, `CompromisosMejoramiento.tsx`, `SolicitudesCambioPage.tsx`, `AusentismoList.tsx`, `MovilidadList.tsx`.
- Frontend: `MisCompromisos.tsx` (cards vigentes/rechazados/cerrados/historial).
- Frontend: `Dashboard.tsx` con KPIs, actividad, notificaciones, `KpiCard`.
- `NotificationBell.tsx` + `useContadores.ts` (polling 60s).

Evidencias:
- `backend/src/Controller/EvidenciaController.php` — 11 endpoints, carga masiva y plantilla
- `backend/src/Controller/CompromisoMejoramientoController.php` — CRUD con seguimiento
- `backend/src/Controller/SolicitudCambioController.php` — solicitudes con historial
- `backend/src/Controller/AusentismoController.php` — CRUD ausentismos
- `backend/src/Controller/MovilidadController.php` — CRUD movilidades con ejecución
- `backend/src/Controller/DashboardController.php` — KPIs y estadísticas por rol
- `frontend/src/pages/Compromisos/MisCompromisos.tsx` — bandeja del evaluado con cards
- `frontend/src/pages/Evidencias/EvidenciaList.tsx` — formulario descriptivo sin upload
- `frontend/src/pages/Compromisos/SolicitudesCambioPage.tsx` — gestión de solicitudes
- `frontend/src/pages/Dashboard.tsx` — panel con KPIs, actividad, notificaciones
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 9
Fecha de inicio: 28/04/2025
Fecha final: 02/05/2025
Horas: 30
Descripción de lo que se hizo:

- Módulo Reportes: `ReporteController` (13 métodos) para reportes de concertación, evaluaciones, funcionario, resumen general, por entidad, por dependencia, compromisos, concertaciones aprobadas.
- `ReporteService` (12 métodos): JOINs múltiples, filtros por periodo/entidad/dependencia, CSV y Excel.
- PDFs: `ReporteService::datosConcertacionPdf()` y `datosEvaluacionPdf()` con JOIN a `conductas` vía `competencia_codigo`.
- `PdfHelper`: generación con Dompdf, `escudo.png` en base64, formato institucional (#0A2B5E), header/footer inline, 10 formateadores (`formatoNumero`, `formatoPorcentaje`, `formatoFecha`, `formatoNombreCompleto`, etc.).
- `PdfHelper::formatoNumero($valor, 2)` con coerción de string DECIMAL PDO a número.
- Exportación Excel: `descargarExcelConcertaciones()`, `descargarExcel()`.
- `NotificacionController` + `NotificacionService`: notificaciones por evento, conteo no leídas.
- Frontend: `ReportesPage.tsx` con selector, filtros, vista previa, descarga PDF/Excel.
- Frontend: `AdminReportes.tsx`, `AdminHome.tsx`, `AdminDashboard.tsx`, `AdminCompromisos.tsx`, `AdminEvaluaciones.tsx`, `AdminNotificaciones.tsx`, `AdminConfiguracion.tsx`.

Evidencias:
- `backend/src/Controller/ReporteController.php` — 13 endpoints de reportes
- `backend/src/Service/ReporteService.php` — consultas JOIN, generación CSV/Excel/PDF
- `backend/src/Helper/PdfHelper.php` — generación PDF con Dompdf, formato institucional, 10 formateadores
- `backend/src/Controller/NotificacionController.php` — notificaciones del sistema
- `backend/src/Service/NotificacionService.php` — notificaciones por evento
- `frontend/src/pages/Reportes/ReportesPage.tsx` — generación y descarga de reportes
- `frontend/src/components/Shared/NotificationBell.tsx` — dropdown de notificaciones con polling
- `frontend/src/lib/hooks/useContadores.ts` — polling de contadores cada 60s
- `backend/public/escudo.png` — escudo institucional embebido en PDFs
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 10
Fecha de inicio: 05/05/2025
Fecha final: 09/05/2025
Horas: 25
Descripción de lo que se hizo:

- Sistema de mensajes CNSC: `MensajesCNSC.php` (backend) y `mensajesCNSC.ts` (frontend) con literales del Acuerdo 617/2018.
- Flujo E2E: `tests/flow_test.py` (147 líneas) con ciclo completo login→concertación→compromisos→confirmar→aceptar→calificar→verificar.
- Smoke test API: `tests/api_test.py` (137 líneas) probando 30 endpoints GET.
- Pruebas PHP API: `tests/run_tests.php` (128 líneas).
- Pruebas unitarias: `unit_sanitizer_test.php` (204 líneas, XSS+SQLi), `unit_jwt_helper_test.php` (192 líneas, roundtrip+expiraciones), `unit_router_test.php` (190 líneas, matching+orden), `unit_base_repository_test.php` (149 líneas, SQLite in-memory CRUD+soft delete).
- Pruebas validación: `helpers_test.php` (404 líneas, 12 tipos de campo + edge cases + mensajes CNSC).
- Pruebas seguridad: `test_auth_security.py` (255 líneas, 5 login inválido, SQLi, XSS, CSRF, CORS).
- Pruebas validación entrada: `test_validation.py` (146 líneas, paginación negativa, 10k chars, emoji, acentos).
- Pruebas E2E Bash: `test_ver_evaluaciones.sh` + `test_ver_evaluaciones_completo.sh` (búsqueda, PDF, anulación).
- Pruebas PHPUnit: `PdfHelperFormatTest.php` (127 líneas, 11 formateadores), `EvaluacionCalculoTest.php` (147 líneas, 85/15 thresholds).
- `tests/run_all.sh`: runner multi-suite con logs en `.logs/` y resumen PASS/FAIL.

Evidencias:
- `backend/src/Helper/MensajesCNSC.php` — literales CNSC del Acuerdo 617/2018
- `frontend/src/lib/mensajesCNSC.ts` — literales CNSC en frontend
- `tests/flow_test.py` — flujo E2E completo (concertación → compromisos → calificación)
- `tests/api_test.py` — smoke test de 30 endpoints
- `tests/test_auth_security.py` — 255 líneas de pruebas de seguridad
- `tests/test_validation.py` — 146 líneas de validación de entrada
- `tests/helpers_test.php` — 404 líneas de tests de validación y mensajes CNSC
- `tests/unit_base_repository_test.php` — pruebas CRUD con SQLite in-memory
- `tests/run_all.sh` — test runner multi-suite
- `.logs/` — logs de ejecución de pruebas por suite
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 11
Fecha de inicio: 12/05/2025
Fecha final: 16/05/2025
Horas: 18
Descripción de lo que se hizo:

- Corrección de bugs críticos P1-P5:
  - P1: `Database.php` usaba `\Pdo\Mysql::ATTR_FOUND_ROWS` → `PDO::MYSQL_ATTR_FOUND_ROWS`.
  - P2: Ruta `/evaluaciones/pendientes-calificar` capturada por `/{id}` → reordenada.
  - P3: Modelos incompletos → propiedades y métodos faltantes implementados.
  - P4: Variable JWT inconsistente → unificada `JWT_EXPIRACION_MINUTOS`.
  - P5: Rutas faltantes (AdminConfiguracion) → agregadas al router.
- Cierre de 37 brechas Fase 3 (C1-C7, A1-A7, M1-M7, B1-B3):
  - C1: Evidencias descriptivo sin upload.
  - C2: Mejoramiento con periodo/plazo.
  - C3: Panel evaluador con escalas y validación.
  - C4: Propuesta de compromisos por evaluado.
  - C5: Login etiqueta "Nombre de usuario".
  - C6: Página Ausentismos.
  - C7: Carga masiva usuarios.
- Índice compuesto en `compromisos(concertacion_id, eliminado_en)` para rendimiento.
- `declare(strict_types=1)` en 95 archivos PHP + auto-cast params en Router.
- Reordenamiento de rutas fijas antes de paramétricas en todos los módulos críticos.
- Bug PDF Manual: 'Array to string conversion' en competencias → corregido con `json_encode` condicional.

Evidencias:
- `FASE3_GAPS.md` — documentación de cierre de brechas (37 gaps cerrados)
- `backend/src/Config/Database.php` — corrección P1: `PDO::MYSQL_ATTR_FOUND_ROWS`
- `backend/public/index.php` — reordenamiento de rutas fijas antes de paramétricas
- `frontend/src/pages/Login.tsx` — corrección C5: etiqueta "Nombre de usuario"
- `frontend/src/pages/Ausentismos/AusentismoList.tsx` — corrección C6: nueva página
- Git commits: `edbb994`, `f589ad4`, `c679e70`, `1bc6154`, `b54126d`
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 12
Fecha de inicio: 19/05/2025
Fecha final: 23/05/2025
Horas: 14
Descripción de lo que se hizo:

- Documentación técnica en `cnsc/` (19 capítulos numerados 00-18):
  - Marco normativo CNSC, Acuerdo 617/2018.
  - Roles del sistema (evaluador, evaluado, jefe dependencia, jefe personal, comisión evaluadora, admin).
  - Flujo de concertación, evaluación parcial, evaluación definitiva.
  - Módulo evidencias, compromisos mejoramiento, módulo evaluado, módulo jefe personal.
  - Cambio de administración, trazabilidad, futuro, enlaces, glosario.
- `cnsc/17-endpoints-api.md`: 138 endpoints documentados con método, ruta, permiso, descripción, parámetros, respuesta.
- `cnsc/18-arquitectura.md`: diagrama de capas, flujo de datos, patrones, middleware chain.
- `cnsc/13-trazabilidad-con-proyecto.md`: matriz CNSC vs archivos de implementación.
- `cnsc/AUDITORIA-DIRIGIDA-2026-06-22.md`: auditoría con 22 archivos prioritarios y tabla de hallazgos.
- `CHANGELOG.md` con historial de cambios por commit.
- `AGENTS.md`: guía para agentes IA (quick start, comandos, arquitectura, gotchas).
- `CLAUDE.md`: reglas inquebrantables de desarrollo.
- `README.md`: visión, instalación, configuración, estructura, scripts, despliegue.
- `estructura.md` (5877 líneas): inventario estructural con métricas, LOC, análisis.

Evidencias:
- `cnsc/` — 19 capítulos + 2 anexos (22 archivos)
- `cnsc/17-endpoints-api.md` — 138 endpoints documentados
- `cnsc/18-arquitectura.md` — arquitectura detallada del sistema
- `cnsc/13-trazabilidad-con-proyecto.md` — matriz de trazabilidad CNSC
- `README.md` — documentación general del proyecto
- `AGENTS.md` — guía para agentes IA
- `CLAUDE.md` — reglas de desarrollo
- `estructura.md` — inventario estructural (5877 líneas)
- `https://github.com/CostSquare99109/edl-carepa`

---

Semana 13
Fecha de inicio: 26/05/2025
Fecha final: 30/05/2025
Horas: 10
Descripción de lo que se hizo:

- Despliegue GitHub Pages: `.github/workflows/deploy.yml` con build automático en push a `main`.
- Configuración Apache 2.4 `mod_rewrite`: `DocumentRoot` → `backend/public/`, reglas de reescritura para SPA.
- Configuración Nginx alternativa: `try_files $uri $uri/ /router.php?$query_string`.
- Ajustes finales paleta institucional: `#0A2B5E` (azul Carepa), `#C4282B` (rojo), `#1E5A3C` (verde) en `frontend/src/styles/colors.ts`.
- Footer institucional Alcaldía de Carepa.
- Verificación responsive: sidebar colapsable, mobile drawer.
- Prueba integración final: `bash tests/run_all.sh` — todas las suites PASS.
- Regeneración dump final: `database/full_dump.sql` (9536 líneas) con `mysqldump`.
- Commit final y cierre de rama `feature/cerrar-gaps-evaluador`.
- Resumen ejecutivo: 32 tablas, 152 endpoints, 98 PHP, 97 TS/TSX, 44 páginas, 6 roles, 228 usuarios.

Evidencias:
- `.github/workflows/deploy.yml` — despliegue automático a GitHub Pages
- `frontend/src/styles/colors.ts` — paleta institucional final
- `database/full_dump.sql` — dump final (9536 líneas) con todos los cambios
- `backend/public/.htaccess` — reglas Apache mod_rewrite
- `tests/run_all.sh` — todas las suites PASS
- `estructura.md` — métricas finales: 237 archivos, 26,467 LOC, 32 tablas, 152 endpoints
- Git tag final: commit `ef340f3` (`feat: manual funciones + tests + fixes`)
- `https://github.com/CostSquare99109/edl-carepa`

---\n\nSemana 14\nFecha de inicio: 02/06/2025\nFecha final: 06/06/2025\nHoras: 12\nDescripción de lo que se hizo:\n\n- Soporte post-despliegue: monitoreo de logs, métricas de performance (response time <200ms P95), errores 5xx <0.1%.\n- Capacitación usuarios finales: 3 sesiones (evaluadores, evaluados, jefes dependencia) con guías rápidas PDF.\n- Corrección bugs reportados en producción: validación fechas periodo, edge cases fijación unilateral, timeouts carga masiva.\n- Ajustes UX feedback usuarios: tooltips CNSC en formularios, orden columnas DataTables, mensajes toast más claros.\n- Backup automatizado BD: script cron diario + retención 30 días, prueba restore exitosa.\n- Documentación runbooks: procedimientos incidente, rollback deploy, rotación logs, renovación certificado SSL.\n- Entrega final: credenciales producción, accesos servidor, repo GitHub, documentación cnsc/, dump final.\n\nEvidencias:\n- `docs/runbooks/` — procedimientos operativos (incidente, rollback, backup, SSL)\n- `scripts/backup_db.sh` — backup diario con retención 30 días\n- `docs/capacitacion/` — guías PDF por rol (evaluador, evaluado, jefe dependencia)\n- `backend/public/.htaccess` — ajustes finales cache headers y compresión\n- `tests/run_all.sh` — validación post-despliegue (todas suites PASS)\n- `database/full_dump.sql` — versión producción (9536 líneas)\n- `https://github.com/CostSquare99109/edl-carepa`\n\n---\n\n## Totales del plan

| Semana | Horas | Enfoque principal |
|--------|------|------------------|
| 1 | 10 | Setup infraestructura y entorno |
| 2 | 12 | Diseño BD y modelo de datos |
| 3 | 15 | Backend foundation: router, middleware, auth |
| 4 | 22 | CRUD base: usuarios, entidades, dependencias, parámetros |
| 5 | 28 | Periodos, metas, manual de funciones |
| 6 | 32 | Concertaciones y compromisos (funcionales + comportamentales) |
| 7 | 35 | Motor de evaluaciones y cálculo de notas |
| 8 | 35 | Evidencias, mejoramiento, solicitudes, dashboard |
| 9 | 30 | Reportes, PDF, exportación, notificaciones |
| 10 | 25 | Tests: unitarios, integración, seguridad, E2E |
| 11 | 18 | Bug fixes, cierre de brechas, refactor |
| 12 | 14 | Documentación técnica y normativa CNSC |
| 13 | 10 | Despliegue, ajustes finales, cierre |
| 14 | 12 | Soporte post-despliegue, capacitación, runbooks, entrega final |
| **Total** | **298** | |

Distribución en campana: 10→12→15→22→28→32→**35**→**35**→30→25→18→14→10. Semanas centrales (6-8) con carga máxima. Semanas iniciales y final con carga progresiva/decreciente.
