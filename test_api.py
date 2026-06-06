import urllib.request
import json

BASE = 'http://localhost:8000/api/v1'

def post(path, data, headers=None):
    h = {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode()
    req = urllib.request.Request(f'{BASE}{path}', data=body, headers=h, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def get(path, token=None):
    h = {}
    if token:
        h['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{BASE}{path}', headers=h)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def put(path, data, token=None):
    h = {'Content-Type': 'application/json'}
    if token:
        h['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode()
    req = urllib.request.Request(f'{BASE}{path}', data=body, headers=h, method='PUT')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

print("=== TEST 1: Login con tipo_documento ===")
r = post('/auth/login', {'documento': '1234567890', 'tipo_documento': 'CC', 'password': 'Admin2026!'})
token = r.get('data', {}).get('token', '')
has_debe = 'debe_cambiar_password' in r.get('data', {})
print(f"  code={r.get('code')}, token_len={len(token)}, debe_cambiar_removed={not has_debe}")

print("\n=== TEST 2: Login sin tipo_documento (debe fallar) ===")
r2 = post('/auth/login', {'documento': '1234567890', 'password': 'Admin2026!'})
print(f"  code={r2.get('code')}, msg={r2.get('message', '')[:60]}")

print("\n=== TEST 3: Competencias ===")
r3 = get('/competencias', token)
comp_data = r3.get('data') or []
print(f"  count={len(comp_data)}, first={comp_data[0]['nombre'] if comp_data else 'none'}")

print("\n=== TEST 4: Decretos ===")
r4 = get('/competencias/decretos', token)
dec_data = r4.get('data') or []
print(f"  decretos={dec_data}")

print("\n=== TEST 5: Competencias por decreto ===")
r5 = get('/competencias?decreto=815/2018', token)
comp_dec = r5.get('data') or []
print(f"  count={len(comp_dec)}")

print("\n=== TEST 6: Perfil ===")
r6 = get('/auth/perfil', token)
nombre = r6.get('data', {}).get('usuario', {}).get('nombre_completo', '')
print(f"  nombre_completo='{nombre}'")

print("\n=== TEST 7: Menu ===")
r7 = get('/menu', token)
menu_items = r7.get('data') or []
print(f"  items={len(menu_items)}")
for item in menu_items[:5]:
    print(f"    - {item.get('label')} ({item.get('icon')})")

print("\n=== TEST 8: Entidades ===")
r8 = get('/entidades', token)
ent_data = r8.get('data') or []
if isinstance(ent_data, dict):
    ent_data = ent_data.get('data') or []
print(f"  count={len(ent_data)}")

print("\n=== TEST 9: Periodos ===")
r9 = get('/periodos', token)
per_data = r9.get('data') or []
if isinstance(per_data, dict):
    per_data = per_data.get('data') or []
print(f"  count={len(per_data)}")

print("\n=== TEST 10: Cambiar rol ===")
r10 = put('/auth/rol', {'rol_codigo': 'admin'}, token)
print(f"  code={r10.get('code')}, rol={r10.get('data', {}).get('rol_activo', '')}")

print("\n=== ALL TESTS COMPLETE ===")
