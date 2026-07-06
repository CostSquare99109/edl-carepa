# 🔗 13 — Trazabilidad: Transcripciones CNSC → Estado Real del Proyecto

> **Propósito:** Este documento es el **puente crítico** entre las 26 transcripciones oficiales de la CNSC y el estado **real verificado** del proyecto EDL Carepa.
>
> Cada brecha o gap se mapea a la **transcripción CNSC que lo justifica** Y al **archivo real del proyecto** que hay que auditar/corregir/mejorar.

---

## ⚠️ Aclaración importante

En una primera pasada se referenciaron tres documentos previos (`INFORME_TECNICO_ANALISIS_CNSC.md`, `REDISENO_UX_UI_AUDITORIA.md`, `CONTROLLERS_DOCUMENTACION.md`) como si fueran el cuerpo principal de auditoría del proyecto. La auditoría posterior (ver `AUDITORIA-DIRIGIDA-2026-06-22.md` §3.5) descubrió que estos 3 archivos **estaban borrados del working tree pero seguían rastreados por git** (sin commit del borrado). El único documento de auditoría previo **verificable en el working tree** es `FASE3_GAPS.md`.

Este documento, corregido, mapea contra:
- `../FASE3_GAPS.md` (raíz del proyecto) — gaps documentados.
- `../README.md` (raíz del proyecto) — descripción general.
- **Inventario real verificado** de archivos en `../backend/src/`, `../frontend/src/`, `../database/`.
- **Auditoría dirigida** documentada en `AUDITORIA-DIRIGIDA-2026-06-22.md`.

---

## 0. Inventario real verificado del proyecto

### 0.1 Backend PHP — Controllers (25 archivos)

| Controller | Existe | Comentario |
|---|:-:|---|
| `AuthController.php` | ✅ | |
| `UsuarioController.php` | ✅ | |
| `DependenciaController.php` | ✅ | |
| `EntidadController.php` | ✅ | |
| `MetaController.php` | ✅ | |
| `PeriodoController.php` | ✅ | |
| `CompromisoController.php` | ✅ | 31.740 bytes (el más grande). |
| `ConcertacionController.php` | ✅ | |
| `EvaluacionController.php` | ✅ | |
| `EvidenciaController.php` | ✅ | |
| `CompromisoMejoramientoController.php` | ✅ | |
| `CompetenciaController.php` | ✅ | |
| `AusentismoController.php` | ✅ | |
| `MovilidadController.php` | ✅ | |
| `CargaMasivaController.php` | ✅ | |
| `ReporteController.php` | ✅ | |
| `DashboardController.php` | ✅ | |
| `MenuController.php` | ✅ | |
| `NotificacionController.php` | ✅ | |
| `ParametroController.php` | ✅ | |
| `ConsultaFuncionarioController.php` | ✅ | |

### 0.2 Frontend React — Páginas (44 archivos)

| Página | Existe | Comentario |
|---|:-:|---|
| `Login.tsx` | ✅ | |
| `CambioForzadoPassword.tsx`, `NuevaContrasena.tsx`, `VerificarCodigo.tsx`, `SelectRolePage.tsx` | ✅ | Flujo de auth completo. |
| `Dashboard.tsx` (16.902 bytes) | ✅ | |
| `Perfil.tsx` | ✅ | |
| `ConsultaFuncionario.tsx` | ✅ | |
| **Admin** (10 archivos) | ✅ | `AdminHome`, `AdminDashboard`, `AdminDependencias`, `DependenciaList`, `AdminUsuarios`, `UsuarioList`, `AdminCompromisos`, `AdminConfiguracion`, `AdminEvaluaciones`, `AdminHome`, `AdminNotificaciones`, `AdminReportes`, `MovilidadList`, `CargaUsuarios`. |
| `Entidades/EntidadList.tsx` | ✅ | |
| `Metas/MetaList.tsx` | ✅ | |
| `Periodos/PeriodoList.tsx` | ✅ | |
| `Ausentismos/AusentismoList.tsx` | ✅ | **Ya existe** (rompe brecha C6 del FASE3_GAPS). |
| **Compromisos** (12 archivos) | ✅ | `CompromisosYCompetencias`, `ConcertarCompromisos`, `ProponerCompromisos`, `AprobarCompromisos`, `AjustarCompromisos`, `MisCompromisos`, `VerCompromisos`, `VerCompromisosPropuestos`, `FijacionUnilateral`, `CompromisosMejoramiento`. |
| **Concertaciones** | ✅ | `ConcertacionList.tsx`. |
| **Evaluaciones** (4 archivos) | ✅ | `PanelEvaluador` (36.821 bytes), `EvaluarPage`, `EvaluacionList`, `ComisionEvaluadora`. |
| **Evidencias** (2 archivos) | ✅ | `EvidenciaList`, `EvidenciasEvaluado`. |
| `Reportes/ReportesPage.tsx` | ✅ | |

