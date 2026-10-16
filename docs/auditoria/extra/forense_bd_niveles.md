# Auditoría forense BD — `cargos_manual`: niveles, duplicados e integridad

Fecha: 2026-08-25 · Alcance: solo lectura (`SELECT`/`SHOW`/`DESCRIBE`) sobre `edl_carepa`.
Estado base verificado: `cargos_manual` = 142 filas totales, **127 vigentes** (eliminado_en IS NULL), 15 soft-deleted; `SUM(num_cargos)` vigentes = **167 empleos** ✓ (consistente con el contexto del proyecto).

---

## 1. Los "3 duplicados exactos" vigentes

Consulta base:

```sql
SELECT planta, codigo, grado, denominacion, COUNT(*) n
FROM cargos_manual WHERE eliminado_en IS NULL
GROUP BY planta, codigo, grado, denominacion HAVING n>1;
```

Resultado: exactamente 3 grupos, todos `global / 407 / 02`.

### Grupo A — `Auxiliar Administrativo - Asistente` (guion ASCII U+002D) ×5

| id | dependencia_id | creado_en |
|----|----|----|
| 10 | 15 | 2026-07-17 15:14:10 |
| 11 | 10 | 2026-07-17 15:14:10 |
| 24 | 14 | 2026-07-17 15:14:10 |
| 62 | 17 | 2026-07-17 15:14:11 |
| 88 | 19 | 2026-07-17 15:14:11 |

### Grupo B — `Auxiliar Administrativo – Asistente` (en-dash U+2013) ×4

ids **29** (dep 14), **49** (dep 21), **66** (dep 16), **70** (dep 12) — creado_en idéntico al lote A.

Evidencia de que son la MISMA denominación con distinto guion (HEX):

```
id 10 → ...766F20 2D 20417369...        (" – " ASCII: 0x2D)
id 29 → ...766F20 E2 80 93 20417369...  (" – " UTF-8: E28093 = U+2013)
```

### Grupo C — `Auxiliar Administrativo – Mensajero y` ×2

| id | dependencia_id | creado_en |
|----|----|----|
| 28 | 14 | 2026-07-17 15:14:10 |
| 51 | 21 | 2026-07-17 15:14:11 |

### Veredicto Q1

- **No son errores de seed duplicados entre sí**: cada fila tiene `num_cargos=1` y `dependencia_id` distinta → plazas legítimas de una misma denominación en dependencias distintas.
- **Sí es un defecto de calidad de datos**: los grupos A y B son textualmente la misma denominación partida en dos ortografías por inconsistencia de guion (9 plazas reales de "Asistente"). Rompe agrupaciones por texto y explica por qué el conteo "exacto" arroja 3 grupos y no 2.
- El grupo C además tiene nombre **truncado** ("Mensajero y…"), ver §7.3.

---

## 2. Compatibilidad denominación ↔ código

Patrones probados (solo vigentes):

```sql
-- Auxiliar→407, Profesional Universitario→219, Técnico→(314,340,367), Secretar*→020
SELECT ... WHERE denominacion LIKE '...' AND codigo <> '...'
```

Resultados:

| Patrón | Coincidencias | Veredicto |
|---|---|---|
| `Auxiliar%` con codigo≠407 | id **30**, codigo **470**, grado 01, asistencial, "Auxiliar Servicios Generales – Aseo" | **Falso positivo del heurístico**: 470 es el código asistencial N=4 correcto según el manual. La regla "Auxiliar⇒407" es demasiado estrecha. |
| `%Profesional Universitario%` con codigo≠219 | ninguna | OK |
| `Técnico%` con codigo NOT IN (314,340,367) | id **33**, codigo **312**, grado 03, tecnico, "Técnico Operativo – Inspector de Transito" | Única fila 312 vigente. Código **fuera de la lista esperada** (314/340/367). Ver §7.2. |
| `Secretar%` (incluye "Secretaria") con codigo≠020 | id **5**, codigo **438**, grado 02, asistencial, "Secretaria ejecutiva – Asistente" | Consistente con el manual (438=N=4 asistencial); observación menor de nomenclatura, no violación. |

