# Forense documental — Niveles jerárquicos de los códigos 314 / 340 / 367

> Auditoría documental EDL-Carepa · 2026-08-25
> Pregunta origen: la tabla agregada (§1) dice N=3 para todos los 314/340/367, pero la BD tiene
> empleos de esos códigos con `nivel='asistencial'`. ¿Siguió el seed fichas individuales que dicen
> «Asistencial» (autocontradicción del manual) o erró el seed?

## 0. Fuentes examinadas

| Fuente | Archivo | Uso |
|---|---|---|
| Modelo estructurado global | `docs/auditoria/aux/modelo_planta_global.md` (5.523 líneas) | §1 agregada, §1.1 discriminada, §4 fichas |
| Modelo estructurado temporal | `docs/auditoria/aux/modelo_planta_temporal.md` | §6 fichas |
| Texto crudo global | `/tmp/manual_global.txt` (1.996 líneas) | verificación independiente de cada campo `Nivel:` de ficha |
| BD | `cargos_manual` (MariaDB, vigentes `eliminado_en IS NULL`) | estado a corregir |
| Migraciones | `database/migrations/M003_p0_1_p0_3_p1_7_datos_maestros.sql`, `2026_07_18_fase4_cargos_faltantes_manual_funciones{,_v2}.sql` | trazabilidad del seed y parches previos |

Verificación cruzada: los 100 pares FICHA→Nivel del md coinciden 1:1 con el texto crudo
(35 fichas «Técnico» = 27×367 + 4×314 + 2×340 + 303/312; el conteo por código en crudo es
idéntico). La transcripción es fiel al original.

## 1. Tabla completa — denominación → ficha → nivel en ficha

### 1.1 Filas afectadas en BD (`nivel='asistencial'`, códigos 314/367, planta global, vigentes)

| # | id BD | Denominación (BD, truncada) | Denominación real (ficha) | Ficha | Nivel en ficha | Línea md (§4) | Línea crudo | Grado BD/ficha |
|--:|--:|---|---|---|---|--:|--:|---|
| 1 | 4 | Técnico Operativo - Conductor | ídem | **FICHA 05** | **Técnico** | 450 (Nivel: 415) | 285 | 02/02 |
| 2 | 37 | Técnico Operativo – Supervisión y Control | ídem | **FICHA 40** | **Técnico** | 2135 (2139) | 904 | 02/02 |
| 3 | 69 | Técnico Operativo - Asistente Técnico | ídem | **FICHA 81** | **Técnico** | 4241 (4245) | — | — |
| 4 | 8 | Técnico Administrativo – Victimas | ídem | **FICHA 11** | **Técnico** | 708 (712) | 392 | 02/02 |
| 5 | 9 | Técnico Administrativo – Participación [Ciudadana] | …– Participación Ciudadana | **FICHA 12** | **Técnico** | 754 (758) | 410 | 02/02 |
| 6 | 20 | Técnico Administrativo – Almacén | ídem | **FICHA 23** | **Técnico** | 1322 (1326) | 606 | 04/04 |
| 7 | 21 | Técnico Administrativo – Servicios y Apoyo [Administrativo] | ídem (2 cargos) | **FICHA 24** | **Técnico** | 1367 (1371) | 623 | 02/02 |
| 8 | 22→ya corregida | Técnico Administrativo – Gestión Documental (Sec. General) | ídem | FICHA 25 | Técnico | 1414 (1418) | 641 | 03/03 |
| 9 | 23 | Técnico Administrativo – Gestión Trasparente y [Contratación] | …Trasparente y Contratación | **FICHA 26** | **Técnico** | 1472 (1476) | 658 | 02/02 |
| 10 | 35 | Técnico Administrativo – Gestión [Documental Tránsito] | …Gestión Documental (Tránsito) | **FICHA 38** | **Técnico** | 2043 (2047) | 868 | 02/02 |
| 11 | 56 | Técnico Administrativo – Gestión de [Riesgo de Desastres] | …Gestión de Riesgo de Desastres | **FICHA 65** | **Técnico** | 3428 (3432) | — | 02/02 |
| 12 | 57 | Técnico Administrativo – Ordenamiento [Territorial] | ídem | **FICHA 68** | **Técnico** | 3588 (3592) | — | 02/02 |
| 13 | 58 | Técnico Administrativo - SISBEN | ídem | **FICHA 69** | **Técnico** | 3641 (3645) | — | 02/— |
| 14 | 59 | Técnico Administrativo – Estadísticas | ídem | **FICHA 70** | **Técnico** | 3694 (3698) | — | 02/— |
| 15 | 60 | Técnico Administrativo – Control Urbanístico | ídem | **FICHA 71** | **Técnico** | 3743 (3747) | — | 02/— |
| 16 | 65 | Técnico Administrativo – Control de OOPPMM | ídem | **FICHA 76** | **Técnico** | 3995 (3999) | — | 02/— |
| 17 | 74 | Técnico Administrativo – Gestión [Educativa y Cultural] | ídem | **FICHA 86** | **Técnico** | 4511 (4515) | — | 04/— |
| 18 | 75 | Técnico Administrativo – Seguridad [Alimentaria] | ídem | **FICHA 87** | **Técnico** | 4562 (4566) | — | 02/02 |
| 19 | 76 | Técnico Administrativo – Gestión de la Cultura [- Biblioteca] | …Gestión de la Cultura - Biblioteca | **FICHA 88** | **Técnico** | 4613 (4617) | 1760 | 02/02 |
| 20 | 77 | Técnico Administrativo – Cultura | ídem | **FICHA 89** | **Técnico** | 4660 (4664) | — | 02/— |
| 21 | 78 | Técnico Administrativo – Programas de [Educación Superior] | ídem | **FICHA 90** | **Técnico** | 4705 (4709) | — | 04/— |
| 22 | 79 | Técnico Administrativo – SIMAT | ídem | **FICHA 91** | **Técnico** | 4752 (4756) | — | 02/— |
| 23 | 86 | Técnico Administrativo – Programas [Sociales SIF Salud] | ídem | **FICHA 99** | **Técnico** | 5158 (5162) | — | 02/— |
| 24 | 87 | Técnico Administrativo – Programas Sociales (Salud) | ídem | **FICHA 98** | **Técnico** | 5107 (5111) | — | 02/— |

