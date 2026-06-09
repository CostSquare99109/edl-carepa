#!/usr/bin/env python3
import json, urllib.request, urllib.error, sys

BASE = "http://localhost:8000/api/v1"

def req(method, path, data=None, token=None):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read())
        except:
            return {"code": str(e.code), "message": e.reason}
    except Exception as e:
        return {"code": "ERR", "message": str(e)}

# 1. Login
print("=" * 60)
print("1. LOGIN")
login = req("POST", "/auth/login", {"documento": "1234567890", "password": "Admin2026!"})
token = login.get("data", {}).get("token", "") if login.get("data") else ""
print(f"   code={login.get('code')} msg={login.get('message','')[:40]} token_len={len(token)}")

if not token:
    print("   FATAL: No se pudo obtener token. Abortando.")
    sys.exit(1)

# 2. Test all GET endpoints
endpoints = [
    ("/auth/perfil", "Perfil usuario"),
    ("/dashboard/resumen", "Dashboard resumen"),
    ("/dashboard/admin-stats", "Admin stats"),
    ("/dashboard/actividad?por_pagina=5", "Actividad reciente"),
    ("/usuarios?por_pagina=5", "Usuarios"),
    ("/entidades?por_pagina=5", "Entidades"),
    ("/dependencias?por_pagina=5", "Dependencias"),
    ("/periodos?por_pagina=5", "Periodos"),
    ("/metas?por_pagina=5", "Metas"),
    ("/concertaciones?por_pagina=5", "Concertaciones"),
    ("/evaluaciones?por_pagina=5", "Evaluaciones"),
    ("/compromisos?por_pagina=5", "Compromisos"),
    ("/compromisos/pendientes?por_pagina=5", "Compromisos pendientes"),
    ("/compromisos/competencias-comportamentales", "Competencias compor."),
    ("/compromisos-mejoramiento?por_pagina=5", "Mejoramiento"),
    ("/evidencias?por_pagina=5", "Evidencias"),
    ("/ausentismos?por_pagina=5", "Ausentismos"),
    ("/movilidades?por_pagina=5", "Movilidades"),
    ("/parametros?por_pagina=5", "Parametros"),
    ("/notificaciones?por_pagina=5", "Notificaciones"),
    ("/menu", "Menu"),
    ("/cargas?por_pagina=5", "Cargas historial"),
    ("/competencias", "Competencias"),
    ("/consulta-funcionario/1234567890", "Consulta publica"),
]

print()
print("=" * 60)
print("2. ENDPOINTS GET (protegidos)")
passed = 0
failed = 0
errors = []
for path, label in endpoints:
    result = req("GET", path, token=token)
    code = result.get("code", "?")
    msg = result.get("message", "")[:50]
    data_info = ""
    if result.get("data"):
        d = result["data"]
        if isinstance(d, list):
            data_info = f"[{len(d)} items]"
        elif isinstance(d, dict):
            if "data" in d and isinstance(d["data"], list):
                data_info = f"[{len(d['data'])} items] total={d.get('total','?')}"
            else:
                keys = list(d.keys())[:4]
                data_info = f"dict({','.join(keys)})"
    status = "OK" if code == "01" or (isinstance(code, int) and code < 300) else "FAIL"
    if code == "01":
        passed += 1
    else:
        failed += 1
        errors.append(f"{label}: {msg}")
    print(f"   {status:4s} | {label:25s} | code={code} | {msg} | {data_info}")

print()
print(f"   PASSED: {passed}/{passed+failed}  FAILED: {failed}")

# 3. Test POST endpoints
print()
print("=" * 60)
print("3. ENDPOINTS POST (creacion)")

# Test crear dependencia
dep_result = req("POST", "/dependencias", {"codigo": "TEST-01", "nombre": "Dependencia Test", "estado": "activa"}, token=token)
print(f"   Crear dependencia: code={dep_result.get('code')} msg={dep_result.get('message','')[:50]}")
dep_id = dep_result.get("data", {}).get("id") if isinstance(dep_result.get("data"), dict) else None

# Test crear periodo
per_result = req("POST", "/periodos", {"nombre": "2026-Test", "fecha_inicio": "2026-01-01", "fecha_fin": "2026-12-31", "estado": "activa"}, token=token)
print(f"   Crear periodo: code={per_result.get('code')} msg={per_result.get('message','')[:50]}")

# 4. Test PUT endpoints
print()
print("=" * 60)
print("4. ENDPOINTS PUT")

if dep_id:
    upd = req("PUT", f"/dependencias/{dep_id}", {"estado": "inactiva"}, token=token)
    print(f"   Toggle dependencia {dep_id}: code={upd.get('code')} msg={upd.get('message','')[:50]}")
else:
    print(f"   Toggle dependencia: SKIPPED (no dep_id)")

# Test cambiar password (with wrong old password - should fail gracefully)
pwd_result = req("PUT", "/auth/password", {"password_actual": "wrong", "password_nueva": "NewPass123"}, token=token)
print(f"   Cambiar password (wrong old): code={pwd_result.get('code')} msg={pwd_result.get('message','')[:50]}")

# 5. Test consulta publica (sin token)
print()
print("=" * 60)
print("5. CONSULTA PUBLICA (sin auth)")
pub = req("GET", "/consulta-funcionario/1234567890")
print(f"   Consulta publica: code={pub.get('code')} msg={pub.get('message','')[:50]}")
if pub.get("data"):
    d = pub["data"]
    print(f"   Nombre: {d.get('nombres','')} {d.get('apellidos','')}")
    print(f"   Cargo: {d.get('cargo','')}")
    print(f"   Estado: {d.get('estado','')}")

# 6. Test auth edge cases
print()
print("=" * 60)
print("6. AUTH EDGE CASES")
bad_login = req("POST", "/auth/login", {"documento": "1234567890", "password": "wrongpassword"})
print(f"   Login wrong password: code={bad_login.get('code')} msg={bad_login.get('message','')[:50]}")

noexist_login = req("POST", "/auth/login", {"documento": "9999999999", "password": "anything"})
print(f"   Login nonexistent user: code={noexist_login.get('code')} msg={noexist_login.get('message','')[:50]}")

# 7. Error summary
print()
print("=" * 60)
if errors:
    print("ERRORES DETECTADOS:")
    for e in errors:
        print(f"   - {e}")
else:
    print("SIN ERRORES - TODOS LOS ENDPOINTS PASARON")

print()
print("=" * 60)
print("RESUMEN FINAL")
print(f"   GET endpoints: {passed}/{passed+failed} OK")
print(f"   POST/PUT: ver resultados arriba")