**Componentes UI primitivos (10):** `Button`, `Card`, `DataTable`, `EmptyState`, `Input`, `Modal`, `Select`, `Skeleton`, `Tabs`, `Tooltip`.

**Helpers frontend:** `mensajesCNSC.ts` (¡ya existe!), `useContadores.ts`.

### 0.3 Database (1 dump consolidado)

Tras la consolidacion operativa del proyecto, el esquema vive en un unico archivo:

- `database/full_dump.sql` (esquema completo + seed + datos de prueba).

No hay migraciones incrementales en el repo. Cualquier cambio de esquema se aplica regenerando el dump completo.

### 0.4 Conclusión del inventario

El proyecto está **mucho más maduro** de lo que sugería el `FASE3_GAPS.md`. La mayoría de páginas y controllers ya existen. Los gaps pendientes son más de **contenido/lógica/calidad** que de archivos faltantes.

---

## 1. Mapeo de Gaps `FASE3_GAPS.md` → Estado real del proyecto

### C1. Módulo de Evidencias — Diseño incorrecto

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: tabla de archivos. |
| **Fuente CNSC** | `Tutorial_EDL_APP_-_Registro_de_evidencias_y_compromisos_de_m.md` [02:24–02:30] ("...no se cargará ningún tipo de archivo"). |
| **Documento detallado** | [`08-evidencias.md`](./08-evidencias.md). |
| **Archivos reales** | `frontend/src/pages/Evidencias/EvidenciaList.tsx` (13.913 bytes) **YA EXISTE**. `frontend/src/pages/Evidencias/EvidenciasEvaluado.tsx` **YA EXISTE**. Backend `EvidenciaController.php` (7.283 bytes) **YA EXISTE**. `database/migration_evidencias_descriptivas.sql` (2.504 bytes) **YA EXISTE**. |
| **Acción real** | **Verificar** si la migración `migration_evidencias_descriptivas.sql` ya está aplicada en el schema activo. **Auditar** `EvidenciaController.php` para confirmar que NO permite upload. **Auditar** `EvidenciaList.tsx` para confirmar formulario descriptivo. Si la migración NO está aplicada, ejecutarla. |
| **Probabilidad de que ya esté resuelto** | Alta (la migración existe y los controllers sugieren que el modelo ya fue corregido). |

### C2. Módulo de Compromisos de Mejoramiento — Falta página frontend

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: falta página frontend. |
| **Fuente CNSC** | `Tutorial_EDL_APP_-_Registro_de_evidencias_y_compromisos_de_m.md` [02:48–03:34]. |
| **Documento detallado** | [`09-compromisos-de-mejoramiento.md`](./09-compromisos-de-mejoramiento.md). |
| **Archivos reales** | `frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx` (13.821 bytes) **YA EXISTE**. Backend `CompromisoMejoramientoController.php` **YA EXISTE**. |
| **Acción real** | **Verificar** que la página esté conectada al controller y registrada en `App.tsx` + `Sidebar.tsx`. **Auditar** la lógica: ¿cumple los 7 campos CNSC (período, documento, compromiso/competencia, motivo, aspecto a corregir, acciones, observación)? |
| **Probabilidad de que ya esté resuelto** | Muy alta (existe la página). Probable: solo ajustes menores de campos o UX. |

