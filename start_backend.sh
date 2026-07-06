#!/data/data/com.termux/files/usr/bin/bash
# Mantiene vivo php -S. Se reinicia solo si muere.
cd "$(dirname "$0")/backend"
while true; do
  php -S 0.0.0.0:8000 -t public/ public/router.php
  sleep 1
done
