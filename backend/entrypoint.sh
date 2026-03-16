#!/bin/sh
set -e

echo "=== Media Zone RP — Starting ==="
echo "DATABASE_URL: $DATABASE_URL"

python3 -c "
import os, sys, time, pymysql, re
url = os.environ.get('DATABASE_URL', '')
m = re.match(r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', url)
user, password, host, port, db = m.groups()
port = int(port)
print(f'Waiting for MySQL at {host}:{port} ...')
for i in range(1, 61):
    try:
        c = pymysql.connect(host=host, port=port, user=user, password=password, database=db, connect_timeout=3)
        c.close()
        print(f'MySQL ready (attempt {i})')
        sys.exit(0)
    except Exception as e:
        print(f'  [{i}/60] {e}')
        time.sleep(3)
sys.exit(1)
"

echo "Running seed..."
python3 seed.py

echo "=== Starting uvicorn ==="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --no-access-log