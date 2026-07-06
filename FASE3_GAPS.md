# FASE 3 — Brechas del Proyecto vs Documentacion CNSC (HISTORIAL CERRADO)

> **Estado del documento**: HISTORICO. Este archivo conserva el analisis de brechas detectado durante la **Fase 3** del proyecto EDL Carepa. La practica actual es usar `cnsc/13-trazabilidad-con-proyecto.md` y `cnsc/14-futuro-del-proyecto.md` para el estado vivo de los gaps CNSC.
>
> **Ultima revision**: 2026-06-27
> **Baseline de codigo**: rama `feature/cerrar-gaps-evaluador`

## TL;DR

El analisis de Fase 3 (lectura triple de los 14 archivos de documentacion primaria, comparacion contra el estado del codigo) detecto brechas que en su mayoria fueron cerradas en el ciclo de cierre del 2026-06-27. Este documento se conserva como **evidencia historica** y referencia para auditoria.

## Trazabilidad del cierre

| Gap | Severidad original | Descripcion | Estado al 2026-06-27 |
| --- | --- | --- | --- |
| **C1** | Critica | Evidencias: cambiar diseno (sin upload de archivos; descriptivo puro) | **CERRADO** (`EvidenciaList.tsx` con formulario descriptivo) |
| **C2** | Critica | Compromisos de Mejoramiento: agregar selector de periodo y plazo_cumplimiento | **CERRADO** (`CompromisosMejoramiento.tsx`) |
| **C3** | Critica | Panel del Evaluador: completar tipos de evaluacion, escalas, validacion 40 chars, preguntas Si/Mod/No | **CERRADO** (`PanelEvaluador.tsx`, ~36 KB) |
| **C4** | Critica | Evaluado: flujo de propuesta de compromisos | **CERRADO** (`ProponerCompromisos.tsx` + flujo completo) |
| **C5** | Critica | Login: cambiar etiqueta "Documento" a "Nombre de usuario" | **CERRADO** (`Login.tsx`) |
| **C6** | Critica | Ausentismos: pagina frontend | **CERRADO** (`AusentismoList.tsx`) |
| **C7** | Critica | Carga masiva de usuarios: pagina frontend | **CERRADO** (`CargaUsuarios.tsx`) |
| **A1** | Alta | Metas: campo Dependencia | **CERRADO** (`MetaList.tsx` con `dependencia_id`) |
| **A2** | Alta | Admin Usuarios: campos CNSC obligatorios (17+ campos) | **CERRADO** (`AdminUsuarios.tsx`) |
| **A3** | Alta | Dependencias: funcion cambiar estado con validacion | **CERRADO** (`DependenciaController.cambiarEstado()`) |
| **A4** | Alta | Periodos: vista informativa de solo lectura | CERRADO |
| **A5** | Alta | Comision Evaluadora: flujo completo de aprobacion/rechazo | CERRADO |
| **A6** | Alta | Escalas de calificacion: logica 85/15 + escala final | **CERRADO** (calculado en `EvaluacionService.guardar/finalizar`) |
| **A7** | Alta | Menu Evaluado: opcion "Proponer Compromisos" | **CERRADO** (en `MenuController.menuEvaluado()`) |
| **M1-M7** | Media | Varios (cambio password, PDF, mensajes literales, validacion anual/prueba, fijacion unilateral, checkbox propuesto jefe) | MAYORIA CERRADA |
| **B1-B3** | Baja | Ajustes cosmeticos (paleta, etiquetas de rol, footer) | CERRADO |
| **P1** | Bug | `Database.php`: `\Pdo\Mysql::ATTR_FOUND_ROWS` invalido | **FIJADO** (`PDO::MYSQL_ATTR_FOUND_ROWS`) |
| **P2** | Bug | Router: `/evaluaciones/pendientes-calificar` capturada por `/{id}` | **FIJADO** (ruta movida antes del parametro) |
| **P3** | Bug | Modelos incompletos | **FIJADO** |
| **P4** | Bug | Inconsistencia nombre variable JWT | **FIJADO** (`JWT_EXPIRACION_MINUTOS` unificado) |
| **P5** | Bug | Rutas faltantes (AdminConfiguracion) | **FIJADO** |

## Seccion historica (preservada para auditoria)

Estas son las definiciones originales de cada brecha, tal como se documentaron durante la Fase 3. Se conservan como referencia; **no representan el estado actual del codigo**. Para el estado vivo, consultar `cnsc/13-trazabilidad-con-proyecto.md`.

### C1. Modulo de Evidencias — diseno descriptivo

El modulo de evidencias, segun Acuerdo 617 de 2018, NO carga archivos al aplicativo. Solo registra: compromiso/competencia, descripcion, ubicacion (fisica o link), observacion.

- Estado al cierre: `frontend/src/pages/Evidencias/EvidenciaList.tsx` con formulario descriptivo puro; `EvidenciaController` devuelve estructura consistente.
- Archivos: `frontend/src/pages/Evidencias/EvidenciaList.tsx`, `backend/src/Controller/EvidenciaController.php`, `backend/src/Service/EvidenciaService.php`, `backend/src/Repository/EvidenciaRepository.php`.

### C2. Compromisos de Mejoramiento — campo periodo y plazo

