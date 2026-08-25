# Investigación forense — Niveles jerárquicos inconsistentes en `cargos_manual`

**Fecha**: 2026-08-25 · **Rama**: `audit/manual-funciones-marzo-2025` · **Disparador**: verificación de la tabla agregada (screenshot usuario) que reveló niveles mixtos no cubiertos por P0-1.
**Método**: 3 subagentes (BD forense, documental, git/adversarial) + verificación independiente de cada afirmación numérica por el agente principal. Sin modificaciones de datos.

---

## 1. Veredicto ejecutivo

**AMARILLO.** Los 24 empleos (23 filas) con `nivel='asistencial'` en los códigos 367 y 314 (planta global) están **confirmados como incorrectos con evidencia triple** (tabla agregada N=3 + fichas individuales "Técnico" + el propio EAV del cargo que trae el conjunto comportamental técnico). Corregirlos es **necesario y seguro**. PERO la investigación demostró que:

1. El hallazgo original ("~20 empleos", luego "24") estaba **incompleto en su momento** por un defecto del script auditor (`all(any(...))` en `comparar_cargos.py:115`) — ya corregido conceptualmente en esta investigación.
2. Existen **errores relacionados adicionales** que M006-nivel no resuelve: `num_cargos=2` ilegítimo (id 76), filas del manual ausentes en BD ("Gestión de Tramites" ×2, y posiblemente más), EAV sin cargar para 40 cargos vigentes (ids ≥96), denominaciones fantasma/duplicadas en el lote técnico (parcialmente substantiado, requiere auditoría propia), 3 duplicados por variante de guion, 14 denominaciones truncadas.
3. Por tanto: **M006-nivel debe crearse** (verde para ese alcance), pero **no debe presentarse como corrección completa del catálogo** — los hallazgos adyacentes van a backlog separado con sus propias aprobaciones.

## 2. Estado real de los 24 registros

23 filas / **24 empleos** (id 76 tiene `num_cargos=2`). Distribución exacta:

| Clave | asistencial (ids) | filas | empleos | técnico correcto (ids) |
|---|---|---|---|---|
| 367/02 | 8,9,21,23,35,56,57,58,59,60,65,75,76(×2),77,79,86,87 | 17 | 18 | 100,101,102,135-146 (15) |
| 367/04 | 20,74,78 | 3 | 3 | 134 |
| 314/02 | 4,37,69 | 3 | 3 | 103(×2),104,105,106 (5) |
| **Total** | | **23** | **24** | 21 filas / 26 empleos correctos |

## 3. Verificación de los IDs (colisiones aparentes)

**No hay colisiones ni duplicados de ID.** El error fue de transcripción del agente principal en el mensaje al usuario: listé los IDs sin la columna `codigo`, mezclando grupos. Verificación con `codigo` explícito:
- **ID 37** = `314/02` — "Técnico Operativo – Supervisión y Control" (no es 367/02).
- **ID 78** = `367/04` — "Técnico Administrativo – Programas de…" (no es 367/02).
- 367/02 asistencial son exactamente 17 ids (incluye **77**, que omití, y **sin** 37/78).
- Lección registrada: toda lista de IDs debe incluir la clave completa (planta+código+grado).

## 4. Todos los grupos con inconsistencias de nivel

Consulta de grupos mixtos (`HAVING COUNT(DISTINCT nivel)>1`) sobre 127 filas vigentes: **únicamente** `314/02`, `367/02`, `367/04` (global). Ninguna clave temporal es mixta. Ningún grupo con nivel NULL. Matriz completa esperado-vs-real: las 22 claves globales y 5 temporales restantes tienen un único nivel, coincidente con el N del manual.

## 5. Auditoría multidimensional (más allá de 125=125)

| Dimensión | Resultado |
|---|---|
| Cardinalidad | global 125 empleos ✓ · temporal 42 ✓ · total 167 ✓ (vigentes) |
| Identidad (código+grado) | 23 claves global + 5 temporal, todas presentes en el manual ✓ |
| Clasificación (nivel) | ❌ 3 claves mixtas (24 empleos) — el hallazgo |
| Código | 0 nulos/vacíos ✓ |
| Grado | 0 nulos; `00` en temporal = refleja el manual (V-08) ✓ |
| Denominación | 3 duplicados por variante de guion (`-` vs `–` en 407/02 "Asistente"; "Mensajero y" truncado ×2) ⚠️ · 14 truncadas ⚠️ |
| Consistencia documental | Agregada ✓ · Discriminada ✓ (grados, salvo §34) · Fichas ✓ nivel · **EAV ✓ (cita conjunto técnico)** |
| Integridad referencial | `nivel` no es FK; 0 huérfanos; solo id 4 tiene 1 asignación vigente |

## 6. Causa raíz

