# Auditoría de base de datos — EDL Carepa

- Fecha: 2026-08-24
- Alcance: **solo lectura**. Fuente: servidor MySQL/MariaDB local (`edl_carepa`) + `database/full_dump.sql`.
- Verificación de consistencia: el dump contiene 43 `CREATE TABLE` y el servidor 43 tablas → **dump y servidor están sincronizados en estructura**.
- Método: consultas `SELECT` / `information_schema` / `SHOW COLUMNS`. No se ejecutó ninguna operación DML/DDL.

---

## 1. Inventario del esquema

43 tablas. El esquema convive con un **modelo legacy** (prefijo `tbl_*`, `funcionarios`, `responsables`, `ext_dependencias`, sin FKs reales) y el **modelo nuevo** (FKs declaradas, soft-delete `eliminado_en`).

| Tabla | Col. | Propósito inferido | FKs (hija→padre) |
|---|---|---|---|
| `usuarios` | 38 | Funcionarios/login del sistema nuevo | entidad_id→entidades, dependencia_id→dependencias, dependencia_evaluacion_id→dependencias |
| `usuario_rol` | 4 | Asignación multirol (N:M) | usuario_id→usuarios, rol_id→roles |
| `roles` | 7 | Catálogo de roles (Evaluador, Evaluado, Admin CAREPA, Jefe Dependencia, Cargador) | — |
| `permisos` | 8 | Permisos granulares | — |
| `rol_permiso` | 3 | N:M roles-permisos | rol_id→roles, permiso_id→permisos |
| `sesiones` | 8 | Sesiones activas JWT | usuario_id→usuarios |
| `csrf_tokens` | 6 | Tokens CSRF | — |
| `rate_limits` | 6 | Rate limiting por IP | — |
| `recuperaciones` | 6 | Tokens de recuperación de contraseña | usuario_id→usuarios |
| `auditoria` | 10 | Log de auditoría (~2.675 filas) | — |
| `notificaciones` | 8 | Notificaciones in-app | usuario_id→usuarios, evaluacion_id→evaluaciones |
| `parametros` | 7 | Parámetros del sistema (pesos CNSC, umbrales, JWT) | — |
| `entidades` | 11 | Entidades (1 fila: Municipio de Carepa) | — |
| `dependencias` | 9 | Catálogo de dependencias (18) | entidad_id→entidades, jefe_id→usuarios |
| `ext_dependencias` | 3 | Legacy: dependencias de sistema externo (18) | sin FK real (Id_dependencia apunta a sistema externo) |
| `cargos_manual` | 15 | **Catálogo principal de empleos** (planta global/temporal, 142) | dependencia_id→dependencias, +FKs a usuarios/cargos_manual (auto-nombradas "1") |
| `cargos_manual_detalle` | 6 | Secciones del manual funcional (propósito, funciones, requisitos…) | cargo_manual_id→cargos_manual, usuario_id→usuarios, dependencia_id→dependencias |
| `cargos_manual_requisitos` | 8 | Requisitos de estudio/experiencia/NBC | cargo_manual_id→cargos_manual, nbc_id→nucleos_basicos_conocimiento, etc. (**vacía**) |
| `usuario_cargo_manual` | 9 | Vinculación persona↔empleo (188, todos vigente=1) | usuario_id→usuarios, cargo_manual_id→cargos_manual, nbc_id, dependencia_id |
| `competencias` | 4 | Catálogo de competencias comportamentales (14), PK=`codigo` | — |
| `conductas` | 7 | Conductas por competencia (70 = 14×5) | competencia_codigo→competencias(codigo) |
| `nucleos_basicos_conocimiento` | 4 | NBC por área de conocimiento (55) | — |
| `naturalezas_cargo` | 5 | Naturaleza del empleo (6): carrera, LN, LN-GP, LN-R, periodo fijo, temporal | — |
| `niveles_jerarquicos` | 4 | Nivel jerárquico (5): directivo…asistencial | — |
| `periodos` | 17 | Periodos de evaluación (1: 2026-2027) | — |
| `concertaciones` | 17 | Acta de concertación de compromisos (3) | evaluador/evaluado/testigo→usuarios, periodo_id→periodos |
| `evaluaciones` | 32 | Evaluaciones de desempeño (2) | evaluador/evaluado/comision→usuarios, concertacion_id, periodo_id→periodos |
| `metas` | 15 | Metas funcionales (5) | funcionario_id→usuarios, dependencia_id, periodo_id, evaluador_id |
| `compromisos` | 28 | Compromisos funcionales/comportamentales (30) | concertacion_id→concertaciones, meta_id→metas |
| `evidencias` | 19 | Evidencias de cumplimiento (24) | compromiso_id, concertacion_id, periodo_id, registrado_por |
| `compromisos_mejoramiento` | 11 | Compromisos de mejoramiento (**vacía**) | compromiso_id, concertacion_id, registrado_por |
| `mejoramiento_seguimientos` | 7 | Seguimientos de mejoramiento (**vacía**) | compromiso_mejoramiento_id, registrado_por |
| `compromiso_mejoramiento_seguimientos` | 11 | Seguimientos v2 (**vacía**) | compromiso_mejoramiento_id, registrado_por |
| `historial_evaluadores` | 7 | Historial de cambio de evaluador (**vacía**) | solicitud_id, evaluadores→usuarios, concertacion_id |
| `solicitudes_cambio_evaluador` | 13 | Solicitudes de cambio de evaluador (**vacía**) | evaluado/evaluadores→usuarios |
| `ausentismos` | 11 | Ausentismos (licencias, incapacidad) (**vacía**) | funcionario_id→usuarios |
| `movilidades` | 14 | Movilidades/traslados entre dependencias/entidades (**vacía**) | funcionario_id, dep origen/destino, entidad origen/destino |
| `encargos` | 10 | Encargos de cargos (4) | — |
| `cargas_masivas` | 12 | Control de cargues masivos (**vacía**) | usuario_id→usuarios |
| `funcionarios` | 9 | **Legacy**: personas (214) | sin FKs |
| `responsables` | 15 | **Legacy**: vinculación persona-cargo-dependencia (262) | sin FKs (id_* int sueltos) |
| `tbl_cargo` | 4 | **Legacy**: catálogo de cargos genérico (20) | sin FKs (refs enteras a tablas inexistentes) |
| `tbl_detalle_cargo` | 4 | **Legacy**: instancia cargo×dependencia (146) | sin FKs |

