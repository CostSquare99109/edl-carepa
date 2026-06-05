import json, subprocess

r = subprocess.run(
    ['curl', '-s', 'http://localhost:8000/api/v1/auth/login',
     '-X', 'POST', '-H', 'Content-Type: application/json',
     '-d', '{"documento":"52987634","tipo_documento":"CC","password":"Eval2026!"}'],
    capture_output=True, text=True
)
d = json.loads(r.stdout)
token = d['data']['token']
print('Login OK, token len:', len(token))

endpoints = [
    '/api/v1/auth/perfil',
    '/api/v1/dashboard/resumen',
    '/api/v1/entidades',
    '/api/v1/usuarios',
    '/api/v1/periodos',
    '/api/v1/evaluaciones',
    '/api/v1/compromisos',
    '/api/v1/menu',
]

prefix = 'Authorization' + ':' + ' Bearer '
for ep in endpoints:
    auth_val = prefix + token
    r2 = subprocess.run(
        ['curl', '-s', 'http://localhost:8000' + ep, '-H', auth_val],
        capture_output=True, text=True
    )
    try:
        resp = json.loads(r2.stdout)
        code = resp.get('code', '?')
        msg = resp.get('message', '')[:50]
        extra = ''
        if isinstance(resp.get('data'), dict):
            extra = ' keys:' + str(list(resp['data'].keys())[:3])
        elif isinstance(resp.get('data'), list):
            extra = ' items:' + str(len(resp['data']))
        print('  [' + code + '] ' + ep + ': ' + msg + extra)
    except Exception as e:
        print('  [ERR] ' + ep + ': ' + r2.stdout[:100])
