#!/bin/bash
# Run all tests: PHP unit + Python integration
set -e

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE_DIR"

PASS=0; FAIL=0; SKIP=0
RESULTS=()

run_test() {
    local name="$1" cmd="$2" log="$3"
    echo "▶ $name"
    echo "  $cmd"
    if eval "$cmd" > "$log" 2>&1; then
        local ok=$(grep -cP '^\s+\[OK\]' "$log" 2>/dev/null || echo 0)
        local fl=$(grep -cP '^\s+\[FAIL\]' "$log" 2>/dev/null || echo 0)
        local summary=$(tail -2 "$log" | grep -iP '(resumen|summary|tests:)' | head -1)
        echo -e "  \033[32mPASS\033[0m  (${ok} OK, ${fl} FAIL)  ${summary}"
        PASS=$((PASS + 1))
    else
        local ok=$(grep -cP '^\s+\[OK\]' "$log" 2>/dev/null || echo 0)
        local fl=$(grep -cP '^\s+\[FAIL\]' "$log" 2>/dev/null || echo 0)
        local first=$(grep -m1 -P '^\s+\[FAIL\]' "$log" 2>/dev/null || echo "(sin detalle)")
        echo -e "  \033[31mFAIL\033[0m  (${ok} OK, ${fl} FAIL)"
        echo "  Primer fallo: ${first}"
        FAIL=$((FAIL + 1))
    fi
    RESULTS+=("$name: $([ $? -eq 0 ] && echo 'PASS' || echo 'FAIL')")
}

echo "============================================"
echo " EDL-CAREPA Complete Test Suite"
echo " Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo " PHP: $(php -v | head -1)"
echo " Python: $(python3 --version 2>/dev/null || echo 'N/A')"
echo "============================================"

# ─── PHP Unit Tests ─────────────────────────────────────────────────
echo ""
echo "--- PHP Unit Tests ---"

for f in tests/unit_*_test.php tests/helpers_test.php; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    run_test "$name" "php $f" ".logs/${name%.php}.log"
done

# ─── PHP Legacy Tests ───────────────────────────────────────────────
echo ""
echo "--- PHP Legacy Tests ---"

for f in tests/run_tests.php backend/tests/test_evaluaciones_fechas.php; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    run_test "$name" "php $f" ".logs/${name%.php}.log"
done

# ─── Python Integration Tests ──────────────────────────────────────
echo ""
echo "--- Python Integration Tests ---"

if python3 -c "import urllib.request" 2>/dev/null; then
    for f in tests/test_auth_security.py tests/test_validation.py; do
        [ -f "$f" ] || continue
        name=$(basename "$f")
        run_test "$name" "python3 $f" ".logs/${name%.py}.log"
    done
else
    echo "  [SKIP] Python3 no disponible"
    SKIP=$((SKIP + 1))
fi

# ─── Summary ────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo " RESULTS"
echo "============================================"
for r in "${RESULTS[@]}"; do echo "  $r"; done
echo ""
echo " Suites: ${#RESULTS[@]} total | PASS: $PASS | FAIL: $FAIL | SKIP: $SKIP"
echo "============================================"
exit $FAIL