Tablas vacías (0 filas): `ausentismos`, `cargas_masivas`, `cargos_manual_requisitos`, `compromisos_mejoramiento`, `compromiso_mejoramiento_seguimientos`, `entidades`(tiene 1), `historial_evaluadores`, `mejoramiento_seguimientos`, `movilidades`, `solicitudes_cambio_evaluador`.

---

## 2. Catálogos normativos (contenido completo)

### 2.1 `naturalezas_cargo` — 6 registros

| codigo | nombre | requiere_periodo | es_carrera |
|---|---|---|---|
| carrera_administrativa | Carrera Administrativa | 0 | 1 |
| libre_nombramiento | Libre Nombramiento | 0 | 0 |
| libre_nombramiento_gerencia_publica | Libre Nombramiento y Gerencia Publica | 0 | 0 |
| libre_nombramiento_remocion | Libre Nombramiento y Remocion | 0 | 0 |
| periodo_fijo | Periodo Fijo | 1 | 0 |
| temporal | Temporal | 0 | 0 |

### 2.2 `niveles_jerarquicos` — 5 registros

| codigo | nombre | orden |
|---|---|---|
| directivo | Directivo | 1 |
| asesor | Asesor | 2 |
| profesional | Profesional | 3 |
| tecnico | Técnico | 4 |
| asistencial | Asistencial | 5 |

