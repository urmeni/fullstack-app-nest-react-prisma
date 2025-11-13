# Nest-App Monorepo (Dockerised: PostgreSQL + NestJS + Prisma + React)

This repository contains a full-stack web application built with:

- **NestJS** backend (Node.js + Prisma ORM)
- **PostgreSQL** database
- **React** frontend (served by Nginx)
- **Docker Compose** for local container orchestration

---

## Features

- Multi-container setup (db, backend, frontend)
- Hot-swappable builds via Docker Compose
- Prisma migrations run directly inside containers
- React frontend automatically connected to backend service
- Persistent PostgreSQL data volume

---

## Project Structure

```
nest-app/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── .env / .env.production
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env / .env.production
├── docker-compose.yml
└── build-run.sh
```

---

## Prerequisites

### Install Docker on Ubuntu

> **Important:** Don’t use the Snap version (`sudo snap install docker`) — it causes permission and path issues. Install Docker CE (Community Edition) from Docker’s official apt repo. That way you get the latest stable version, not the Snap one, and it works seamlessly with Compose.

```bash
# remove any snap/docker.io first
sudo snap remove docker
sudo apt remove docker.io podman-docker

# install prereqs
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# add Docker’s official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# add Docker’s official repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# update and install
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

```

### Verify installation

```bash
docker --version
docker compose version
```

---

## Environment Variables

### backend/.env (used inside container)
```env
PORT=4000
JWT_SECRET=supersecret
DATABASE_URL=postgres://postgres:postgres@db:5432/nestdb
```

### frontend/.env
```env
REACT_APP_API_URL=http://backend:4000
```

> The `.env.production` file is still kept for future VM deployments but will be overwritten with `.env` during local Docker builds.

---

## Docker Setup

### Build and start all containers

Run this helper script:

```bash
chmod +x buildrun.sh
./buildrun.sh
```

or manually:

```bash
docker compose build --pull backend frontend
docker compose up -d db
#docker compose run --rm backend npx prisma migrate deploy # done inside the backend container with corresponding entrypoint.sh
docker compose up -d backend frontend
```

### Verify containers

```bash
docker ps
```

Expected:
```
nest_pg         postgres:15   Up   5433->5432/tcp
nest_backend    backend       Up   4000->4000/tcp
nest_frontend   frontend      Up   3000->80/tcp
```

---

## Access the Application

| Service | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:4000/api |
| PostgreSQL | localhost:5433 |

---

## Key Files

### docker-compose.yml
Defines the 3 services (db, backend, frontend).

### backend/Dockerfile
Builds the NestJS backend, installs dependencies, runs Prisma generate.

### frontend/Dockerfile
Builds React app and serves it via Nginx. Overwrites `.env.production` with `.env` for local builds.

### frontend/nginx.conf
Reverse proxy that redirects `/api` calls to backend.

### build-run.sh
Automates build, migration, and service startup.

---

## Common Pitfalls & Fixes

| Problem | Cause | Fix |
|----------|--------|-----|
| **Permission denied on Docker socket** | User not in `docker` group | `sudo usermod -aG docker $USER` → `newgrp docker` |
| **Port 5432 already in use** | Local PostgreSQL instance running | Changed host port to `5433:5432` |
| **Prisma client binary mismatch** | Prisma client built on host OS | Run `npx prisma generate` inside Docker build |
| **Double `/api/api/...` paths** | Wrong `REACT_APP_API_URL` | Set to `http://backend:4000` |
| **CRA env confusion** | `.env.production` overrides `.env` | Overwrite `.env.production` in Dockerfile |

---

## Useful Commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# Rebuild specific service
docker compose build backend

# View logs
docker compose logs -f backend

# Run migrations manually
docker compose run --rm backend npx prisma migrate deploy
```

---

## Container Network Diagram

```
 ┌───────────────┐       ┌────────────────┐       ┌──────────────────┐
 │   Frontend    │ <---> │   Backend API  │ <---> │   PostgreSQL DB  │
 │ (React+Nginx) │       │ (NestJS+Prisma)│       │ (postgres:15)   │
 │ port:3000     │       │ port:4000      │       │ port:5432 (5433)│
 └───────────────┘       └────────────────┘       └──────────────────┘
```

---

## Notes

- Prisma client is always generated **inside container**.
- CRA environment variables are **baked at build time**.
- Use `backend` as hostname inside the Docker network (not localhost).

---

