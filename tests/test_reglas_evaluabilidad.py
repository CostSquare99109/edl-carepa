#!/usr/bin/env python3
"""Reglas de evaluabilidad y ano laboral (EDL-CAREPA API).

Verifica el ciclo de vida completo de un funcionario nuevo:

  - Alta con `semestre_ingreso` explicito (2do semestre).
  - El primer semestre NO le corresponde: la API lo rechaza con 42.
  - El segundo semestre si se puede iniciar sin evaluacion previa.
  - La definitiva del ano laboral se emite al completar las dos parciales.

Usa un usuario temporal con documento derivado del reloj y lo elimina al final.
Requiere backend en $API_BASE (por defecto :8000).
"""
import json, urllib.request, urllib.error, os, time, subprocess

BASE = os.environ.get('API_BASE', 'http://localhost:8000')
API = BASE + '/api/v1'
PASS = 0
FAIL = 0
TOK = ''


def api(method, path, data=None, tok=None, csrf=None):
    url = API + path
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if tok:
        req.add_header('Authorization', f'Bearer {tok}')
    if csrf:
        req.add_header('X-CSRF-Token', csrf)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        raw = resp.read()
        return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return json.loads(raw) if raw else {'code': f'HTTP_{e.code}', 'http_status': e.code}
        except (json.JSONDecodeError, TypeError):
            return {'code': f'HTTP_{e.code}', 'http_status': e.code}
    except Exception as e:
        return {'code': 'NET_ERR', 'message': str(e)}


def resp_data(resp):
    """Envoltura tolerante: la API puede devolver data: null."""
    value = resp.get('data') if isinstance(resp, dict) else None
    return value if isinstance(value, dict) else {}


def login_admin(documento='1040353165'):
    """Login + seleccion explicita de rol (el usuario es multi-rol)."""
    global TOK
    resp = api('POST', '/auth/login', {'documento': documento, 'password': '12345678'})
    tok = resp_data(resp).get('token')
    if not tok:
        return None
    csrf = resp_data(api('GET', '/auth/csrf', tok=tok)).get('csrf_token')
    resp = api('PUT', '/auth/rol', {'rol_codigo': 'admin_carepa'}, tok, csrf)
    TOK = resp_data(resp).get('token') or tok
    return TOK


def mut(method, path, data=None):
    """Request mutante: los tokens CSRF son de un solo uso, se pide uno nuevo."""
    global TOK
    csrf = resp_data(api('GET', '/auth/csrf', tok=TOK)).get('csrf_token')
    return api(method, path, data, TOK, csrf)


def rechazado(resp):
    """Rechazo de validacion del backend: code 02 con HTTP 422."""
    return resp.get('code') == '02' and resp.get('http_status') in (422, None, 419)


def check(label, condition, detail=''):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [OK] {label}")
    else:
        FAIL += 1
        print(f"  [FAIL] {label} {detail}")
    return condition


def sql(statement):
    """Ejecuta SQL directo para preparar/limpiar datos de la prueba."""
    try:
        subprocess.run(
            ['mysql', '-u', 'root', '-h', '127.0.0.1', 'edl_carepa', '-e', statement],
            capture_output=True, timeout=15, check=False)
        return True
    except Exception:
        return False


