# Fullstack NestJS + React Monorepo

A complete **full-stack web application** built with **NestJS**, **React**, and **PostgreSQL**, designed for local development and production deployment across multiple virtual machines using **Nginx reverse proxies**.

---

## Project Overview

| Layer | Technology | Description |
|:------|:------------|:-------------|
| Frontend | **React + Axios** | Single-page app built with Create React App |
| Backend | **NestJS + Prisma** | REST API with JWT authentication and PostgreSQL ORM |
| Database | **PostgreSQL** | Relational data storage |
| Web Server | **Nginx** | Static hosting & reverse proxy |
| Deployment | **VirtualBox Multi-VM** | Isolated Frontend, Backend, DB, and Test VMs |

---

## 🗂 Monorepo Structure

```
/
├── backend/               # NestJS backend
│   ├── src/
│   ├── prisma/
│   ├── dist/              # Compiled output
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/              # React frontend
│   ├── src/
│   ├── public/
│   ├── build/             # Production build output
│   ├── package.json
│   └── .env.example
│
└── README.md              # This file
```

---

## Technologies Used

### **Frontend**
- React (Create React App)
- Axios for HTTP requests
- React Router

### **Backend**
- NestJS Framework
- Prisma ORM
- JWT Authentication (with Guards)
- PostgreSQL
- Class Validator / DTOs

### **Infrastructure**
- Nginx reverse proxy
- Node.js v18+
- PostgreSQL 15+
- Multi-VM deployment via VirtualBox

---

## Installation & Setup (Development)

### Clone the repository

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

---

### Backend Setup

#### Install dependencies
```bash
cd backend
npm install
```

#### Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL="postgresql://nestuser:password@localhost:5432/nestappdb?schema=public"
JWT_SECRET="yoursecret"
PORT=4000
```

#### Database setup
Ensure PostgreSQL is running locally:
```bash
npx prisma migrate dev
npx prisma generate
```

#### Run backend
```bash
npm run start:dev
```

Backend available at:
```
http://localhost:4000/api
```

---

### Frontend Setup

#### Install dependencies
```bash
cd ../frontend
npm install
```

#### Configure environment
Create `.env.local`:
```bash
REACT_APP_API_URL=http://localhost:4000/api
```

#### Run frontend
```bash
npm start
```

Frontend available at:
```
http://localhost:3000
```

---

## Local Development Workflow

| Service | Command | URL |
|----------|----------|-----|
| **Frontend** | `npm start` | http://localhost:3000 |
| **Backend** | `npm run start:dev` | http://localhost:4000/api |
| **Database** | PostgreSQL service | localhost:5432 |

---

## Production Deployment (Multi-VM)

### 🔹 Overview
We use a **build-on-host, deploy-to-VM** strategy:
- Build React and NestJS on the host
- Transfer only built artifacts to VMs
- Use Nginx for serving and proxying

---

### 🔹 Backend Deployment (BackendVM)

#### 1. Build backend
```bash
cd backend
npm ci
npm run build
npx prisma generate
```

#### 2. Transfer to VM
```bash
scp -r dist prisma package.json package-lock.json admin@BackendVM:~/backend
```

#### 3. Install dependencies on VM
```bash
cd ~/backend
npm ci --omit=dev
node dist/main.js
```

#### 4. Configure Nginx (`/etc/nginx/sites-available/backend.conf`)
```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable & reload:
```bash
sudo ln -s /etc/nginx/sites-available/backend.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 🔹 Frontend Deployment (FrontendVM)

#### 1. Build frontend
```bash
cd frontend
npm ci
npm run build
```

#### 2. Transfer to VM
```bash
scp -r build admin@FrontendVM:~/frontend
```

#### 3. Configure Nginx (`/etc/nginx/sites-available/frontend`)
```nginx
server {
    listen 80;
    server_name _;

    root /home/admin/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

#### 4. Reload Nginx
```bash
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 🔹 Database Setup (DBVM)

```sql
CREATE USER nestuser WITH PASSWORD 'strongpassword';
CREATE DATABASE nestappdb OWNER nestuser;
GRANT ALL PRIVILEGES ON DATABASE nestappdb TO nestuser;
```

Edit `/etc/postgresql/*/main/pg_hba.conf`:
```
host all all 192.168.56.0/24 md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Environment Configuration Summary

| Environment | File | Example |
|--------------|------|----------|
| **Frontend (Dev)** | `.env.local` | `REACT_APP_API_URL=http://localhost:4000/api` |
| **Frontend (Prod)** | `.env.production` | `REACT_APP_API_URL=http://192.168.56.11/api` |
| **Backend** | `.env` | `DATABASE_URL=postgresql://nestuser:password@192.168.56.10:5432/nestappdb?schema=public` |

---

## Common Pitfalls & Fixes

| Issue | Cause | Fix |
|-------|--------|-----|
| **Permission denied (frontend)** | Nginx can’t read `/build` | `sudo chown -R www-data:www-data frontend/build` |
| **404 `/api/api/...`** | Double prefix in routes | Remove redundant `/api` in proxy or frontend |
| **500 Internal Server Error** | Missing `.env` or DB access | Check `.env` and DB connection |
| **Prisma client error** | `npx prisma generate` not run | Run it before starting the backend |
| **CORS error** | Missing origin in NestJS | Enable CORS in `main.ts` with allowed origin |
| **Reverse proxy mismatch** | Wrong IP in `proxy_pass` | Ensure correct internal VM IPs |

---

## Architecture Diagram

```
   ┌─────────────────┐
   │  FrontendVM     │
   │  React + Nginx  │
   │  (192.168.56.12)│
   └───────┬─────────┘
           │ /api
           ▼
   ┌─────────────────┐
   │  BackendVM      │
   │  NestJS + Nginx │
   │  (192.168.56.11)│
   └───────┬─────────┘
           │ PostgreSQL
           ▼
   ┌─────────────────┐
   │  DBVM           │
   │  PostgreSQL     │
   │  (192.168.56.10)│
   └─────────────────┘
```

---

## Testing API Connections

From FrontendVM:
```bash
curl -i -X POST http://192.168.56.11/api/auth/signup   -H "Content-Type: application/json"   -d '{"email":"test@example.com","password":"123456"}'
```

Expected response:
```json
{ "message": "User created successfully" }
``