### C3. Módulo Evaluar — PanelEvaluador vs doc CNSC

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: faltan dropdowns, escalas, etc. |
| **Fuente CNSC** | `Tutorial_EDL_APP_Realización_de_las_Evaluaciones_desde_el_Ro.md`, `Tutorial_para_la_realización_de_la_primera_evaluación_parcia.md`. |
| **Documento detallado** | [`05-flujo-evaluacion-y-calificacion.md`](./05-flujo-evaluacion-y-calificacion.md). |
| **Archivos reales** | `frontend/src/pages/Evaluaciones/PanelEvaluador.tsx` (36.821 bytes) **YA EXISTE** y es grande. `frontend/src/pages/Evaluaciones/EvaluarPage.tsx` **YA EXISTE**. `frontend/src/pages/Evaluaciones/ComisionEvaluadora.tsx` **YA EXISTE**. Backend `EvaluacionController.php`, `EvaluacionService.php` (9.136 bytes) **YA EXISTEN**. |
| **Acción real** | **Auditar en detalle** el contenido de `PanelEvaluador.tsx` (36KB sugiere que ya hay bastante lógica). Verificar que tenga: dropdown de 4 tipos, dropdown de motivos, escalas 4-6/7-9/10-12/13-15, preguntas de validación con justificación ≥40 chars, paso de Comisión Evaluadora. |
| **Probabilidad de que ya esté resuelto** | Media. La página existe y es grande, pero los detalles de UX y validación pueden faltar. |

### C4. Flujo Evaluado — Propuesta de compromisos

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: falta vista para que el evaluado proponga. |
| **Fuente CNSC** | `Tutorial_EDL_APP_-_Propuesta_de_compromisos_por_parte_del_Ev.md`. |
| **Documento detallado** | [`10-modulo-evaluado.md` §3](./10-modulo-evaluado.md). |
| **Archivos reales** | `frontend/src/pages/Compromisos/ProponerCompromisos.tsx` (11.049 bytes) **YA EXISTE**. `MisCompromisos.tsx`, `AprobarCompromisos.tsx`, `AjustarCompromisos.tsx`, `FijacionUnilateral.tsx`, `VerCompromisosPropuestos.tsx` **YA EXISTEN**. Backend `CompromisoController.php` (31.740 bytes) **YA EXISTE**. |
| **Acción real** | **Auditar** `ProponerCompromisos.tsx`: ¿está conectada correctamente al backend? ¿se integra con `CompromisosYCompetencias.tsx`? ¿valida rangos 1-5 funcional anual / 1-3 prueba / 3-5 comportamental? |
| **Probabilidad de que ya esté resuelto** | Muy alta (existen múltiples páginas relacionadas con el flujo bilateral). |

### C5. Login — Etiquetas incorrectas

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico (rápido): "Documento" debe ser "Nombre de usuario". |
| **Fuente CNSC** | `Tutorial_para_el_aplicativo_Sistema_Tipo_para_la_EDL.md` [00:08–00:17]. |
| **Documento detallado** | [`11-modulo-jefe-personal.md` §1](./11-modulo-jefe-personal.md). |
| **Archivos reales** | `frontend/src/pages/Login.tsx` (7.523 bytes) **YA EXISTE**. |
| **Acción real** | **Verificar** contenido de `Login.tsx`: ¿usa "Documento" o "Nombre de usuario"? Cambiar etiqueta si corresponde. **Verificar** que el botón sea "Acceder". |
| **Probabilidad de que ya esté resuelto** | Media-alta (es un cambio trivial que puede o no haberse hecho). |

### C6. Módulo Ausentismos — Falta página frontend

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: falta página frontend. |
| **Fuente CNSC** | `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md` [05:00–06:20]. |
| **Documento detallado** | [`11-modulo-jefe-personal.md` §7](./11-modulo-jefe-personal.md). |
| **Archivos reales** | `frontend/src/pages/Ausentismos/AusentismoList.tsx` (12.378 bytes) **YA EXISTE**. Backend `AusentismoController.php` **YA EXISTE**. |
| **Acción real** | **Verificar** que esté conectado, registrado en `App.tsx` y en `Sidebar.tsx`. **Auditar** que tenga los campos: motivo (incapacidad/comisión/encargo/suspensión/licencias/vacaciones/otro), fecha inicio, fecha fin, observaciones. **Auditar** validación >30 días y tipo de vinculación. |
| **Probabilidad de que ya esté resuelto** | Alta. |

### C7. Carga Masiva de Usuarios — Falta página frontend

