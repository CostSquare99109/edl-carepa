# 🛠️ 09 — Módulo de Compromisos de Mejoramiento

> **Fuentes CNSC:** `Tutorial_EDL_APP_-_Registro_de_evidencias_y_compromisos_de_m.md` (b8eOIVxvnZ8), `Tutorial_EDL_APP_Rol_Evaluador.md`, `Tutorial_para_el_aplicativo_Sistema_Tipo_para_la_EDL.md`, `Fases_de_EDL.md`.

---

## 1. Definición

Los **Compromisos de Mejoramiento** surgen como resultado del **seguimiento al desempeño del servidor** en el marco del proceso de evaluación. Son **acciones correctivas** puntuales que el evaluador registra para promover el desarrollo de los compromisos concertados.

> *"En caso de que se requieran acordar compromisos de mejoramiento con el fin de mejorar y promover el desarrollo de los compromisos concertados, podrá registrarlos en el módulo dispuesto para ello."*

> *"Si como resultado del seguimiento el evaluador evidencia que existen aspectos a mejorar, podrá suscribir compromisos de mejoramiento individual basados en los avances de los planes institucionales o metas por áreas, dependencias, grupos internos de trabajo y procesos o indicadores de gestión, y las evidencias sobre el desarrollo de los compromisos concertados."*

## 2. Momento del proceso

Fase de **seguimiento** (segunda fase). Se registran durante todo el período de evaluación, a medida que el evaluador identifica aspectos a mejorar.

## 3. Campos del formulario

| # | Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| 1 | **Período** | Lista desplegable | Sí | Período de evaluación. |
| 2 | **Documento del evaluado** | Input + botón "Buscar evaluado" | Sí | Documento del evaluado. |
| 3 | **Compromiso o competencia** | Lista desplegable | Sí | Compromiso o competencia que se asocia al compromiso de mejoramiento (debe estar en la concertación). |
| 4 | **Motivo** | Textarea | Sí | Causas del compromiso de mejoramiento. |
| 5 | **Aspecto a corregir** | Textarea | Sí | Tema puntual que requiere acciones para mejorar. |
| 6 | **Acciones de mejoramiento** | Textarea | Sí | Acciones puntuales a realizar por parte del evaluado. |
| 7 | **Observación** | Textarea | Opcional | Solo si hay lugar a ella. |

## 4. Listado de compromisos de mejoramiento (panel derecho)

Una vez registrado, en la parte derecha de la pantalla se muestra la información del evaluado y evaluador y el **listado de compromisos de mejoramiento** con las siguientes columnas:

| Columna | Descripción |
|---|---|
| **Fecha de registro** | Cuándo se creó. |
| **Compromiso/competencia** | A qué compromiso/competencia se asocia. |
| **Motivo** | Causas del compromiso de mejoramiento. |
| **Aspecto a corregir** | El tema puntual. |
| **Acción de mejoramiento** | Las acciones a realizar. |
| **Observación** | Opcional. |
| **Usuario que registró** | Persona que hizo el registro. |
| **Editar** | Acción habilitada únicamente para el servidor que registró la información. |

## 5. Quién registra compromisos de mejoramiento

El **evaluador** es quien los registra, ya que es el responsable del seguimiento.

## 6. Relación con la evaluación parcial

> *"Las conductas evaluadas son las establecidas por los Decretos 2539 de 2005 y 815 de 2018 según corresponda."*

> *"Tenga en cuenta que cuando no se produce la calificación en los términos establecidos legalmente, la calificación parcial semestral se entenderá proporcional al mínimo satisfactorio, es decir, 33%."*

Los compromisos de mejoramiento **NO** son una evaluación, son **acciones preventivas/correctivas**. No modifican la calificación por sí mismos, pero su seguimiento **sí impacta** las evaluaciones parciales y definitivas.

## 7. Mensajes literales esperados

- *"La creación del compromiso de mejoramiento se realizó correctamente."* (al guardar)
- *"El registro del compromiso de mejoramiento es exitoso."* (confirmación)

## 8. Reglas de negocio

| Regla | Mensaje esperado |
|---|---|
| Período debe existir | *"El período seleccionado no es válido."* |
| Compromiso debe pertenecer a la concertación del evaluado | *"El compromiso seleccionado no corresponde a la concertación del evaluado."* |
| Motivo no puede estar vacío | *"El motivo del compromiso de mejoramiento es obligatorio."* |
| Aspecto a corregir no puede estar vacío | *"El aspecto a corregir es obligatorio."* |
| Acciones de mejoramiento no puede estar vacío | *"Las acciones de mejoramiento son obligatorias."* |

## 9. Decisión arquitectónica importante (brecha del proyecto)

El proyecto EDL Carepa tiene una **inconsistencia crítica** respecto a este módulo:

> En la migración `migration_edl_carepa.sql`, los compromisos de tipo "mejoramiento" se convierten a "funcional" — **se eliminan como tipo separado**.

Esto contradice directamente el Acuerdo 617 y los tutoriales de la CNSC, donde los compromisos de mejoramiento son un **módulo separado** con sus propios campos (`motivo`, `aspecto a corregir`, `acciones de mejoramiento`, `observación`).

**Recomendación:** crear la tabla `compromisos_mejoramiento` como entidad separada, asociada a un compromiso o competencia por FK, pero **NO como tipo de compromiso**.

```
compromisos_mejoramiento
├── id
├── compromiso_id (FK a compromisos)
├── competencia_id (FK a competencias, nullable)
├── periodo_id (FK a periodos)
├── evaluado_id (FK a usuarios)
├── evaluador_id (FK a usuarios)
├── motivo (TEXT)
├── aspecto_corregir (TEXT)
├── acciones_mejoramiento (TEXT)
├── observacion (TEXT, nullable)
├── usuario_registra_id (FK a usuarios)
├── fecha_registro (TIMESTAMP)
├── created_at / updated_at
```

## 10. Diferencia con el módulo de evidencias

| Módulo | Objetivo | Cuándo se usa |
|---|---|---|
| **Evidencias** | Demostrar cumplimiento/incumplimiento de un compromiso ya concertado. | Durante el seguimiento, cada vez que hay soporte. |
| **Compromisos de Mejoramiento** | Definir acciones correctivas cuando se identifican aspectos a mejorar. | Durante el seguimiento, cuando el evaluador detecta una brecha. |

Ambos son **complementarios**: las evidencias respaldan el estado actual, los compromisos de mejoramiento definen cómo cerrar las brechas identificadas.