Conclusión: **no hay incompatibilidad denominación↔código real** más allá del caso límite 312; las dos coincidencias son explicables.

---

## 3. Las 15 filas soft-deleted

```sql
SELECT id,codigo,grado,nivel,denominacion,eliminado_en FROM cargos_manual WHERE eliminado_en IS NOT NULL;
```

| id | codigo | grado | nivel | denominacion | eliminado_en |
|----|--------|-------|-------|--------------|--------------|
| 89 | 367 | 01 | asistencial | Técnico Administrativo – Programas | 2026-07-17 23:58:30 |
| 90 | 407 | 00 | asistencial | Auxiliar Administrativo – Programas | 2026-07-17 23:58:30 |
| 91 | 219 | 00 | profesional | Profesional Universitario – Abogado Comisaria de… | 2026-07-17 23:58:30 |
| 97 | 020 | 02 | directivo | Secretario de Despacho – Salud | 2026-07-18 00:02:16 |
| 111 | 219 | 01 | profesional | Profesional Universitario – Epidemiología | 2026-07-17 23:59:14 |
| 112 | 367 | 02 | tecnico | Técnico Administrativo – Vacunación | 2026-07-17 23:59:14 |
| 113 | 367 | 02 | tecnico | Técnico Administrativo – Salud Ambiental | 2026-07-17 23:59:14 |
| 114 | 367 | 02 | tecnico | Técnico Administrativo – RIPS | 2026-07-17 23:59:14 |
| 115 | 314 | 02 | tecnico | Técnico Operativo – Riego y Drenaje | 2026-07-17 23:59:14 |
| 116 | 314 | 02 | tecnico | Técnico Operativo – Ganadería | 2026-07-17 23:59:14 |
| 118 | 314 | 02 | tecnico | Técnico Operativo – Suelos | 2026-07-17 23:59:14 |
| 119 | 219 | 01 | profesional | Profesional Universitario – Obras Civiles | 2026-07-17 23:59:14 |
| 120 | 303 | 04 | tecnico | Inspector de Policía 3a-6a Categoría | 2026-07-18 00:02:16 |
| 121 | 039 | 01 | directivo | Gerente PDET | 2026-07-17 23:59:14 |
| 127 | 314 | 01 | tecnico | Técnico Operativo – Monitores Escolares | 2026-07-17 23:58:30 |

### ¿Referenciadas por usuario_cargo_manual?

```sql
SELECT cm.id, COUNT(u.id) total, SUM(u.vigente=1) vig FROM cargos_manual cm
LEFT JOIN usuario_cargo_manual u ON u.cargo_manual_id=cm.id
WHERE cm.eliminado_en IS NOT NULL GROUP BY cm.id;
```

Solo **id 91** tiene 1 asignación y está `vigente=0` (ROBINSON TABORDA, c.c. 1040379118). Las otras 14 tienen cero referencias. **Ninguna soft-deleted tiene asignación vigente.**

### ¿Alguna debería estar vigente según el manual?

No. Para cada código/grado borrado existe cobertura vigente equivalente (p. ej. 219/01 tiene 21 vigentes; 367/02 técnico tiene 15; 314/01 tiene vigente id 92 "Monitores" que reemplaza al id 127 "Monitores Escolares"; 303 tiene vigente id 108 con el mismo cargo y grafía corregida "3a a 6a"). Patrón típico de **pasada de deduplicación/reimportación nocturna** (ver §6): se borraron duplicados o versiones con grafía defectuosa. Ninguna de las 15 es "nivel mixto" vigente hoy (la 89 era asistencial en 367/01, pero no hay 367/01 asistencial vigente).

---

## 4. Impacto referencial de cambiar nivel en las 23 claves mixtas

Ids auditados: 8,9,21,23,35,56,57,58,59,60,65,75,76,77,79,86,87 (367/02), 20,74,78 (367/04), 4,37,69 (314/02).