| Atributo | Detalle |
|---|---|
| **Estado declarado en FASE3_GAPS** | Gap crítico: falta página frontend. |
| **Fuente CNSC** | `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md` [07:23–07:42]. |
| **Documento detallado** | [`11-modulo-jefe-personal.md` §9`](./11-modulo-jefe-personal.md). |
| **Archivos reales** | `frontend/src/pages/Admin/CargaUsuarios.tsx` (7.974 bytes) **YA EXISTE**. Backend `CargaMasivaController.php` **YA EXISTE**. |
| **Acción real** | **Verificar** conexión y registro de ruta. **Auditar** UX: wizard 4 pasos según CNSC (descargar → subir → preview → confirmar). |
| **Probabilidad de que ya esté resuelto** | Alta. |

---

## 2. Mapeo de Gaps Altos (A1–A7) — Estado real

### A1. Metas con Dependencia

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_-_Metas.md` [00:48–01:00]. |
| **Archivos reales** | `MetaList.tsx` (8.834 bytes) **YA EXISTE**. Backend `MetaController.php` **YA EXISTE**. |
| **Acción real** | **Auditar** `MetaList.tsx`: ¿tiene campo Dependencia? **Auditar** `schema.sql` línea `metas`: ¿tiene columna `dependencia_id`? |

### A2. Formulario Usuarios con campos CNSC

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_Creación_de_Usuarios.md`. |
| **Archivos reales** | `AdminUsuarios.tsx` (18.834 bytes — página grande). `UsuarioController.php`. `seed_usuarios.sql`. |
| **Acción real** | **Auditar en detalle** `AdminUsuarios.tsx` contra la lista de campos CNSC (género, ubicación, naturaleza, es_contratista, etc.). Probablemente algunos campos faltan o la lógica condicional (contratista → cargador) no está completa. |

### A3. Cambio de estado Dependencias

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md` [02:19–02:30]. |
| **Archivos reales** | `AdminDependencias.tsx` (7.248 bytes), `DependenciaList.tsx` **YA EXISTEN**. Backend `DependenciaController.php` **YA EXISTE**. |
| **Acción real** | **Auditar** si existe el botón "Cambiar estado" + validación "no inactivar con usuarios asociados". |

### A4. Periodos solo lectura

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_Rol_Jefe_de_Personal.md` [01:13–01:30]. |
| **Archivos reales** | `PeriodoList.tsx` (9.732 bytes) **YA EXISTE**. Backend `PeriodoController.php` **YA EXISTE**. |
| **Acción real** | **Confirmar** que el controller/backend no permita crear/editar períodos (solo lectura para la entidad). |

### A5. Comisión Evaluadora

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_Realización_Aprobación_Evaluaciones_Rol_de_.md` [03:30–05:26]. |
| **Archivos reales** | `ComisionEvaluadora.tsx` **YA EXISTE** como página dedicada. |
| **Acción real** | **Auditar** `ComisionEvaluadora.tsx`: ¿tiene flujo de aprobar/rechazar? ¿hay endpoint backend dedicado? |

### A6. Escalas de calificación

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Usos_escalas_y_consecuencias_de_EDL.md`. |
| **Archivos reales** | `EvaluacionService.php` (9.136 bytes). |
| **Acción real** | **Auditar** el service: ¿calcula correctamente funcional 85% + comportamental 15%? ¿mapea a Sobresaliente (≥90) / Satisfactorio (>65 y <90) / No Satisfactorio (≤65)? |

### A7. Menú del Evaluado

| Atributo | Detalle |
|---|---|
| **Fuente CNSC** | `Tutorial_EDL_APP_-_Propuesta_de_compromisos_por_parte_del_Ev.md`. |
| **Archivos reales** | `MenuController.php` **YA EXISTE**. |
| **Acción real** | **Verificar** que la respuesta del menú incluye "Proponer compromisos" para el rol evaluado. |

---

## 3. Mapeo de Bugs Críticos (P1–P5) — `FASE3_GAPS.md`

| ID | Bug | Archivo a tocar | Acción real |
|---|---|---|---|
| P1 | `Database.php` usa `\Pdo\Mysql::ATTR_FOUND_ROWS` | `backend/src/Config/Database.php` (1.250 bytes) | **Buscar la cadena** `ATTR_FOUND_ROWS`. Si está como `\Pdo\Mysql::ATTR_FOUND_ROWS`, cambiar a `PDO::MYSQL_ATTR_FOUND_ROWS`. |
| P2 | Conflicto de rutas `/evaluaciones/pendientes-calificar` vs `/evaluaciones/{id}` | `backend/public/index.php` (17.639 bytes) o `backend/public/router.php` (199 bytes) | **Auditar** `index.php`. Verificar que la ruta específica se registre ANTES de la captura con `{id}`. |
| P3 | Modelos PHP incompletos | `backend/src/Model/Evaluacion.php` (1.296 bytes), `Compromiso.php` (1.159 bytes) | **Auditar** qué propiedades faltan vs cómo se usan en Services. |
| P4 | Variable JWT inconsistente | `backend/.env.example` (545 bytes), `backend/src/Helper/JwtHelper.php` (2.188 bytes) | **Buscar** referencias a `JWT_EXPIRATION` y `JWT_EXPIRACION_MINUTOS`. Unificar. |
| P5 | Ruta AdminConfiguracion huérfana | `frontend/src/App.tsx` (6.188 bytes) | **Auditar** las rutas registradas. Verificar que `AdminConfiguracion` esté importada y montada. |

---

## 4. Resumen de acciones reales (no teóricas)

| Acción | Cantidad | Estado probable |
|---|---:|---|
| Verificar contenido de archivos existentes (auditoría) | ~15 | Muchos gaps son de "verificar y ajustar", no de "crear". |
| Fix puntual de bugs (P1–P5) | 5 | Bugs reales a corregir. |
| Ejecutar migración SQL pendiente (si aplica) | 1 | `migration_evidencias_descriptivas.sql`. |
| Agregar campos a schema (si faltan) | ~3 | `usuarios` campos CNSC, `metas.dependencia_id`, etc. |
| Crear archivo nuevo | 0 | Ya no hay gaps de "falta crear". |

**Conclusión:** el proyecto está mucho más cerca de "MVP funcional" de lo que sugería el `FASE3_GAPS.md`. La documentación CNSC ahora permite hacer una **auditoría dirigida** de los archivos existentes.

---

## 5. Tabla maestra de auditoría

Orden recomendado de auditoría/acción:

| # | Archivo | Acción | Origen |
|---|---|---|---|
| 1 | `backend/src/Config/Database.php` | Fix bug P1 | `FASE3_GAPS.md` |
| 2 | `backend/public/index.php` | Fix bug P2 | `FASE3_GAPS.md` |
| 3 | `backend/src/Model/Evaluacion.php` | Completar propiedades | Bug P3 |
| 4 | `backend/src/Model/Compromiso.php` | Completar propiedades | Bug P3 |
| 5 | `backend/.env.example` + `JwtHelper.php` | Unificar variable | Bug P4 |
| 6 | `frontend/src/App.tsx` | Verificar ruta `AdminConfiguracion` | Bug P5 |
| 7 | `frontend/src/pages/Login.tsx` | Verificar etiqueta "Nombre de usuario" | C5 |
| 8 | `database/migration_evidencias_descriptivas.sql` | Verificar si está aplicada | C1 |
| 9 | `backend/src/Controller/EvidenciaController.php` | Auditar (no upload) | C1 |
| 10 | `frontend/src/pages/Evidencias/EvidenciaList.tsx` | Auditar formulario | C1 |
| 11 | `frontend/src/pages/Evaluaciones/PanelEvaluador.tsx` | Auditar dropdowns/escalas | C3 |
| 12 | `backend/src/Service/EvaluacionService.php` | Auditar escalas | A6 |
| 13 | `frontend/src/pages/Compromisos/CompromisosYCompetencias.tsx` | Auditar opciones evaluado | A7 |
| 14 | `frontend/src/pages/Evaluaciones/ComisionEvaluadora.tsx` | Auditar flujo aprobar/rechazar | A5 |
| 15 | `frontend/src/pages/Admin/AdminUsuarios.tsx` | Auditar campos CNSC | A2 |
| 16 | `database/schema.sql` | Auditar `usuarios` campos CNSC | A2 |
| 17 | `database/schema.sql` | Auditar `metas.dependencia_id` | A1 |
| 18 | `frontend/src/pages/Metas/MetaList.tsx` | Auditar UI Dependencia | A1 |
| 19 | `frontend/src/pages/Admin/AdminDependencias.tsx` | Auditar botón cambiar estado | A3 |
| 20 | `frontend/src/lib/mensajesCNSC.ts` | Auditar completitud | M4 |
| 21 | `frontend/src/components/Layout/Sidebar.tsx` | Auditar items | C2/C6/C7 (registro) |
| 22 | `frontend/src/components/Shared/RoleSelector.tsx` | Auditar labels | B2 |