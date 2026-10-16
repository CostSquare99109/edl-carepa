#!/usr/bin/env python3
"""
generar_eav_oleada1.py — Oleada 1 (Global): genera el SQL de poblacion EAV
(cargos_manual_detalle) para los cargos globales SIN ninguna fila EAV, desde la
transcripcion normativa docs/auditoria/extra/modelo_planta_global.md.

Salidas:
  database/migrations/M010_oleada1_eav_global.sql      (aplicar SOLO via aplicar_migracion.sh)
  database/migrations/M010_oleada1_reporte_mapeo.md    (mapeo ficha<->cargo para revision)

Reglas:
  * Solo genera secciones con respaldo literal en la ficha. Nada inventado.
  * JSON limpio y separado (anti-R2): {"comunes": ["A","B"], "nivel": [...]}.
  * Idempotente: cada INSERT lleva NOT EXISTS (cargo, seccion).
  * Excluye las filas AA sin respaldo (147-151) por decision del usuario.
  * Mapeos no automaticos quedan en el reporte y NO generan SQL.
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MODELO = RAIZ / "docs" / "auditoria" / "aux" / "modelo_planta_global.md"
SQL_OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    RAIZ / "database" / "migrations" / "M010_oleada1_eav_global.sql")
REP_OUT = SQL_OUT.with_name(SQL_OUT.stem + "_reporte_mapeo.md")

EXCLUIR_IDS = {147, 148, 149, 150, 151}  # AA sin respaldo (decision TH pendiente)
# PARCIAL aprobados explicitamente por el usuario (2026-08-25):
#  108 -> FICHA 10 (respaldo V-06 tabla agregada + dependencia corregida en P1-7
#         con la misma ficha). Su denominacion NO se renombra: V-06 resolvio
#         "id 108 se mantiene".
APROBADOS_PARCIALES: set[int] = {98, 108}
SECCIONES_ORDEN = [
    ("proposito", 140), ("funciones", 141), ("contribuciones", 142),
    ("conocimientos", 143), ("competencias", 144),
    ("requisitos_estudio", 145), ("requisitos_experiencia", 146),
]
BD = "edl_carepa"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("\u2013", "-").replace("\u2014", "-")
    s = re.sub(r"\s+", " ", s).strip()
    return s.rstrip(". ").strip()


def grado_norm(g: str) -> str:
    g = g.strip()
    return str(int(g)) if g.isdigit() else norm(g)


def q(sql: str) -> list[tuple]:
    out = subprocess.run(
        ["mariadb", "--default-character-set=utf8mb4", "-N", "-B", "-u", "root", BD, "-e", sql],
        capture_output=True, text=True, check=True).stdout
    return [tuple(line.split("\t")) for line in out.splitlines() if line]


def sqlstr(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "''") + "'"


# ---------------------------------------------------------------- parseo MD
text = MODELO.read_text(encoding="utf-8")
bloques = re.split(r"(?=^#### FICHA \d+ )", text, flags=re.M)[1:]
fichas = []
for b in bloques:
    m = re.match(r"#### FICHA (\d+) — (.+)", b)
    num, denom_hdr = int(m.group(1)), m.group(2).strip()

    def campo(nombre):
        mm = re.search(rf"^\|\s*{nombre}\s*\|(.+)\|\s*$", b, flags=re.M)
        return mm.group(1).strip() if mm else ""

    codigo = campo("Código").replace("`", "").strip()
    grado = campo("Grado").replace("`", "").strip()
    denom = campo("Denominación del Empleo") or denom_hdr
    dep = campo("Dependencia")

    f = {"num": num, "denom": denom, "codigo": codigo, "grado": grado,
         "dep": dep, "secs": {}}

    def tras_marca(marca):
        mm = re.search(re.escape(marca) + r"[^:\n]*:\*\*(.+)", b)
        return mm.group(1).strip() if mm else None

    f["secs"]["proposito"] = tras_marca("**II. PROPÓSITO PRINCIPAL")

    miii = re.search(r"\*\*III\.[^\n]*\n(.*?)(?=^\*\*IV\.)", b, flags=re.M | re.S)
    if miii:
        items = [t.strip() for t in re.findall(r"^\d+\.\s+(.+)$", miii.group(1), flags=re.M)]
        if items:
            f["secs"]["funciones"] = items

    mciv = re.search(r"\*\*IV\.[^\n]*:\*\*(.+)", b)
    if mciv:
        txt = mciv.group(1).strip()
        partes = [p.strip() for p in re.split(r"(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])", txt) if p.strip()]
        if partes:
            f["secs"]["contribuciones"] = partes

    mcv = re.search(r"\*\*V\.[^\n]*:\*\*(.+)", b)
    if mcv:
        txt = mcv.group(1).strip()
        partes = [p.strip() for p in re.split(r"(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])", txt) if p.strip()]
        if partes:
            f["secs"]["conocimientos"] = partes

    mcom = re.search(r"-\s*Comunes:\s*(.+)$", b, flags=re.M)
    mniv = re.search(r"-\s*Espec[ií]ficas del nivel:\s*(.+)$", b, flags=re.M | re.I)
    if mcom or mniv:
        comunes = [p.strip() for p in mcom.group(1).split(",") if p.strip()] if mcom else []
        nivel = [p.strip() for p in mniv.group(1).split(",") if p.strip()] if mniv else []
        f["secs"]["competencias"] = {"comunes": comunes, "nivel": nivel}

    mest = re.search(r"-\s*Estudios:\s*(.+)$", b, flags=re.M)
    mexp = re.search(r"-\s*Experiencia:\s*(.+)$", b, flags=re.M)
    if mest:
        f["secs"]["requisitos_estudio"] = "ESTUDIOS " + mest.group(1).strip()
    if mexp:
        f["secs"]["requisitos_experiencia"] = "EXPERIENCIA " + mexp.group(1).strip()

    fichas.append(f)

indice_exacto: dict = {}
for f in fichas:
    indice_exacto.setdefault((norm(f["codigo"]), grado_norm(f["grado"]), norm(f["denom"])), []).append(f)

# ------------------------------------------------------------- carga objetivos
filas = q("""
SELECT cm.id, cm.codigo, cm.grado, cm.denominacion, IFNULL(dd.nombre,'')
FROM cargos_manual cm
LEFT JOIN dependencias dd ON dd.id = cm.dependencia_id
LEFT JOIN cargos_manual_detalle d ON d.cargo_manual_id = cm.id
WHERE cm.eliminado_en IS NULL AND cm.planta='global' AND d.id IS NULL
ORDER BY cm.id""")
objetivos = [(int(i), c, g, dnm, dep)
             for i, c, g, dnm, dep in filas if int(i) not in EXCLUIR_IDS]


def deps_relacionadas(dep_ficha: str, dep_bd: str) -> bool:
    a, b = norm(dep_ficha), norm(dep_bd)
    if not a or not b:
        return True  # sin dato no bloquea
    return a in b or b in a


# ---------------------------------------------------------------------- mapeo
reporte, inserts, sin_ficha, parcial, ambiguas, parciales = [], [], [], [], [], []
for cid, cod, gra, den, dep_bd in objetivos:
    clave = (norm(cod), grado_norm(gra), norm(den))
    candidatos = list(indice_exacto.get(clave, []))
    if len(candidatos) > 1:
        filtrados = [x for x in candidatos if deps_relacionadas(x["dep"], dep_bd)]
        if len(filtrados) == 1:
            candidatos, tipo = filtrados, "EXACTA_DEP"
            f = filtrados[0]
        else:
            ambiguas.append((cid, cod, gra, den, dep_bd, [x["num"] for x in candidatos]))
            continue
    else:
        f = candidatos[0] if candidatos else None
        tipo = "EXACTA"
    if f is None:
        # tolerancia de grado (00 vs 0 ya cubierta); prueba por prefijo largo
        cand = [x for x in fichas
                if norm(x["codigo"]) == norm(cod) and grado_norm(x["grado"]) == grado_norm(gra)
                and (norm(x["denom"]).startswith(norm(den)) or norm(den).startswith(norm(x["denom"])))
                and min(len(norm(x["denom"])), len(norm(den))) >= 15]
        if len(cand) == 1:
            f, tipo = cand[0], "PARCIAL"
            if cid in APROBADOS_PARCIALES:
                tipo = "PARCIAL_APROBADO"
            else:
                # GO condicional usuario: los PARCIAL NO generan SQL en M010;
                # requieren aprobación individual (mismo tratamiento que id 76 en M009).
                parciales.append((cid, cod, gra, den, f["num"], f["denom"]))
                continue
    if f is None:
        # codigo+denominacion exactos con grado distinto (ej. PDET: ficha 00 vs BD 01 por V-01b)
        cand = [x for x in fichas
                if norm(x["codigo"]) == norm(cod) and norm(x["denom"]) == norm(den)]
        if len(cand) == 1:
            f, tipo = cand[0], "EXACTA_GRADO_DIF"
    if f is None:
        sin_ficha.append((cid, cod, gra, den))
        continue
    if tipo == "EXACTA":
        pass
    for seccion, orden in SECCIONES_ORDEN:
        contenido = f["secs"].get(seccion)
        if contenido is None:
            continue
        if isinstance(contenido, list):
            payload = json.dumps(contenido, ensure_ascii=False)
        elif isinstance(contenido, dict):
            payload = json.dumps(contenido, ensure_ascii=False)
        else:
            payload = contenido
        inserts.append((cid, seccion, orden, payload, f["num"]))
    reporte.append((cid, cod, gra, den, f["num"], f["denom"], tipo,
                    ", ".join(s for s, _ in SECCIONES_ORDEN if s in f["secs"]) or "(sin secciones)"))

# ------------------------------------------------------------------- emitir SQL
lineas = [
    "-- ============================================================================",
    "-- M010_oleada1_eav_global.sql — GENERADO por tests/generar_eav_oleada1.py",
    "-- Poblacion EAV (cargos_manual_detalle) para cargos globales sin filas EAV.",
    "-- Fuente literal: docs/auditoria/extra/modelo_planta_global.md (FICHAS 1-100).",
    f"-- Cargos objetivo: {len(objetivos)} · mapeados automaticamente: {len(reporte)}",
    f"-- Filas a insertar: {len(inserts)} · sin ficha (pendientes revision): {len(sin_ficha)}",
    "-- Excluidos por decision TH: ids 147-151 (AA sin respaldo en el manual).",
    "-- JSON anti-R2: comunes/nivel como items separados.",
    "-- Aplicar SOLO via: database/migrations/aplicar_migracion.sh este_archivo <bd>",
    "-- ============================================================================",
    "",
    "START TRANSACTION;",
    "",
]
for cid, seccion, orden, payload, fnum in inserts:
    lineas.append(
        f"INSERT INTO cargos_manual_detalle (cargo_manual_id, seccion, contenido, orden) "
        f"SELECT {cid}, '{seccion}', {sqlstr(payload)}, {orden} FROM (SELECT 1 AS one) AS d "
        f"WHERE NOT EXISTS (SELECT 1 FROM cargos_manual_detalle "
        f"WHERE cargo_manual_id={cid} AND seccion='{seccion}');  -- FICHA {fnum}"
    )
lineas += [
    "",
    "-- VERIFICACIONES",
    f"SELECT COUNT(*) AS filas_esperadas_{len(inserts)} FROM cargos_manual_detalle "
    f"WHERE cargo_manual_id IN ({','.join(str(c) for c, *_ in objetivos)}) AND creado_en >= CURDATE();",
    "SELECT COUNT(*) AS json_invalidos_esperado_0 FROM cargos_manual_detalle "
    f"WHERE cargo_manual_id IN ({','.join(str(c) for c, *_ in objetivos)}) AND seccion IN ('funciones','contribuciones','conocimientos','competencias') "
    "AND JSON_VALID(contenido)=0;",
    "SELECT COUNT(DISTINCT cargo_manual_id) AS cargos_con_proposito FROM cargos_manual_detalle "
    f"WHERE seccion='proposito' AND cargo_manual_id IN ({','.join(str(c) for c, *_ in objetivos)});",
    "",
    "COMMIT;",
    "",
    "-- ROLLBACK:",
    "-- UPDATE cargos_manual_detalle SET eliminado... (tabla sin soft-delete fisico declarado;",
    "-- usar DELETE acotado) :",
    f"-- DELETE FROM cargos_manual_detalle WHERE cargo_manual_id IN ({','.join(str(c) for c, *_ in objetivos)})",
    "--   AND orden BETWEEN 140 AND 146 AND creado_en >= CURDATE();",
]
SQL_OUT.write_text("\n".join(lineas) + "\n", encoding="utf-8")

# -------------------------------------------------------------------- reporte
rep = [
    "# Reporte de mapeo ficha↔cargo — Oleada 1 (Global)",
    f"Cargos objetivo: {len(objetivos)} · auto-mapeados: {len(reporte)} · sin ficha: {len(sin_ficha)} · parciales: {len(parcial)}",
    "",
    "## Mapeados (generan SQL)",
    "| cargo_id | código | grado | denominación BD | FICHA | denominación manual | tipo | secciones |",
    "|---|---|---|---|---|---|---|---|",
]
for cid, cod, gra, den, fnum, fdnm, tipo, secs in reporte:
    rep.append(f"| {cid} | {cod} | {gra} | {den} | {fnum} | {fdnm} | {tipo} | {secs} |")
rep += ["", "## SIN ficha (NO generan SQL — requieren decisión humana)", "",
        "| cargo_id | código | grado | denominación BD |", "|---|---|---|---|"]
for cid, cod, gra, den in sin_ficha:
    rep.append(f"| {cid} | {cod} | {gra} | {den} |")
rep += ["", "## AMBIGUAS (múltiples fichas candidatas — NO generan SQL)", "",
        "| cargo_id | código | grado | denominación BD | dependencia BD | fichas candidatas |",
        "|---|---|---|---|---|---|"]
for cid, cod, gra, den, dep_bd, nums in ambiguas:
    rep.append(f"| {cid} | {cod} | {gra} | {den} | {dep_bd} | {nums} |")
rep += ["", "## PARCIALES — FUERA de M010 (requieren aprobación individual, vía M011)", "",
        "| cargo_id | código | grado | denominación BD | FICHA | denominación manual |", "|---|---|---|---|---|---|"]
for cid, cod, gra, den, fnum, fdnm in parciales:
    rep.append(f"| {cid} | {cod} | {gra} | {den} | {fnum} | {fdnm} |")
REP_OUT.write_text("\n".join(rep) + "\n", encoding="utf-8")

print(f"fichas parseadas          : {len(fichas)}")
print(f"cargos objetivo           : {len(objetivos)}")
print(f"mapeados (generan SQL)    : {len(reporte)}")
print(f"parciales (fuera, M011)   : {len(parciales)}")
print(f"ambiguas (revisar)        : {len(ambiguas)}")
print(f"SIN ficha (pendientes TH) : {len(sin_ficha)}")
print(f"filas INSERT generadas    : {len(inserts)}")
for cid, cod, gra, den, dep_bd, nums in ambiguas:
    print(f"  AMBIGUA   -> id {cid}: {cod}/{gra} {den} · candidatas {nums}")
for cid, cod, gra, den in sin_ficha:
    print(f"  SIN FICHA -> id {cid}: {cod}/{gra} {den}")
print(f"\nSQL  -> {SQL_OUT}")
print(f"Repo -> {REP_OUT}")
