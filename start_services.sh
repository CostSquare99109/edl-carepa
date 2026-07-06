#!/data/data/com.termux/files/usr/bin/bash
set -e

BACKEND_DIR="$(dirname "$0")/backend"
FRONTEND_DIR="$(dirname "$0")/frontend"

cleanup() {
  echo ""
  echo "Deteniendo servicios..."
  kill $PHP_PID $VITE_PID 2>/dev/null
  wait $PHP_PID $VITE_PID 2>/dev/null
  echo "Detenido."
}
trap cleanup EXIT INT TERM

# Backend (loop para auto-reinicio)
cd "$BACKEND_DIR"
while true; do
  php -S 0.0.0.0:8000 -t public/ public/router.php &
  PHP_PID=$!
  wait $PHP_PID
  sleep 1
  echo "[$(date +%H:%M:%S)] Reiniciando backend..."
done &
PHP_WATCHER=$!

# Frontend
cd "$FRONTEND_DIR"
npm run dev &
VITE_PID=$!

echo "=== Servicios iniciados ==="
echo "  Frontend: http://localhost:5174"
echo "  Backend:  http://localhost:8000"
echo ""
echo "Presiona Ctrl+C para detener todo."

wait $PHP_WATCHER $VITE_PID
