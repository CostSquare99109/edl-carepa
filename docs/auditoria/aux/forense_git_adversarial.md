# Informe forense git/adversarial — niveles `asistencial` residuales en `cargos_manual`

> Auditoría adversarial de solo lectura. Rama `audit/manual-funciones-marzo-2025`, HEAD `c42d357` + docs (`29dd808`).
> Fecha de análisis: 2026-08-25. Método: arqueología git del seed, lectura de migraciones M001–M005,
> cotejo ficha-a-ficha contra `modelo_planta_global.md` / `modelo_planta_temporal.md`, conciliación
> agregada manual-vs-BD por dependencia, y verificación SELECT directa contra la BD local (solo lectura).

---

## Resumen de una línea

Los 24 empleos (23 filas) con `nivel='asistencial'` en códigos 367/02, 367/04 y 314/02 (planta global)
**nacieron asistencial en la carga original del 2026-07-17**, nunca fueron tocados por ninguna migración,
y **contradicen de forma UNÁNIME tanto la tabla agregada del manual (N=3) como las 23 fichas
individuales correspondientes (todas «Nivel: Técnico»)**. No existe soporte documental para
«Asistencial» en ningún nivel. La corrección M006 es segura; lo que NO resuelve es otra capa de
problemas (duplicados fantasma, plazas ausentes y `num_cargos` sin respaldo).

---

## FRENTE D — Git y migraciones

### D1. Qué corrigió exactamente M003 (`f351cec`, archivo idéntico en working tree)

`database/migrations/M003_p0_1_p0_3_p1_7_datos_maestros.sql` (37 líneas, introducido en `f351cec`
"docs: implementar backlog aprobado manuales marzo 2025", 2026-08-24):

**P0-1 — nivel, exactamente 6 UPDATE con guardas triples/quádruples:**

| id | Guardas (`AND`) | Comentario en el archivo |
|----|-----------------|--------------------------|
| 33 | `codigo='312' AND grado='03' AND nivel='asistencial'` | FICHA 36: Inspector de Tránsito |
| 34 | `codigo='340' AND grado='02' AND nivel='asistencial'` | planta §1.1 Agente Tránsito |
| 36 | `codigo='340' AND grado='01' AND nivel='asistencial'` | — |
| 22 | `codigo='367' AND grado='03' AND nivel='asistencial'` | Gestión Documental |
| 92 | `codigo='314' AND grado='01' AND nivel='asistencial' AND planta='temporal'` | Monitores |
| 95 | `codigo='340' AND grado='01' AND nivel='asistencial' AND planta='temporal'` | Agente Tránsito |

Además: 7 denominaciones truncadas (P0-3, ids 3,16,17,43,44,47,64 con guarda de texto previo),
Gerente PDET id 96 (naturaleza+dependencia→17) e Inspector de Policía id 108 (dependencia→15).

El propio encabezado declara la política de guardas: *«si algo no coincide, afecta 0 filas (señal de alerta)»*.
**Verificado por diff `5871949..f351cec`: los únicos cambios de `nivel` en todo el commit son esos 6 ids.**
Ningún otro id cambió de nivel en ningún momento posterior (diff completo contra `HEAD` idéntico).

**Guardas silenciosas:** sí, habrían fallado a 0 filas si el pre-estado no fuera el esperado, y **no hay
ninguna aserción automatizada**: la sección final «Verificación de datos BLOQUEADOS» son SELECT
**comentados** que solo revisan distribución de **grados** de 219/367 («esperado: 4 en 04, 1 en 03,
33 en 02») y existencia de DEP-013. **Ninguna verificación agrupa por `nivel`** — el hueco exacto
que dejó pasar los 24 residuales.

### D2. Origen del `asistencial`: lote único del 2026-07-17 (pre-fases)

- El primer commit git donde `cargos_manual` tiene datos es **`6ce5255`** ("Fase 1 catálogos",
  2026-07-17): el dump ya trae **las 23 filas objetivo como `asistencial`**, dentro del lote inicial.
