# 🔄 12 — Lineamientos para el Cambio de Administración

> **Fuentes CNSC:** `Lineamientos_para_la_EDL_con_respecto_al_cambio_de_administr.md` (TcOmOoSoXRA), `Fases_de_EDL.md`.

---

## 1. Contexto

A partir del **1° de enero de 2024** (y en general en cualquier cambio de administración territorial), se producen **transiciones de gobierno** que impactan directamente el proceso de EDL. La CNSC emitió lineamientos claros para los evaluadores salientes y entrantes.

## 2. Lineamiento para evaluadores salientes

> *"Los evaluadores que se retiran del servicio deberán dejar calificados a todos los servidores que tienen a su cargo, ya sea en período de prueba o en período anual, hasta el último día hábil en que permanezcan en el cargo, atendiendo a la causal 'cambio de evaluador', generando de esta manera una evaluación parcial eventual."*

**Implicaciones operativas:**

| Acción | Plazo |
|---|---|
| Dejar **calificados** a todos los servidores a cargo (período de prueba o anual) | **Hasta el último día hábil** en que permanezcan en el cargo. |
| Tipo de evaluación a registrar | **Evaluación parcial eventual** con causal = **Cambio de evaluador**. |

> *"Atendiendo a cuál causal es la que se encuentra establecida que indica por cambio de evaluador, generando de esta manera una evaluación parcial eventual."*

## 3. Lineamiento para evaluadores entrantes

> *"Para aquellos que ingresan el primero de enero de 2024, asumirán los días que queden pendientes, atendiendo a lo que nos da como lineamiento el Acuerdo 617: aquellos días pendientes serán adjuntados al período de evaluación, debiendo fijar unos compromisos que les permitan dar cuenta del desempeño de estos servidores durante todo el año de vigencia."*

**Implicaciones operativas:**

| Acción | Cuándo |
|---|---|
| Asumir los días restantes del período de evaluación. | Desde la posesión del nuevo evaluador. |
| **Fijar compromisos** que permitan dar cuenta del desempeño de los servidores durante todo el año. | Antes del 15 de febrero (dentro del plazo de concertación). |
| **Verificar** las evaluaciones parciales registradas por el evaluador saliente. | Inmediatamente. |

## 4. Cronología típica del cambio de gobierno

```
31 de diciembre (año N-1)
  │
  ├─ Evaluador saliente debe haber completado evaluaciones parciales
  │  eventuales por cambio de evaluador.
  │
1 de enero (año N)
  │
  ├─ Nuevo evaluador asume.
  ├─ Puede revisar evaluaciones registradas por saliente.
  │
1-15 de febrero (año N)
  │
  ├─ Plazo normal de concertación (15 días hábiles desde 1° feb).
  └─ El nuevo evaluador puede concertar compromisos para el resto
     del período.
```

## 5. Decisiones técnicas para el sistema

### 5.1 Backend

- Permitir evaluaciones parciales eventuales con causal "Cambio de evaluador" con fechas personalizables (no auto-completar con la fecha del último día del evaluador).
- Al crear un nuevo usuario evaluador y asignarle evaluados, el sistema debe:
  - Detectar si hay evaluaciones parciales eventuales previas (del evaluador saliente).
  - Permitir al nuevo evaluador **continuar** desde el estado actual.

### 5.2 Frontend

- En el módulo "Evaluar", al seleccionar causal "Cambio de evaluador":
  - Mostrar nota informativa: *"Esta causal aplica cuando el evaluador saliente debe dejar calificados a todos sus servidores a cargo. El nuevo evaluador asumirá los días restantes."*
  - Habilitar libremente las fechas de inicio/fin del período a evaluar.

### 5.3 Reportes

- Agregar filtro "Causal" en reportes de evaluaciones (por defecto "Todas").
- Permitir reporte de **transición de administración**: cuántos evaluadores cambiaron, cuántos evaluados fueron evaluados parcialmente, cuántos quedaron pendientes.

## 6. Supuestos operativos del proyecto Carepa

- Carepa tuvo cambio de gobierno territorial en 2024 (u otro año).
- El sistema debe estar preparado para **manejar transiciones de gobierno** sin pérdida de información.
- Específicamente:
  - **No perder** evaluaciones parciales registradas por evaluadores salientes.
  - **No romper** el flujo de los evaluados (sus compromisos previos siguen vigentes).
  - **Permitir** que el nuevo evaluador continué desde donde quedó el anterior.
  - **Generar** trazabilidad de quién evaluó cuándo (auditoría).

## 7. Mensaje literal CNSC

> *"Para más información vamos a dar un comunicado y vamos a expedir un instructivo que les va a permitir poder tener claridad frente a este procedimiento. Igualdad, mérito y oportunidad. Comisión Nacional del Servicio Civil."*

**Implicación:** la CNSC publicará (o publicó) un instructivo específico. El proyecto debe estar alineado con ese instructivo cuando se emita.

## 8. Recomendaciones de implementación

1. **Tabla `historial_evaluadores`**: registrar cada cambio de evaluador con fecha, evaluador anterior, evaluador nuevo, motivo.
2. **Evaluaciones "huérfanas"**: workflow para asignar evaluaciones parciales pendientes cuando un evaluador se va sin terminar.
3. **Notificación automática**: cuando se asigna un nuevo evaluador, notificarle qué evaluaciones tiene pendientes.
4. **Reasignación masiva**: endpoint para que el jefe de personal reasigne todos los evaluados de un evaluador saliente a uno nuevo (de una sola vez).
5. **Reporte de transición**: como reporte pre-armado para el jefe de personal.