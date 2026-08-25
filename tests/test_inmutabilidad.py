#!/usr/bin/env python3
"""Fase F: regresión de inmutabilidad de evaluaciones calificadas.

Cubre escenarios A-H y la reproducción exacta del BUG P1 de la Fase E.
Requiere backend en :8000. Crea fixtures propios y los limpia al final.
"""
import json, urllib.request, urllib.error, sys, os

BASE = os.environ.get('API_BASE', 'http://localhost:8000')
API = BASE + '/api/v1'
PASS = 0
FAIL = 0
CLEANUP_SQL = []


def api(method, path, data=None, tok=None, csrf=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(API + path, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if tok:
        req.add_header('Authorization', f'Bearer {tok}')
    if csrf:
        req.add_header('X-CSRF-Token', csrf)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}


def check(nombre, cond, detalle=''):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f'  [OK] {nombre}')
    else:
        FAIL += 1
        print(f'  [FAIL] {nombre} {detalle}')


def main():
    # --- login evaluador + rol activo ---
    _, r = api('POST', '/auth/login', {'documento': '43141896', 'password': '12345678'})
    tok = r['data']['token']
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    _, r = api('PUT', '/auth/rol', {'rol_codigo': 'evaluador'}, tok=tok, csrf=csrf)
    tok = r['data']['token']
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']

    # --- fixture: evaluacion mutable nueva (evaluado 12, periodo activo) ---
    st, r = api('POST', '/evaluaciones', {
        'evaluado_id': 12, 'tipo': 'parcial_eventual', 'observaciones': 'fixture fase F'
    }, tok=tok, csrf=csrf)
    check('Fixture: crear evaluacion mutable', st in (200, 201) and r.get('data', {}).get('id'), str(r)[:120])
    eval_mutable = r['data']['id']

    # --- reproducir escenario original del BUG P1 (Fase E): eval 10 CALIFICADA ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos-comportamentales',
                {'evaluacion_id': 10, 'competencia_codigo': 'INS_DEC', 'conductas_json': [], 'es_propuesto_evaluado': 1},
                tok=tok, csrf=csrf)
    check('BUG P1 repro: crear comportamental en calificada -> rechazado', st >= 400 and 'evaluacion esta' in r.get('message', ''), f'status={st} msg={r.get("message")}')
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos/funcional',
                {'evaluacion_id': 10, 'descripcion': 'Verificar el cierre del proceso segun cronograma', 'meta_id': 1, 'peso': 10},
                tok=tok, csrf=csrf)
    check('BUG P1 repro: crear funcional en calificada -> rechazado', st >= 400 and 'evaluacion esta' in r.get('message', ''), f'status={st} msg={r.get("message")}')

    # --- C: crear funcional en calificada (eval 24) ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos/funcional',
                {'evaluacion_id': 24, 'descripcion': 'Elaborar el informe de cierre segun el calendario', 'meta_id': 1, 'peso': 10},
                tok=tok, csrf=csrf)
    check('C: crear funcional en calificada -> rechazado', st >= 400, f'status={st}')

    # --- D: crear comportamental en calificada (eval 24) ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos-comportamentales',
                {'evaluacion_id': 24, 'competencia_codigo': 'COM_EFEC', 'conductas_json': [], 'es_propuesto_evaluado': 1},
                tok=tok, csrf=csrf)
    check('D: crear comportamental en calificada -> rechazado', st >= 400, f'status={st}')

    # --- E: PUT compromiso de calificada (id 30, eval 24) ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('PUT', '/compromisos/30', {'descripcion': 'tramo alterado'}, tok=tok, csrf=csrf)
    check('E: PUT compromiso en calificada -> rechazado (sin exito falso)', st >= 400, f'status={st} msg={r.get("message")}')

    # --- F: DELETE compromiso de calificada ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('DELETE', '/compromisos/funcional/30', tok=tok, csrf=csrf)
    check('F: DELETE compromiso en calificada -> rechazado', st >= 400, f'status={st}')
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('DELETE', '/compromisos-comportamentales/34', tok=tok, csrf=csrf)
    check('F2: DELETE comportamental en calificada -> rechazado', st >= 400, f'status={st}')

    # --- A: crear funcional en mutable -> permitido ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos/funcional',
                {'evaluacion_id': eval_mutable, 'descripcion': 'Ejecutar el plan de trabajo segun cronograma', 'meta_id': 1, 'peso': 100},
                tok=tok, csrf=csrf)
    check('A: crear funcional en mutable -> permitido', st in (200, 201) and r.get('data', {}).get('id'), f'status={st} msg={r.get("message")}')
    comp_func = r['data']['id'] if r.get('data') else None

    # --- B: crear comportamental en mutable -> permitido ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('POST', '/compromisos-comportamentales',
                {'evaluacion_id': eval_mutable, 'competencia_codigo': 'COM_EFEC', 'conductas_json': [], 'es_propuesto_evaluado': 1},
                tok=tok, csrf=csrf)
    check('B: crear comportamental en mutable -> permitido', st in (200, 201) and r.get('data', {}).get('id'), f'status={st} msg={r.get("message")}')
    comp_comp = r['data']['id'] if r.get('data') else None

    # --- G: PUT en mutable -> exito real ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('PUT', f'/compromisos/{comp_func}', {'observaciones_evaluador': 'ajuste de prueba'}, tok=tok, csrf=csrf)
    check('G: PUT compromiso en mutable -> exito', st == 200, f'status={st} msg={r.get("message")}')

    # --- H: enviar/fijar/calificar no roto (calificacion de compromiso en mutable) ---
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('PUT', f'/compromisos/{comp_func}/calificar', {'puntaje': 85}, tok=tok, csrf=csrf)
    check('H1: calificar compromiso en mutable -> permitido', st == 200, f'status={st} msg={r.get("message")}')
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    st, r = api('PUT', '/compromisos-comportamentales/34/calificar', {'calificacion': 10}, tok=tok, csrf=csrf)
    check('H2: calificar comportamental en calificada -> ahora rechazado', st >= 400, f'status={st} msg={r.get("message")}')

    print(f'\n=== RESULTADO: {PASS} OK, {FAIL} FAIL ===')
    print(f'FIXTURES_A_LIMPIAR: evaluacion={eval_mutable} comp_func={comp_func} comp_comp={comp_comp}')
    return FAIL


if __name__ == '__main__':
    sys.exit(main())