```sql
SELECT cm.id, cm.codigo,
 (SELECT COUNT(*) FROM usuario_cargo_manual u WHERE u.cargo_manual_id=cm.id) ucm_total,
 (SELECT COUNT(*) FROM usuario_cargo_manual u WHERE u.cargo_manual_id=cm.id AND u.vigente=1) ucm_vig,
 (SELECT COUNT(*) FROM cargos_manual_detalle d WHERE d.cargo_manual_id=cm.id) det,
 (SELECT COUNT(*) FROM cargos_manual_requisitos r WHERE r.cargo_manual_id=cm.id) req
FROM cargos_manual cm WHERE cm.id IN (...);
```

Resumen:

- **usuario_cargo_manual**: solo **id 4** (314/02, "Técnico Operativo - Conductor", dep 9) tiene 1 asignación y es VIGENTE (HARILSON MOSQUERA, c.c. 1001032834, desde 2026-07-17). Los otros 22 ids: 0 asignaciones. Total referencias activas del hallazgo: **1**.
- **cargos_manual_detalle**: las 23 tienen contenido EAV (5–7 secciones cada una).
- **cargos_manual_requisitos**: 0 filas para todos (la tabla está vacía globalmente, ver §7.5).
- FKs que referencian `cargos_manual` (information_schema.KEY_COLUMN_USAGE): `cargos_manual_detalle`, `cargos_manual_requisitos`, `usuario_cargo_manual`, `cargos_manual_conocimientos` — todas apuntan a `id`, **ninguna a `nivel`**. `nivel` es un simple `varchar(20)` indexado.

**Conclusión**: corregir `nivel='tecnico'` en esas 23 filas NO rompe ninguna FK ni borra referencias; único efecto lógico relevante: (a) la única asignación vigente del id 4 pasaría a resolverse como cargo técnico, y (b) cambiaría el mapeo de competencias vía `competencias_por_nivel` (ver §5), lo cual es precisamente el objetivo de la corrección (alinear BD con el manual).

---

## 5. EAV (`cargos_manual_detalle`) de los 23 ids vs vecinos técnicos

### Los 23 ids marcados como "asistencial"

```sql
SELECT cargo_manual_id, LEFT(contenido,260) FROM cargos_manual_detalle
WHERE seccion='competencias' AND cargo_manual_id IN (8,21,60,20,78,4);
```

Todas devuelven el mismo JSON (truncado):

```json
{"comunes": ["Aprendizaje continúo Orientación a resultados Orientación al usuario
y al ciudadano Compromiso con la organización Trabajo en equipo Adaptación al cambio"],
 "nivel": ["Confiabilidad Técnica Disciplina Responsabilidad"]}
```

El conjunto de nivel citado es **CONFI/DISC/RESP = conjunto TÉCNICO**. Comparar con `competencias_por_nivel`:

| nivel_codigo | conjunto |
|---|---|
| tecnico | CONFI, DISC, RESP |
| asistencial | MAN_INF, REL_INT, COLAB |
| profesional | APR_TEC, COM_EFEC, GEST_PRO, INS_DEC |
| directivo / asesor | VIS_EST, LIDER, PLANE, TOM_DEC, GEST_DES_PER, PEN_SIS, RES_CON |

Además el EAV de requisitos de estudio del id 8 exige *"Título de formación técnica…"* → perfil TÉCNICO.

**Veredicto**: el CONTENIDO del manual de los 23 cargos es íntegramente técnico; solo la columna `nivel` quedó mal etiquetada como 'asistencial'. Corregirla alinea tres fuentes a la vez (manual PDF, EAV, `competencias_por_nivel`). Nota menor: id 60 usa "Aprendizaje continuo" (sin tilde) y omite "Compromiso con la organización" — variante de grafía dentro del mismo lote.

### Vecinos técnicos (vigentes, ids ~96–146)