- Estado al cierre: `frontend/src/pages/Compromisos/CompromisosMejoramiento.tsx` con selector de periodo (requerido antes de buscar evaluado) y `plazo_cumplimiento` (date picker).
- Verificacion: confirmadas las 6 ocurrencias de `plazo_cumplimiento` en el archivo.

### C3. Panel del Evaluador — especificacion completa CNSC

- Estado al cierre: `frontend/src/pages/Evaluaciones/PanelEvaluador.tsx` (~36 KB) con los 4 tipos de evaluacion, validacion de fechas para 2.do semestre, escalas comportamentales (nunca/algunas veces/frecuentemente/siempre -> 4/7/10/13), preguntas de aporte, justificacion minima de 40 caracteres, jefe inmediato y motivo.
- Logica de calculo: `backend/src/Service/EvaluacionService.php` separada para no contaminar el UPDATE con campos espurios (`unset` de `tipo_evaluacion`/`fecha_inicio_eval`/`fecha_fin_eval` previo al UPDATE; nombre de periodo seleccionado de forma segura).

### C4. Propuesta de compromisos del evaluado

- Estado al cierre: `ProponerCompromisos.tsx` (313 lineas) + `MisCompromisos.tsx` + `AprobarCompromisos.tsx` + `AjustarCompromisos.tsx` + `FijacionUnilateral.tsx` + `VerCompromisosPropuestos.tsx`.
- Ruta frontend: `/compromisos/proponer` declarada en `App.tsx`.

### C5. Etiquetas de Login

- Estado al cierre: `frontend/src/pages/Login.tsx` usa la etiqueta "Nombre de usuario" (alineada con la documentacion CNSC).

### C6. Modulo de Ausentismos

- Estado al cierre: `frontend/src/pages/Ausentismos/AusentismoList.tsx` con motivos (incapacidad, comision, encargo, suspension, licencias, vacaciones, otros), validacion > 30 dias.

### C7. Carga Masiva de Usuarios

- Estado al cierre: `frontend/src/pages/Admin/CargaUsuarios.tsx` con descarga de plantilla, seleccion de archivo y boton enviar.

### A1. Metas + Dependencia

- Estado al cierre: `MetaList.tsx` con selector de `dependencia_id`.

### A2. Formulario de Usuarios (Admin) — campos CNSC

- Estado al cierre: `AdminUsuarios.tsx` con 17+ campos: genero, departamento, municipio, telefono 1 y 2, confirmar correo, contratista Si/No, nivel, naturaleza, tipo de nombramiento, dependencia, es evaluador, denominacion, codigo, grado, periodo de prueba, fecha de posesion, empezo el 1 de febrero, proposito del empleo.

### A3. Cambio de estado de Dependencias

- Estado al cierre: `DependenciaController::cambiarEstado()` + validacion por usuarios asociados. Endpoint: `PUT /dependencias/{id}/estado`.

### A6. Escalas de calificacion

- Estado al cierre: backend aplica 85% funcionales / 15% comportamentales; escala final: Sobresaliente >= 90, Satisfactorio entre 65 y 90, No Satisfactorio <= 65.

### A7. Menu del Evaluado

- Estado al cierre: `MenuController::menuEvaluado()` retorna 5 items, incluyendo "Proponer Compromisos".

### Bugs historicos P1-P5

- **P1**: `PDO::MYSQL_ATTR_FOUND_ROWS` ya aplicado en `Database.php`.
- **P2**: ruta `pendientes-calificar` movida antes de `/{id}` en `index.php`.
- **P3**: `Evaluacion.php` y `Compromiso.php` completados.
- **P4**: `JWT_EXPIRACION_MINUTOS` unificado en backend.
- **P5**: rutas `AdminConfiguracion` registradas.

## Lecciones aprendidas

1. La documentacion primaria debe ser la **fuente viva** (en este caso, `cnsc/13-trazabilidad-con-proyecto.md`). Mantener archivos de gap como `FASE3_GAPS.md` solo si se archival tras cada cierre.
2. `FASE3_GAPS.md` tuvo secciones "RESUELTO" parciales que quedaron inconsistentes con la realidad (`C4` y `A7` marcados, `C1`-`C3` y `C5`-`C7` no). Esto se corrigio con la transformacion a historial cerrado.
3. El proyecto crecio mas rapido que su gap tracker. Es la dinamica habitual: las herramientas de gap deben ser **rotativas**, no acumulativas.
4. La trazabilidad definitiva queda en `cnsc/13-trazabilidad-con-proyecto.md` (matriz norma-codigo viva) y en el cuerpo de los PRs (referencias cruzadas).

## Como usar este documento

- **No editar** este archivo para reflejar el estado actual del codigo. Cualquier nueva brecha debe registrarse en `cnsc/13-trazabilidad-con-proyecto.md` y/o en `cnsc/14-futuro-del-proyecto.md`.
- Solo editar este archivo si se quiere **anexar una nueva fase historica** (ej. "FASE 3.5 cerrada el YYYY-MM-DD") con el mismo formato de tabla resumen.

---

*Documento cerrado. Para gaps activos consultar `cnsc/13-trazabilidad-con-proyecto.md` y `cnsc/14-futuro-del-proyecto.md`.*
