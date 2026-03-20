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

# ── Run DB migrations (add new columns safely) ────────────────────────────────
echo "Running migrations..."
python - <<'PYEOF'
import os, re
import pymysql

url = os.environ.get("DATABASE_URL", "")
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", url)
user, password, host, port, db = m.groups()

conn = pymysql.connect(host=host, port=int(port), user=user, password=password, database=db)
cur = conn.cursor()

migrations = [
    ("users", "forum_banned_until", "ALTER TABLE users ADD COLUMN forum_banned_until DATETIME NULL"),
    ("news",  "image_url",          "ALTER TABLE news ADD COLUMN image_url VARCHAR(512) NULL"),
]

for table, column, sql in migrations:
    cur.execute(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND COLUMN_NAME=%s",
        (db, table, column)
    )
    if cur.fetchone()[0] == 0:
        print(f"  + Adding {table}.{column}")
        cur.execute(sql)
        conn.commit()
    else:
        print(f"  ✓ {table}.{column} already exists")

cur.close()
conn.close()
PYEOF

# ── Seed tables + categories ──────────────────────────────────────────────────
echo "Running seed..."
python seed.py

# ── Start FastAPI ─────────────────────────────────────────────────────────────
echo "=== Starting uvicorn ==="
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --no-access-log