- En `5871949`/`b601b7a`/`f351cec`/`HEAD` el INSERT de `cargos_manual` tiene exactamente
  **dos lotes por `creado_en`**:
  - **Lote A — 2026-07-17: 124 filas (ids 1–131)**. Aquí están los 24 empleos objetivo
    (23 filas: ids 4,8,9,20,21,23,35,37,56,57,58,59,60,65,69,74,75,76,77,78,79,86,87),
    todos `nivel='asistencial'` **desde su creación**. También aquí están los técnicos
    367/02 de Salud (ids 100,101,102 y sus duplicados 112,113,114) — **ya nacieron `tecnico`**;
    nadie los cambió jamás.
  - **Lote B — 2026-07-18: 18 filas (ids 134–151)**, insertadas por
    `2026_07_18_fase4_cargos_faltantes_manual_funciones_v2.sql`: ids 134–146 como
    `tecnico` explícito (Calidad, Archivo, Correspondencia, Contabilidad, Presupuesto,
    Catastro, Ordenamiento Rural, Matrículas, Historias Clínicas, Autorizaciones,
    Inventarios, Planos, Protocolo) y 147–151 como `asistencial` (407 Auxiliares, correcto).
- **Conclusión**: no hubo ningún cambio de nivel sobre 100–146 ni sobre los 23 residuales;
  la dicotomía técnico/asistencial **es un artefacto de la carga inicial** (lote A), probablemente
  un default o inferencia errónea al importar, no una decisión documental.
- Evidencia adicional de importación accidentada en fase4 v1
  (`2026_07_18_fase4_cargos_faltantes_manual_funciones.sql`):
  - `DELETE FROM cargos_manual WHERE id IN (45,46,80,93,94)` — **DELETE duro** (viola la convención
    soft-delete del repo). Explica los huecos de AUTO_INCREMENT del seed.
  - Header de fase4 **v2**: «ESTADO ACTUAL BD (tras limpieza corruptos): Global: 88 cargos (de 125);
    Temporal: 2 (de 42)» y lista de sobras: «+1 Gerente PDET … −1 Profesional Univ G1 [sobra 1],
    −1 Inspector Policía [sobra 1], −1 Técnico-Agente Tránsito G1 [sobra 1]». **La BD venía
    arrastrando sustituciones desde antes de las fases.**

### D3. M001–M005: ninguna otra toca `nivel`

| Migración | ¿Toca `cargos_manual.nivel`? |
|-----------|------------------------------|
| M001 (objetos faltantes) | No (tablas competencias/conocimientos/vista) |
| M002 (JWT/parámetro)     | No |
| **M003 (datos maestros)** | **Sí — solo ella, 6 ids** |
| M004 (competencias)      | No (catalogo + matriz por nivel) |
| M005 (normalización)     | No (nombres dependencias/competencias, desactiva asignaciones a cargo eliminado) |

Las fases tempranas (`2026_07_17_fase1…` crea catálogos incl. `niveles_jerarquicos`;
fase4 v1/v2 insertan cargos con su nivel explícito) tampoco ejecutan UPDATE de nivel.

**Verificación post-migración insuficiente (causa raíz de la persistencia):** los SELECT comentados
de M003 validan grados pero no niveles. Además, la auditoría §7.2 detectó solo 6 combinaciones
(~20 empleos) porque su comparación por combos contó el desfase de 367/02 como problema de
**grado** (§7.3: «367 TA grado 2: Manual 36 vs BD 33») y nunca audita `nivel` fila a fila.
El script externo `comparar_cargos.py` (línea 115) contiene el chequeo débil confirmado:

```python
nivel_ok = all(any(NIVEL.get(r['nivel'], ...) == NIVEL.get(dd['nivel_db'], ...) for dd in drows) for r in mrows)
```

`any()` sobre todas las filas BD del combo: si **al menos una** fila del grupo es técnica
(p. ej. las 18 técnicas de 367/02), el grupo completo «pasa», aunque otras 17 filas sean asistenciales.
**Así se escabulleron los grupos mixtos.**

