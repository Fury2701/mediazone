#!/bin/sh
set -e

echo "=== Media Zone RP — Starting ==="
echo "DATABASE_URL: $DATABASE_URL"

# ── Wait for MySQL using Python (pymysql вже є в requirements) ────────────────
python - <<'PYEOF'
import os, sys, time

url = os.environ.get("DATABASE_URL", "")
# parse: mysql+pymysql://user:pass@host:port/db
import re
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", url)
if not m:
    print(f"Cannot parse DATABASE_URL: {url}")
    sys.exit(1)

user, password, host, port, db = m.groups()
port = int(port)

print(f"Waiting for MySQL at {host}:{port} ...")

import pymysql
for i in range(1, 61):
    try:
        conn = pymysql.connect(host=host, port=port, user=user,
                               password=password, database=db,
                               connect_timeout=3)
        conn.close()
        print(f"✓ MySQL ready (attempt {i})")
        sys.exit(0)
    except Exception as e:
        print(f"  [{i}/60] {e}")
        time.sleep(3)

print("✗ MySQL not available after 60 attempts")
sys.exit(1)
PYEOF

# ── Seed tables + categories ──────────────────────────────────────────────────
echo "Running seed..."
python seed.py

# ── Start FastAPI ─────────────────────────────────────────────────────────────
echo "=== Starting uvicorn ==="
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    --no-access-log
