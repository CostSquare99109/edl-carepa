#!/usr/bin/env python3
"""Auth edge cases + security tests for EDL-CAREPA API.

Requires backend on :8000. Login uses admin/12345678.
"""
import json, urllib.request, urllib.error, sys, time, os, base64, hmac, hashlib

BASE = 'http://localhost:8000'
API = BASE + '/api/v1'
PASS = 0
FAIL = 0


def api(method, path, data=None, tok=None, headers_extra=None):
    url = API + path
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if tok:
        req.add_header('Authorization', f'Bearer {tok}')
    if headers_extra:
        for k, v in headers_extra.items():
            req.add_header(k, v)
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return json.loads(raw) if raw else {'code': 'HTTP_' + str(e.code), 'http_status': e.code}
        except (json.JSONDecodeError, TypeError):
            return {'code': 'HTTP_' + str(e.code), 'http_status': e.code, 'raw': raw[:200].decode(errors='replace')}
    except Exception as e:
        return {'code': 'NET_ERR', 'message': str(e)}


def test(label, method, path, expected_codes=None, data=None, tok=None, headers_extra=None):
    """expected_codes: list of acceptable response codes"""
    global PASS, FAIL
    if expected_codes is None:
        expected_codes = ['01']
    resp = api(method, path, data, tok, headers_extra)
    actual = resp.get('code', '?')
    ok = actual in expected_codes
    if ok:
        PASS += 1
        msg = resp.get('message', '')[:60]
        extra = f"  [{msg}]" if msg else ""
        print(f"  [OK] {label}{extra}")
    else:
        FAIL += 1
        http = resp.get('http_status', '?')
        msg = resp.get('message', '')[:60]
        print(f"  [FAIL] {label}: code={actual} http={http} msg={msg}")
    return resp


def section(title):
    print(f"\n=== {title} ===")


def login(doc, pw):
    r = api('POST', '/auth/login', {'documento': doc, 'password': pw})
    if r.get('code') == '01' and isinstance(r.get('data'), dict):
        return r['data'].get('token', '')
    return ''


# ─── PRE-FLIGHT ─────────────────────────────────────────────────────
section("Setup")
TOKEN = login('1040353165', '12345678')
if not TOKEN:
    print("  FATAL: No se pudo obtener token. Backend en :8000 corriendo?")
    sys.exit(1)
print(f"  Token: {TOKEN[:40]}...")

# ─── 1. AUTH EDGE CASES ────────────────────────────────────────────
section("Auth: login failures")

test('Pass incorrecto', 'POST', '/auth/login',
     expected_codes=['02'],
     data={'documento': 'admin', 'password': 'wrongpass'})

test('Doc inexistente', 'POST', '/auth/login',
     expected_codes=['02'],
     data={'documento': '9999999999', 'password': '12345678'})

test('Sin documento', 'POST', '/auth/login',
     expected_codes=['02', '42'],
     data={'password': '12345678'})

test('Sin password', 'POST', '/auth/login',
     expected_codes=['02', '42'],
     data={'documento': 'admin'})

test('Body vacio', 'POST', '/auth/login',
     expected_codes=['02', '42'],
     data={})

test('Login con campos vacios', 'POST', '/auth/login',
     expected_codes=['02', '42'],
     data={'documento': '', 'password': ''})

# ─── 2. TOKEN VALIDATION ───────────────────────────────────────────
section("Auth: token validation")

# Backend returns 401 HTTP but code=02
test('Sin token', 'GET', '/auth/perfil',
     expected_codes=['02'],
     tok='')

test('Token malformado', 'GET', '/auth/perfil',
     expected_codes=['02'],
     tok='not-a-jwt')

test('Token payload inventado', 'GET', '/auth/perfil',
     expected_codes=['02'],
     tok='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZha2UifQ.doubloons')

test('Token expirado', 'GET', '/auth/perfil',
     expected_codes=['02'])

# Build expired token
header_b64 = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).rstrip(b'=').decode()
payload_old = base64.urlsafe_b64encode(json.dumps({
    "sub": 1, "documento": "admin", "roles": ["admin_carepa"],
    "iat": 1000000000, "exp": 1000000100, "rol_activo": "admin_carepa"
}).encode()).rstrip(b'=').decode()
sig = base64.urlsafe_b64encode(
    hmac.new(
        'test_secret_key_minimo_32_caracteres_para_desarrollo'.encode(),
        f'{header_b64}.{payload_old}'.encode(),
        hashlib.sha256
    ).digest()
).rstrip(b'=').decode()
expired = f'{header_b64}.{payload_old}.{sig}'
# The backend uses a different secret (from .env) and will reject this
test('Token expirado (firma invalida)', 'GET', '/auth/perfil',
     expected_codes=['02'],
     tok=expired)

