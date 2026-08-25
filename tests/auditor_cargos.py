#!/usr/bin/env python3
"""Auditor determinista: planta normativa (manuales marzo 2025) vs BD cargos_manual.

Corrige el defecto existencial del prototipo (/tmp/comparar_cargos.py:115-117):

    nivel_ok = all(any(...) for r in mrows)   # INCORRECTO: basta 1 fila buena
                                              # para validar grupos mezclados.

Politica de comparacion por dimension (expected set vs actual set):

| Dimension | Regla                | Severidad | Justificacion                       |
|-----------|----------------------|-----------|-------------------------------------|
| nivel     | igualdad de conjuntos| ERROR     | El manual asigna UN nivel por clave |
| cantidad  | suma(num_cargos)     | ERROR*    | *claves V-02/V-03 se anotan como    |
|           |                      |           |  disputa documental congelada       |
| denom     | esperado ⊆ actual    | WARN      | Enriquecimiento por ficha legitimo  |
|           |                      |           | (V-06); faltante exige revision     |
| dep       | esperado ⊆ actual    | WARN      | Reasignaciones aprobadas (P1-7);    |
|           |                      |           | extras/faltantes exigen revision    |

Grupos vacios (comportamiento explicito):
- clave normativa sin filas en BD  -> FALTA_EN_BD (ERROR)
- clave de BD sin respaldo normativo -> SIN_RESPALDO_NORMATIVO (WARN)

Uso:
    python3 tests/auditor_cargos.py --mysql          # auditoria contra BD viva (SELECT)
    python3 tests/auditor_cargos.py --desde-archivos # snapshot md + txt (offline)
Exit codes: 0 sin ERROR, 2 con ERROR (apto para CI).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / 'docs' / 'auditoria' / 'aux'

# Leyenda normativa: manual-funciones-marzo-2025.md:51
NIVEL = {'0': 'directivo', '1': 'asesor', '2': 'profesional',
         '3': 'tecnico', '4': 'asistencial'}

# Disputas documentales congeladas (V-02/V-03) y errata resuelta por la
# agregada + aritmetica (V-04): diferencias de GRADO entre la tabla agregada
# (que sigue la BD) y la discriminada (que parsea este auditor).
# No son errores de datos ni de nivel; se reportan aparte.
CLAVES_EN_DISPUTA_GRADO = {
    ('global', '219', '01'), ('global', '219', '02'),   # V-02: agregada 4g2/21g1
    ('global', '367', '02'), ('global', '367', '04'),   # V-03: agregada 33g2/1g3/4g4
    ('global', '407', '00'), ('global', '407', '02'),   # V-04: agregada 25 g2 unica
}

SQL_LIVE = (
    "SELECT cm.planta, cm.nivel, cm.denominacion, cm.codigo, cm.grado, "
    "cm.num_cargos, dep.codigo, dep.nombre "
    "FROM cargos_manual cm JOIN dependencias dep ON dep.id = cm.dependencia_id "
    "WHERE cm.eliminado_en IS NULL ORDER BY cm.planta, cm.id"
)


# ---------------------------------------------------------------- normalizacion

def norm(s: str) -> str:
    s = unicodedata.normalize('NFD', (s or '').upper())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^A-Z0-9 ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def canon_denom(s: str) -> str:
    s = norm(s)
    for a, b in (
        ('TECNICOS ADMINISTRATIVOS', 'TECNICO ADMINISTRATIVO'),
        ('TECNICOS OPERATIVOS', 'TECNICO OPERATIVO'),
        ('PROFESIONALES UNIVERSITARIOS', 'PROFESIONAL UNIVERSITARIO'),
        ('AUXILIARES ADMINISTRATIVOS', 'AUXILIAR ADMINISTRATIVO'),
        ('SECRETARIA DE DESPACHO', 'SECRETARIO DE DESPACHO'),
        ('SECRETERIA', 'SECRETARIA'),
        ('ALCALDE MUNICIPAL', 'ALCALDE'),
        ('INSPECTOR DE TRANSITO Y TRANSPORTE', 'INSPECTOR DE TRANSITO'),
        ('GERENTE CONTROL INTERNO', 'GERENTE DE CONTROL INTERNO'),
        ('GERENTE  CONTROL INTERNO', 'GERENTE DE CONTROL INTERNO'),
    ):
        s = s.replace(a, b)
    return s


def canon_dep(s: str) -> str:
    s = norm(s).replace('SECRETERIA', 'SECRETARIA')
    exactos = {
        'SECRETARIA PLANEACION': 'SECRETARIA DE PLANEACION',
        'SECRETARIA DE PLANEACION ORDENAMIENTO TERRITORIAL Y VIVIENDA': 'SECRETARIA DE PLANEACION',
        'SECRETARIA DE GOBIERNO Y PARTICIPACION CIUDADANA': 'SECRETARIA DE GOBIERNO',
        'SECRETARIA EDUCACION Y CULTURA': 'SECRETARIA DE EDUCACION',
        'SECRETARIA DE SALUD Y PROTECCION SOCIAL': 'SECRETARIA DE SALUD',
        'SECRETARIA DE TRANSITO Y TRANSPORTE': 'SECRETARIA DE TRANSITO',
        'SECRETARIA GENERAL Y DE SERVICIOS ADMINISTRATIVOS': 'SECRETARIA GENERAL',
        'SECRETARIA DE AGRICULTURA Y MEDIO AMBIENTE': 'SECRETARIA DE AGRICULTURA',
        'DESPACHO ALCALDIA': 'DESPACHO',
        'DESPACHO DEL ALCALDE': 'DESPACHO',
        'SECRETARIA DE INFRAESTRUCTURA FISICA': 'SECRETARIA DE INFRAESTRUCTURA',
        'INSPECCION DE POLICIA': 'INSPECCION',
    }
    return exactos.get(s, s)


# ------------------------------------------------------------- carga de fuentes

def parse_manual_global(ruta: Path) -> list[tuple]:
    """Tabla discriminada §1.1 -> [(planta, dep, denom, nivel_num, cod, grado, cant)]."""
    txt = ruta.read_text(encoding='utf-8')
    sec = txt.split('### 1.1')[1].split('**Totales por dependencia')[0]
    filas, dep = [], 'DESPACHO'
    for line in sec.splitlines():
        m = re.match(r'\|\s*\*\*(.+?)\*\*\s*\|', line)
        if m and 'subtotal' not in line.lower():
            dep = m.group(1)
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) >= 5 and re.match(r'^\d+$', cells[0]) and 'subtotal' not in line.lower():
            filas.append(('global', dep, cells[1], cells[2], cells[3], cells[4], int(cells[0])))
    return filas


def parse_manual_temporal(ruta: Path) -> list[tuple]:
    """§2 planta temporal -> mismas tuplas con planta='temporal'."""
    txt = ruta.read_text(encoding='utf-8')
    sec = txt.split('## 2. PLANTA TEMPORAL')[1].split('Verificación aritmética')[0]
    filas = []
    for line in sec.splitlines():
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) >= 6 and re.match(r'^\d+$', cells[1].replace('**', '')) \
                and 'subtotal' not in line.lower() and 'TOTAL' not in cells[0].upper():
            dep = cells[0].replace('**', '').replace('[sic]', '').strip()
            filas.append(('temporal', dep, cells[2], cells[3], cells[4], cells[5],
                          int(cells[1].replace('**', ''))))
    return filas


def cargar_bd_lineas(texto: str) -> list[dict]:
    """Snapshot TSV/planta|nivel|denom|codigo|grado|num|dep_cod|dep_nom."""
    filas = []
    for line in texto.splitlines():
        p = line.rstrip('\n').split('|')
        if len(p) == 8:
            filas.append({'planta': p[0], 'nivel': p[1], 'denom': p[2], 'codigo': p[3],
                          'grado': p[4], 'num': int(p[5]), 'dep_cod': p[6], 'dep_nom': p[7]})
    return filas


def cargar_bd_mysql(db: str = 'edl_carepa', host: str = '127.0.0.1',
                    user: str = 'root', password: str = '') -> list[dict]:
    """Lectura viva SOLO SELECT via cliente mysql/mariadb."""
    binario = 'mariadb' if shutil_which('mariadb') else 'mysql'
    cmd = [binario, f'-h{host}', f'-u{user}']
    if password:
        cmd.append(f'-p{password}')
    cmd += ['-N', '-B', db, '-e', SQL_LIVE]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return cargar_bd_lineas(out.replace('\t', '|'))


def shutil_which(name: str):
    import shutil
    return shutil.which(name)


# ------------------------------------------------------------ comparador puro

def _conj(levels, mapa=NIVEL) -> set:
    return frozenset(mapa.get(str(x), str(x)) for x in levels)


def auditar_grupo(niveles_esperados, niveles_actuales,
                  empleos_esperados: int, empleos_actuales: int,
                  denoms_esperadas=None, denoms_actuales=None,
                  deps_esperadas=None, deps_actuales=None) -> list[dict]:
    """Comparacion determinista expected-set vs actual-set para una clave.

    Regla central: NO basta que exista al menos una fila correcta.
    Los conjuntos completos deben coincidir (nivel) o cubrirse (denom/dep).
    """
    issues: list[dict] = []
    exp_n, act_n = _conj(niveles_esperados), _conj(niveles_actuales)

    if not niveles_actuales:
        issues.append({'tipo': 'FALTA_EN_BD', 'severidad': 'ERROR',
                       'detalle': 'clave normativa sin filas en BD'})
        return issues

    if exp_n != act_n:
        solo_bd = sorted(act_n - exp_n)
        solo_man = sorted(exp_n - act_n)
        issues.append({
            'tipo': 'NIVEL_INCORRECTO', 'severidad': 'ERROR',
            'detalle': (f"EXPECTED LEVELS: {sorted(exp_n)} | "
                        f"ACTUAL LEVELS: {sorted(act_n)}"
                        + (f" | sobrante_en_bd={solo_bd}" if solo_bd else '')
                        + (f" | faltante={solo_man}" if solo_man else '')),
        })

    if empleos_esperados != empleos_actuales:
        issues.append({'tipo': 'CANTIDAD', 'severidad': 'ERROR',
                       'detalle': f'empleos esperados={empleos_esperados} '
                                  f'actuales={empleos_actuales}'})

    if denoms_esperadas is not None:
        exp_d = frozenset(canon_denom(d) for d in denoms_esperadas)
        act_d = frozenset(canon_denom(d) for d in denoms_actuales)
        faltan = sorted(exp_d - act_d)
        extra = sorted(act_d - exp_d)
        if faltan:
            issues.append({'tipo': 'DENOM_FALTANTE', 'severidad': 'WARN',
                           'detalle': f'manual={faltan} ausentes_en_bd'})
        if extra:
            issues.append({'tipo': 'DENOM_ENRIQUECIDA', 'severidad': 'INFO',
                           'detalle': f'solo_en_bd={extra} (legitimo si respaldado '
                                      f'por ficha, regla V-06)'})

    if deps_esperadas is not None:
        exp_p = frozenset(canon_dep(d) for d in deps_esperadas)
        act_p = frozenset(canon_dep(d) for d in deps_actuales)
        if sorted(exp_p - act_p):
            issues.append({'tipo': 'DEP_FALTANTE', 'severidad': 'WARN',
                           'detalle': f'manual={sorted(exp_p - act_p)} ausentes_en_bd'})
        if sorted(act_p - exp_p):
            issues.append({'tipo': 'DEP_EXTRA', 'severidad': 'WARN',
                           'detalle': f'solo_en_bd={sorted(act_p - exp_p)} '
                                      f'(verificar reasignaciones aprobadas, ej. P1-7)'})
    return issues


def agrupar(filas_normativas, filas_bd):
    man = defaultdict(lambda: {'niveles': set(), 'cant': 0, 'denoms': set(), 'deps': set()})
    for planta, dep, denom, nivel, cod, grado, cant in filas_normativas:
        k = (planta, cod.zfill(3), grado.zfill(2))
        man[k]['niveles'].add(str(nivel))
        man[k]['cant'] += cant
        man[k]['denoms'].add(denom)
        man[k]['deps'].add(dep)

    db = defaultdict(lambda: {'niveles': set(), 'cant': 0, 'denoms': set(), 'deps': set(),
                              'ids_filas': 0})
    for d in filas_bd:
        k = (d['planta'], d['codigo'].zfill(3), d['grado'].zfill(2))
        db[k]['niveles'].add(d['nivel'])
        db[k]['cant'] += d['num']
        db[k]['denoms'].add(d['denom'])
        db[k]['deps'].add(d['dep_nom'])
        db[k]['ids_filas'] += 1
    return man, db


def auditar(filas_normativas, filas_bd) -> dict:
    man, db = agrupar(filas_normativas, filas_bd)
    resultados = []
    for k in sorted(set(man) | set(db)):
        m, d = man.get(k), db.get(k)
        if m is None:
            resultados.append({'clave': k, 'issues': [{
                'tipo': 'SIN_RESPALDO_NORMATIVO', 'severidad': 'WARN',
                'detalle': f"clave en BD sin fila normativa "
                           f"(filas_bd={d['ids_filas']}, empleos={d['cant']})"}]})
            continue
        issues = auditar_grupo(
            m['niveles'], d['niveles'] if d else set(),
            m['cant'], d['cant'] if d else 0,
            m['denoms'], d['denoms'] if d else set(),
            m['deps'], d['deps'] if d else set())
        if k in CLAVES_EN_DISPUTA_GRADO:
            issues.append({'tipo': 'DISPUTA_GRADO_V02_V03_V04', 'severidad': 'INFO',
                           'detalle': 'diferencias de cantidad/grado atribuibles a la '
                                      'autocontradiccion de grados del manual o errata '
                                      'resuelta por la agregada; congeladas hasta acto '
                                      'administrativo'})
        resultados.append({'clave': k, 'issues': issues})
    return {
        'grupos': resultados,
        'resumen': resumir(resultados),
    }


def resumir(resultados) -> dict:
    r = {'ok': 0, 'warn': 0, 'error': 0}
    for g in resultados:
        sev = [i['severidad'] for i in g['issues']]
        if 'ERROR' in sev:
            r['error'] += 1
        elif 'WARN' in sev:
            r['warn'] += 1
        else:
            r['ok'] += 1
    return r


def formatear(resultado: dict) -> str:
    lines = []
    for g in resultado['grupos']:
        if not g['issues']:
            lines.append(f"[OK]    {g['clave']}")
            continue
        peor = 'ERROR' if any(i['severidad'] == 'ERROR' for i in g['issues']) else 'WARN'
        lines.append(f"[{peor}]  {g['clave']}")
        for i in g['issues']:
            lines.append(f"   [{i['severidad']:5s}] {i['tipo']}: {i['detalle']}")
    r = resultado['resumen']
    lines.append(f"\nRESUMEN grupos ok={r['ok']} warn={r['warn']} error={r['error']}")
    return '\n'.join(lines)


# ------------------------------------------------------------------------ CLI

def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    modo = ap.add_mutually_exclusive_group(required=True)
    modo.add_argument('--mysql', action='store_true', help='audita BD viva (solo SELECT)')
    modo.add_argument('--desde-archivos', action='store_true',
                      help='audita snapshot offline (md + txt)')
    ap.add_argument('--db', default='edl_carepa')
    ap.add_argument('--json', action='store_true', help='salida JSON estructurada')
    args = ap.parse_args(argv)

    glob = parse_manual_global(BASE / 'modelo_planta_global.md')
    temp = parse_manual_temporal(BASE / 'modelo_planta_temporal.md')
    normativas = glob + temp

    if args.mysql:
        bd = cargar_bd_mysql(args.db)
    else:
        snap = Path('/tmp/db_cargos.txt')
        bd = cargar_bd_lineas(snap.read_text(encoding='utf-8'))

    print(f'MANUAL: {len(normativas)} filas, {sum(f[6] for f in normativas)} empleos',
          file=sys.stderr)
    print(f'BD: {len(bd)} filas, {sum(d["num"] for d in bd)} empleos', file=sys.stderr)

    resultado = auditar(normativas, bd)
    if args.json:
        print(json.dumps(resultado, ensure_ascii=False, indent=1))
    else:
        print(formatear(resultado))
    return 2 if resultado['resumen']['error'] else 0


if __name__ == '__main__':
    sys.exit(main())
