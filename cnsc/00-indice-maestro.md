# 📚 Índice Maestro — Documentación CNSC para EDL Carepa

> **Propósito:** Este directorio contiene la documentación consolidada y navegable derivada de las **26 transcripciones oficiales** de los videos de la Comisión Nacional del Servicio Civil (CNSC) sobre el Sistema Tipo de Evaluación del Desempeño Laboral (EDL), conforme al Acuerdo 617 de 2018.
>
> **Fuente primaria:** `/data/data/com.termux/files/home/Projects/TI-Carepa/transcripciones_cnsc/` (26 archivos `.md` con transcripciones literales de los videos del canal oficial CNSC).
>
> **Audiencia:** Equipo de desarrollo, jefe de personal y evaluadores de la Alcaldía de Carepa que necesiten entender la norma, los flujos y los campos requeridos por el aplicativo CNSC.

---

## 🗺️ Mapa del directorio

| # | Archivo | Tema | Subtemas cubiertos |
|---|---|---|---|
| 00 | `00-indice-maestro.md` | **Estás aquí** | Mapa, navegación, fuentes |
| 01 | `01-generalidades-y-marco-normativo.md` | Qué es la EDL, Acuerdo 617/2018, sistema tipo | Definición, fases, principios, marco legal |
| 02 | `02-roles-y-actores.md` | Roles del sistema | Jefe de Personal, Evaluador, Evaluado, Cargador, Comisión Evaluadora, otros actores |
| 03 | `03-periodos-y-etapas.md` | Períodos, etapas y fases | Período anual, períodos de prueba, etapas (concertación, seguimiento, parcial, calificación) |
| 04 | `04-flujo-concertacion.md` | Flujo completo de concertación | Bilateralidad, plazos 15+3, tipos (concertada / fijada), estructura del compromiso |
| 05 | `05-flujo-evaluacion-y-calificacion.md` | Flujo de evaluación y calificación | Tipos de evaluación, escalas funcionales/comportamentales, pesos 85/15, escala final |
| 06 | `06-evaluacion-parcial-eventual.md` | Evaluaciones parciales eventuales | Causales (cambio de evaluador, separación temporal, traslado, periodo de prueba) |
| 07 | `07-evaluacion-definitiva.md` | Evaluación definitiva anual y extraordinaria | Consolidación, factores de acceso a Sobresaliente (95-99% / 100%), recursos |
| 08 | `08-evidencias.md` | Módulo de evidencias | Diseño descriptivo (sin archivos), campos, búsqueda |
| 09 | `09-compromisos-de-mejoramiento.md` | Módulo de compromisos de mejoramiento | Motivos, aspectos a corregir, acciones |
| 10 | `10-modulo-evaluado.md` | Módulo del evaluado | Proponer, aceptar/rechazar, ver concertaciones |
| 11 | `11-modulo-jefe-personal.md` | Módulo del jefe de personal | Períodos, dependencias, metas, usuarios, ausentismos, reportes, cargue masivo |
| 12 | `12-cambio-administracion.md` | Lineamientos cambio de administración | Caso particular del Acuerdo 617 aplicable a transiciones de gobierno |
| 13 | `13-trazabilidad-con-proyecto.md` | **Cruce con el proyecto real** | Mapeo transcripción → gap de `FASE3_GAPS.md` → archivo concreto a tocar (backend/frontend/database) |
| 14 | `14-futuro-del-proyecto.md` | **Hoja de ruta** | Roadmap derivado 100% de las transcripciones + tabla maestra de archivos a tocar |
| 15 | `15-enlaces-y-referencias.md` | Enlaces y referencias oficiales | Videos YouTube, marco normativo colombiano, glosario |
| — | `AUDITORIA-DIRIGIDA-2026-06-22.md` | **Auditoría del estado real** | Inspección de los 22 archivos prioritarios. Estado de cada gap/brecha con evidencia. |
| — | `CHANGELOG.md` | Bitácora de cambios de esta carpeta | Qué se consolidó, qué no se hizo y por qué |

---

## 🎯 Cómo usar este directorio

1. **Si querés entender el negocio de la EDL:** empezá por `01`, después `02` y `03`.
2. **Si vas a codificar un módulo específico (ej. Concertación):** andá directo a `04`.
3. **Si vas a tomar una decisión técnica y necesitás saber qué dijo la CNSC:** usá `13` como índice cruzado — te dice exactamente en qué transcripción se fundamenta cada brecha ya detectada en el proyecto.
4. **Si querés saber hacia dónde va el proyecto:** mirá `14`.

---

## 📂 Sobre las transcripciones fuente y el proyecto destino

**Fuente primaria:** `/data/data/com.termux/files/home/Projects/TI-Carepa/transcripciones_cnsc/` (26 archivos `.md` con transcripciones literales de los videos del canal oficial CNSC).

**Proyecto destino:** `/data/data/com.termux/files/home/Projects/TI-Carepa/edl-carepa/` — aplicación full-stack (PHP 8.2 + React 19 + MySQL) para la Alcaldía de Carepa.

**Documento de auditoría previo verificable:** `../FASE3_GAPS.md` (raíz del proyecto).

Las 26 transcripciones se agrupan naturalmente en:

- **Videos institucionales CNSC** (5): `#EnterateCNSC EDL`, `Generalidades EDL`, `Fases de EDL`, `Qué es la EDL`, `Usos escalas y consecuencias de EDL`, `Evaluación Parcial Semestral`, `EDL Evaluación definitiva`, `Nuevo Sistema Tipo EDL` (×2), `Jornada de capacitación 2018`, `Lineamientos cambio de administración`.
- **Tutoriales aplicativo EDL APP** (16): tutorial por rol (Jefe de Personal, Evaluador), tutoriales por módulo (Concertación, Evaluar, Dependencias, Metas, Creación de Usuarios, Propuesta por Evaluado, Evidencias y Mejoramiento, Realización de Evaluaciones, Aprobación Comisión Evaluadora, Primera Evaluación Parcial Semestral), y tutorial general del aplicativo.
- **Documento de enlaces** (1): índice de YouTube.
- **Documento 5 pasos** (1): resumen ejecutivo.

---

## ⚠️ Nota importante

Esta carpeta es **documentación derivada**, no reemplaza el Acuerdo 617 de 2018 ni el Anexo Técnico publicado por la CNSC. Para decisiones formales, remitirse siempre a las fuentes oficiales (https://www.cnsc.gov.co).