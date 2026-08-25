# REAUDITORÍA PRE-M006 — Niveles de `cargos_manual`

> Fecha: 2026-08-25 · Alcance: corrección del mecanismo auditor + revalidación
> integral + preparación (NO ejecución) de M006.
> Precedido por: forense_*_niveles.md (commit 8702004).

## 0. Veredicto

**🟢 GO PARA M006** — con condiciones de proceso ya satisfechas y documentadas:
auditor corregido y probado, migración generada programáticamente desde la BD,
validada en sandbox (camino feliz + 3 caminos de aborto con rollback), scope
cerrado a `cargos_manual.nivel`, sin riesgo técnico pendiente que la invalide.
La ejecución queda sujeta al GO explícito del responsable (no ejecutada).

## 1. Estado Git

- HEAD al inicio: `8702004` (docs forenses «sin M006»). Working tree limpio salvo `.pids/`.
- Sin triggers ni events en BD (`information_schema`: 0/0).
- Commit de este cambio: `fix(audit)` separado (ver §2).

## 2. Cambios realizados (ninguno toca datos)

| Archivo | Contenido |
|---|---|
| `tests/auditor_cargos.py` | Auditor determinista (librería + CLI `--mysql`/`--desde-archivos`). Reemplaza `all(any(...))` por comparación expected-set vs actual-set. Exit 2 si hay ERROR (CI). |
| `tests/test_auditor_cargos.py` | 12 tests unitarios (casos A-F + regresión escenario real 367/02). |
| `tests/generar_m006.py` | Genera M006 desde consulta canónica sobre BD viva; valida población antes de emitir SQL. IDs jamás escritos a mano. |
| `database/migrations/M006_p0_1_residuo_niveles.sql` | Artefacto PREPARADO, NO EJECUTADO en `edl_carepa`. |
| `database/referencia_normativa_niveles.sql` | Referencia normativa de nivel (28 claves, todas unívocas) derivada del parser de manuales. Comentarios activos solo tras GO. |
| `tests/auditoria_niveles.sql` | Test de regresión SQL robusto (mezcla, NULL, referencia faltante/huérfana). |

## 3–4. Bug exacto y corrección

Defecto (`comparar_cargos.py` prototipo, líneas 115-117): cuantificación
existencial `all(any(...))` en `nivel_ok`, `denom_ok` y `dep_ok`; bastaba UNA
fila correcta para validar grupos mezclados (falso negativo estructural, jamás
detectó los 3 grupos). Además consumía snapshot obsoleto (generado 18:36,
antes de aplicar M003 19:11).

Corrección coherente para las tres dimensiones (misma abstracción
`auditar_grupo()`): **nivel** = igualdad estricta de conjuntos (ERROR);
**cantidad** = igualdad de sumas (ERROR, anotada si clave V-02/V-03/V-04);
**denominación/dependencia** = cobertura esperado⊆actual (WARN/INFO: el
enriquecimiento por ficha es legítimo según V-06 y las reasignaciones según P1-7;
los faltantes exigen revisión humana, no bloquean por sí solos). Grupos vacíos:
`FALTA_EN_BD` (ERROR) y `SIN_RESPALDO_NORMATIVO` (WARN) explícitos.

## 5–6. Tests y resultados

12/12 PASS, incluidos: caso A (mezcla→FAIL, reproducía el bug), B/C homogéneos
PASS, D/E FAIL, F grupos vacíos explícitos, escenario real 17+15 bajo una clave
FAIL, NULL y niveles fuera de catálogo nunca validan.

## 7. Auditoría completa contra BD viva (`--mysql`, exit 2 esperado hoy)

```
RESUMEN grupos ok=5 warn=16 error=7
[ERROR] ('global','314','02') NIVEL_INCORRECTO EXPECTED ['tecnico'] ACTUAL ['asistencial','tecnico']
[ERROR] ('global','367','02') NIVEL_INCORRECTO ídem + CANTIDAD(36v33) [disputa V-03]
[ERROR] ('global','367','04') NIVEL_INCORRECTO ídem + CANTIDAD(1v4)   [disputa V-03]
[ERROR] ('global','219','01') CANTIDAD 15v21 [V-02] · ('global','219','02') CANTIDAD 10v4 [V-02]
[ERROR] ('global','407','00') FALTA_EN_BD [errata V-04] · ('global','407','02') CANTIDAD 23v25 [agregada 25g2]
```
**Únicos grupos con inconsistencia de NIVEL: exactamente los 3 conocidos.**
Los 4 errores restantes son familia GRADO, congelados documentalmente (V-02/V-03/V-04),
ortogonales a M006.

## 8–10. Lista canónica y confirmación