### D4. La documentación fue incompleta

- **§7.2** «Nivel jerárquico incorrecto en BD» lista SOLO 6 combos ≈ 20 empleos
  (312/03×1, 340/01×7, 340/02×1, 367/03×1, temporal 314/01×8, temporal 340/01×2).
  **Omite completamente global/367/02 (18 empleos), global/367/04 (3) y global/314/02 (3).**
- **§25 backlog**: «P0-1 Corregir nivel jerárquico en ~20 empleos». El «~20» era el total declarado.
- **§61.1** registra la implementación como completa: «P0-1 … 6 filas (ids 22,33,34,36,92,95)
  … (~20 empleos) ✅».
- Total real afectado: **≈ 44 empleos** (20 corregidos + 24 residuales). La documentación
  describió correctamente LO QUE HIZO M003, pero presentó el alcance de P0-1 como cerrado
  cuando estaba parcial (~55 %).

---

## FRENTE E — Intento adversarial de romper «los 24 deben ser técnico»

### E1. ¿Qué tendría que ser falso para NO corregir? → Las fichas tendrían que decir Asistencial. No lo dicen.

Mapeo ficha-a-ficha de los 23 ids residuales contra `docs/auditoria/aux/modelo_planta_global.md`
(extracción literal de las filas `| Nivel |`, `| Grado |`, `| No. de Cargos |`):

| id(s) BD | Ficha | Denominación | Nivel ficha | Grado | Cargos ficha | BD num |
|---|---|---|---|---|---|---|
| 8 | 11 | Téc. Adm. – Víctimas | **Técnico** | 02 | 01 | 1 ✓ |
| 9 | 12 | Téc. Adm. – Participación | **Técnico** | 02 | 01 | 1 ✓ |
| 21 | 24 | Téc. Adm. – Servicios y Apoyo | **Técnico** | 02 | **02** | 1 ⚠ |
| 23 | 26 | Téc. Adm. – Gestión Trasparente | **Técnico** | 02 | 01 | 1 ✓ |
| 35 | 41 | Téc. Adm. – Gestión de Trámites | **Técnico** | 02 | **02** | 1 ⚠ |
| 56 | 65 | Téc. Adm. – Riesgo de Desastres | **Técnico** | 02 | 01 | 1 ✓ |
| 57 | 68 | Téc. Adm. – Ordenamiento Territorial | **Técnico** | 02 | 01 | 1 ✓ |
| 58 | 69 | Téc. Adm. – SISBEN | **Técnico** | 02 | 01 | 1 ✓ |
| 59 | 70 | Téc. Adm. – Estadísticas | **Técnico** | 02 | 01 | 1 ✓ |
| 60 | 71 | Téc. Adm. – Control Urbanístico | **Técnico** | 02 | 01 | 1 ✓ |
| 65 | 76 | Téc. Adm. – Control OOPPMM | **Técnico** | 02 | 01 | 1 ✓ |
| 75 | 87 | Téc. Adm. – Seguridad Alimentaria | **Técnico** | 02 | 01 | 1 ✓ |
| 76 | 88 | Téc. Adm. – Gestión de la Cultura-Biblioteca | **Técnico** | 02 | **01** | **2 ⚠⚠** |
| 77 | 89 | Téc. Adm. – Cultura | **Técnico** | 02 | 01 | 1 ✓ |
| 79 | 91 | Téc. Adm. – SIMAT | **Técnico** | 02 | 01 | 1 ✓ |
| 86 | 98 | Téc. Adm. – Programas Sociales | **Técnico** | 02 | **08** | 1 ⚠⚠ |
| 87 | 99 | Téc. Adm. – Prog. Sociales SIF Salud | **Técnico** | 02 | 01 | 1 ✓ |
| 74 | 86 | Téc. Adm. – Gestión Educativa y Cultural | **Técnico** | 04 | 01 | 1 ✓ |
| 78 | 90 | Téc. Adm. – Prog. Educación Superior | **Técnico** | 04 | 01 | 1 ✓ |
| 20 | 23 | Téc. Adm. – Almacén | **Técnico** | 04 | 01 | 1 ✓ |
| 4 | 05 | Téc. Op. – Conductor | **Técnico** | 02 | 01 | 1 ✓ |
| 37 | 40 | Téc. Op. – Supervisión y Control | **Técnico** | 02 | 01 | 1 ✓ |
| 69 | 81 | Téc. Op. – Asistente Técnico | **Técnico** | 02 | **05** | 1 ⚠⚠ |

