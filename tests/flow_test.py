#!/usr/bin/env python3
"""Flujo E2E completo del proceso EDL (Acuerdo CNSC 617 de 2018).

Recorre el ciclo real con dos responsables distintos:
  login evaluador -> login evaluado -> crear evaluacion -> crear concertacion
  -> compromisos funcionales (pesos 100%) -> compromisos comportamentales
  (matriz por nivel del evaluado) -> bilateralidad (evaluado acepta)
  -> fijacion (evaluador) -> calificar funcionales (0-100)
  -> calificar comportamentales (4-15) -> calificacion definitiva (85/15)
  -> inmutabilidad post-calificacion.

Verifica la matematica normativa: con funcionales 80/90 (pesos 60/40) y
comportamentales 12/10/14 (peso 1 c/u) el resultado esperado es
71.40 + 10.91 = 82.31 -> satisfactorio.

Requiere backend en :8000 (o API_BASE). Crea fixtures propios y reporta
los ids a limpiar (FIXTURES_A_LIMPIAR), igual que test_inmutabilidad.py.
"""
import json, os, sys, urllib.error, urllib.request

BASE = os.environ.get('API_BASE', 'http://localhost:8000')
API = BASE + '/api/v1'
PASS = 0
FAIL = 0

EVALUADOR = {'documento': '43141896', 'password': '12345678'}   # evaluador + jefe_dependencia
EVALUADO = {'documento': '1040353165', 'password': '12345678'}  # evaluado + admin_carepa
PERIODO_ID = 1
EVALUADO_ID = 12
PESOS = {'f1': (60, 80), 'f2': (40, 90)}
COMPETENCIAS = ['APR_TEC', 'COM_EFEC', 'GEST_PRO']  # set profesional (nivel del evaluado)
CALIF_COMP = [12, 10, 14]


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


def login_y_rol(cred, rol):
    _, r = api('POST', '/auth/login', cred)
    if r.get('code') != '01':
        raise SystemExit(f'Login {cred["documento"]} fallo: {r.get("message")}')
    tok = r['data']['token']
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = r['data']['csrf_token']
    _, r = api('PUT', '/auth/rol', {'rol_codigo': rol}, tok=tok, csrf=csrf)
    if r.get('code') != '01':
        raise SystemExit(f'Seleccion de rol {rol} fallo: {r.get("message")}')
    tok = r['data']['token']
    _, r = api('GET', '/auth/csrf', tok=tok)
    return tok, r['data']['csrf_token']


def mutacion(tok, method, path, data=None):
    """Mutacion con token CSRF fresco: los tokens son de un solo uso
    (CsrfHelper::validar marca utilizado=1), igual que en test_inmutabilidad."""
    _, r = api('GET', '/auth/csrf', tok=tok)
    csrf = (r.get('data') or {}).get('csrf_token')
    return api(method, path, data, tok=tok, csrf=csrf)


