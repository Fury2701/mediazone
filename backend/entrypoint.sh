#!/bin/sh
set -e

echo "=== Media Zone RP — Starting ==="

# ── 1. Parse host/port from DATABASE_URL ──────────────────────────────────────
# DATABASE_URL = mysql+pymysql://user:pass@HOST:PORT/dbname
DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@\([^:]*\):.*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')
DB_USER=$(echo "$DATABASE_URL" | sed 's|.*://\([^:]*\):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed 's|.*://[^:]*:\([^@]*\)@.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/\([^?]*\).*|\1|')

DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}

echo "Connecting to MySQL at ${DB_HOST}:${DB_PORT} ..."

# ── 2. Wait for MySQL TCP port ─────────────────────────────────────────────────
MAX=60
COUNT=0
until mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" \
      -u "$DB_USER" --password="$DB_PASS" --silent 2>/dev/null; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX" ]; then
    echo "✗ MySQL not ready after ${MAX}s — aborting"
    exit 1
  fi
  echo "  Waiting for MySQL... ${COUNT}/${MAX}"
  sleep 2
done

echo "✓ MySQL is ready!"

# ── 3. Run migrations / seed ───────────────────────────────────────────────────
echo "Running seed..."
python seed.py

# ── 4. Start FastAPI ──────────────────────────────────────────────────────────
echo "=== Starting FastAPI ==="
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    --no-access-log