(«Línea md»: primera = inicio de la ficha `#### FICHA NN`, entre paréntesis = fila `| Nivel |`.)

Nota: existe además 1 fila temporal soft-deleted (id 89, «Técnico Administrativo – Programas»,
temporal FICHA 07, nivel ficha `Técnico`, temporal.md línea 369) — borrada, sin efecto.

### 1.2 Grupo de contraste (BD `nivel='tecnico'`) — la ficha también dice «Técnico»

| Denominación BD | Ficha | Nivel ficha | Línea md | Estado BD |
|---|---|---|---|--:|
| Téc. Adm. – Contabilidad | FICHA 53 (global) · FICHA 18 (temporal) | Técnico · Técnico | 2796 · temp. 696 | tecnico ✓ |
| Téc. Adm. – Presupuesto | FICHA 52 | Técnico | 2745 | tecnico ✓ |
| Téc. Adm. – Catastro | FICHA 66 y FICHA 67 (duplicado real del manual) | Técnico ambas | 3481 / 3534 | tecnico ✓ |
| Téc. Adm. – Gestión Documental | FICHA 25 y FICHA 38 | Técnico ambas | 1418 / 2047 | id 22 tecnico (M003), id 35 asistencial ✗ |
| Téc. Op. – Inspector de Transito | FICHA 36 (código 312, grado 03) | **Técnico** | 1956 (crudo 833) | corregida por M003 (era asistencial) |
| Téc.-Agente de Tránsito | FICHA 37 y FICHA 39 | Técnico ambas | 2000 / 2094 | tecnico (M003) |
| Téc. Op. – Monitores (temporal) | FICHA 14 temporal | Técnico | temp. 582 | tecnico (M003) |
| Téc. Adm. – Impuestos / SAC / LGBTIQ+ / Aseguramiento (temporal) | FICHA 19 / 6 / 5 / 4 temporales | **Técnico todas** | temp. 732 / 343 / 314 / 286 | Impuestos/SAC/LGBTIQ+ sin fila vigente en BD; Aseguramiento insertada por fase4-v2 como tecnico |

Conclusión del contraste: **no hay ninguna diferencia de criterio entre las filas 'tecnico' y
las 'asistencial' de la BD respecto del documento fuente. Todas las fichas dicen lo mismo:
«Técnico».**

## 2. Respuestas a las preguntas

**P1. ¿Cuántas fichas afectadas dicen 'Asistencial' vs 'Técnico'? ¿Coincide la distribución de la BD?**
De las 24 filas afectadas listadas: **24 dicen «Técnico», 0 dicen «Asistencial»** (tampoco
«Asistente»). La hipótesis «el seed siguió el campo Nivel de fichas que decían Asistencial» queda
**REFUTADA**: no existe tal ficha. La distribución BD actual (vigentes): 314 → 3 asistenciales /
4 técnicas; 367 → 20 asistenciales / 19 técnicas (filas); en cargos: 3 + 21 = **24 cargos
asistenciales** vs 26 técnicos. Esa distribución es un artefacto del pipeline de carga, no del manual.

**P2. ¿Se contradicen §1.1 y las fichas entre sí, o solo la agregada vs fichas?**
**Ninguna de las tres fuentes se contradice en el nivel.** §1 agregada (md 30-35: todas las filas
314/340/367 con N=3), §1.1 discriminada (md 54, 62, 71, 78, 85, 90, 96-99, 106-108, 116, 122:
todas NIVEL 3) y las 33 fichas globales + 8 temporales de esos códigos (todas «Técnico») son
consistentes. Únicas anomalías reales del manual (ninguna afecta el nivel):
- §1.1 línea 99: una fila dice «TECNICO ADMINISTRATIVO» pero con **código 314** (que es Técnico
  Operativo) en Tránsito — error de rótulo de denominación, no de nivel.
