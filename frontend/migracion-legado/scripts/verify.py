#!/usr/bin/env python3
"""
VerificaciÃ³n cruzada entre sistema legacy y edl-carepa.

Muestra discrepancias en:
  - Dependencias (nombres, IDs)
  - Usuarios (cargo, dependencia)
  - Usuarios sin match en legacy
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.legacy_db import LegacyDB
from src.adapter import APIClient, LEGACY_TO_API_DEPENDENCIA, API_TO_LEGACY_DEPENDENCIA


def nombre_completo(u: dict) -> str:
    return " ".join(filter(None, [
        u.get("primer_nombre", ""),
        u.get("segundo_nombre", ""),
        u.get("primer_apellido", ""),
        u.get("segundo_apellido", ""),
    ]))


def main():
    legacy = LegacyDB()
    legacy.load()

    api = APIClient()
    api.login()

    usuarios = api.get_usuarios()
    api_deps = {d["id"]: d.get("nombre", "") for d in api.get_dependencias()}

    print("=" * 80)
    print("VERIFICACIÃ“N CRUZADA: LEGACY (gestion) vs EDL-CAREPA")
    print("=" * 80)

    # 1. Resumen general
    print(f"\n--- RESUMEN ---")
    print(f"  Funcionarios en legacy: {len(legacy.funcionarios)}")
    print(f"  Dependencias en legacy: {len(legacy.dependencias)}")
    print(f"  Cargos en legacy: {len(legacy.cargos)}")
    print(f"  Detalles de cargo: {len(legacy.detalles_cargo)}")
    print(f"  Responsables: {sum(len(v) for v in legacy.responsables.values())}")
    print(f"  Usuarios en API: {len(usuarios)}")
    print(f"  Dependencias en API: {len(api_deps)}")

    # 2. Estado de cargo en API
    con_cargo_nombre = 0
    con_cargo_correcto = 0
    for u in usuarios:
        nombre = nombre_completo(u)
        cargo = (u.get("denominacion_empleo") or "").strip()
        if cargo.upper() == nombre.upper():
            con_cargo_nombre += 1
        elif cargo:
            con_cargo_correcto += 1
    print(f"\n--- ESTADO DE CARGOS EN API ---")
    print(f"  Con cargo correcto: {con_cargo_correcto}")
    print(f"  Con nombre en lugar de cargo: {con_cargo_nombre}")

    # 3. Usuarios sin match en legacy
    sin_match = []
    for u in usuarios:
        doc = str(u.get("documento", "") or "")
        nombre = nombre_completo(u)
        if doc in ("0", "", "12345678"):
            sin_match.append((u["id"], nombre, doc, "documento invÃ¡lido"))
        elif not legacy.get_funcionario_by_cedula(doc):
            sin_match.append((u["id"], nombre, doc, "no encontrado en funcionarios"))
    if sin_match:
        print(f"\n--- USUARIOS SIN MATCH EN LEGACY ({len(sin_match)}) ---")
        for uid, nombre, doc, razon in sin_match:
            print(f"  ID={uid:<4} {nombre[:35]:<38} Doc={doc:<12} ({razon})")

    # 4. Discrepancias de dependencia
    print(f"\n--- DISCREPANCIAS DE DEPENDENCIA ---")
    dif_count = 0
    sin_resp = 0
    for u in sorted(usuarios, key=lambda x: x["id"]):
        doc = str(u.get("documento", "") or "")
        dep_actual = u.get("dependencia_id")
        legacy_dep_id = legacy.resolve_dependencia_id(doc)
        if legacy_dep_id is None:
            if doc not in ("0", "", "12345678") and legacy.get_funcionario_by_cedula(doc):
                sin_resp += 1
            continue
        api_esperado = LEGACY_TO_API_DEPENDENCIA.get(legacy_dep_id)
        if api_esperado and dep_actual != api_esperado:
            dif_count += 1
            if dif_count <= 10:
                nombre = nombre_completo(u)
                actual_name = api_deps.get(dep_actual, f"ID={dep_actual}")
                esperado_name = api_deps.get(api_esperado, f"ID={api_esperado}")
                print(f"  ID={u['id']:<4} {nombre[:30]:<33} API:{actual_name[:35]:<38} Legacy:{esperado_name}")
    print(f"  Total discrepancias: {dif_count}")
    if sin_resp:
        print(f"  Usuarios en funcionarios pero sin responsables: {sin_resp}")

    # 5. Discrepancias de cargo
    print(f"\n--- DISCREPANCIAS DE CARGO ---")
    dif_cargo = 0
    for u in sorted(usuarios, key=lambda x: x["id"]):
        doc = str(u.get("documento", "") or "")
        cargo_actual = (u.get("denominacion_empleo") or "").strip()
        cargo_legacy = legacy.resolve_cargo(doc)
        if cargo_legacy and cargo_actual.upper() != cargo_legacy.upper():
            dif_cargo += 1
            if dif_cargo <= 10:
                nombre = nombre_completo(u)
                print(f"  ID={u['id']:<4} {nombre[:32]:<35} Actual:{cargo_actual[:35]:<38} Legacy:{cargo_legacy}")
    print(f"  Total discrepancias: {dif_cargo}")

    # 6. Mapeo dependencias
    print(f"\n--- MAPEO DEPENDENCIAS LEGACY -> API ---")
    for lid, lname in sorted(legacy.dependencias.items()):
        api_id = LEGACY_TO_API_DEPENDENCIA.get(lid)
        api_name = api_deps.get(api_id, "?") if api_id else "?"
        status = "OK" if api_name and api_name.lower() == lname["descripcion"].lower() else "REVISAR"
        print(f"  LEGACY ID={lid:<3} {lname['descripcion'][:45]:<48} -> API ID={api_id} [{status}]")

    print(f"\n--- FIN DE VERIFICACIÃ“N ---")


if __name__ == "__main__":
    main()
