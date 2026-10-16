#!/usr/bin/env python3
"""
analizar_oleada2_temporal.py — SOLO LECTURA. Cruza los cargos temporales de BD
contra las 21 fichas del modelo_planta_temporal.md y produce la tabla de mapeo
para revision humana. NO genera SQL.
Salida: database/migrations/oleada2_reporte_mapeo_temporal.md
"""
import re
import subprocess
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MODELO = RAIZ / "docs" / "auditoria" / "aux" / "modelo_planta_temporal.md"
SALIDA = RAIZ / "database" / "migrations" / "oleada2_reporte_mapeo_temporal.md"
BD = "edl_carepa"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("\u2013", "-").replace("\u2014", "-")
    return re.sub(r"\s+", " ", s).strip().rstrip(".")


def grado_norm(g):
    g = str(g).strip()
    return str(int(g)) if g.isdigit() else g


def q(sql):
    out = subprocess.run(["mariadb", "--default-character-set=utf8mb4", "-N", "-B", "-u", "root",
                          BD, "-e", sql], capture_output=True, text=True, check=True).stdout
    return [tuple(l.split("\t")) for l in out.splitlines() if l]


text = MODELO.read_text(encoding="utf-8")
bloques = re.split(r"(?=^### FICHA \d+ )", text, flags=re.M)[1:]
fichas = []
for b in bloques:
    num = int(re.match(r"### FICHA (\d+) — (.+)", b).group(1))
    hdr_name = re.match(r"### FICHA \d+ — (.+)", b).group(1).strip()
    idl = re.search(r"\*\*IDENTIFICACI[ÓO]N\*\*:(.+)$", b, flags=re.M)
    linea = idl.group(1) if idl else ""

    def campo(nombre):
        mm = re.search(nombre + r":\s*`([^`]*)`", linea)
        return mm.group(1).strip() if mm else ""

    fichas.append({
        "num": num, "hdr": hdr_name,
        "nivel": campo("Nivel"),
        "denom": campo("Denominación del Empleo") or hdr_name,
        "codigo": campo("Código"), "grado": campo("Grado"),
        "cargos": campo("No\\.? de Cargos") or campo("No. de Cargos"),
        "dep": campo("Dependencia"),
    })

bd = q("""
SELECT cm.id, cm.codigo, cm.grado, cm.denominacion, cm.num_cargos, IFNULL(dd.nombre,'')
FROM cargos_manual cm LEFT JOIN dependencias dd ON dd.id=cm.dependencia_id
WHERE cm.eliminado_en IS NULL AND cm.planta='temporal' ORDER BY cm.id""")

lineas = [
    "# Reporte de mapeo ficha↔cargo — Oleada 2 (Temporal)",
    "",
    f"Fichas del manual: {len(fichas)} · Cargos temporales en BD: {len(bd)}",
    "",
    "## A. Por cada cargo BD: candidatas por código (+grado) y dependencia",
    "",
    "| cargo_id | código/grado | denominación BD | dep BD | n° plazas | fichas mismo código | veredicto preliminar |",
    "|---|---|---|---|---|---|---|",
]
usados = {}
for cid, cod, gra, den, nc, dep_bd in bd:
    mismos = [f for f in fichas if norm(f["codigo"]) == norm(cod)]
    mism_gr = [f for f in mismos if grado_norm(f["grado"]) == grado_norm(gra)]
    rel_dep = [f for f in mismos if (norm(f["dep"]) in norm(dep_bd)) or (norm(dep_bd) in norm(f["dep"]))]
    if len(rel_dep) == 1:
        veredicto = f"UNICA por dep -> FICHA {rel_dep[0]['num']}"
    elif len(mism_gr) == 1 and not rel_dep:
        veredicto = f"UNICA por grado -> FICHA {mism_gr[0]['num']} (dep difiere)"
    elif len(mismos) == 0:
        veredicto = "SIN_FICHA (ninguna con ese código)"
    elif len(mism_gr) == 0 and mismos:
        veredicto = f"GRADO_DIF: {[(f['num'], f['grado']) for f in mismos]}"
    elif len(rel_dep) > 1:
        veredicto = f"MULTIPLE_DEP: {[f['num'] for f in rel_dep]}"
    else:
        veredicto = f"AMBIGUA: mismas-grado {[f['num'] for f in mism_gr]} · dep-rel {len(rel_dep)}"
    cand = ",".join(str(f["num"]) for f in mismos) or "-"
    lineas.append(f"| {cid} | {cod}/{gra} | {den} | {dep_bd[:38]} | {nc} | {cand} | {veredicto} |")

lineas += ["", "## B. Fichas del manual sin contraparte denominación-exacta en BD", "",
           "| FICHA | denominación manual | código/grado | n° plazas | dependencia |", "|---|---|---|---|---|"]
for f in fichas:
    exacta = any(norm(den) == norm(f["denom"]) and norm(cod) == norm(f["codigo"])
                 for _i, cod, _g, den, _n, _d in [(r[0], r[1], r[2], r[3], r[4], r[5]) for r in bd])
    if not exacta:
        lineas.append(f"| {f['num']} | {f['denom']} | {f['codigo']}/{f['grado']} | {f['cargos']} | {f['dep'][:40]} |")

lineas += ["", "## C. Identificación completa de las 21 fichas (referencia)", "",
           "| FICHA | nivel | denominación | cód | grado | plazas | dependencia |", "|---|---|---|---|---|---|---|"]
for f in fichas:
    lineas.append(f"| {f['num']} | {f['nivel']} | {f['denom']} | {f['codigo']} | {f['grado']} | {f['cargos']} | {f['dep'][:42]} |")

SALIDA.write_text("\n".join(lineas) + "\n", encoding="utf-8")
print(f"fichas: {len(fichas)} · cargos BD: {len(bd)}")
print(f"reporte -> {SALIDA}")
