# ⏱️ 06 — Evaluación Parcial Eventual

> **Fuentes CNSC:** `Tutorial_EDL_APP_Realización_de_las_Evaluaciones_desde_el_Ro.md` (C8X9iSqXK5o), `Fases_de_EDL.md`, `Lineamientos_para_la_EDL_con_respecto_al_cambio_de_administr.md` (TcOmOoSoXRA).

---

## 1. Cuándo aplica

La evaluación parcial eventual se genera por situaciones especiales que interrumpen o modifican el curso normal del período de evaluación. **No es automática** — la dispara una situación específica y se realiza dentro de un plazo estricto.

## 2. Causales (dentro del período anual)

Cuando se selecciona "Evaluación parcial eventual" en el dropdown de tipo de evaluación, el aplicativo muestra las siguientes opciones:

| # | Causal |
|---|---|
| 1 | **Cambio de evaluador** |
| 2 | **Lapso entre la última evaluación y el final del período** |
| 3 | **Período de prueba en otro empleo** |
| 4 | **Separación temporal del empleo por más de 30 días calendario** |
| 5 | **Cambio de empleo por traslado o reubicación** |

### 2.1 Si se selecciona la causal #4 (separación temporal >30 días)

Se habilita una segunda lista desplegable para indicar la **razón**:

| Razón |
|---|
| Por **suspensión** |
| Por asumir o finalizar **encargo** en las funciones de otro empleo |
| Por **licencias** |
| Con ocasión al inicio o finalización de **comisiones** |
| Por **vacaciones** |

## 3. Datos requeridos para iniciar una parcial eventual

| Campo | Tipo |
|---|---|
| Causal (lista desplegable) | Requerido |
| Razón (si causal = separación temporal >30 días) | Condicional |
| **Fecha de inicio** del período a evaluar | Requerido |
| **Fecha de fin** del período a evaluar | Requerido |

> *"Posteriormente se deberán ingresar las fechas de comienzo y fin del período a evaluar y seleccionar el botón 'Comenzar evaluación'."*

## 4. Plazos

| Situación | Plazo |
|---|---|
| Parciales eventuales en general | **10 días hábiles** siguientes contados a partir del momento en que se presente la situación que las origina. |
| **Excepción — cambio de evaluador** | Se realiza **antes del retiro** del evaluador. |

> *"Estas evaluaciones parciales eventuales deben producirse dentro de los 10 días hábiles siguientes contados a partir del momento en que se presente la situación que las origina, con excepción de la ocasionada por cambio de evaluador, la cual se realizará antes del retiro de éste."*

## 5. Lapso a evaluar (qué se evalúa)

Depende de la causal:

| Causal | Lapso cubierto por la parcial eventual |
|---|---|
| **Cambio de evaluador** | Lo transcurrido desde el inicio del período hasta el retiro del evaluador. |
| **Lapso entre la última evaluación y el final del período** | Lo que va desde la última evaluación parcial (si la hubiere) hasta el final del período semestral a evaluar. |
| **Período de prueba en otro empleo** | Lo transcurrido en período de prueba. |
| **Separación temporal >30 días** | Lo transcurrido durante la separación. |
| **Cambio de empleo por traslado o reubicación** | Lo transcurrido en el empleo anterior. |

## 6. Caso especial: cambio de administración territorial

Ver [`12-cambio-administracion.md`](./12-cambio-administracion.md) para el lineamiento específico:

> *"Los evaluadores que se retiran del servicio deberán dejar calificados a todos los servidores que tienen a su cargo, ya sea en período de prueba o en período anual, hasta el último día hábil en que permanezcan en el cargo, atendiendo a la causal 'cambio de evaluador', generando de esta manera una evaluación parcial eventual."*

> *"Para aquellos que ingresan el primero de enero de 2024, asumirán los días que queden pendientes, atendiendo a lo que nos da como lineamiento el Acuerdo 617: aquellos días pendientes serán adjuntados al período de evaluación, debiendo fijar unos compromisos que les permitan dar cuenta del desempeño de estos servidores durante todo el año de vigencia."*

## 7. Dentro del período de prueba

Las parciales eventuales también aplican al período de prueba:

| Causal | Tratamiento |
|---|---|
| Cambio de evaluador | El evaluador saliente evalúa al empleado en período de prueba antes de retirarse. |
| **Interrupción del período de prueba** ≥ 20 días continuos | El período de prueba se prolonga por el término que dure la interrupción. |
| Lapso entre última evaluación parcial (si la hubiere) y el final del período de prueba | Se evalúa ese tramo. |

## 8. Consideraciones técnicas para el sistema

- El sistema debe permitir **filtrar/agrupar** las evaluaciones por tipo para reportes e historial.
- La causal y razón deben quedar **almacenadas como metadatos** de la evaluación.
- Las fechas inicio/fin se usan para:
  - Calcular los **días** del período evaluado (visible en "Ver evaluaciones").
  - Soportar la **regla de separación temporal >30 días** (validación: si la causal es separación temporal, los días entre fecha_inicio y fecha_fin deben ser >30).
  - Soportar la **regla de interrupción de período de prueba >20 días**.

## 9. Mensajes literales esperados

- *"La creación de la evaluación se realizó correctamente."*
- *"La separación temporal del cargo debe ser superior a 30 días calendario para generar evaluación parcial eventual."* (validación)
- *"La interrupción del período de prueba es igual o superior a 20 días continuos. El período de prueba se prolonga por [X] días."* (validación)