def main():
    print('=== Flujo E2E EDL: concertacion -> fijacion -> calificacion -> definitiva ===\n')

    # 1. Login de ambos responsables
    print('--- 1. Logins con multi-rol ---')
    tok_ev, csrf_ev = login_y_rol(EVALUADOR, 'evaluador')
    tok_ed, csrf_ed = login_y_rol(EVALUADO, 'evaluado')
    check('Login evaluador + rol activo', bool(tok_ev))
    check('Login evaluado + rol activo', bool(tok_ed))

    # 2. Crear evaluacion (pendiente)
    print('\n--- 2. Crear evaluacion ---')
    st, r = mutacion(tok_ev, 'POST', '/evaluaciones', {
        'evaluado_id': EVALUADO_ID, 'periodo_id': PERIODO_ID,
        'tipo': 'parcial_eventual', 'observaciones': 'fixture test_flujo_edl',
    })
    check('Crear evaluacion (parcial_eventual)', st in (200, 201) and r.get('data', {}).get('id'), str(r)[:160])
    if FAIL:
        sys.exit(1)
    ev_id = r['data']['id']

    # 3. Crear concertacion (vincula la evaluacion)
    print('\n--- 3. Crear concertacion ---')
    st, r = mutacion(tok_ev, 'POST', '/concertaciones', {
        'periodo_id': PERIODO_ID, 'evaluado_id': EVALUADO_ID,
    })
    check('Crear concertacion', st in (200, 201), str(r)[:160])
    conc_id = (r.get('data') or {}).get('id')
    st, r = api('GET', f'/evaluaciones/{ev_id}', tok=tok_ev)
    check('Evaluacion vinculada a la concertacion',
          st == 200 and (r.get('data', {}).get('concertacion_id') == conc_id), str(r)[:120])

    # 4. Compromisos funcionales (pesos suman 100; requieren meta_id y
    #    descripcion con estructura verbo + objeto + condicion - CNSC)
    print('\n--- 4. Compromisos funcionales ---')
    _, r = api('GET', '/metas?por_pagina=10', tok=tok_ev)
    metas = ((r.get('data') or {}).get('data') or [])
    meta_ids = [m['id'] for m in metas if isinstance(m, dict) and m.get('id')][:2]
    check('Metas disponibles para los compromisos', len(meta_ids) >= 2, f'obtenidas={len(meta_ids)}')
    comp_ids = []
    for (nombre, (peso, _)), meta_id in zip(PESOS.items(), meta_ids):
        st, r = mutacion(tok_ev, 'POST', '/compromisos/funcional', {
            'evaluacion_id': ev_id,
            'meta_id': meta_id,
            'descripcion': f'Ejecutar las actividades del compromiso {nombre.upper()} conforme al cronograma institucional del periodo',
            'peso': peso,
        })
        check(f'Funcional peso={peso}', st in (200, 201), str(r)[:160])
        cid = (r.get('data') or {}).get('id')
        if cid:
            comp_ids.append(cid)

    # 5. Compromisos comportamentales (set por nivel del evaluado)
    print('\n--- 5. Compromisos comportamentales ---')
    st, r = mutacion(tok_ev, 'POST', '/compromisos-comportamentales/guardar', {
        'evaluacion_id': ev_id,
        'competencias': [{'competencia_id': c} for c in COMPETENCIAS],
    })
    check('Guardar 3 comportamentales (set profesional)', st in (200, 201), str(r)[:200])

    # 6. Bilateralidad: el evaluado acepta
    print('\n--- 6. Bilateralidad (evaluado acepta) ---')
    st, r = mutacion(tok_ed, 'PUT', f'/evaluaciones/{ev_id}/aceptar-concertacion', {})
    check('Evaluado acepta la concertacion', st in (200, 201), str(r)[:160])

    # 7. Fijacion por el evaluador
    print('\n--- 7. Fijacion (evaluador) ---')
    st, r = mutacion(tok_ev, 'PUT', f'/concertaciones/{conc_id}/fijar', {})
    check('Fijar concertacion', st in (200, 201), str(r)[:200])

    # 8. Calificar funcionales (0-100)
    print('\n--- 8. Calificar funcionales ---')
    for cid, (_, puntaje) in zip(comp_ids, PESOS.values()):
        st, r = mutacion(tok_ev, 'PUT', f'/compromisos/{cid}/calificar',
                         {'puntaje': puntaje, 'observaciones': 'cumplio satisfactoriamente'})
        check(f'Calificar funcional id={cid} puntaje={puntaje}', st in (200, 201), str(r)[:160])

    # 9. Calificar comportamentales (4-15). El listado funcional
    #    (/compromisos/evaluacion/{id}) NO incluye comportamentales: usar
    #    el endpoint propio de compromisos-comportamentales.
    print('\n--- 9. Calificar comportamentales ---')
    st, r = api('GET', f'/compromisos-comportamentales/evaluacion/{ev_id}', tok=tok_ev)
    comp_list = r.get('data') or []
    if isinstance(comp_list, dict):
        comp_list = comp_list.get('data') or []
    comp_list_ids = [c.get('id') for c in comp_list if isinstance(c, dict) and c.get('id')]
    check('3 comportamentales visibles', len(comp_list_ids) >= 3, f'obtenidos={len(comp_list_ids)}')
    for cid, calif in zip(comp_list_ids, CALIF_COMP):
        st, r = mutacion(tok_ev, 'PUT', f'/compromisos-comportamentales/{cid}/calificar',
                         {'calificacion': calif})
        check(f'Calificar comportamental id={cid} calif={calif}', st in (200, 201), str(r)[:160])

    # 10. Calificacion definitiva (85/15)
    print('\n--- 10. Calificacion definitiva ---')
    st, r = mutacion(tok_ev, 'PUT', f'/evaluaciones/{ev_id}/definitiva', {})
    check('Calificacion definitiva', st in (200, 201), str(r)[:200])
    st, r = api('GET', f'/evaluaciones/{ev_id}', tok=tok_ev)
    ev = r.get('data') or {}
    defi = ev.get('calificacion_definitiva')
    check('Nota definitiva = 82.31 (85% de 84 + 15% de 72.72)',
          defi is not None and abs(float(defi) - 82.31) < 0.02, f'obtenido={defi}')
    check('nivel_resultado = satisfactorio', ev.get('nivel_resultado') == 'satisfactorio',
          f'obtenido={ev.get("nivel_resultado")}')
    check('estado = calificada', ev.get('estado') == 'calificada', f'obtenido={ev.get("estado")}')

    # 11. Inmutabilidad post-calificacion (descripcion y meta validas para
    #     que el rechazo provenga del guard de inmutabilidad, no de validacion)
    print('\n--- 11. Inmutabilidad post-calificacion ---')
    st, r = mutacion(tok_ev, 'POST', '/compromisos/funcional', {
        'evaluacion_id': ev_id, 'meta_id': meta_ids[0],
        'descripcion': 'Ejecutar una actividad adicional conforme al cronograma institucional vigente',
        'peso': 10,
    })
    check('Crear compromiso en calificada -> rechazado', st == 400, f'status={st}')
    st, r = mutacion(tok_ev, 'PUT', f'/evaluaciones/{ev_id}/definitiva', {})
    check('Recalificar definitiva -> rechazado', st == 400, f'status={st}')

    print(f'\nFIXTURES_A_LIMPIAR: evaluacion={ev_id} concertacion={conc_id} compromisos={",".join(map(str, comp_ids + comp_list_ids))}')
    print(f'\n=== RESUMEN: {PASS} OK, {FAIL} FAIL ===')
    sys.exit(1 if FAIL else 0)


if __name__ == '__main__':
    main()