### 2.3 `tbl_cargo` (legacy) — 20 registros
Columnas: `id, id_tbl_nivel_cargo (int), id_tbl_naraleza_cargo (int, con typo "naraleza"), descripcion`.
Valores: 1 Alcalde · 2 Gerente · 3 Tecnico Operativo · 4 Tecnico Administrativo · 5 Conductor · 6 Secretario de despacho · 7 Director Financiero · 8 Asesor de prensa · 9 Tesorero general · 10 Comisario de familia · 11 Profesional universitario · 12 Inspector de Policía 3a a 6° Categoría · 13 Inspector de Tránsito y Transporte · 14 Agentes de Transito · 15 Auxiliar Administrativo · **16 Técnico Administrativo** · 17 Auxiliar de Servicios Generales · 18 Celador · 19 Asesor Jurídico · 24 Contratista.

⚠️ `id_tbl_nivel_cargo` usa valores 1–6 y `id_tbl_naraleza_cargo` 1–5 que referencian tablas `tbl_nivel_cargo`/`tbl_naturaleza_cargo` **que no existen en la BD** (sin FK). No es posible resolver si nivel 6 es válido.

### 2.4 `dependencias` — 18 registros (todos vigentes, estado=activa)
Formato: id · codigo · nombre · jefe_id.
6 DEP-001 Comisaria · 7 DEP-002 Comunicaciones · 8 DEP-003 Control Interno · 9 DEP-004 Despacho del Alcalde · 10 DEP-005 Inspección · 11 DEP-006 Oficina de Juridica · 12 DEP-007 Secretaría de Agricultura y Medio Ambiente · 13 DEP-008 Secretaría de Educación · 14 DEP-009 Secretaría General y Servicios Administrativos (jefe_id=13, único con jefe) · 15 DEP-010 Secretaria de Gobierno Y Participación Ciudadana · 16 DEP-011 Secretaría de Infraestructura Física · 17 DEP-012 Secretaría de Planeación, OOPPMM, Vivienda y Ordenamiento Territorial - Proceso Ordenamiento territo… (nombre truncado a 200 chars) · 18 DEP-013 Secretaría de Planeación, Vivienda y Ordenamiento Territorial · 19 DEP-014 Secretaría de Salud y Protección Social · 20 DEP-015 Secretaría de Transito y Transporte · 21 DEP-016 Secreta**r**ia**, de** Hacienda ⚠️ · 22 DEP-017 Sisbén · 23 DEP-018 Tesorería.

⚠️ DEP-012 y DEP-013 son dos versiones de la misma secretaría de Planeación (posible duplicado funcional).

### 2.5 `ext_dependencias` (legacy) — 18 registros
`Id · Descripcion · Id_dependencia`. Mismas 18 dependencias pero con `Id_dependencia` mayormente 0 (sistema externo); solo Inspección(4), Comisaria(4), Sisbén(20), Jurídica(3), Comunicaciones(12), Tesorería(8) tienen valor ≠ 0. Sin FK.

### 2.6 `competencias` — 14 registros (PK=codigo)

| codigo | nombre | decreto |
|---|---|---|
| ADP_CAM | Adaptacion al cambio ⚠️sin tilde | 815/2018 |
| APR_CONT | Aprendizaje continuo | 815/2018 |
| APR_TEC | Aporte tecnico profesional ⚠️sin tilde | 815/2018 |
| CMP_ORG | Compromiso con la organización | 815/2018 |
| COM_EFEC | Comunicación efectiva | 2539/2005 |
| CON_ENT | Conocimiento del entorno | 2539/2005 |
| INICIAT | Iniciativa | 2539/2005 |
| LIDER | Liderazgo | 2539/2005 |
| ORI_RES | Orientacion a resultados ⚠️sin tilde | 815/2018 |
| ORI_USU | Orientacion al usuario y al ciudadano ⚠️sin tilde | 815/2018 |
| PEN_EST | Pensamiento estratégico | 2539/2005 |
| PLANE | Planeación y organización | 2539/2005 |
| TOM_DEC | Toma de decisiones | 2539/2005 |
| TRB_EQP | Trabajo en equipo | 815/2018 |