**Doble defecto encadenado**:
1. **Seed del 17-jul (commit `6ce5255`, lote 15:14)**: insertó masivamente `nivel='asistencial'` para los códigos 367/314 (y hasta 312/340), contradiciendo fichas y tablas. Esa misma noche (23:53-00:07) se cargó una planta técnica parcial (lote 18-jul, ids 134-146 ya correctos + parches fase4) **sin corregir los residuos** → estado híbrido.
2. **Auditoría (Fase D) con chequeo débil** que dio el visto bueno a los grupos mixtos → P0-1 solo arregló los 6 grupos de una sola pieza.

## 7. Por qué P0-1 no detectó todo / 8. Defecto exacto del auditor

`comparar_cargos.py:115`:

```python
nivel_ok = all(any(NIVEL.get(r['nivel'], ...) == NIVEL.get(dd['nivel_db'], ...) for dd in drows) for r in mrows)
```

- **`any()`**: con UNA sola fila correcta en el grupo (p. ej. el técnico id 134 en 367/04), `nivel_ok=True` aunque las otras 3 fueran asistencial → **falso negativo**.
- **`drows[0]['nivel_db']`** en el mensaje: reportaba solo la primera fila → diagnóstico engañoso.
- **Grupos omitidos por este defecto**: exactamente los 3 mixtos (367/02, 367/04, 314/02) — 24 empleos. No se identifican otros falsos negativos: re-ejecutando con la lógica robusta (abajo) sobre la BD actual, solo esos 3 grupos fallan.
- **Falsos positivos que podía producir**: un grupo 100 % incorrecto con `mcant==dcant` y denominación/dependencia coincidentes habría pasado igual (sin fila correcta que lo "salve", `any()`=False sí lo habría marcado — el defecto específico era el grupo mixto).
- **Auditor robusto (diseño)**: por cada clave, `set(niveles_actuales) == {nivel_esperado}` — falla si hay CUALQUIER nivel distinto, mezcla, o vacío. Implementado como consulta canónica:

```sql
-- Debe devolver 0 filas (cada fila = violación)
SELECT cm.planta, cm.codigo, cm.grado, cm.nivel, SUM(cm.num_cargos) empleos
FROM cargos_manual cm
JOIN (  -- nivel esperado por código según manuales (agregada §1)
  SELECT 'global' planta, '005' codigo 'directivo' nivel UNION ALL SELECT 'global','020','directivo'
  UNION ALL SELECT 'global','009','directivo' UNION ALL SELECT 'global','039','directivo'
  UNION ALL SELECT 'global','091','directivo' UNION ALL SELECT 'global','115','asesor'
  UNION ALL SELECT 'global','202','profesional' UNION ALL SELECT 'global','219','profesional'
  UNION ALL SELECT 'global','303','tecnico' UNION ALL SELECT 'global','312','tecnico'
  UNION ALL SELECT 'global','314','tecnico' UNION ALL SELECT 'global','340','tecnico'
  UNION ALL SELECT 'global','367','tecnico' UNION ALL SELECT 'global','407','asistencial'
  UNION ALL SELECT 'global','438','asistencial' UNION ALL SELECT 'global','470','asistencial'
  UNION ALL SELECT 'global','477','asistencial'
  UNION ALL SELECT 'temporal','219','profesional' UNION ALL SELECT 'temporal','314','tecnico'
  UNION ALL SELECT 'temporal','340','tecnico' UNION ALL SELECT 'temporal','367','tecnico'
  UNION ALL SELECT 'temporal','407','asistencial'
) e ON e.planta=cm.planta AND e.codigo=cm.codigo
WHERE cm.eliminado_en IS NULL AND cm.nivel <> e.nivel
GROUP BY cm.planta, cm.codigo, cm.grado, cm.nivel;
```

## 9. Riesgo de más errores (inventario del subagente BD, verificado por muestreo)

| # | Hallazgo | Clase | ¿M006-nivel lo resuelve? |
|---|---|---|---|
| 1 | 24 empleos con nivel asistencial | Datos P1 | Sí (es su objeto) |
| 2 | id 76 `num_cargos=2` vs FICHA 88 «No. de Cargos: 01» | Datos P2 | No |
| 3 | Filas del manual ausentes en BD: "TA – Gestión de Tramites" (FICHA 41, 2 cargos) y "AA – Gestión de Tramites" (FICHA 43); candidatas adicionales bajo revisión (Escolta/FICHA 04, etc.) | Datos P2 | No (requiere INSERTs validados) |
| 4 | EAV (`cargos_manual_detalle`) solo cubre ids 1-95: **40 vigentes ≥96 sin ficha cargada** (incluye los técnicos 100-146) | Datos P2 | No |
| 5 | Denominaciones "fantasma" en el lote técnico (Riego y Drenaje, Ganadería, Piscicultura, Suelos, Vacunación, RIPS, Salud Ambiental…): verificación propia muestra que **algunas SÍ aparecen en el manual** (Riego 2 menciones, Suelos 7, RIPS 1, Catastro 12) y otras no (Ganadería 0, Piscicultura 0, Vacunación 0) → **auditoría propia requerida**, el agente adversarial sobregeneralizó | Datos P2 | No |
| 6 | 3 duplicados por guion (`-`/`–`) en 407/02 + "Mensajero y" truncado | Datos P3 | No |
| 7 | 14 denominaciones truncadas (ya en backlog P0-3 cerrado parcialmente) | Datos P3 | No |
| 8 | Temporal 92/95 `naturaleza='carrera_administrativa'` | §34-adyacente (V-08) | No |