- FICHA 06 usa «Asistente» (no normativo) para código 438.
- Rótulos de competencias comportamentales inconsistentes con el nivel en algunas fichas de
  AUXILIARES 407 (md 2948, 3014, 3071, 5474-5487).

**P3. ¿Existe ALGUNA ficha 367/314 que diga «Asistencial»?**
**No. Ninguna.** Las 27 fichas 367, las 4 fichas 314 (globales) y las fichas temporales
367/314/340 declaran «Técnico» (ver tablas §1.1/§1.2, columnas «Nivel en ficha»). Los únicos
«Asistencial» del manual son Auxiliares Administrativos (407), Auxiliar Servicios Generales (470),
Celador (477) y la Secretaria Ejecutiva 438 («Asistente»).

**P4. FICHA 88 «Técnico Administrativo – Gestión de la Cultura - Biblioteca»: No. de Cargos.**
La ficha dice **No. de Cargos: 01** (crudo línea 1760; md 4617). Es coherente con §1.1
(Educación = 6 técnicos = 6 fichas × 1 cargo, md 85). La BD tiene esa fila con
**num_cargos=2 (id 76)** → segunda desviación del seed en la misma fila, no respaldada por el
manual. Con ese 2 extra la dependencia suma 7 en BD frente a 6 normativos.

**P5. Ficha 36 «Inspector de Transito» y «Gestión Documental».**
- FICHA 36 (md 1956; crudo 833): Nivel **Técnico**, código **312** g03, 1 cargo. La BD la tuvo
  como 'asistencial' hasta que M003-P0-1 la corrigió (id 33).
- «Técnico Administrativo – Gestión Documental»: FICHA 25 (Sec. General, g03, md 1418) y FICHA 38
  (Tránsito, g02, md 2047): **Técnico ambas**. En BD la primera fue corregida (M003, id 22); la
  segunda sigue 'asistencial' (id 35).

**P6. ¿El manual temporal tiene fichas 314/340/367 con nivel declarado?**
Sí, y **todas dicen «Técnico»**: Monitores 314 g01×8 (temporal.md 582); Agente de Tránsito 340
g01×2 (temporal.md 795); Aseguramiento/LGBTIQ+/SAC/Programas Sociales/Contabilidad/Impuestos 367
(temporal.md 286, 314, 343, 369, 696, 732). Cero asistenciales.

## 3. Causa raíz (trazabilidad del seed)

1. El seed original cargó `cargos_manual` desde un JSON normalizado ya inexistente
   (`/storage/emulated/0/Download/edl-carepa/edl_carepa_normalizado.json`; `database/import.php`
   solo cubre el modelo legacy `cargos`, no `cargos_manual`). Ese pipeline **truncó denominaciones**
   («…Gestión Trasparente y», «…Ordenamiento», «…Programas de») y asignó `nivel='asistencial'`
   masivamente a empleos 312/340/367/314.
2. El propio equipo ya reconoció el error y lo corrigió **parcialmente**:
   `M003_p0_1_p0_3_p1_7_datos_maestros.sql` líneas 6-12 (P0-1) corrige solo 6 filas
   (ids 22, 33, 34, 36, 92, 95) con el comentario *«respaldado por tablas de planta Nivel=3 y
   fichas»*. Las demás quedaron sin corregir.
3. Las filas 367/314 hoy en 'tecnico' provienen de parches posteriores con criterio correcto
   (fase4 v1/v2 insertan Vacunación, Salud Ambiental, RIPS, SAMA, Tesorería, Aseguramiento como
   'tecnico'; ids 134-146 provienen de un parche no versionado en el repo).

## 4. Veredicto e implicaciones para la corrección

**Es un error de seed, no ambigüedad documental tipo §34.** El manual es internamente consistente
en sus tres capas (agregada, discriminada, fichas): los códigos 314/340/367 son nivel **Técnico (N=3)**
sin excepción. No hay margen de interpretación.

Corrección de BD segura y respaldada:
```sql
UPDATE cargos_manual SET nivel='tecnico'
WHERE eliminado_en IS NULL AND nivel='asistencial' AND codigo IN ('314','367'); -- 23 filas (ids 4,8,9,20,21,23,35,56,57,58,59,60,65,69,74,75,76,77,78,79,86,87)
```
Efectos colaterales a revisar en el mismo paquete: (a) `num_cargos` id 76: ficha dice 01, BD tiene 2;
(b) falta la fila del empleo «Técnico Administrativo – Gestión de Tramites» (FICHA 41, 2 cargos,
Tránsito) — no existe en `cargos_manual` vigente; (c) sin filas vigentes para SAC, LGBTIQ+, TA-Impuestos
temporales; (d) propagar a `funcionarios`/legacy si se alimenta de `nivel` propio (el dump muestra
funcionarios 'asistencial' con cargo Inspector de Tránsito).
