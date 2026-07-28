#!/usr/bin/env python3
"""Input validation edge cases for EDL-CAREPA API.

Requires backend on :8000. Tests focus on graceful error handling,
not specific error codes (since permissions vary by user).
"""
import json, urllib.request, urllib.error, sys, urllib.parse

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
            return {'code': 'HTTP_' + str(e.code), 'http_status': e.code}
    except Exception as e:
        return {'code': 'NET_ERR', 'message': str(e)}


def test(label, method, path, expected_codes=None, data=None, tok=None, headers_extra=None):
    """Test that response code is in expected_codes (default ['01','02','42','44','45'])."""
    global PASS, FAIL
    if expected_codes is None:
        expected_codes = ['01', '02', '42', '44', '45']
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


def get_csrf(tok):
    r = api('GET', '/auth/csrf', tok=tok)
    return r.get('data', {}).get('csrf_token', '') if r.get('code') == '01' else ''


# Setup
section("Setup")
r = api('POST', '/auth/login', {'documento': '1040353165', 'password': '12345678'})
TOKEN = r.get('data', {}).get('token', '') if r.get('code') == '01' else ''
if not TOKEN:
    print("  FATAL: No se pudo obtener token")
    sys.exit(1)
print(f"  Token: {TOKEN[:40]}...")

# ─── 1. PAGINATION ──────────────────────────────────────────────────
section("Pagination edge cases (must not crash)")

test('pagina negativa', 'GET', '/evaluaciones?pagina=-1&por_pagina=10', tok=TOKEN)
test('pagina cero', 'GET', '/evaluaciones?pagina=0&por_pagina=10', tok=TOKEN)
test('pagina enorme', 'GET', '/evaluaciones?pagina=9999&por_pagina=10', tok=TOKEN)
test('por_pagina negativo', 'GET', '/evaluaciones?por_pagina=-5', tok=TOKEN)
test('por_pagina cero', 'GET', '/evaluaciones?por_pagina=0', tok=TOKEN)
test('por_pagina enorme', 'GET', '/evaluaciones?por_pagina=10000', tok=TOKEN)
test('por_pagina string', 'GET', '/evaluaciones?por_pagina=abc', tok=TOKEN)
test('sin paginacion', 'GET', '/evaluaciones', tok=TOKEN)
test('perfil (always works)', 'GET', '/auth/perfil', expected_codes=['01'], tok=TOKEN)

# ─── 2. MISSING FIELDS ─────────────────────────────────────────────
section("Validation: missing required fields")

csrf = get_csrf(TOKEN)
test('Crear dependencia sin nombre', 'POST', '/dependencias',
     data={'codigo': 'TEST'}, tok=TOKEN, headers_extra={'X-CSRF-Token': csrf or 'x'})

csrf = get_csrf(TOKEN)
test('Crear dependencia body vacio', 'POST', '/dependencias',
     data={}, tok=TOKEN, headers_extra={'X-CSRF-Token': csrf or 'x'})

# ─── 3. TYPE MISMATCH ──────────────────────────────────────────────
section("Validation: type mismatch (ID not found)")

test('Usuario path ID string', 'GET', '/usuarios/abc', tok=TOKEN)
test('Entidad ID -1', 'GET', '/entidades/-1', tok=TOKEN)
test('Periodo ID 99999', 'GET', '/periodos/99999', tok=TOKEN)

# ─── 4. STRING BOUNDARIES ──────────────────────────────────────────
section("Validation: string boundaries")

test('Busqueda 10k chars', 'GET', '/evaluaciones/buscar-evaluado?q=' + 'A' * 10000, tok=TOKEN)
acentos = 'áéíóúñÑüÜ'
test('Busqueda acentos', 'GET', '/evaluaciones/buscar-evaluado?q=' + urllib.parse.quote(acentos), tok=TOKEN)
test('Busqueda solo espacios', 'GET', '/evaluaciones/buscar-evaluado?q=' + urllib.parse.quote('   '), tok=TOKEN)
test('Busqueda string vacio', 'GET', '/evaluaciones/buscar-evaluado?q=', tok=TOKEN)
test('Busqueda unicode emoji', 'GET', '/evaluaciones/buscar-evaluado?q=%F0%9F%98%80', tok=TOKEN)

# ─── 5. CHANGE ROLE ────────────────────────────────────────────────
section("Validation: cambiar rol")

csrf = get_csrf(TOKEN)
test('Cambiar rol sin codigo', 'PUT', '/auth/rol',
     expected_codes=['02', '42'],
     data={}, tok=TOKEN, headers_extra={'X-CSRF-Token': csrf or 'x'})

csrf = get_csrf(TOKEN)
test('Cambiar rol codigo invalido', 'PUT', '/auth/rol',
     expected_codes=['02', '42'],
     data={'rol_codigo': 'rol_inexistente'}, tok=TOKEN,
     headers_extra={'X-CSRF-Token': csrf or 'x'})

# ─── 6. INVALID BODY ───────────────────────────────────────────────
section("Validation: invalid body types (with CSRF)")

csrf = get_csrf(TOKEN)
test('Body string en vez de JSON', 'POST', '/dependencias',
     data="string", tok=TOKEN, headers_extra={'X-CSRF-Token': csrf or 'x'})

csrf = get_csrf(TOKEN)
test('Body numero en vez de JSON', 'POST', '/dependencias',
     data=42, tok=TOKEN, headers_extra={'X-CSRF-Token': csrf or 'x'})

# ─── SUMMARY ────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"VALIDATION TESTS: {PASS} OK, {FAIL} FAIL")
sys.exit(1 if FAIL > 0 else 0)
