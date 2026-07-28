#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"

cleanup() {
  echo "Deteniendo servicios..."
  [ -f "$PID_DIR/mysql.pid" ] && kill "$(cat "$PID_DIR/mysql.pid")" 2>/dev/null && rm "$PID_DIR/mysql.pid"
  [ -f "$PID_DIR/php.pid" ] && kill "$(cat "$PID_DIR/php.pid")" 2>/dev/null && rm "$PID_DIR/php.pid"
  [ -f "$PID_DIR/node.pid" ] && kill "$(cat "$PID_DIR/node.pid")" 2>/dev/null && rm "$PID_DIR/node.pid"
  echo "Servicios detenidos."
}

cleanup
