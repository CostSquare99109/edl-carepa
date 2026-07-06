#!/bin/bash
# Integration test: Ver evaluaciones + Anular
set -e
API="http://localhost:8000/api/v1"

echo "=== Setup: Login + role switch ==="
TOK=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"documento":"43141896","password":"12345678"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])")
CSRF=$(curl -s -X GET "$API/auth/csrf" -H "Authorization: Bearer $TOK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['csrf_token'])")
curl -s -X PUT "$API/auth/rol" -H "Content-Type: application/json" -H "Authorization: Bearer $TOK" -H "X-CSRF-Token: $CSRF" -d '{"rol_codigo":"evaluador"}' > /dev/null
TOK=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"documento":"43141896","password":"12345678"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])")
CSRF=$(curl -s -X GET "$API/auth/csrf" -H "Authorization: Bearer $TOK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['csrf_token'])")
echo "  OK (rol=evaluador)"

echo ""
echo "=== Test 1: Buscar evaluado (periodo 2026-2027) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/buscar-evaluado?periodo_id=1&documento=1045678923" -H "Authorization: Bearer $TOK")
EVAL_ID=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); rows=d['data']; print(rows[0]['evaluacion_id'] if rows else 0)")
EVALUADO_ID=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); rows=d['data']; print(rows[0]['id'] if rows else 0)")
echo "  Evaluado id=$EVALUADO_ID, evaluacion_id=$EVAL_ID"

echo ""
echo "=== Test 2: Ver evaluaciones (botón en tabla del evaluador) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID/evaluaciones-previas" -H "Authorization: Bearer $TOK")
COUNT=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']) if isinstance(d['data'], list) else 0)")
echo "  Tabla de evaluaciones: $COUNT fila(s)"
if [ "$COUNT" -gt 0 ]; then
  echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"    - Periodo: {e.get('periodo_nombre')} | Tipo: {e['tipo']} | Estado: {e['estado']} | Calif: {e.get('calificacion_definitiva')}\") for e in d['data']]"
fi

echo ""
echo "=== Test 3: Ver en detalle de evaluación (modal) ==="
RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID" -H "Authorization: Bearer $TOK")
echo $RESP | python3 -c "
import sys, json
d = json.load(sys.stdin)
e = d['data']
print(f\"  Información del evaluado:\")
print(f\"    Nombre: {e.get('evaluado_nombre', 'N/A')}\")
print(f\"    Documento: {e.get('evaluado_documento', 'N/A')}\")
print(f\"  Información del evaluador:\")
print(f\"    Nombre: {e.get('evaluador_nombre', 'N/A')}\")
print(f\"  Evaluación:\")
print(f\"    Tipo: {e['tipo']}\")
print(f\"    Estado: {e['estado']}\")
print(f\"    Calif. definitiva: {e.get('calificacion_definitiva', 'N/A')}\")
"

echo ""
echo "=== Test 4: Descargar PDF de la evaluación ==="
PDF_TMP="$HOME/eval-test-${EVAL_ID}.pdf"
HTTP=$(curl -s -o "$PDF_TMP" -w "%{http_code}" -X GET "$API/reportes/evaluacion-pdf/$EVAL_ID" -H "Authorization: Bearer $TOK")
SIZE=$(stat -c%s "$PDF_TMP" 2>/dev/null || echo 0)
if [ "$HTTP" = "200" ] && [ "$SIZE" -gt 100 ]; then
  echo "  PDF OK: ${SIZE} bytes"
else
  echo "  PDF ERROR: HTTP=$HTTP size=$SIZE"
  exit 1
fi

echo ""
echo "=== Test 5: Intentar anular evaluación en_proceso (debe funcionar) ==="
RESP=$(curl -s -X PUT "$API/evaluaciones/$EVAL_ID/anular" -H "Content-Type: application/json" -H "Authorization: Bearer $TOK" -H "X-CSRF-Token: $CSRF" -d '{"motivo":"Test de anulacion automatica por script de pruebas"}')
CODE=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['code'])")
if [ "$CODE" = "01" ]; then
  echo "  Anulación OK"
else
  echo "  Anulación falló: $RESP"
  exit 1
fi

echo ""
echo "=== Test 6: Re-verificar que el estado cambió a 'anulada' ==="
RESP=$(curl -s -X GET "$API/evaluaciones/$EVAL_ID" -H "Authorization: Bearer $TOK")
ESTADO=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['estado'])")
echo "  Estado actual: $ESTADO"
if [ "$ESTADO" = "anulada" ]; then
  echo "  OK"
else
  echo "  FAIL: estado no es 'anulada'"
  exit 1
fi

echo ""
echo "=== Test 7: Re-anular (debe fallar porque ya está anulada) ==="
RESP=$(curl -s -X PUT "$API/evaluaciones/$EVAL_ID/anular" -H "Content-Type: application/json" -H "Authorization: Bearer $TOK" -H "X-CSRF-Token: $CSRF" -d '{"motivo":"Segundo intento de anulación"}')
CODE=$(echo $RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['code'])")
if [ "$CODE" = "02" ]; then
  echo "  OK: rechazo correcto"
else
  echo "  FAIL: deberia rechazar ($RESP)"
  exit 1
fi

echo ""
echo "=== Cleanup: revertir estado a en_proceso ==="
mysql -u root edl_carepa -e "UPDATE evaluaciones SET estado='en_proceso', motivo_anulacion=NULL WHERE id=$EVAL_ID" 2>&1 | tail -1
echo "  OK"

echo ""
echo "=== TODOS LOS TESTS PASARON ==="