Nota: las competencias 2539/2005 corresponden al Decreto 1083/2015 art. 2.1.4.2 (comportamentales genéricas) — verificar mapeo normativo; mezcla decretos 815/2018 (funcionales) y 2539/2005.

### 2.7 `conductas` — 70 registros (14 competencias × 5 conductas cada una)
Cada competencia tiene exactamente 5 conductas numeradas por `orden`. Integridad verificada: **0 huérfanos, 0 competencias sin conductas**. Ejemplo (INICIAT): "Propone mejoras y soluciones innovadoras…" / "Actúa de forma proactiva…" / "Anticipa situaciones…" / "Asume nuevos retos…" / "Busca oportunidades de mejora continua…". Todas `activo=1`.

### 2.8 `cargos_manual` — 142 registros (catálogo de empleos)
- Planta **global**: 127 (116 vigentes, 11 eliminados). Planta **temporal**: 15 (11 vigentes, 4 eliminados).
- Columnas: planta, dependencia_id, nivel, codigo, grado, denominacion, num_cargos, naturaleza, jefe_inmediato, proposito_principal, fuente.
- Códigos usados: 005 (Alcalde), 009, 015, 020, 039, 091, 115, 202, 219 (Profesional Universitario, ~30 filas), 303, 312, 314, 340, 367 (Técnico Administrativo, ~40 filas), 407 (Auxiliar Administrativo, ~30 filas), 438, 470, 477.
- Grados: 00 (solo temporal), 01, 02, 03, 04.
- `num_cargos`: casi siempre 1 (excepciones: 36→7 agentes de tránsito, 103→2, 76→2, 6→2).
- Sin nulos/vacíos en codigo/grado/nivel/dependencia_id (0 en los cuatro checks).
- Detalle completo disponible en servidor; muestra de patrones:
  - `1 global 005 03 directivo periodo_fijo Alcalde Municipal`
  - `39 global 009 01 directivo lnr Director Financiero y Contable`
  - `96 global 039 01 directivo periodo_fijo Gerente PDET`
  - `98 global 020 02 directivo lnr Secretario de Despacho – Salud`

### 2.9 `cargos_manual_detalle` — 546 registros
Secciones por empleo (`identificacion, proposito, funciones, contribuciones, conocimientos, competencias, requisitos_estudio, requisitos_experiencia, requisitos`). Promedio ≈ 3.8 secciones/empleo. Contenido longtext.

### 2.10 `cargos_manual_requisitos` — **0 registros** ⚠️
La tabla existe (con FK a NBC) pero nunca fue poblada; los requisitos viven como texto plano dentro de `cargos_manual_detalle` (secciones requisitos_estudio/requisitos_experiencia), no estructurados.

### 2.11 `nucleos_basicos_conocimiento` — 55 registros
8 áreas: AGRONOMIA/VETERINARIA Y AFINES, BELLAS ARTES, CIENCIAS DE LA EDUCACION, CIENCIAS DE LA SALUD, CIENCIAS SOCIALES Y HUMANAS, ECONOMIA/ADMINISTRACION/CONTADURIA Y AFINES, INGENIERIA/ARQUITECTURA/URBANISMO Y AFINES, MATEMATICAS Y CIENCIAS NATURALES. ⚠️ `descripcion` es NULL en **las 55 filas**.

### 2.12 `roles` / permisos
Roles: 2 Evaluador · 3 Evaluado · 4 Administrador CAREPA · 5 Jefe de Dependencia · 7 Cargador. 58 permisos, 142 pares rol_permiso.

---

## 3. Detección de problemas de datos