**Hallazgo mayor**: `cargos_manual_detalle` solo cubre ids **1–95** (564 filas, 90 cargos). Los ids ≥96 —incluidos TODOS los técnicos vigentes del rango 100–146— **no tienen ninguna sección EAV** (ni funciones, ni competencias, ni requisitos):

```sql
SELECT MIN(cargo_manual_id), MAX(cargo_manual_id), COUNT(DISTINCT cargo_manual_id) FROM cargos_manual_detalle;
-- 1 .. 95, 90 cargos
SELECT CASE WHEN id<=95 THEN '1-95' ELSE '96+' END rango, eliminado_en IS NULL vig,
       COUNT(*), SUM(d.cargo_manual_id IS NOT NULL) con_detalle
FROM cargos_manual cm LEFT JOIN cargos_manual_detalle d ON d.cargo_manual_id=cm.id
GROUP BY rango, vig;
-- 1-95 vigentes: 543 filas, 543 con detalle | 96+ vigentes: 40 filas, 0 con detalle
```

Es decir: **no se puede comparar EAV con los vecinos porque los vecinos no tienen manual cargado**. Esto es en sí otra inconsistencia (§7.5).

---

## 6. Cronología de importación (¿dos lotes?)

```sql
SELECT DATE_FORMAT(creado_en,'%Y-%m-%d %H:%i') minuto, COUNT(*) n, SUM(eliminado_en IS NULL) vig
FROM cargos_manual GROUP BY minuto ORDER BY minuto;

minuto               n   vig
2026-07-17 15:14    90    87
2026-07-17 23:53    14    13
2026-07-17 23:54     9     0
2026-07-17 23:56    11     9
2026-07-18 00:07    18    18
```

Para 314/367 específicamente:

```sql
SELECT codigo, nivel, MIN(creado_en), MAX(creado_en), COUNT(*) ...
GROUP BY codigo, nivel;

314 asistencial  creado 15:14:10–15:14:11  (3 filas)
367 asistencial  creado 15:14:10–15:14:11  (20 filas)
314/367 tecnico  creado 15:14 (solo 2: ids 22,92) y luego 23:53–00:07 (resto)
```

**Conclusión cronológica**: las 23 filas "asistencial" provienen TODAS del lote inicial de **2026-07-17 15:14** (el mismo lote que trajo los guiones mezclados y nombres truncados). La planta técnica correcta llegó en las pasadas nocturnas de esa misma noche (23:53–00:07, junto con las deduplicaciones de §3). Es decir: el lote 1 importó mal el nivel de esos cargos, el lote nocturno re-importó los técnicos sin eliminar/corregir los residuos asistenciales → origen exacto de la MIXTEZ. Además, 16 filas fueron tocadas en bloque el **2026-08-24 19:11:02** (ninguna de las 23 entre ellas), y `competencias_por_nivel` se pobló a las 19:13:30 del mismo día.

---

## 7. Otras inconsistencias encontradas

### 7.1 Grados '00' fuera del patrón 01–04 (11 filas vigentes)

Todos en `planta='temporal'` (lote 00:07): `219/00` ×2 (profesional: ids 122 "Gestión Social", 129 "Psicología Comunitaria") y `407/00` ×5 (asistencial: ids 123,125,126,128,131). Parece convención deliberada del lote temporal ("grado no definido"), pero conviene confirmarla contra el acto administrativo; rompe validaciones `grado IN ('01'..'04')`.

### 7.2 Códigos presentes en BD ausentes de la lista esperada del manual

- **202** "Comisario de Familia" (id 7, 02, profesional, dep 15).
- **303** "Inspector de Policía 3a a 6a Categoría" (id 108, 04, tecnico, dep 15).
- **312** "Técnico Operativo – Inspector de Transito" (id 33, 03, tecnico, dep 20).

Si la tabla agregada del manual solo contempla 005/009/020/039/091/115/202?/219/303?/312?/314/340/367/407/438/470/477, estos 3 códigos quedan sin clasificación N; verificar contra el Decreto 159/2024 antes de decidir si son legítimos.

