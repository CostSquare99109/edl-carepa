#!/bin/bash
# E2E test for "Ver evaluaciones" feature
# Simulates: login -> search evaluado -> open Ver evaluaciones modal -> see data
set -e
API="http://localhost:8000/api/v1"

echo "=== Test 1: Login ==="
TOK=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"documento":"43141896","password":"12345678"}' | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['code']=='01', d; print(d['data']['token'])")
echo "  Login OK, token: ${TOK:0:30}..."

echo ""
echo "=== Test 2: CSRF + role switch ==="
CSRF=$(curl -s -X GET "$API/auth/csrf" -H "Authorization: Bearer $TOK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['csrf_token'])")
RESP=$(curl -s -X PUT "$API/auth/rol" -H "Content-Type: application/json" -H "Authorization: Bearer $TOK" -H "X-CSRF-Token: $CSRF" -d '{"rol_codigo":"evaluador"}')
echo "  Rol activo: $(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['rol_activo'])")"

# Re-login to get token with new role
TOK=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"documento":"43141896","password":"12345678"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])")

echo ""
echo "=== Test 3: Buscar evaluado por documento 1045678923 (Juan Gomez) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/buscar-evaluado?periodo_id=1&documento=1045678923" -H "Authorization: Bearer $TOK")
EVAL_ID=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); rows=d['data']; print(rows[0]['evaluacion_id'] if rows else 0)")
EVALUADO_ID=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); rows=d['data']; print(rows[0]['id'] if rows else 0)")
echo "  Evaluado id=$EVALUADO_ID, evaluacion_id=$EVAL_ID"

echo ""
echo "=== Test 4: Ver evaluaciones (por evaluacion_id=$EVAL_ID) ==="
if [ "$EVAL_ID" != "0" ]; then
  RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID/evaluaciones-previas" -H "Authorization: Bearer $TOK")
  COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
  echo "  Endpoint /evaluaciones/$EVAL_ID/evaluaciones-previas retorna $COUNT evaluación(es)"
  echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"    - id={e['id']} tipo={e['tipo']} estado={e['estado']} periodo={e.get('periodo_nombre','?')}\") for e in d['data'][:5]]"
else
  echo "  SKIP: el evaluado no tiene evaluación"
fi

echo ""
echo "=== Test 5: Ver evaluaciones (por evaluado_id=$EVALUADO_ID) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/evaluado/$EVALUADO_ID/previas" -H "Authorization: Bearer $TOK")
COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
echo "  Endpoint /evaluaciones/evaluado/$EVALUADO_ID/previas retorna $COUNT evaluación(es)"
echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"    - id={e['id']} tipo={e['tipo']} estado={e['estado']} periodo={e.get('periodo_nombre','?')}\") for e in d['data'][:5]]"

echo ""
echo "=== Test 6: Ver detalle de evaluacion $EVAL_ID ==="
if [ "$EVAL_ID" != "0" ]; then
  RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID" -H "Authorization: Bearer $TOK")
  ESTADO=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'].get('estado', 'n/a'))")
  echo "  Detalle: estado=$ESTADO"
fi

echo ""
echo "=== Test 7: Compromisos de la evaluación $EVAL_ID ==="
if [ "$EVAL_ID" != "0" ]; then
  RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID/compromisos" -H "Authorization: Bearer $TOK")
  COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
  echo "  Compromisos: $COUNT"
fi

echo ""
echo "=== Test 8: Descargar PDF evaluación $EVAL_ID ==="
if [ "$EVAL_ID" != "0" ]; then
  PDF_TMP="$HOME/eval-test-${EVAL_ID}.pdf"
  HTTP=$(curl -s -o "$PDF_TMP" -w "%{http_code}" -X GET "$API/reportes/evaluacion-pdf/$EVAL_ID" -H "Authorization: Bearer $TOK")
  SIZE=$(stat -c%s "$PDF_TMP" 2>/dev/null || echo 0)
  if [ "$HTTP" = "200" ] && [ "$SIZE" -gt 100 ]; then
    echo "  PDF generado: $SIZE bytes, HTTP $HTTP -> $PDF_TMP"
  else
    echo "  PDF falló: HTTP $HTTP size=$SIZE"
  fi
fi

echo ""
echo "=== Test 9: Buscar evaluado con varias evaluaciones ==="
# YEISON ROMAÑA (id=12) tiene evaluacion 6 (cerrada). Probemos con este.
RESP=$(curl -s -X GET "$API/evaluaciones/evaluado/12/previas" -H "Authorization: Bearer $TOK")
COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
echo "  YEISON ROMAÑA (id=12): $COUNT evaluación(es) registradas"
echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"    - id={e['id']} tipo={e['tipo']} estado={e['estado']} concertacion_id={e.get('concertacion_id')}\") for e in d['data']]"

echo ""
echo "=== Test 10: Compromisos de la evaluación 6 (YEISON) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/6/compromisos" -H "Authorization: Bearer $TOK")
COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
echo "  YEISON: $COUNT compromisos"
echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"    - id={c['id']} tipo={c['tipo']} calificacion={c.get('calificacion')}\") for c in d['data']]"

echo ""
echo "=== All tests completed ==="