## 10-11. Contraste documental y contradicciones

- **El manual NO se autocontradice en nivel para 314/340/367**: las tres capas (agregada §1, discriminada §1.1, 33 fichas) dicen Técnico. Verificado ficha a ficha: **0/24 fichas afectadas dicen Asistencial**.
- La autocontradicción documental real es la de **grados 219/367** (agregada vs discriminada) — §34/V-02/V-03, sin relación con el nivel.
- El EAV de los afectados cita el conjunto técnico (Confiabilidad Técnica/Disciplina/Responsabilidad) y exige título técnico → corregir `nivel` **alinea** columna↔EAV↔`competencias_por_nivel`↔manual.

## 12. Impacto en reglas de negocio

Con `nivel='asistencial'`, estos 24 empleos recibirían (cuando se consulte la matriz) el conjunto asistencial (Manejo de la información/Relaciones interpersonales/Colaboración) en lugar del técnico (Confiabilidad/Disciplina/Responsabilidad), y su EAV/requisitos (título técnico) contradirían la clasificación. Corregir alinea todo.

## 13. Recomendación

**Modificar primero el auditor, luego M006** (estrategia en 3 pasos):
1. Incorporar la prueba canónica expected-vs-actual (§8) como `tests/test_niveles_manual.py` (debe FALLAR hoy con 3 grupos y PASAR tras M006).
2. M006 con IDs cerrados (los 23), guardas triples (id + codigo + grado + nivel actual), transacción, postcondición `COUNT asistencial en 303/312/314/340/367 global = 0`, rollback documentado.
3. Los hallazgos 2-8 del §9 van a backlog separado (no en M006).

## 14. Diseño de M006 (propuesto, NO ejecutado)

```sql
-- M006_p0_1_residual_niveles.sql
-- Precondición: las 23 filas existen con nivel='asistencial' (guardas por id+codigo+grado+nivel)
UPDATE cargos_manual SET nivel='tecnico'
WHERE id IN (8,9,21,23,35,56,57,58,59,60,65,75,76,77,79,86,87) AND codigo='367' AND grado='02' AND nivel='asistencial' AND planta='global' AND eliminado_en IS NULL;
UPDATE cargos_manual SET nivel='tecnico'
WHERE id IN (20,74,78) AND codigo='367' AND grado='04' AND nivel='asistencial' AND planta='global' AND eliminado_en IS NULL;
UPDATE cargos_manual SET nivel='tecnico'
WHERE id IN (4,37,69) AND codigo='314' AND grado='02' AND nivel='asistencial' AND planta='global' AND eliminado_en IS NULL;
-- Postcondición obligatoria: SELECT COUNT(*) FROM cargos_manual WHERE planta='global' AND codigo IN ('303','312','314','340','367') AND nivel='asistencial' AND eliminado_en IS NULL;  → 0
-- Rollback: UPDATE ... SET nivel='asistencial' WHERE id IN (los 23) AND nivel='tecnico';
```

## 15-16. Plan de pruebas y re-regresión
1. `test_niveles_manual.py` (nuevo, canónica §8) → FAIL antes, PASS después.
2. `test_inmutabilidad.py` 13/13 (dev+staging).
3. `run_all.sh` 9/9 · conteos 167/125/42 · 0 huérfanos.
4. Aplicar en staging (servidor :8001) → repetir 1-3 → luego dev.

## 17. Evidencia
- Consultas y resultados: §2, §4, §5, §8 (este documento).
- Subagentes: `aux/forense_bd_niveles.md`, `aux/forense_documental_niveles.md`, `aux/forense_git_adversarial.md` (con las correcciones del agente principal anotadas: "133 empleos" era conteo con soft-deleted — vigentes son 125; "fantasmas sin ninguna fuente" sobregeneralizado — Riego/Suelos/RIPS/Catastro sí aparecen).
- Git: M003 en `f351cec` (6 ids, verificaciones post comentadas y sin chequeo de nivel) · seed original `6ce5255` · defecto del auditor: `comparar_cargos.py:115`.
- Commits involucrados: `20fde35` (auditoría), `f351cec` (P0-1 parcial), `c42d357` (estado actual del código).
