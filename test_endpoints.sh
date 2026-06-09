#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"documento":"52987634","password":"Carepa2025!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))")

if [ -z "$TOKEN" ]; then
  echo "LOGIN FAILED"
  exit 1
fi

echo "Token obtained: ${#TOKEN} chars"

endpoints=(
  "/api/v1/auth/perfil"
  "/api/v1/usuarios?por_pagina=5"
  "/api/v1/dependencias"
  "/api/v1/periodos"
  "/api/v1/metas"
  "/api/v1/entidades"
  "/api/v1/competencias"
  "/api/v1/parametros"
  "/api/v1/evaluaciones?por_pagina=5"
  "/api/v1/compromisos?por_pagina=5"
  "/api/v1/concertaciones?por_pagina=5"
  "/api/v1/evidencias?por_pagina=5"
  "/api/v1/notificaciones?por_pagina=5"
  "/api/v1/dashboard/resumen"
  "/api/v1/dashboard/actividad?por_pagina=5"
  "/api/v1/ausentismos?por_pagina=5"
  "/api/v1/movilidades?por_pagina=5"
  "/api/v1/menu"
  "/api/v1/consulta-funcionario?cedula=52987634"
)

for ep in "${endpoints[@]}"; do
  url="http://localhost:8000${ep}"
  resp=$(curl -s "$url" -H "Authorization: Bearer $TOKEN")
  code=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code','?'))" 2>/dev/null || echo "PARSE_ERR")
  msg=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message','')[:70])" 2>/dev/null || echo "")
  if [ "$code" = "01" ]; then
    echo "[OK] $ep"
  else
    echo "[ERR] $ep: $code - $msg"
  fi
done
