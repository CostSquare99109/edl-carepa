#!/usr/bin/env python3
"""
Sincroniza dependencias del sistema legacy hacia edl-carepa.

Modos de uso:
  python scripts/sync_dependencias.py --modo=verificar   # SÃ³lo compara
  python scripts/sync_dependencias.py --modo=generar-sql # Genera INSERT SQL
  python scripts/sync_dependencias.py --modo=sincronizar # Actualiza vÃ­a API
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.legacy_db import LegacyDB
from src.adapter import LEGACY_TO_API_DEPENDENCIA, APIClient, generar_sql_insert_dependencia


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Sincronizar dependencias")
    parser.add_argument("--modo", choices=["verificar", "generar-sql", "sincronizar"], default="verificar")
    args = parser.parse_args()

    legacy = LegacyDB()
    legacy.load()

    api = APIClient()
    api.login()

    api_deps = {d["id"]: d for d in api.get_dependencias()}

    print("=== COMPARACIÃ“N DEPENDENCIAS LEGACY vs API ===\n")
    legacy_ids_usadas = set()

    for f in legacy.get_all_funcionarios():
        cedula = str(f["cedula"])
        dep_id = legacy.resolve_dependencia_id(cedula)
        if dep_id:
            legacy_ids_usadas.add(dep_id)

    # Ignorar dependencias no usadas (ej. IDs sin funcionarios activos)
    legacy_ids_con_datos = sorted(legacy_ids_usadas)

    for lid in sorted(legacy.dependencias.keys()):
        ldep = legacy.dependencias[lid]
        api_id = LEGACY_TO_API_DEPENDENCIA.get(lid)
        api_dep = api_deps.get(api_id) if api_id else None

        usada = "USADA" if lid in legacy_ids_con_datos else "SIN USO"
        if api_dep:
            match = "OK" if api_dep["nombre"].strip().lower() == ldep["descripcion"].strip().lower() else "DIFERENTE"
        else:
            match = "NO EXISTE EN API"

        print(f"  LEGACY ID={lid:<3} {ldep['descripcion'][:50]:<52} -> API ID={api_id} [{match}] {usada}")

    if args.modo == "generar-sql":
        print("\n=== SQL INSERT para dependencias faltantes ===")
        for lid, ldep in sorted(legacy.dependencias.items()):
            api_id = LEGACY_TO_API_DEPENDENCIA.get(lid)
            if api_id and api_id not in api_deps:
                print(generar_sql_insert_dependencia(ldep, api_id))

    if args.modo == "sincronizar":
        print("\n=== SINCRONIZANDO... ===")
        print("(no implementado - usa generar-sql o sync_usuarios.py)")


if __name__ == "__main__":
    main()
