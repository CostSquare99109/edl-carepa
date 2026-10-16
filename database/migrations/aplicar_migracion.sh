#!/usr/bin/env bash
# ============================================================================
# aplicar_migracion.sh — Ejecutor seguro de migraciones SQL (EDL-Carepa)
#
# Garantías:
#   1. El destino SIEMPRE lo decide el argumento <bd>, nunca el archivo:
#      elimina cualquier sentencia USE del archivo antes de aplicarlo
#      (causa raíz del incidente M008: un USE interno re-ancla la conexión
#      de mariadb CLI a otra BD silenciosamente).
#   2. Verifica DATABASE() de la conexión ANTES de escribir e inyecta una
#      guardia que ABORTA todo el lote (referencia a tabla inexistente =>
#      error 1146 y fin del script) si la BD activa no es la esperada.
#   3. Protege la BD principal: edl_carepa exige --permitir-produccion.
#
# Uso:
#   aplicar_migracion.sh <archivo.sql> <bd_destino> [--permitir-produccion]
#
# Notas:
#   - Aplicar SIEMPRE con este runner; la aplicación directa con mariadb CLI
#     queda desaconsejada (ver NOTA OPERATIVA en M008).
#   - La transacción la maneja cada archivo de migración (START TRANSACTION
#     ... COMMIT), no el runner.
# ============================================================================
set -euo pipefail

MYSQL=${MYSQL:-mariadb}
CHARSET="--default-character-set=utf8mb4"

ARCHIVO="${1:-}"
BD="${2:-}"
FLAG="${3:-}"

if [[ -z "$ARCHIVO" || -z "$BD" ]]; then
  echo "Uso: $0 <archivo.sql> <bd_destino> [--permitir-produccion]" >&2
  exit 64
fi
if [[ ! -f "$ARCHIVO" ]]; then
  echo "ERROR: no existe el archivo '$ARCHIVO'" >&2
  exit 66
fi
if [[ "$BD" == "edl_carepa" && "$FLAG" != "--permitir-produccion" ]]; then
  echo "ERROR: '$BD' es la BD principal." >&2
  echo "       La aplicación directa requiere el flag --permitir-produccion." >&2
  echo "       Para ensayos usa una BD de prueba: ej. edl_carepa_dryrun" >&2
  exit 77
fi

TMP=$(mktemp "${TMPDIR:-/tmp}/migracion_$(basename "$ARCHIVO" .sql)_XXXXXX.sql")
trap 'rm -f "$TMP"' EXIT

# --- Capa 1: neutralizar USE (el destino lo decide el argumento) -------------
if grep -qiE '^[[:space:]]*USE[[:space:]]+[`a-zA-Z_]' "$ARCHIVO"; then
  echo "[runner] AVISO: el archivo contenía sentencias USE; fueron neutralizadas."
fi
{ echo "-- [runner] Guardia anti-desvio de entorno (inyectada automaticamente)"
  echo "-- Si DATABASE() != '$BD', PREPARE resuelve una tabla inexistente y ABORTA el lote."
  echo "-- (No se usa WHERE directo: el optimizador resuelve subconsultas constantes"
  echo "--  aunque la condición sea falsa y abortaría siempre.)"
  echo "SET @guardia_sql := IF(DATABASE() <> '${BD}',"
  echo "  'SELECT 1 FROM _ABORTO_BD_INCORRECTA_ESPERABA_${BD}',"
  echo "  'SELECT CONCAT(\\'guardia OK: \\' , DATABASE()) AS entorno');"
  echo "PREPARE g FROM @guardia_sql; EXECUTE g; DEALLOCATE PREPARE g;"
  cat "$ARCHIVO"
} > "$TMP"

# --- Capa 2: verificar la BD activa de la conexión ---------------------------
ACTUAL=$($MYSQL $CHARSET -N -B -e "SELECT DATABASE();" "$BD")
echo "[runner] Archivo : $ARCHIVO"
echo "[runner] Destino : $BD (conexión anclada a: ${ACTUAL:-<ninguna>})"
if [[ "$ACTUAL" != "$BD" ]]; then
  echo "ERROR: la conexión quedó anclada a '$ACTUAL', no a '$BD'. Abortando." >&2
  exit 78
fi

# --- Aplicar -----------------------------------------------------------------
$MYSQL $CHARSET "$BD" < "$TMP"
RC=$?
echo "[runner] OK: migración aplicada sobre '$BD' (exit $RC)."
[[ "$BD" == "edl_carepa" ]] && \
  echo "[runner] RECUERDA: regenerar database/full_dump.sql (regla AGENTS.md)."
exit $RC