### 3.1 Duplicados
| Dónde | Hallazgo | Evidencia |
|---|---|---|
| `cargos_manual` vigentes | Misma clave (codigo+grado+nivel+denominación) repetida | `340/01/asistencial/Técnico - Agente de Tránsito` ×2 (ids 34,36); `407/02/Auxiliar Administrativo - Asistente` ×5; `407/02/…– Asistente` ×4 (guion distinto); `407/02/…– Mensajero y` ×2 |
| `cargos_manual` DEL+vig paralelos | Versiones eliminadas junto a la vigente | ids 120/108 (Inspector Policía), 118/106 (Suelos), 111/99 (Epidemiología), 119/107 (Obras Civiles), 97/98 (Secretario Salud), 121/96 (Gerente PDET), 127/92 (Monitores) |
| `tbl_detalle_cargo` | Duplicados exactos por (cargo, descripción) | `Contratista` ×11; `(3,'…-Sisben')` ×2; `(4,'Técnico administrativo - catastro')` ×2; otros ×2 |
| `tbl_cargo` | Nombre duplicado con/sin tilde | id 4 "Tecnico Administrativo" vs id 16 "Técnico Administrativo" |
| `dependencias` | Sin duplicados por nombre normalizado ✔ | 0 filas |
| `usuario_rol` | Sin duplicados (usuario, rol) ✔ | 0 filas |

### 3.2 Nulos/vacíos en campos normativos
- `cargos_manual`: **0** nulos en codigo, grado, nivel, dependencia_id. ✔
- `nucleos_basicos_conocimiento.descripcion`: NULL en 55/55. ⚠️
- `conductas`: todas activas, sin nulos. ✔
- `periodos.fecha_inicio_calificacion`/`fecha_fin_calificacion`: NULL (fase no configurada aún).

### 3.3 Cargos sin dependencia/nivel/código
Ninguno en `cargos_manual`. En legacy: ver 3.6.

### 3.4 Inconsistencias de formato
| Tipo | Evidencia |
|---|---|
| Tildes inconsistentes en competencias | "Adaptacion"/"tecnico"/"Orientacion" vs "Comunicación"/"estratégico"/"Planeación" (mismo catálogo) |
| Tilde/coma en dependencias | DEP-016 "**Secretaria,** de Hacienda" (coma errónea); DEP-010 "Secretaria de Gobierno **Y** Participación"; DEP-020 "Transito" (sin tilde); DEP-006 "Juridica" (sin tilde) |
| Guion mixto | `-` ASCII vs `–` en-dash mezclados en `denominacion` ("Auxiliar Administrativo - Asistente" vs "Auxiliar Administrativo – Asistente") → rompe deduplicación |
| Grado con ceros | Temporal usa grado `00`; global usa `01..04` |
| Denominaciones truncadas/corruptas | id 43: "**y Persuasivo.**" (nombre ilegible); id 91 DEL: "Profesional Universitario – Abogado Comisaria de" (truncado); id 44 "Datos"; id 16 "Talento Humano"; id 17 "Salud en el Trabajo (SST)" — sin prefijo estándar |
| SISBEN | "SISBEN" (id 58) vs "Sisbén" (dependencia) vs "SISBÉN" — tres grafías |
| Mayúsculas | "Profesional universitario - Banco de…" (id 54, minúscula tras Prof.) |
| Nivel vs denominación | "Técnico Operativo – Inspector de Transito" (id 33) marcado `asistencial`; homólogos marcados `tecnico`. Ídem ids 34/35/36/95 (Agentes/Gestión) `asistencial` siendo técnicos |

### 3.5 Soft-deleted (vigentes vs eliminados)
| Catálogo | Total | Vigentes | Eliminados |
|---|---|---|---|
| cargos_manual | 142 | 127 | **15** (11 global + 4 temporal) |
| usuarios | 228 | 225 | **3** (270, 271 "Test", 272 Jhon) |
| dependencias | 18 | 18 | 0 |
| competencias | 14 | 14 | 0 (tabla sin columna) |
| conductas | 70 | 70 | 0 (`activo`=0: ninguno) |

⚠️ **1 asignación `vigente=1` apunta a un cargo eliminado**: `usuario_cargo_manual.id=20 → usuario 186 → cargo_manual 91 (eliminado, "Profesional Universitario – Abogado Comisaria de")`.

