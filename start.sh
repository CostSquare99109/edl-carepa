#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$PID_DIR" "$LOG_DIR"

cleanup() {
  echo ""
  echo "Deteniendo servicios..."
  [ -f "$PID_DIR/mysql.pid" ] && kill "$(cat "$PID_DIR/mysql.pid")" 2>/dev/null && rm "$PID_DIR/mysql.pid"
  [ -f "$PID_DIR/php.pid" ] && kill "$(cat "$PID_DIR/php.pid")" 2>/dev/null && rm "$PID_DIR/php.pid"
  [ -f "$PID_DIR/node.pid" ] && kill "$(cat "$PID_DIR/node.pid")" 2>/dev/null && rm "$PID_DIR/node.pid"
  exit 0
}
trap cleanup SIGINT SIGTERM

# 1. MySQL
if pgrep -x mysqld >/dev/null 2>&1 || pgrep -x mariadbd >/dev/null 2>&1; then
  echo "[DB] MySQL ya está corriendo (saltando)"
else
  echo "[DB] Iniciando MySQL..."
  nohup mysqld_safe --skip-syslog > "$LOG_DIR/mysql.log" 2>&1 &
  MYSQL_PID=$!
  echo "$MYSQL_PID" > "$PID_DIR/mysql.pid"
  sleep 3
fi

# 2. Backend PHP
echo "[BE] Iniciando PHP backend en :8000..."
nohup php -S localhost:8000 -t "$ROOT_DIR/backend/public" "$ROOT_DIR/backend/public/router.php" > "$LOG_DIR/php.log" 2>&1 &
PHP_PID=$!
echo "$PHP_PID" > "$PID_DIR/php.pid"

# 3. Frontend Vite
echo "[FE] Iniciando frontend en :5173..."
nohup npm --prefix "$ROOT_DIR/frontend" run dev > "$LOG_DIR/vite.log" 2>&1 &
NODE_PID=$!
echo "$NODE_PID" > "$PID_DIR/node.pid"

echo ""
echo "=== Servicios iniciados ==="
echo "  DB:      mysql (PID ${MYSQL_PID:-ya-corriendo})"
echo "  Backend: http://localhost:8000 (PID $PHP_PID)"
echo "  Frontend: http://localhost:5173 (PID $NODE_PID)"
echo ""
echo "Logs: $LOG_DIR/"
echo "PIDs: $PID_DIR/"
echo "Usa './stop.sh' para detener."
