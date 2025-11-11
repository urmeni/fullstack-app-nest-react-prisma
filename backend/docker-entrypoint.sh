#!/bin/sh
set -e

# default values (can be overridden via env)
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_WAIT_TIMEOUT=${DB_WAIT_TIMEOUT:-60}

echo "Waiting for database at $DB_HOST:$DB_PORT ..."

# wait until tcp port is open (netcat must be installed)
COUNTER=0
until nc -z "$DB_HOST" "$DB_PORT"; do
  COUNTER=$((COUNTER+1))
  if [ "$COUNTER" -ge "$DB_WAIT_TIMEOUT" ]; then
    echo "Timeout waiting for DB ($DB_WAIT_TIMEOUT seconds)."
    exit 1
  fi
  echo "DB not ready yet... ($COUNTER)"
  sleep 1
done

echo "DB is up — running migrations (prisma migrate deploy)..."
# For development you may prefer `prisma migrate dev`. For production use CI & `migrate deploy`.
npx prisma migrate deploy --preview-feature || true

echo "Starting NestJS..."
exec node dist/main.js
