#!/usr/bin/env python3
"""Auditor determinista R1/R8: sincronizacion usuarios.nivel <-> cargo vigente.

Fuente de verdad: cargos_manual (catalogo normativo solo-lectura via API).
usuarios.nivel es una COPIA MATERIALIZADA que solo se propaga en
POST /usuarios/{id}/cargo-manual (CargoManualService::asignar) y puede ser
editada directamente via PUT /usuarios/{id} -> vector de drift.

Politica (expected-vs-actual por usuario):
| Situacion                                            | Veredicto | Severidad |
|------------------------------------------------------|-----------|-----------|
| vinculo vigente + nivel == cargo.nivel               | OK        | -         |
| vinculo vigente + nivel != cargo.nivel               | DESYNC    | ERROR     |
| sin vinculo vigente + nivel NULL + usuario activo    | SIN_VINCULO_ACTIVO | WARN |
| sin vinculo vigente + nivel definido                 | SIN_VINCULO | INFO   |

Los usuarios sin vinculo vigente quedan FUERA del alcance de correccion
automatica: su nivel esperado no es derivable del catalogo sin politica de
reasignacion (decision humana).

Uso: python3 tests/auditor_usuarios_nivel.py --mysql [--json]
Exit codes: 0 sin DESYNC, 2 con DESYNC (apto para CI).
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys

SQL_LIVE = (
    "SELECT u.id, u.documento, u.estado, u.es_contratista, u.nivel, "
    "u.codigo_empleo, cm.id, cm.codigo, cm.grado, cm.nivel "
    "FROM usuarios u "
    "JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1 "
    "LEFT JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id "
    "WHERE u.eliminado_en IS NULL "
    "ORDER BY u.id"
)

SQL_SIN_VINCULO = (
    "SELECT u.id, u.estado, u.nivel IS NULL FROM usuarios u "
    "LEFT JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1 "
    "WHERE u.eliminado_en IS NULL AND ucm.id IS NULL ORDER BY u.id"
)


def auditar_usuario(nivel_usuario, tiene_vinculo: bool,
                    nivel_cargo=None, usuario_activo: bool = True) -> list[dict]:
    """Comparacion determinista para un usuario (funcion pura, testeable)."""
    issues = []
    if tiene_vinculo:
        if nivel_cargo is None:
            issues.append({'tipo': 'CARGO_MUERTO', 'severidad': 'WARN',
                           'detalle': 'vinculo apunta a cargo soft-deleted'})
        elif nivel_usuario != nivel_cargo:
            issues.append({'tipo': 'DESYNC_NIVEL', 'severidad': 'ERROR',
                           'detalle': f"EXPECTED (cargo): {nivel_cargo} | "
                                      f"ACTUAL (usuario): {nivel_usuario}"})
        return issues
    # sin vinculo vigente
    if nivel_usuario is None:
        sev = 'WARN' if usuario_activo else 'INFO'
        issues.append({'tipo': 'SIN_VINCULO_SIN_NIVEL', 'severidad': sev,
                       'detalle': 'sin cargo vigente ni nivel; fuera del alcance '
                                  'de sincronizacion automatica'})
    else:
        issues.append({'tipo': 'SIN_VINCULO_CON_NIVEL', 'severidad': 'INFO',
                       'detalle': 'nivel presente pero sin cargo vigente; '
                                  'consistencia no derivable del catalogo'})
    return issues


def _mysql(sql: str, db: str = 'edl_carepa') -> str:
    binario = 'mariadb' if shutil_which('mariadb') else 'mysql'
    return subprocess.run([binario, '-u', 'root', '-N', '-B', db, '-e', sql],
                          capture_output=True, text=True, check=True).stdout


def shutil_which(name: str):
    import shutil
    return shutil.which(name)


def recolectar() -> dict:
    filas = [l.split('\t') for l in _mysql(SQL_LIVE).splitlines() if l]
    resultados = []
    for (uid, doc, estado, contratista, nivel_u, cod_emp,
         cid, ccod, cgrado, cniv) in filas:
        tiene_v = cid not in ('NULL', '') and cid != '\\N'
        cn = None if cniv in ('NULL', '\\N') else cniv
        nu = None if nivel_u in ('NULL', '\\N', '') else nivel_u
        issues = auditar_usuario(nu, tiene_v, cn, estado == 'activo')
        resultados.append({'usuario_id': int(uid), 'documento': doc,
                           'estado': estado, 'codigo_empleo': cod_emb_limpio(cod_emp),
                           'cargo_id': cid, 'issues': issues})
    sin_v = [l.split('\t') for l in _mysql(SQL_SIN_VINCULO).splitlines() if l]
    cubiertos = {r['usuario_id'] for r in resultados}
    for uid, estado, sin_nivel in sin_v:
        if int(uid) in cubiertos:
            continue
        nu = None if sin_nivel == '1' else object()
        results_add(resultados, uid, doc='', estado=estado,
                    nu=None if nu is None else 'definido')
    return {'usuarios': resultados}


def cod_emb_limpio(v):
    return None if v in ('NULL', '\\N') else v


def results_add(resultados, uid, doc, estado, nu):
    if isinstance(nu, str) and nu == 'definido':
        iss = auditar_usuario('definido', False)
    else:
        iss = auditar_usuario(None, False, usuario_activo=(estado == 'activo'))
    resultados.append({'usuario_id': int(uid), 'documento': doc, 'estado': estado,
                       'codigo_empleo': None, 'cargo_id': None, 'issues': iss})


def resumen(resultados) -> dict:
    r = {'ok': 0, 'warn': 0, 'error': 0, 'desync': []}
    for x in resultados:
        sev = [i['severidad'] for i in x['issues']]
        if 'ERROR' in sev:
            r['error'] += 1
            uid = x.get('usuario_id')
            if uid is not None:
                r['desync'].append(uid)
        elif 'WARN' in sev:
            r['warn'] += 1
        else:
            r['ok'] += 1
    r['desync'].sort()
    return r


def formatear(data: dict) -> str:
    lines = []
    for x in data['usuarios']:
        if not x['issues']:
            continue
        peor = 'ERROR' if any(i['severidad'] == 'ERROR' for i in x['issues']) else \
               ('WARN' if any(i['severidad'] == 'WARN' for i in x['issues']) else 'INFO')
        lines.append(f"[{peor}] usuario {x['usuario_id']} ({x.get('documento','')} "
                     f"estado={x['estado']} codigo={x.get('codigo_empleo')})")
        for i in x['issues']:
            lines.append(f"   [{i['severidad']:5s}] {i['tipo']}: {i['detalle']}")
    r = resumen(data['usuarios'])
    lines.insert(0, f"DESYNC (ERROR): {len(r['desync'])} usuarios -> ids {r['desync']}")
    lines.append(f"\nRESUMEN ok={r['ok']} warn={r['warn']} error={r['error']} "
                 f"(solo errores son desincronizacion corregible por M007)")
    return '\n'.join(lines)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--mysql', action='store_true')
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args(argv)
    if not args.mysql:
        ap.error('por ahora solo --mysql')
    data = recolectar()
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=1))
    else:
        print(formatear(data))
    return 2 if resumen(data['usuarios'])['error'] else 0


if __name__ == '__main__':
    sys.exit(main())
