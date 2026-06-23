#!/usr/bin/env python3
"""API test suite for EDL-CAREPA using urllib (no curl dependence)"""
import json, urllib.request, urllib.error, sys, time, os, subprocess, signal

BASE = 'http://localhost:8002'
pass_count = 0
fail_count = 0
token = None

def api(method, path, data=None, tok=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Origin', 'http://localhost:5173')
    if tok:
        req.add_header('Authorization', f'Bearer {tok}')
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return json.loads(body) if body else {'code': str(e.code), 'message': f'HTTP {e.code}'}
        except json.JSONDecodeError:
            return {'code': str(e.code), 'message': f'HTTP {e.code}: {body[:200]!r}'}
    except Exception as e:
        return {'code': 'NET', 'message': str(e)}

def test(label, method, path, data=None, expected='01'):
    global pass_count, fail_count, token
    resp = api(method, path, data, token)
    if isinstance(resp, list):
        code = '01'
        msg = f"{len(resp)} items"
    else:
        code = resp.get('code', '?')
        msg = resp.get('message', '')
    if code == expected:
        print(f"  [OK] {label}  [{msg}]" if msg else f"  [OK] {label}")
        pass_count += 1
    else:
        print(f"  [FAIL] {label}: got {code} - {msg}")
        fail_count += 1
    if expected == '01' and isinstance(resp, dict):
        d = resp.get('data')
        if isinstance(d, dict) and d.get('token'):
            token = d['token']
    return resp

# Start PHP server
php_dir = os.path.join(os.getcwd(), 'backend')
proc = subprocess.Popen(
    ['php', '-S', 'localhost:8002', '-t', 'public', 'public/router.php'],
    cwd=php_dir,
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    preexec_fn=os.setsid
)
time.sleep(3)

try:
    print("=== EDL-CAREPA API Tests (HTTP) ===\n")

    print("--- Auth ---")
    r = test('Login admin', 'POST', '/api/v1/auth/login', {'documento': 'admin', 'password': 'Admin2026!'})
    if not token:
        print("  ABORT: no token"); sys.exit(1)
    print(f"  Token: {token[:30]}...")

    print("\n--- Perfil & Menus ---")
    test('Perfil', 'GET', '/api/v1/auth/perfil')
    test('Menu', 'GET', '/api/v1/menu')
    test('Notificaciones', 'GET', '/api/v1/notificaciones?por_pagina=5')
    test('CSRF Token', 'GET', '/api/v1/auth/csrf')

    print("\n--- Dashboard ---")
    test('Dashboard resumen', 'GET', '/api/v1/dashboard/resumen')
    test('Dashboard admin stats', 'GET', '/api/v1/dashboard/admin-stats')
    test('Periodo activo', 'GET', '/api/v1/dashboard/periodo-activo')
    test('Actividad', 'GET', '/api/v1/dashboard/actividad?por_pagina=5')

    print("\n--- CRUD: Usuarios ---")
    test('Usuarios listar', 'GET', '/api/v1/usuarios?por_pagina=5')
    test('Usuario ver (id=1)', 'GET', '/api/v1/usuarios/1')

    print("\n--- CRUD: Dependencias/Entidades/Periodos ---")
    test('Dependencias listar', 'GET', '/api/v1/dependencias')
    test('Entidades listar', 'GET', '/api/v1/entidades')
    test('Entidad ver (id=1)', 'GET', '/api/v1/entidades/1')
    test('Periodos listar', 'GET', '/api/v1/periodos')
    test('Periodo ver (id=1)', 'GET', '/api/v1/periodos/1')

    print("\n--- CRUD: Metas/Competencias/Parametros ---")
    test('Metas listar', 'GET', '/api/v1/metas')
    test('Competencias listar', 'GET', '/api/v1/competencias')
    test('Decretos', 'GET', '/api/v1/competencias/decretos')
    test('Parametros listar', 'GET', '/api/v1/parametros')

    print("\n--- Evaluaciones ---")
    test('Evaluaciones listar', 'GET', '/api/v1/evaluaciones?por_pagina=5')
    test('Pendientes calificar', 'GET', '/api/v1/evaluaciones/pendientes-calificar')

    print("\n--- Compromisos ---")
    test('Compromisos listar', 'GET', '/api/v1/compromisos?por_pagina=5')
    test('Pendientes aprobacion', 'GET', '/api/v1/compromisos/pendientes')
    test('Propuestos evaluado (sin parametro)', 'GET', '/api/v1/compromisos/propuestos-evaluado', expected='02')
    test('Propuestos evaluado (con id)', 'GET', '/api/v1/compromisos/propuestos-evaluado?evaluacion_id=1')
    test('Buscar evaluado por doc', 'GET', '/api/v1/compromisos/buscar-evaluado?documento=1045678923')

    print("\n--- Concertaciones ---")
    test('Concertaciones listar', 'GET', '/api/v1/concertaciones?por_pagina=5')

    print("\n--- Evidencias/Ausentismos/Movilidades ---")
    test('Evidencias listar', 'GET', '/api/v1/evidencias?por_pagina=5')
    test('Ausentismos listar', 'GET', '/api/v1/ausentismos?por_pagina=5')
    test('Movilidades listar', 'GET', '/api/v1/movilidades?por_pagina=5')

    print("\n--- Mejoramiento & Cargas ---")
    test('Mejoramiento global', 'GET', '/api/v1/compromisos-mejoramiento')
    test('Cargas historial', 'GET', '/api/v1/cargas')

    print("\n--- Reportes ---")
    test('Resumen (periodo=1)', 'GET', '/api/v1/reportes/resumen?periodo_id=1')
    test('Funcionario (id=6)', 'GET', '/api/v1/reportes/funcionario/6')
    test('Compromisos', 'GET', '/api/v1/reportes/compromisos')

    print("\n--- Consulta funcionario ---")
    test('Por cedula (path)', 'GET', '/api/v1/consulta-funcionario/52987634')

    print("\n--- Logout ---")
    test('Logout', 'POST', '/api/v1/auth/logout')

    print(f"\n=== FINAL: {pass_count} OK, {fail_count} FAIL ===")
finally:
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)

sys.exit(1 if fail_count > 0 else 0)
