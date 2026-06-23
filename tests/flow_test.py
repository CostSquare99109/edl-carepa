#!/usr/bin/env python3
"""Flujo completo: concertación → compromisos → evaluación → calificación"""
import json, urllib.request, time, sys

BASE = 'http://localhost:8000'
API = BASE + '/api/v1'

def api(method, path, data=None, tok=None):
    url = API + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if tok:
        req.add_header('Authorization', f'Bearer {tok}')
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try: return json.loads(e.read())
        except: return {'code': str(e.code), 'message': str(e)}
    except Exception as e:
        return {'code': 'NET', 'message': str(e)}

def login(doc, pw):
    r = api('POST', '/auth/login', {'documento': doc, 'password': pw})
    if r.get('code') == '01':
        return r['data']['token']
    raise SystemExit(f"Login fail: {r.get('message')}")

def ok(r, step):
    if r.get('code') != '01':
        print(f"  [FAIL] {step}: {r.get('message','?')}")
        sys.exit(1)
    print(f"  [OK] {step}")

print("=== Flujo completo concertación → compromisos → evaluación → calificación ===\n")

# 1. Login as evaluador (Maria, ID=2)
print("--- 1. Login evaluador ---")
maria_token = login('52987634', 'Eval2026!')
print("  Maria token OK")

# 2. Crear concertación
print("\n--- 2. Crear concertación ---")
r = api('POST', '/concertaciones', {
    'periodo_id': 1,
    'evaluado_id': 6,
}, maria_token)
ok(r, 'Crear concertacion')
concertacion_id = r['data']['id']
print(f"  Concertacion ID: {concertacion_id}")

# 3. Agregar compromisos funcionales (3 items, sum=100)
print("\n--- 3. Compromisos funcionales ---")
func_items = [
    ('Entregar informes mensuales de gestion', 40),
    ('Atender PQRS en menos de 10 dias', 35),
    ('Capacitar al personal en nuevas herramientas', 25),
]
for desc, peso in func_items:
    r = api('POST', '/compromisos/funcional', {
        'evaluacion_id': 1,
        'descripcion': desc,
        'peso': peso,
    }, maria_token)
    ok(r, f'Funcional: {desc[:30]}... peso={peso}')

# 4. Agregar compromisos comportamentales (3 competencias)
print("\n--- 4. Compromisos comportamentales ---")
r = api('POST', '/compromisos/comportamental', {
    'evaluacion_id': 1,
    'competencias': [
        {'competencia_codigo': 'TRB_EQP', 'es_propuesto_jefe': 1},
        {'competencia_codigo': 'ORI_RES', 'es_propuesto_jefe': 1},
        {'competencia_codigo': 'CMP_ORG', 'es_propuesto_jefe': 0},
    ],
}, maria_token)
ok(r, 'Comportamentales')

# 5. Confirmar concertación
print("\n--- 5. Confirmar concertación ---")
r = api('PUT', '/compromisos/confirmar-concertacion/1', {}, maria_token)
ok(r, 'Confirmar concertacion')

# 6. Login as evaluado (Juan, ID=6)
print("\n--- 6. Login evaluado ---")
juan_token = login('1045678923', 'Func2026!')
print("  Juan token OK")

# 7. Aceptar concertación como evaluado
print("\n--- 7. Aceptar concertación ---")
r = api('PUT', '/evaluaciones/1/aceptar-concertacion', {}, juan_token)
ok(r, 'Aceptar concertacion evaluado')

# 8. Login as evaluador again (needs fresh token after state change)
print("\n--- 8. Re-login evaluador ---")
maria_token = login('52987634', 'Eval2026!')

# 9. Calificar compromisos
print("\n--- 9. Calificar compromisos ---")
# Get compromisos IDs
r = api('GET', '/compromisos/evaluacion/1', {}, maria_token)
if r.get('code') != '01':
    print(f"  [FAIL] Get compromisos: {r.get('message','?')}")
    sys.exit(1)
comps = r['data']
if isinstance(comps, list):
    compromisos = comps
elif isinstance(comps, dict):
    compromisos = comps.get('funcional', []) + comps.get('comportamentales', [])
else:
    compromisos = []
print(f"  {len(compromisos)} compromisos encontrados")

for c in compromisos:
    cid = c.get('id', c.get('compromiso_id'))
    r = api('PUT', f'/compromisos/{cid}/calificar', {
        'puntaje': 85 if c.get('tipo') == 'funcional' else 90,
        'observaciones': 'Cumplio satisfactoriamente',
    }, maria_token)
    ok(r, f'Calificar compromiso {cid}')

# 10. Verificar estado final
print("\n--- 10. Verificar estado final ---")
r = api('GET', '/evaluaciones/1', {}, maria_token)
if r.get('code') == '01':
    ev = r['data']
    print(f"  Evaluacion: estado={ev.get('estado')}, fecha_concertacion={ev.get('fecha_concertacion')}")
else:
    print(f"  [WARN] Verificar evaluacion: {r.get('message','?')}")

r = api('GET', f'/concertaciones/{concertacion_id}', {}, maria_token)
if r.get('code') == '01':
    co = r['data']
    print(f"  Concertacion: estado={co.get('estado')}")
else:
    print(f"  [WARN] Verificar concertacion: {r.get('message','?')}")

r = api('GET', '/compromisos/evaluacion/1', {}, maria_token)
if r.get('code') == '01':
    comps = r['data']
    total = len(comps) if isinstance(comps, list) else 0
    if isinstance(comps, dict):
        total = len(comps.get('funcional', [])) + len(comps.get('comportamentales', []))
    print(f"  Compromisos: {total} total")

print("\n=== FLOW COMPLETED SUCCESSFULLY ===")