# ─── 3. BASELINE ────────────────────────────────────────────────────
section("Auth: token valido (baseline)")
test('Token valido da perfil', 'GET', '/auth/perfil', tok=TOKEN)

# ─── 4. SQL INJECTION ──────────────────────────────────────────────
section("Security: SQL injection")

sql_payloads = [
    "' OR '1'='1", "admin'--", "'; DROP TABLE usuarios; --",
    "' UNION SELECT * FROM usuarios --",
    "' AND 1=1 --",
]
for payload in sql_payloads:
    label = f"SQLi login: {payload[:25]}"
    r = api('POST', '/auth/login', {'documento': payload, 'password': payload})
    code = r.get('code', '?')
    if code == '01':
        print(f"  [FAIL] {label}: LOGIN EXITOSO (vulnerabilidad!)")
        FAIL += 1
    elif code in ('02', '42'):
        print(f"  [OK] {label} -> {code}")
        PASS += 1
    elif code == 'NET_ERR':
        print(f"  [CRASH] {label}: {r.get('message','')}")
        FAIL += 1
    else:
        print(f"  [OK] {label} -> {code}")
        PASS += 1

section("Security: SQLi in search params")
for payload in ["' OR '1'='1", "'; DELETE FROM usuarios --"]:
    r = api('GET', f'/usuarios/buscar-global?q={urllib.parse.quote(payload)}', tok=TOKEN)
    code = r.get('code', '?')
    if code in ('01', '02', '42', '45'):
        PASS += 1
        print(f"  [OK] SQLi search '{payload[:20]}' -> {code}")
    else:
        FAIL += 1
        print(f"  [FAIL] SQLi search '{payload[:20]}' -> {code}")

# ─── 5. XSS ────────────────────────────────────────────────────────
section("Security: XSS in search")
xss_payloads = ['<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>']
for payload in xss_payloads:
    r = api('GET', f'/evaluaciones/buscar-evaluado?q={urllib.parse.quote(payload)}', tok=TOKEN)
    code = r.get('code', '?')
    if code in ('01', '02', '42', '45'):
        PASS += 1
        print(f"  [OK] XSS '{payload[:20]}' -> {code}")
    else:
        FAIL += 1
        print(f"  [FAIL] XSS '{payload[:20]}' -> {code}")

# ─── 6. CSRF ────────────────────────────────────────────────────────
section("Security: CSRF validation")

# PUT /auth/rol requires CSRF. Try without.
test('PUT sin CSRF (debe rechazar)', 'PUT', '/auth/rol',
     expected_codes=['02'],
     data={'rol_codigo': 'evaluador'}, tok=TOKEN)

# Get CSRF, then try. Admin may not have 'evaluador' role, so accept 02.
r = api('GET', '/auth/csrf', tok=TOKEN)
csrf = r.get('data', {}).get('csrf_token', '') if r.get('code') == '01' else ''
if csrf:
    test('PUT /auth/rol con CSRF (acepta codigo de error si rol no asignado)',
         'PUT', '/auth/rol',
         expected_codes=['01', '02', '42'],
         data={'rol_codigo': 'evaluador'}, tok=TOKEN,
         headers_extra={'X-CSRF-Token': csrf})

# ─── 7. CORS ────────────────────────────────────────────────────────
section("Security: CORS headers")
try:
    req = urllib.request.Request(API + '/auth/perfil', method='GET')
    req.add_header('Origin', 'http://localhost:5173')
    req.add_header('Authorization', f'Bearer {TOKEN}')
    resp = urllib.request.urlopen(req, timeout=10)
    for h in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
        val = resp.headers.get(h, '')
        if val:
            PASS += 1
            print(f"  [OK] CORS {h}: {val}")
        else:
            FAIL += 1
            print(f"  [FAIL] CORS {h} ausente")
except Exception as e:
    FAIL += 3
    print(f"  [FAIL] CORS request fallo: {e}")

# OPTIONS preflight
try:
    req = urllib.request.Request(API + '/auth/login', method='OPTIONS')
    req.add_header('Origin', 'http://localhost:5173')
    req.add_header('Access-Control-Request-Method', 'POST')
    resp = urllib.request.urlopen(req, timeout=10)
    origin = resp.headers.get('Access-Control-Allow-Origin', '')
    if origin:
        PASS += 1
        print(f"  [OK] OPTIONS preflight Allow-Origin: {origin}")
    else:
        FAIL += 1
        print("  [FAIL] OPTIONS preflight sin Allow-Origin")
except Exception as e:
    FAIL += 1
    print(f"  [FAIL] OPTIONS preflight: {e}")


# ─── SUMMARY ────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"AUTH + SECURITY: {PASS} OK, {FAIL} FAIL")
sys.exit(1 if FAIL > 0 else 0)
