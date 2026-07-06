# EVALUADOR_IMPLEMENTATION.md — Registro cerrado (2026-06-27)

> **Estado del documento**: HISTORICO. Este archivo captura la especificacion tecnica usada para construir el rol Evaluador del sistema EDL Carepa. La implementacion resultante esta **cerrada y operativa** desde 2026-06-27.
>
> **Para el estado vivo** del modulo Evaluador consultar:
> - Frontend: `frontend/src/pages/Evaluaciones/PanelEvaluador.tsx` (~36 KB)
> - Backend: `backend/src/Controller/EvaluacionController.php` + `backend/src/Service/EvaluacionService.php` + `backend/src/Repository/EvaluacionRepository.php`
> - Reglas de negocio CNSC: `cnsc/05-flujo-evaluacion-y-calificacion.md`

## Resumen de la especificacion

El modulo Evaluador implementa los cuatro tipos de evaluacion del Sistema Tipo CNSC:

1. Evaluacion parcial eventual (con motivo: cambio de evaluador, lapso desde ultima evaluacion, periodo de prueba, separacion temporal > 30 dias, cambio de empleo/traslado).
2. Evaluacion 1.er semestre (01-02 a 31-07).
3. Evaluacion 2.do semestre (01-08 a 31-01 del ano siguiente; validacion estricta de fechas).
4. Calificacion extraordinaria.

Ademas:

- Catalogo de compromisos funcionales con peso porcentual y calificacion 0-100.
- Catalogo de compromisos comportamentales con conductas (5 por competencia, segun Decretos 2539/2005 y 815/2018), escala de frecuencia (Nunca / Algunas veces / Frecuentemente / Siempre -> 4 / 7 / 10 / 13), preguntas de aporte (Si / Moderadamente / No) y de aporte adicional (Si / No) con justificacion >= 40 caracteres.
- Pregunta de jefe inmediato con motivo condicional (retiro, impedimento, recusacion).

## Sidebar del Evaluador

1. Inicio
2. Compromisos y Competencias
3. Evidencias
4. Compromisos de Mejoramiento
5. Evaluar

## Pantalla Evaluar (`/evaluar`)

- Selector de periodo (anual tipo "2026-2027").
- Busqueda por documento o nombre del evaluado.
- Tabla de evaluados del periodo (columnas: documento, evaluado, nivel, denominacion, codigo dependencia, grado, opciones).
- Click "Evaluar" -> flujo de tipo de evaluacion -> pantalla de calificacion -> guardado o finalizacion.

## Contrato backend (resumen de endpoints)

| Metodo | Endpoint | Descripcion |
| --- | --- | --- |
| GET | `/api/v1/evaluaciones?evaluador=me&periodo_id=X` | Listar evaluaciones del evaluador en un periodo |
| GET | `/api/v1/evaluaciones/buscar-evaluado?documento=X&nombre=Y&periodo_id=Z` | Buscar evaluado por doc o nombre |
| GET | `/api/v1/evaluaciones/{evaluacionId}/evaluaciones` | Ver evaluaciones previas del evaluado |
| GET | `/api/v1/compromisos/evaluacion/{evaluacionId}` | Compromisos funcionales + comportamentales con conductas |
| PUT | `/api/v1/compromisos/{id}/calificar` | Calificar compromiso (funcional 0-100 o comportamental con conductas) |
| PUT | `/api/v1/evaluaciones/{id}/guardar` | Guardar evaluacion parcial |
| PUT | `/api/v1/evaluaciones/{id}/finalizar` | Finalizar evaluacion (calcula definitiva con 85/15) |

## Validaciones implementadas

- **Fecha 2.do semestre**: `fecha_inicio >= 01-08-<anio>` y `fecha_fin <= 31-01-<anio+1>`. Validacion confirmada como operativa.
- **Compromisos funcionales**: suma de pesos = 100%; calificacion 0-100.
- **Compromisos comportamentales**: todas las conductas valoradas; preguntas respondidas; justificacion >= 40 caracteres si impacto_excede = "si".
- **Jefe inmediato**: si `evaluador_no_jefe` es true, motivo obligatorio (retiro_empleado_responsable / impedimento / recusacion).
- **Update limpio**: previo al `UPDATE` en `EvaluacionService::guardar/finalizar` se hace `unset` de las claves ajenas a la tabla (`tipo_evaluacion`, `fecha_inicio_eval`, `fecha_fin_eval`) para evitar errores SQL.
- **Nombre de periodo**: el `EvaluarPage.tsx` consulta inline `SELECT nombre FROM periodos WHERE id = ?` para mostrar el nombre del periodo en validaciones y resumenes, evitando contaminar el payload principal.

## Reglas de negocio CNSC aplicadas

- Funcionales: 85% de la calificacion total.
- Comportamentales: 15% de la calificacion total.
- Escala comportamental: Bajo (4-6), Aceptable (7-9), Alto (10-12), Muy Alto (13-15).
- Escala final: Sobresaliente >= 90%, Satisfactorio entre 65% y 90%, No Satisfactorio <= 65%.
- Periodicidad segun Decreto 1083/2015: anual 01-02 a 31-01 siguiente; parcial dentro de 15 dias habiles post-vencimiento.

## Estructura de estados (frontend)

```typescript
// Busqueda
periodoId, busquedaDoc, busquedaNombre, evaluaciones[], evaluacionSel
// Configuracion de evaluacion
tipoEvaluacion, motivoEvaluacion, razonEvaluacion, fechaInicio, fechaFin,
noEsJefe, motivoNoJefe, evaluacionIniciada
// Compromisos
compromisos[], modalCompromiso, calificacion, conductasForm, obsCompromiso
// Preguntas de cierre
cumplioCompromisos, aporteAdicional, descAporte, justificacion
// UI
loading, buscando, errorBusqueda, saving, guardandoCal, confirmModal
```

## Datos relevantes (verificados)

- 6 referencias a `plazo_cumplimiento` en `CompromisosMejoramiento.tsx` (lineas 17, 154, 179, 329, 384-385).
- 4 tipos de evaluacion soportados: parcial_eventual, parcial_primer_semestre, parcial_segundo_semestre, calificacion_definitiva, calificacion_extraordinaria (el enum existe en la tabla `evaluaciones`).
- Conductas por competencia: 7 competencias x 5 conductas = 35 conductas (seed en `migration_conductas.sql` historica, ahora consolidado en el dump unico).

## Cambios criticos posteriores al cierre inicial

- Filtro por `periodo_id` agregado a las llamadas del modulo Compromisos de Mejoramiento.
- `plazo_cumplimiento` (date picker) agregado al formulario de alta/edicion de compromisos de mejoramiento.
- Validacion de 2.do semestre (01-08 a 31-01 del ano siguiente) verificada en runtime (codigo de respuesta HTTP 200; codigo 422 cuando violada).

## Cierre

El modulo Evaluador cumple la especificacion CNSC Acuerdo 617 de 2018 para los flujos de calificacion del desempeno laboral. Cualquier nueva necesidad funcional debe:

1. Registrarse como brecha en `cnsc/13-trazabilidad-con-proyecto.md`.
2. Planificarse en `cnsc/14-futuro-del-proyecto.md` (Fases post-cierre).
3. Implementarse con el patron Controller -> Service -> Repository y Pruebas con `tests/api_test.py` + `tests/flow_test.py`.

No editar este archivo para reflejar cambios funcionales; usar los documentos de trazabilidad vivos.