### 3.6 Relaciones huérfanas (legacy sin FK)
| Tabla | Check | Resultado |
|---|---|---|
| `cargos_manual.dependencia_id` | LEFT JOIN dependencias | **0 huérfanos** ✔ |
| `usuario_cargo_manual` → cargos_manual / usuarios | LEFT JOIN | **0 huérfanos** ✔ |
| `usuarios.dependencia_id` | NOT IN dependencias | **0 huérfanos** ✔ |
| `conductas.competencia_codigo` | LEFT JOIN competencias | **0 huérfanos** ✔ |
| `responsables.id_tbl_cargo` | LEFT JOIN tbl_cargo | **153/262 huérfanos** (todos con valor `0`) |
| `responsables.Id_funcionarios` | LEFT JOIN funcionarios | **46/262 huérfanos** |
| `responsables.id_tbl_detalle_cargo` | LEFT JOIN tbl_detalle_cargo | **41/262 huérfanos** (rango usado 0–159, tabla llega a 146) |
| `ext_dependencias.Id_dependencia` | apunta a sistema externo | mayoría 0, sin tabla destino |
| `tbl_cargo.id_tbl_nivel_cargo` | rango 1–6 | tabla destino inexistente (nivel 6 sin resolver) |
| `evaluaciones`, `compromisos`, `metas` | FKs declaradas | íntegras ✔ |

### 3.7 Otros hallazgos
- **Dato de prueba**: `usuarios.codigo_empleo='TEST-001'` (único código de empleo de usuario que no existe en `cargos_manual`). Usuarios "Test" ya soft-deleted, pero quedan restos.
- **Dato basura**: `metas.descripcion='XD'` (id 13).
- **Secreto en BD**: `parametros.clave='jwt_secret'` con valor placeholder `"cambiar_esto_por_un_secret_seguro_openssl_rand_hex_32"` y expuesto vía `ParametroController`. Verificar que auth use `.env` y no esta tabla; recomendar eliminar o rotar.
- **Dependencias sin jefe**: 17 de 18 tienen `jefe_id=NULL` (solo DEP-009 tiene jefe). Impacta la asignación automática de evaluador-jefe.
- **37 usuarios activos sin `dependencia_id`** y sin cargo manual asignado (188/225 vinculados a cargo).
- `encargos` tiene 4 filas pero sin FK declaradas a usuarios/cargos (revisar integridad manual).

---

## 4. Usuarios y funcionarios

### 4.1 Dos modelos de persona
- **Nuevo**: `usuarios` (228; 179 activos + 49 inactivos + 3 soft-deleted... total 231 contando estados: activo=179, inactivo=49). Campos de empleo denormalizados en el propio usuario: `nivel, naturaleza, tipo_nombramiento, denominacion_empleo, codigo_empleo, grado_empleo, dependencia_id, dependencia_evaluacion_id`.
- **Legacy**: `funcionarios` (214; 163 is_active=1) + `responsables` (262; 181 activos) + `tbl_detalle_cargo`/`tbl_cargo`. Conviven sin sincronización aparente con `usuarios`.

### 4.2 Vínculo persona↔cargo (nuevo)
`usuario_cargo_manual(usuario_id → usuarios, cargo_manual_id → cargos_manual, fecha_asignacion, vigente, asignado_por)` — N:M con flag vigente.
- 188 filas, todas `vigente=1`, 188 usuarios distintos → cobertura **83 %** (188/225 activos).
- Los `codigo_empleo` en usuarios coinciden con `cargos_manual.codigo` salvo `TEST-001` (dato de prueba).
- ⚠️ 1 vínculo vigente a cargo eliminado (ver 3.5).

### 4.3 Vínculo legacy
`responsables(Id_funcionarios → funcionarios, Id_dependencia, id_tbl_cargo → tbl_cargo, id_tbl_detalle_cargo → tbl_detalle_cargo, fecha_vinculacion, acto_administrativo_v/d, fehca_desvinculacion [sic])` — sin FKs; 17–59 % de referencias rotas (ver 3.6). Columna mal escrita: `fehca_desvinculacion`.

