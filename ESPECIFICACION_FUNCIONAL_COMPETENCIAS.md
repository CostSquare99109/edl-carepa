# ESPECIFICACIÓN FUNCIONAL — Módulo de Gestión de Competencias Funcionales y Comportamentales por Cargo

**Versión:** Definitiva para presentación al Municipio  
**Fecha:** 2026-07-31  
**Fuente:** Manual de Funciones Planta Temporal - Marzo 2025 y Manual de Funciones Planta Global - Marzo 2025  
**Alcance:** Basado exclusivamente en los dos Manuales de Funciones proporcionados

---

## 📋 REQUISITOS RESPALDADOS POR LOS MANUALES (Obligatorios)

| ID | Requisito | Fuente en Manuales |
|----|-----------|-------------------|
| **RF-01** | El sistema debe conservar la información de **competencias comportamentales** definidas en los manuales para cada nivel jerárquico. | Sección VI de fichas + referencia Decreto 2539/2005 (art. 6, 7, 8) |
| **RF-02** | **En las fichas de cargos revisadas de los Manuales de Funciones, las competencias comportamentales están conformadas por las competencias comunes y las competencias específicas correspondientes al nivel jerárquico del cargo.** | Sección VI - "COMUNES" + específicas por nivel (fichas revisadas) |
| **RF-03** | **En las fichas de cargos revisadas de los Manuales de Funciones se identifican como competencias comunes las siguientes:** Aprendizaje continuo, Orientación a resultados, Orientación al usuario y al ciudadano, Compromiso con la organización, Trabajo en equipo, Adaptación al cambio. Las competencias específicas por nivel documentadas son: | Sección VI de fichas revisadas |
| | • **Directivo (7)**: Visión estratégica, Liderazgo efectivo, Planeación, Toma de decisiones, Gestión del desarrollo de las personas, Pensamiento sistémico, Resolución de conflictos | Fichas nivel Directivo |
| | • **Profesional (4)**: Aporte técnico-profesional, Comunicación efectiva, Gestión de procedimientos, Instrumentación de decisiones | Fichas nivel Profesional |
| | • **Técnico (3)**: Confiabilidad técnica, Disciplina, Responsabilidad | Fichas nivel Técnico |
| | • **Asistencial (3)**: Manejo de la información, Relaciones interpersonales, Colaboración | Fichas nivel Asistencial |
| **RF-04** | **Nivel Asesor**: En la revisión realizada de los dos Manuales de Funciones proporcionados no se identificó una ficha de un cargo del Nivel Asesor que permita determinar sus competencias comportamentales específicas. Por tanto, ese requisito no puede establecerse con base en la documentación proporcionada. | Ausencia de ficha de cargo Nivel Asesor en manuales revisados |
| **RF-05** | El sistema debe conservar las **funciones esenciales** de cada cargo tal como aparecen en la sección "Descripción de Funciones Esenciales" del Manual de Funciones. | Cada ficha - sección "III. DESCRIPCIÓN DE FUNCIONES ESENCIALES" |
| **RF-06** | Las **competencias funcionales** deben estar sustentadas en el contenido funcional del empleo (funciones esenciales). | Manuales: "se definirán a partir del contenido funcional del empleo" |
| **RF-07** | La documentación **no define** el procedimiento para convertir funciones esenciales en elementos evaluables (pesos, agrupación, items, escalas, evidencias). | "Ese nivel de detalle no está definido en la documentación proporcionada" |

---

## 🔧 PROPUESTAS DE DISEÑO (Pendientes de Aprobación del Municipio)

*Lo siguiente **NO** está en los manuales. Son propuestas técnicas para implementar los requisitos arriba. Requieren revisión y aprobación del Municipio antes de incorporarse como requisitos funcionales del sistema, ya que no se encuentran definidas en los Manuales de Funciones proporcionados.*

| Área | Propuesta de Diseño | Estado |
|------|---------------------|--------|
| **Modelo de datos** | Tablas: `competencias_comportamentales`, `cargo_competencias_comportamentales`, campo `funciones_esenciales` en `cargos_manual`, tabla futura `cargo_competencias_funcionales_config` | ⏳ Pendiente |
| **Asignación automática** | Al crear/editar cargo, el sistema asigna competencias según su nivel (6 comunes + específicas del nivel) | ⏳ Pendiente |
| **Recálculo por cambio de nivel** | Si se cambia el nivel del cargo, se actualizan sus competencias comportamentales automáticamente | ⏳ Pendiente |
| **UI: Carga de manuales** | Pantalla admin para ingresar/importar fichas: nivel, funciones esenciales, competencias sección VI | ⏳ Pendiente |
| **UI: Ver competencias por cargo** | Pantalla que muestra cargo → 6 comunes + específicas según nivel + funciones esenciales completas | ⏳ Pendiente |
| **UI: Evaluador** | Al evaluar, ve competencias asignadas + funciones esenciales (solo lectura) | ⏳ Pendiente |
| **Nivel Asesor** | Definir el comportamiento del sistema para los cargos del Nivel Asesor una vez el Municipio suministre la documentación correspondiente o apruebe la regla funcional aplicable. | ⏳ Pendiente |
| **Estructura futura funcionales** | Tabla/configuración para cuando Municipio emita regla: pesos, agrupación, items, evidencias | ⏳ Pendiente |

---

## 📌 CIERRE DE LA FASE DE ANÁLISIS FUNCIONAL

Con base exclusivamente en los dos Manuales de Funciones revisados, se concluyó el levantamiento y la especificación de los requisitos funcionales respaldados por la documentación disponible.

Como resultado de esta fase:

- Se identificaron los requisitos funcionales documentados y su trazabilidad con los Manuales de Funciones.
- Se identificaron las brechas de información presentes en la documentación revisada.
- Se separaron explícitamente las propuestas de diseño de los requisitos documentados.
- Se estableció que las propuestas de diseño requieren revisión y aprobación del Municipio antes de incorporarse como requisitos funcionales del sistema.

En consecuencia, el documento obtenido constituye un insumo para la revisión y validación por parte del Municipio, quien deberá:

1. Confirmar los requisitos documentados.
2. Aprobar, ajustar o rechazar las propuestas de diseño.
3. Definir los aspectos que no están contemplados en los Manuales de Funciones, incluyendo el tratamiento del Nivel Asesor y la metodología para convertir las funciones esenciales en competencias funcionales evaluables.

Con base en la documentación revisada, la fase de análisis funcional se considera concluida y el proceso queda preparado para la etapa de validación por parte del Municipio.

---

**Documento generado como resultado de la fase de análisis funcional basada exclusivamente en los dos Manuales de Funciones proporcionados. No constituye aprobación oficial del Municipio, sino insumo para su revisión y validación.**