Generada por `tests/generar_m006.py` desde la BD (no copiada de informes):
23 filas / 24 empleos; ids `4,8,9,20,21,23,35,37,56,57,58,59,60,65,69,74,75,76,77,78,79,86,87`;
grupos 367/02=17 filas-18 empleos (id 76 `num_cargos`=2), 367/04=3-3, 314/02=3-3.
Fila muerta id 89 excluida correctamente.

## 11. Grupos limpios

Los verdaderos asistenciales (407/438/470/477) y todo el resto homogéneos y
conformes a manual. Denominaciones enriquecidas respaldadas (V-06).

## 12–13. Validación documental y adversarial

N=3=Técnico (MF:51); agregada+discriminada+fichas 23/23+EAV concordantes;
autocontradicción del manual SOLO en grados (V-02/V-03), bloqueadas por acto
administrativo, ortogonales al nivel. Adversarial: códigos reales sin sufijo
(`/NN` es `grado`); union de listas del diagnóstico original = los mismos 23 ids
(atribución por grupo defectuosa ya corregida aquí).

## 14. Riesgo de recontaminación

- Ningún endpoint API escribe el catálogo (solo GET + asignación a usuarios).
- Importadores históricos (fase1/fase4, `import.php`, `migrate_usuarios.py`) no
  re-escriben estos registros; no hay cron/triggers/events.
- **Único vector real**: recargar `full_dump.sql` antiguo tras M006 reintroduciría
  `asistencial`. Mitigación obligatoria: aplicar M006 → regenerar dump → commitear ambos.
- CI usa BD propia desde el dump; misma regla aplica.

## 15–16. R1 y R2-R7 (separados de M006)

| ID | Hallazgo | Estado | Vía |
|---|---|---|---|
| R1 | 24 desincronizados `usuarios.nivel`≠cargo vinculado: 23 asistencial-vs-cargo33(tecnico), 1 usuario 147 (cargo 4 pasará a tecnico con M006) + hallazgo nuevo: usuario 13 (directivo vs cargo 15 profesional 219/02). Cero concertaciones/evaluaciones activas → sin impacto inmediato | Investigado | **M007 aparte** (derivación desde `usuario_cargo_manual` vigente) |
| R2 | num_cargos vs fichas (76=2 vs ficha 1; 86=1 vs 8; 69=1 vs 5…) | Enumerado | Expediente propio |
| R3 | Filas ausentes/fantasma | Enumerado | Expediente propio |
| R4 | EAV sin cargar ids ≥96 | Enumerado | Expediente propio |
| R5 | Grados 219/367/407 (V-02/V-03/V-04) | Congelado | Acto administrativo |
| R6 | Errata denominación discriminada (Tránsito dice TA código 314) | Documental | Informe al municipio |
| R7 | NUEVO: Secretarios de Despacho (020) concentrados en Despacho del Alcalde (dep 9) excepto Salud; manual asigna cada uno a su Secretaría | Detectado hoy | Investigación propia |

## 17–21. Diseño final M006

Procedimiento transaccional con `SIGNAL SQLSTATE '45000'` + EXIT HANDLER
(`ROLLBACK; RESIGNAL`): precondiciones P1 (23 filas)/P2 (24 empleos)/P3 (nada
fuera de alcance), 23 UPDATEs cerrados por id+codigo+grado+planta+nivel_previo,
postcondiciones V1 (afectadas=23)/V2 (367/314 homogéneo tecnico)/V3-V4 (127
filas/167 empleos). Validado en sandbox aislado `edl_carepa_m006_test`
(copia de solo `cargos_manual`+`dependencias`; `edl_carepa` intacta):

| Prueba | Resultado |
|---|---|
| Camino feliz | EXIT=0; grupos homogéneos; asistencial −24 / tecnico +24; totales intactos |
| Población ≠23 (mutación previa) | SIGNAL P1 + rollback total |
| Guarda obsoleta (id 8 grado alterado en artefacto) | SIGNAL V1 + rollback total (id 8 sigue asistencial) |
| Q1 regresión SQL post-M006 | 0 grupos mixtos |

Plan de staging: 1) backup/mysqldump pre; 2) aplicar M006 en staging; 3)
postcondiciones + `tests/auditor_cargos.py --mysql` (NIVEL_INCORRECTO debe pasar
de 3 a 0; exit seguirá 2 solo por disputas de GRADO congeladas); 4) regenerar
`full_dump.sql`; 5) replicar en producción; 6) abrir expedientes R1(M007) y R2-R7.

Rollback post-COMMIT documentado en el propio artefacto (valores previos
conocidos: `nivel='asistencial'` para los mismos ids).