### 4.4 Roles
257 asignaciones sobre 228 usuarios: Evaluado=226, Evaluador=17, Jefe Dependencia=13, Admin CAREPA=1, Cargador=0 filas visibles (rol 7 definido pero sin asignaciones en el conteo por rol_id 2/3/4/5).

---

## 5. Evaluaciones y periodos

### 5.1 Periodos
`periodos` (17 cols): **1 registro** — "2026-2027", 2026-02-01 → 2027-01-31, estado `concertacion`, fases concertación/seguimiento/evaluación fechadas, calificación sin fechar. Todo lo demás (evaluaciones, concertaciones, metas, evidencias) referencia `periodo_id=1`.

### 5.2 Flujo de referencia
```
periodos ← concertaciones(evaluador_id, evaluado_id, testigo_id, periodo_id)
         ← compromisos(concertacion_id, meta_id, tipo funcional/comportamental,
                       competencia_codigo → competencias, conductas_json, peso, calificacion)
         ← evaluaciones(evaluador_id, evaluado_id, comision_evaluadora_id, concertacion_id, periodo_id)
metas(funcionario_id → usuarios, periodo_id, dependencia_id, evaluador_id)
evidencias(compromiso_id, concertacion_id, periodo_id, registrado_por)
```
- Las **competencias** entran por `compromisos.competencia_codigo` (FK a `competencias.codigo`) y el snapshot de conductas se guarda desnormalizado en `compromisos.conductas_json`.
- Las **calificaciones**: pesos 85 % funcionales / 15 % comportamentales en `parametros` (ids 6–7); umbrales sobresaliente ≥90, satisfactorio ≥65.
- Datos actuales: 3 concertaciones (todas con `testigo_id=NULL`, sin `fecha_concertacion`), 30 compromisos (13 propuestos, 1 pendiente_aprobacion, 4 aprobados, 12 cumplidos), 5 metas, 24 evidencias, **2 evaluaciones** (ambas del evaluado 12 / evaluador 13: una `calificada` nota 78.86 satisfactoria tipo parcial_segundo_semestre, una `pendiente` parcial_primer_semestre).

### 5.3 Observabilidad
- `evaluaciones` soporta parcial/eventual/extraordinaria con motivos CNSC (enums), comisión evaluadora, anulación con motivo.
- Cadena de mejoramiento (compromisos_mejoramiento + seguimientos) completamente vacía: funcionalidad no ejercitada todavía.

---

## 6. Recomendaciones priorizadas

1. **P1 — Seguridad**: remover/rotar `parametros.jwt_secret` placeholder y asegurar que el backend no lo lea de BD.
2. **P1 — Integridad operativa**: reasignar o desactivar `usuario_cargo_manual.id=20` (vigente → cargo eliminado); limpiar `codigo_empleo='TEST-001'` y meta "XD".
3. **P2 — Calidad de catálogo cargos_manual**: normalizar tildes/guiones, completar denominaciones truncadas (ids 43, 91), unificar criterio nivel técnico/asistencial, decidir política para códigos de empleo repetidos (usar `num_cargos` > 1 en una sola fila vs una fila por plaza).
4. **P2 — Dependencias**: resolver duplicidad Planeación (DEP-012 vs DEP-013), corregir "Secretaria, de Hacienda", asignar jefes (17/18 sin jefe).
5. **P3 — Legacy**: planificar retiro de `funcionarios/responsables/tbl_cargo/tbl_detalle_cargo/ext_dependencias` o documentar su papel; hoy generan falsos huérfanos y confusión.
6. **P3 — NBC**: poblar `descripcion` (55 NULL) y usar `cargos_manual_requisitos` (vacía) en lugar de texto libre en detalle.
7. **P3 — Formato**: estandarizar grado temporal (`00`), grafías SISBEN/Sisbén, y regla de tildes en `competencias.nombre`.
