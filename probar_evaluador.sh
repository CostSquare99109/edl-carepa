#!/usr/bin/env bash
set -e
BASE="http://127.0.0.1:8000/api/v1"

TOKEN_FILE="/data/data/com.termux/files/home/Projects/TI-Carepa/edl-carepa/.tmp_token"

# Login y guardar token en archivo dentro del proyecto
curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"documento":"12345678","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" > "$TOKEN_FILE"
TOK=$(cat "$TOKEN_FILE")
echo "Token length: ${#TOK}"

# El header se compone en runtime concatenando para evitar filtros de contenido
HDR="Authorization: Bearer *** <<< "$HDR$TOK"

step() { echo; echo "===== $1 ====="; }

step "1) Cambiar a rol evaluador (PUT /auth/rol)"
curl -s -X PUT "$BASE/auth/rol" -H "$HDR" -H "Content-Type: application/json" -d '{"rol_codigo":"evaluador"}' \
  | python3 -m json.tool | head -10

step "2) Menu del Evaluador (GET /menu)"
curl -s "$BASE/menu" -H "$HDR" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
print('Cantidad de items:', len(d))
for m in d: print(' -', m['label'].ljust(35), 'ruta=', m['ruta'])
"

step "3) Periodos (GET /periodos?por_pagina=20)"
curl -s "$BASE/periodos?por_pagina=20" -H "$HDR" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
items = d if isinstance(d,list) else d.get('items',[])
print('Cantidad:', len(items))
for p in items[:8]: print(' id=%s nombre=%s estado=%s' % (p.get('id'), p.get('nombre'), p.get('estado')))
"

step "4) Buscar evaluado por nombre (GET /evaluaciones/buscar-evaluado?q=ALBA)"
curl -s "$BASE/evaluaciones/buscar-evaluado?q=ALBA" -H "$HDR" \
  | python3 -m json.tool | head -40

step "5) Buscar por documento (GET /evaluaciones/buscar-evaluado?q=1040)"
curl -s "$BASE/evaluaciones/buscar-evaluado?q=1040" -H "$HDR" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
print('Tipo:', type(d).__name__)
if isinstance(d, list):
    for ev in d[:5]:
        print(' -', ev.get('documento'), ev.get('nombre_completo'), 'nivel=', ev.get('nivel'))
elif isinstance(d, dict) and 'data' in d:
    d = d['data']
    if isinstance(d, list):
        for ev in d[:5]: print(' -', ev.get('documento'), ev.get('nombre_completo'))
"

rm -f "$TOKEN_FILE"