**Resultado: 23/23 fichas dicen «Técnico»; 0 dicen «Asistencial».** Y la tabla agregada
(modelo §1, transcripción íntegra) es aún más tajante:

```
| 4  | TECNICO ADMINISTRATIVO | 3 | 367 | 4 |
| 1  | TECNICO ADMINISTRATIVO | 3 | 367 | 3 |
| 33 | TECNICO ADMINISTRATIVO | 3 | 367 | 2 |
| 8  | TECNICO OPERATIVO      | 3 | 314 | 2 |
```

Columna **N=3 = Técnico** para TODAS las plazas 367 y 314/02 (§4 del informe principal:
«Directivo N=0 … Técnico N=3, Asistencial N=4»). **El manual NO se autocontradice en `nivel`;
la BD contradice al manual en ambas fuentes (agregada + fichas). M006 directa NO es prematura.**

Nota adversarial honesta: lo que SÍ se autocontradice el manual es `num_cargos`/grado en algunos
puntos (ver E2/E4/E5), pero eso es ortogonal al `nivel`.

### E2. id 76 «Gestión de la Cultura», `num_cargos=2` → NO respaldado por su ficha

FICHA 88 dice **No. de Cargos = 01**. La segunda plaza de id 76 carece de respaldo individual.
Atenuante numérico: la discriminada por dependencia asigna a Educación y Cultura «6 TÉCNICOS
ADMINISTRATIVOS 367/02», y dep-13 en BD suma 6 empleos 367/02 **precisamente gracias** al 2 de id 76
(75,76×2,77,79 + Matrículas id141). Es decir: el «2» parece un **relleno para cuadrar el subtotal**,
no un dato de ficha. Con fichas 86 y 90 siendo 367/**04** (fuera del subtotal /02 de la discriminada),
el subtotal manual de Educación es internamente sospechoso. **Conclusión: nivel correcto a corregir;
`num_cargos=2` requiere validación aparte (candidato a valer 1, con Matrículas id141 fantasma).**

### E3. ¿Son 100–146 los incorrectos y los asistenciales los correctos? → No, pero 100–146 tienen SU propio problema

- Los asistenciales (4–99) tienen respaldo doble: ficha individual Técnico + agregada N=3.
- Del «lote técnico»:
  - **ids 100–108 y duplicados 112–120** (Vacunación, Salud Ambiental, RIPS, Riego y Drenaje,
    Ganadería, Piscicultura, Suelos, Obras Civiles, Inspector de Policía, + Epidemiología 99/111,
    Sec. Salud 97/98, Gerente PDET 96/121): estas denominaciones **NO existen en NINGUNA de las
    dos fuentes** — ni en las 100 fichas del manual global ni en las 21 del temporal (buscado
    por nombre en ambos modelos). Son **filas fantasma/duplicadas del lote A**, creadas
    presumiblemente para llenar cupos agregados (Salud «9 TÉCNICOS ADMINISTRATIVOS 367/02»,
    Agricultura «5 TÉCNICO OPERATIVO 314/02»). Su `nivel='tecnico'` es coherente con el código,
    pero varias FILAS enteras son inventadas.
  - **ids 134–146 (fase4 v2)**: Archivo, Correspondencia, Protocolo, Matrículas, Historias
    Clínicas, Autorizaciones, Inventarios, Planos, Ordenamiento Rural, Calidad → sin ficha;
    Contabilidad (53), Presupuesto (52), Catastro (66/67) → con ficha Técnico, pero pueden
    duplicar cupos ya cubiertos.
  - Ojo con el solape de nombres: «Contabilidad» e «Impuestos» también son fichas del manual
    **TEMPORAL** (fichas 18 y 19) — la BD global las usa para cupos globales; LGBTIQ+ (5) y
    SAC (6) del temporal **ni siquiera están en la BD temporal**.
- **Conclusión**: la dirección de la corrección es correcta (los asistenciales son los errados),
  pero M006 debe quedar explícitamente **scoped a `nivel`**: no legitima las filas fantasma
  100–121 ni los excesos 134–146, que requieren limpieza separada (bloqueada hoy por P0-4/P1-4).

### E4. ¿Hay cargos del manual AUSENTES en BD que un UPDATE no resolvería? → SÍ

Conciliación discriminada manual-vs-BD por dependencia (empleos, planta global), tras reubicar
mentalmente los 8 secretarios que la BD dejó todos en dep-9 (colocación, no existencia):

| Dependencia | Manual | BD | Delta | Explicación principal |
|---|---:|---:|---:|---|
| Despacho | 6 | 9* | +3 | PDET duplicado (96+121), Protocolo (146) sobrante; **falta Escolta (FICHA 04)**: Conductor num=1 vs combo 314/02=2 |
| Gobierno | 10 | 8* | −2 | falta PU Atención a Víctimas (FICHA 09) y 1 auxiliar (combo pide 4) |
| Hacienda | 17 | 16* | −1 | falta 1 PU g1 (FICHA 47 Coordinador de Impuestos) y 1 TA 367/02 (solo Contabilidad+Presupuesto vs 3) |
| Planeación OTV | 16 | 16* | 0 | tras mover PDET (M003); TA/02 = 5 con ficha + Catastro/Ordenamiento Rural sin ficha |
| Educación | 9 | 12* | +3 | 367/04 ×2 extra (respaldadas por fichas 86/90 pero ausentes de la discriminada — contradicción INTERNA del manual), Biblioteca (151) extra |
| Salud | 17 | 18* | +1 | Vacunación/SalAmb/RIPS duplicados; **faltan 2 Auxiliares grado 0** (§7.3 ya lo documentó) y PU están en grado 1 en vez de 2 |
| Tránsito | 16 | 11* | −5 | faltan 2 TA/02 (FICHA 38 Gestión Documental-Tránsito completa + 1 plaza de FICHA 41) y 2 auxiliares |
| General | 20 | 20* | 0 | Archivo/Correspondencia (135/136) empujan TA/02 a 4 vs 3 |
| Agricultura | 9 | 13* | +4 | Asistente Técnico num=1 vs ficha=5; el hueco lo rellenaron Riego/Ganadería/Piscicultura/Suelos **por duplicado** (103–106 y 115–118) |
| Infraestructura | 5 | 7* | +2 | Obras Civiles duplicado (107/119), Planos (145) extra |

(\*) cifras crudas por dep antes de redistribuir secretarios; ver script en apéndice.
En planta **temporal** además: Monitores duplicado (id 92 num=8 + id 127 num=8 = 16 empleos
vs 8 del manual), id 89 fantasma (367/01), y **sin** LGBTIQ+, SAC, Contabilidad-T, Impuestos-T.

**Sí hay cargos ausentes** (Escolta, FICHA 09, FICHA 38, auxiliares Gobierno/Tránsito,
Aux grado-0 Salud, 4 fichas temporales). Un UPDATE de nivel no los crea.

### E5. ¿125/167 enmascara sustituciones? → SÍ

- Planta global: manual 125 empleos vs **133 en BD** (+8 neto). El neto oculta
  **≥14 empleos sobrantes fantasma** (PDET, Epidemiología ×2, Vacunación ×2, SalAmb ×2, RIPS ×2,
  Obras Civiles ×2, Sec-Salud ×2, Inspector ×2, Protocolo, Calidad, Inventarios, Matrículas,
  Historias Clínicas, Autorizaciones, Planos, Correspondencia, Archivo, Biblioteca, Admisiones…)
  y **≥10 déficits** (E4). No es «un cargo de más y uno de menos»: es relleno por duplicación
  + vacíos reales, en direcciones distintas por dependencia.
- Planta temporal: manual 42 vs **51–57 según conteo** (Monitores ×2 explica +8).
- El par «total 167» era correcto como meta normativa, pero como métrica de carga fue usado
  en fase4 («Fase 4 completa - 167 cargos cargados») sin validar composición: **el total cuadró
  por relleno, no por correspondencia**.

---

## Veredicto adversarial

1. **M006 directa (UPDATE `nivel='tecnico'` de los 23 ids/24 empleos residuales) es SEGURA y
   documentalmente obligatoria.** No existe ni una sola fuente —agregada (N=3), 23 fichas
   individuales (Técnico), ni jerarquía Decreto 785/2005 aplicable— que sostenga «Asistencial».
   El riesgo inverso («la BD sigue las fichas y la agregada está equivocada») quedó descartado:
   fichas y agregada coinciden entre sí; solo la BD difiere.
2. **PERO M006 es necesaria y NO suficiente.** Debe ir con:
   - Guardas por id + `(codigo,grado,nivel='asistencial',planta='global')`, igual que M003.
   - **Verificación POST real y ejecutada** (no comentada), incluyendo la consulta que M003
     no tuvo: `SELECT COUNT(*) FROM cargos_manual WHERE eliminado_en IS NULL AND planta='global'
     AND codigo IN ('312','340','303','367','314') AND nivel='asistencial'` → esperado **0**
     (los 407 sí son asistenciales legítimos).
   - Impacto positivo directo en P1-3: estos 24 empleos hoy reciben el set comportamental
     de Asistencial (Colaboración/Manejo info/Relaciones) en lugar del de Técnico
     (Confiabilidad/Disciplina/Responsabilidad) en `/competencias/por-nivel`.
3. **Riesgos residuales que M006 NO toca** (recomendación: backlog separado, no mezclar):
   - Filas fantasma/duplicadas 96–121 y excesos 134–146 (requiere P0-4/P1-4 y criterio de negocio).
   - `num_cargos` sin respaldo: id 76 (=2 vs ficha 1), id 86 (=1 vs ficha 8), id 69 (=1 vs ficha 5),
     id 35 y 21 (=1 vs ficha 2).
   - Cargos ausentes (Escolta/FICHA 04, FICHA 09, FICHA 38, auxiliares, grado-0 de Salud, temporales).
   - Colocación: 8 secretarios acumulados en dep-9.
4. **Corrección al proceso de auditoría**: cualquier chequeo de nivel futuro debe ser
   fila-a-fila (`GROUP BY id` con expectativa explícita) o `COUNT(*) WHERE nivel<>esperado`,
   jamás `all(any(...))` sobre grupos mixtos; y las verificaciones post-migración deben
   ejecutarse con aserción, no quedar como comentarios.

## Apéndice — trazas clave

- `git show f351cec -- database/migrations/M003…` → 6 UPDATE nivel con guardas; verificación final comentada solo por grado.
- Diff `5871949..f351cec` sobre `full_dump.sql` → únicos cambios de nivel: ids 22,33,34,36,92,95.
- `git show 6ce5255:database/full_dump.sql` → primer dump con datos de `cargos_manual`; los 23 ids ya eran `asistencial`.
- Lotes por `creado_en` en el seed: 2026-07-17 ×124 (ids 1–131), 2026-07-18 ×18 (ids 134–151, fase4 v2).
- `database/migrations/2026_07_18_fase4…v1.sql` → `DELETE FROM cargos_manual WHERE id IN (45,46,80,93,94)` (hard delete).
- `comparar_cargos.py:115` → `nivel_ok = all(any(...))` (chequeo débil que pasó grupos mixtos).
- BD local (SELECT de verificación, hoy): 367/02 asistencial = 17 filas/18 empleos; 367/04 = 3/3; 314/02 = 3/3. Total 23 filas/24 empleos.
