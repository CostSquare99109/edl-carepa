#!/usr/bin/env python3
"""
Sincroniza usuarios desde el sistema legacy hacia edl-carepa.

Actualiza:
  - denominacion_empleo (cargo)
  - dependencia_id

Modos:
  python scripts/sync_usuarios.py --modo=verificar
  python scripts/sync_usuarios.py --modo=generar-sql
  python scripts/sync_usuarios.py --modo=api --campos=cargo --confirmar
  python scripts/sync_usuarios.py --modo=api --campos=dependencia --confirmar
  python scripts/sync_usuarios.py --modo=api --campos=todo --confirmar
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.legacy_db import LegacyDB
from src.adapter import APIClient, LEGACY_TO_API_DEPENDENCIA


def nombre_completo(u: dict) -> str:
    return " ".join(filter(None, [
        u.get("primer_nombre", ""),
        u.get("segundo_nombre", ""),
        u.get("primer_apellido", ""),
        u.get("segundo_apellido", ""),
    ]))


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Sincronizar usuarios")
    parser.add_argument("--modo", choices=["verificar", "generar-sql", "api"], default="verificar")
    parser.add_argument("--campos", choices=["cargo", "dependencia", "todo"], default="todo")
    parser.add_argument("--confirmar", action="store_true", help="Ejecutar cambios (sin esto solo muestra preview)")
    args = parser.parse_args()

    legacy = LegacyDB()
    legacy.load()

    api = APIClient()
    api.login()

    usuarios = api.get_usuarios()
    api_deps = {d["id"]: d.get("nombre", "") for d in api.get_dependencias()}

    print(f"\nTotal usuarios en API: {len(usuarios)}\n")

    pendientes_cargo = []
    pendientes_dep = []

    for u in sorted(usuarios, key=lambda x: x["id"]):
        uid = u["id"]
        doc = str(u.get("documento", "") or "")
        nombre = nombre_completo(u)
        cargo_actual = (u.get("denominacion_empleo") or "").strip()
        dep_actual = u.get("dependencia_id")

        # --- CARGO ---
        if args.campos in ("cargo", "todo"):
            cargo_legacy = legacy.resolve_cargo(doc)
            if cargo_legacy and cargo_actual.upper() != cargo_legacy.upper():
                pendientes_cargo.append((uid, nombre, doc, cargo_actual, cargo_legacy))

        # --- DEPENDENCIA ---
        if args.campos in ("dependencia", "todo"):
            legacy_dep_id = legacy.resolve_dependencia_id(doc)
            if legacy_dep_id:
                api_dep_id = LEGACY_TO_API_DEPENDENCIA.get(legacy_dep_id)
                if api_dep_id and dep_actual != api_dep_id:
                    pendientes_dep.append((
                        uid, nombre, doc,
                        api_deps.get(dep_actual, f"ID={dep_actual}"),
                        api_deps.get(api_dep_id, f"ID={api_dep_id}"),
                        api_dep_id,
                    ))

    if args.modo == "verificar":
        print(f"=== USUARIOS CON CARGO DIFERENTE ({len(pendientes_cargo)}) ===")
        for uid, nombre, doc, actual, legacy_val in pendientes_cargo[:20]:
            print(f"  ID={uid:<4} {nombre[:32]:<35} Cargo actual: {actual[:30]:<32} -> Legacy: {legacy_val}")
        if len(pendientes_cargo) > 20:
            print(f"  ... y {len(pendientes_cargo) - 20} mÃ¡s")

        print(f"\n=== USUARIOS CON DEPENDENCIA DIFERENTE ({len(pendientes_dep)}) ===")
        for uid, nombre, doc, dep_act, dep_leg, _ in pendientes_dep[:20]:
            print(f"  ID={uid:<4} {nombre[:32]:<35} Dep actual: {dep_act[:35]:<38} -> Legacy: {dep_leg}")
        if len(pendientes_dep) > 20:
            print(f"  ... y {len(pendientes_dep) - 20} mÃ¡s")

    elif args.modo == "generar-sql":
        print("=== SQL UPDATE para cargos ===")
        for uid, nombre, doc, actual, legacy_val in pendientes_cargo:
            escaped = legacy_val.replace("'", "\\'")
            print(f"UPDATE `usuarios` SET `denominacion_empleo` = '{escaped}' WHERE `id` = {uid};")
        print("\n=== SQL UPDATE para dependencias ===")
        for uid, nombre, doc, dep_act, dep_leg, api_id in pendientes_dep:
            print(f"UPDATE `usuarios` SET `dependencia_id` = {api_id} WHERE `id` = {uid};")

    elif args.modo == "api":
        if args.campos in ("cargo", "todo") and pendientes_cargo:
            print(f"\n=== ACTUALIZANDO CARGO ({len(pendientes_cargo)} usuarios) ===")
            if not args.confirmar:
                print("  (preview - usa --confirmar para ejecutar)")
                for uid, nombre, doc, actual, legacy_val in pendientes_cargo:
                    print(f"  ID={uid:<4} {nombre[:28]:<30} -> {legacy_val}")
            else:
                ok = 0
                err = 0
                for uid, nombre, doc, actual, legacy_val in pendientes_cargo:
                    try:
                        resp = api.update_usuario(uid, {"denominacion_empleo": legacy_val})
                        if resp.get("code") == "01":
                            ok += 1
                        else:
                            print(f"  ERR ID={uid}: {resp.get('message', '')}")
                            err += 1
                    except Exception as e:
                        print(f"  ERR ID={uid}: {e}")
                        err += 1
                    time.sleep(0.3)
                print(f"  Cargos actualizados: {ok}, Errores: {err}")

        if args.campos in ("dependencia", "todo") and pendientes_dep:
            print(f"\n=== ACTUALIZANDO DEPENDENCIA ({len(pendientes_dep)} usuarios) ===")
            if not args.confirmar:
                print("  (preview - usa --confirmar para ejecutar)")
                for uid, nombre, doc, dep_act, dep_leg, api_id in pendientes_dep:
                    print(f"  ID={uid:<4} {nombre[:28]:<30} {dep_act[:30]:<32} -> {dep_leg}")
            else:
                ok = 0
                err = 0
                for uid, nombre, doc, dep_act, dep_leg, api_id in pendientes_dep:
                    try:
                        resp = api.update_usuario(uid, {"dependencia_id": api_id})
                        if resp.get("code") == "01":
                            ok += 1
                        else:
                            print(f"  ERR ID={uid}: {resp.get('message', '')}")
                            err += 1
                    except Exception as e:
                        print(f"  ERR ID={uid}: {e}")
                        err += 1
                    time.sleep(0.3)
                print(f"  Dependencias actualizadas: {ok}, Errores: {err}")


if __name__ == "__main__":
    import time
    main()