### 7.3 Denominaciones truncadas (14 vigentes, todas del lote 15:14)

Terminan en preposición/conjunción/guion colgante — corte por salto de línea o coma en el PDF fuente:

```
14  Secretario(a) de Despacho – General y de        (dep 9)
18  Profesional Universitario – Procesos y          (dep 14)
23  Técnico Administrativo – Gestión Trasparente y  (dep 14)  [además "Trasparente" typo]
25  Auxiliar Administrativo -                       (dep 14)  ¡solo el prefijo!
28  Auxiliar Administrativo – Mensajero y           (dep 14)
32  Secretario de Despacho – Transito y             (dep 9)
50  Auxiliar Administrativo – Impuestos y           (dep 21)
51  Auxiliar Administrativo – Mensajero y           (dep 21)
54  Profesional universitario - Banco de            (dep 17)  [minúscula irregular]
56  Técnico Administrativo – Gestión de             (dep 17)
68  Profesional Universitario – Programas y         (dep 12)
71  Secretario(a) de Despacho – Educación y         (dep 9)
78  Técnico Administrativo – Programas de           (dep 13)
81  Profesional Universitario - Promoción y         (dep 19)
```

La dependencia 14 concentra 5 de 14. Grafías menores adicionales: "Victimas"/"Transito" sin tilde (ids 8, 12, 33), espacios irregulares alrededor del guion ("Universitario– Infraestructura", id 64; "–Seguridad", id 17), punto final (id 43).

### 7.4 Tablas hijas vacías

- `cargos_manual_requisitos`: **0 filas** para los 142 cargos.
- `cargos_manual_conocimientos`: **0 filas**.

Los requisitos/knowledge del manual viven solo dentro del EAV (`requisitos_estudio`, `conocimientos`). Si alguna pantalla o API consulta esas tablas, devolverá vacío.

### 7.5 Planta temporal con naturaleza inconsistente

ids **92** (314/01 Monitores, num_cargos=8) y **95** (340/01 Agente de Tránsito, num_cargos=2): `planta='temporal'` pero `naturaleza='carrera_administrativa'`; las demás filas temporales (122–131) sí usan `naturaleza='temporal'`. Ambos fueron actualizados el 2026-08-24 19:11.

### 7.6 Sin problemas detectados

- Ningún `dependencia_id` huérfano (LEFT JOIN contra `dependencias` = 0 nulos).
- Todos los `codigo` cumplen `^[0-9]{3}$`.
- `SUM(num_cargos)=167` ✓. `num_cargos>1` en 15 filas con patrón plausible (Agentes de Tránsito ×7, Monitores ×8, Auxiliares 407/00 ×2..6, Secretarios de Despacho ×2) — coherente con plazas múltiples; nada anómalo per se.
- Múltiples filas mismo codigo+grado+DEPENDENCIA (p. ej. 367/02 dep 17 ×7) corresponden a denominaciones distintas (funciones diferentes) → legítimo.

---

## 8. Conclusiones ejecutivas

1. La MIXTEZ de niveles de las 3 claves (23 filas) es un **residuo del lote de importación inicial (17-jul 15:14)**: su EAV y requisitos exigen perfil técnico (conjunto CONFI/DISC/RESP + título técnico), por lo que corregir `nivel='tecnico'` es seguro (sin FK sobre `nivel`, 1 sola asignación vigente afectada: HARILSON MOSQUERA vía id 4) y alinea DB↔manual↔`competencias_por_nivel`.
2. Los "3 duplicados" son **plazas legítimas por dependencia**; el artefacto real es la doble grafía del guion (ASCII vs U+2013) y nombres truncados del lote 1.
3. Deuda adicional: 40 cargos vigentes del lote 2 (ids ≥96) **sin manual/EAV cargado**, 2 tablas hijas vacías, 14 denominaciones truncadas, grados '00' temporales sin validar, y 3 códigos (202/303/312) fuera de la tabla agregada esperada.