def main():
    global TOK

    if sql('SELECT 1') is False:
        print("  [SKIP] cliente mysql no disponible")
        return 0

    stamp = str(int(time.time()))[-6:]
    documento = f'99{stamp}'
    usuario_id = None

    print("=== Reglas de evaluabilidad y ano laboral ===\n")

    # --- Login como administrador ---
    print("--- Autenticacion ---")
    TOK = ''
    if not check('Login admin', bool(login_admin()), 'credenciales 1040353165'):
        return 1
    check('Rol admin_carepa activo', True)

    # --- Periodo de referencia: el primero vigente ---
    print("\n--- Preparacion ---")
    resp = api('GET', '/periodos?por_pagina=50', tok=TOK)
    periodos = resp_data(resp).get('data') or []
    if not check('Existe al menos un periodo', len(periodos) > 0):
        return 1
    periodo = sorted(periodos, key=lambda p: p.get('fecha_inicio') or '')[-1]
    periodo_id = periodo['id']
    print(f"  (periodo {periodo['nombre']}, id={periodo_id})")

    # Dependencia con jefe evaluable
    resp = api('GET', '/dependencias?por_pagina=50', tok=TOK)
    dependencias = resp_data(resp).get('data') or []
    dependencia_id = next((d['id'] for d in dependencias if d.get('jefe_id')), None)
    if not check('Dependencia con jefe disponible', dependencia_id is not None):
        return 1
    evaluador_id = next((d['jefe_id'] for d in dependencias if d['id'] == dependencia_id), None)

    # Periodo siguiente (temporal): sin el no se puede probar que la segunda
    # parcial del ano laboral cae en el periodo siguiente.
    anio_inicio = int((periodo.get('nombre') or '2026-2027').split('-')[0])
    nombre_siguiente = f'{anio_inicio + 1}-{anio_inicio + 2}'
    sql(f"INSERT INTO periodos (nombre, anio, fecha_inicio, fecha_fin, estado) "
        f"VALUES ('{nombre_siguiente}', '{nombre_siguiente}', "
        f"'{anio_inicio + 1}-02-01', '{anio_inicio + 2}-01-31', 'configuracion')")
    resp = api('GET', '/periodos?por_pagina=50', tok=TOK)
    siguiente = next((p for p in (resp_data(resp).get('data') or [])
                      if p.get('nombre') == nombre_siguiente), None)
    check('Periodo siguiente disponible para la prueba', siguiente is not None, nombre_siguiente)

    # --- Alta del funcionario con semestre de ingreso explicito ---
    print("\n--- Alta con semestre de ingreso (2do semestre) ---")
    nuevo = {
        'documento': documento,
        'primer_nombre': 'Funcionario',
        'primer_apellido': 'PruebaAnoLaboral',
        'email': f'prueba.ano.laboral.{stamp}@carepa.gov.co',
        'password': '12345678',
        'dependencia_id': dependencia_id,
        'entidad_id': 1,
        'naturaleza': 'carrera_administrativa',
        'fecha_posesion': '2026-10-01',
        'semestre_ingreso': 'segundo_semestre',
        'en_periodo_prueba': 0,
    }
    resp = mut('POST', '/usuarios', nuevo)
    usuario_id = resp_data(resp).get('id')
    if not check('Usuario creado', bool(usuario_id), resp.get('message', '')):
        print(f"  (respuesta: {json.dumps(resp)[:300]})")
        return 1

    resp = api('GET', f'/usuarios/{usuario_id}', tok=TOK)
    check('semestre_ingreso persistido',
          resp_data(resp).get('semestre_ingreso') == 'segundo_semestre',
          resp_data(resp).get('semestre_ingreso'))

    # Valor invalido rechazado
    resp = mut('PUT', f'/usuarios/{usuario_id}', {'semestre_ingreso': 'tercer_semestre'})
    check('semestre_ingreso invalido rechazado', rechazado(resp), resp.get('message', ''))

    # --- Reglas de evaluabilidad ---
    print("\n--- Reglas de evaluabilidad ---")
    resp = api('GET', f'/evaluaciones/evaluado/{usuario_id}/reglas-evaluabilidad?periodo_id={periodo_id}', tok=TOK)
    reglas = resp.get('data', {})
    if not check('Endpoint reglas-evaluabilidad responde 01', resp.get('code') == '01', resp.get('message', '')):
        return 1

    check('semestre_ingreso = segundo_semestre', reglas.get('semestre_ingreso') == 'segundo_semestre')
    check('exento del primer semestre', reglas.get('exento_primer_semestre') is True)
    check('puede_iniciar_primer_semestre = false', reglas.get('puede_iniciar_primer_semestre') is False)
    check('puede_iniciar_segundo_semestre = true', reglas.get('puede_iniciar_segundo_semestre') is True)
    check('primer semestre no aparece entre los permitidos',
          'primer_semestre' not in (reglas.get('semestres_permitidos') or []))

    parciales = reglas.get('anio_laboral') or []
    if check('ano laboral con 2 parciales', len(parciales) == 2):
        check('primera parcial = 2do semestre', parciales[0].get('tipo') == 'parcial_segundo_semestre')
        check('segunda parcial = 2do semestre (periodo siguiente)',
              parciales[1].get('tipo') == 'parcial_segundo_semestre')
        check('la segunda parcial cae en otro periodo',
              parciales[1].get('periodo_id') != parciales[0].get('periodo_id'),
              f"{parciales[0].get('periodo_id')} vs {parciales[1].get('periodo_id')}")

    # --- Enforcement: el 1er semestre se rechaza ---
    # /evaluaciones/iniciar siempre opera sobre el usuario autenticado, asi que
    # el propio funcionario propose su evaluacion.
    print("\n--- Enforcement (1er semestre bloqueado) ---")
    resp = api('POST', '/auth/login', {'documento': documento, 'password': '12345678'})
    tok_evaluado = resp_data(resp).get('token')
    if not check('Login del funcionario nuevo', bool(tok_evaluado), resp.get('message', '')):
        return 1
    TOK = tok_evaluado

    resp = mut('POST', '/evaluaciones/iniciar',
               {'periodo_id': periodo_id, 'tipo': 'parcial_primer_semestre'})
    check('iniciar 1er semestre rechazado', rechazado(resp), resp.get('message', ''))
    check('motivo explica la exencion',
          'primer semestre' in (resp.get('message') or '').lower(),
          resp.get('message', ''))

    # El 2do semestre si se puede iniciar, sin parcial previa
    resp = mut('POST', '/evaluaciones/iniciar',
               {'periodo_id': periodo_id, 'tipo': 'parcial_segundo_semestre'})
    check('iniciar 2do semestre permitido (01)', resp.get('code') == '01', resp.get('message', ''))
    evaluacion_id = resp_data(resp).get('evaluacion_id')
    check('evaluacion creada', bool(evaluacion_id))

    # Volvemos al admin para el resto de comprobaciones
    login_admin()

    # --- Definitiva: incompleta con una sola parcial ---
    if evaluacion_id:
        print("\n--- Definitiva del ano laboral ---")
        resp = mut('POST', f'/evaluaciones/evaluado/{usuario_id}/definitiva-anio-laboral?periodo_id={periodo_id}')
        check('definitiva bloqueada con una sola parcial', rechazado(resp), resp.get('message', ''))

        # Calificamos la primera parcial y verificamos que sigue incompleta
        sql(f"UPDATE evaluaciones SET estado='calificada', calificacion_definitiva=88 "
            f"WHERE id={evaluacion_id}")
        resp = mut('POST', f'/evaluaciones/evaluado/{usuario_id}/definitiva-anio-laboral?periodo_id={periodo_id}')
        check('definitiva sigue bloqueada con 1 de 2 parciales', rechazado(resp), resp.get('message', ''))

        # Simulamos la segunda parcial (del periodo siguiente)
        if siguiente:
            sql(f"INSERT INTO evaluaciones (periodo_id, evaluado_id, evaluador_id, tipo, estado, "
                f"calificacion_definitiva) VALUES ({siguiente['id']}, {usuario_id}, "
                f"{evaluador_id}, 'parcial_segundo_semestre', 'calificada', 78)")

            resp = mut('POST', f'/evaluaciones/evaluado/{usuario_id}/definitiva-anio-laboral?periodo_id={periodo_id}')
            datos = resp_data(resp)
            if check('definitiva emitida con las 2 parciales (01)', resp.get('code') == '01', resp.get('message', '')):
                # (88 + 78) / 2 = 83 -> satisfactorio con umbral 85
                check('promedio de las dos parciales = 83', datos.get('calificacion_definitiva') == 83.0,
                      datos.get('calificacion_definitiva'))
                check('nivel = satisfactorio (83 < 85)', datos.get('nivel') == 'satisfactorio', datos.get('nivel'))

                # No se puede emitir dos veces
                resp2 = mut('POST', f'/evaluaciones/evaluado/{usuario_id}/definitiva-anio-laboral?periodo_id={periodo_id}')
                check('definitiva no se reemite', rechazado(resp2), resp2.get('message', ''))

    # --- Limpieza ---
    if usuario_id:
        sql(f"DELETE FROM evaluaciones WHERE evaluado_id = {usuario_id}; "
            f"DELETE FROM concertaciones WHERE evaluado_id = {usuario_id}; "
            f"DELETE FROM usuario_rol WHERE usuario_id = {usuario_id}; "
            f"DELETE FROM usuarios WHERE id = {usuario_id};")
    sql(f"DELETE FROM periodos WHERE nombre = '{nombre_siguiente}'")

    print(f"\n=== Resultado: {PASS} OK, {FAIL} FAIL ===")
    return 1 if FAIL else 0


if __name__ == '__main__':
    raise SystemExit(main())