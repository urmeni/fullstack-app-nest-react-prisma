#!/bin/sh
set -e

# Build backend
docker compose build --pull backend

# Start DB
docker compose up -d db

# Wait a few seconds (optional)
#sleep 5
# Run migrations
#docker compose run --rm --entrypoint "" backend npx prisma migrate deploy

# Start backend
docker compose up -d backend

# Build frontend
docker compose build --pull frontend

# Start frontend
docker compose up -d frontend

# Tail logs
docker compose logs -f backend frontend
