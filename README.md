# JoinEazy Assignment Manager

A full-stack, role-based Student, Group & Assignment Management System built for university courses.

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

---

## Architecture & Technology Stack

- **Frontend:** React (Vite, JavaScript), Tailwind CSS, React Router, Recharts, React Hot Toast, Lucide Icons
- **Backend:** Node.js, Express, raw SQL queries using `pg` Pool (zero ORM), Zod validation, Helmet, CORS, Rate Limiting
- **Database:** PostgreSQL (Neon Serverless DB in Cloud / PostgreSQL 16 in Docker)
- **Authentication:** JWT with role-based access control (`student` / `admin`), bcrypt (12 salt rounds)
- **Deployment:** Docker & Docker Compose, Render (Backend API), Vercel (Frontend SPA), Neon (Database)

```
docs/
├── er-diagram.md     # Mermaid Entity-Relationship diagram
└── architecture.md   # System architecture and request flow
```

---

## Demo Credentials (Seeded Data)

| Role | Email | Password | Student ID / Details |
|---|---|---|---|
| **Admin (Professor)** | `prof@joineazy.test` | `Admin@123` | Can create, edit, delete & track all assignments |
| **Student Leader** | `stu1@joineazy.test` | `Student@123` | `STU001` — Leader of **Alpha Team** |
| **Student Member** | `stu2@joineazy.test` | `Student@123` | `STU002` — Member of **Alpha Team** |
| **Student Member** | `stu3@joineazy.test` | `Student@123` | `STU003` — Member of **Alpha Team** |
| **Student Leader** | `stu4@joineazy.test` | `Student@123` | `STU004` — Leader of **Beta Squad** |
| **Student Member** | `stu5@joineazy.test` | `Student@123` | `STU005` — Member of **Beta Squad** |
| **Student Member** | `stu6@joineazy.test` | `Student@123` | `STU006` — Member of **Beta Squad** |

*Note: The login page includes 1-click demo login buttons for rapid testing.*

---

## Option 1: Quick Start with Docker Compose

Running the entire stack (Database + Backend + Frontend) via Docker:

```bash
# 1. Clone repository
git clone https://github.com/x-anish-y/joineazy-assignment-manager.git
cd joineazy-assignment-manager

# 2. Copy root environment variables
cp .env.example .env

# 3. Build and launch all containers
docker-compose up --build -d

# 4. Seed the database (creates demo professor, students, teams, assignments)
docker-compose exec backend npm run seed
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Database:** `localhost:5432`

---

## Option 2: Local Development Setup (Without Docker)

### 1. Database & Backend Setup

```bash
cd backend
cp .env.example .env

# Configure your DATABASE_URL in .env (local PostgreSQL or Neon cloud DB)
# DATABASE_URL=postgresql://neondb_owner:npg_RHcim61DKwdu@ep-fancy-frog-aoncgqyy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
# DB_SSL=true

npm install

# Initialize schema (idempotent IF NOT EXISTS)
npm run db:init

# (Optional) Reset database completely
# npm run db:reset

# Seed demo users, groups, assignments, and submissions
npm run seed

# Start development server with nodemon
npm run dev
```

The backend starts at `http://localhost:5000`. Test endpoints using `backend/api.http` or run the automated self-test:

```bash
node selftest.js
```

### 2. Frontend Setup

```bash
cd ../frontend
cp .env.example .env

npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.

---

## Production Deployment Guide

### Step 1: Database Setup on Neon (PostgreSQL)

1. Sign up / Log in to [Neon.tech](https://neon.tech).
2. Create a new project (e.g. `joineazy-db`), select your preferred region (e.g., `ap-southeast-1` or `us-east-1`).
3. Under **Dashboard > Connection Details**, copy the **Connection string** (Pooled or Direct). Example:
   ```
   postgresql://neondb_owner:xxxx@ep-fancy-frog-xxxx-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Run the schema initialization and seed script against your Neon DB from your local terminal:
   ```bash
   cd backend
   DATABASE_URL="<your-neon-connection-string>" DB_SSL=true npm run db:init
   DATABASE_URL="<your-neon-connection-string>" DB_SSL=true npm run seed
   ```

### Step 2: Backend Deployment on Render

1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** > **Web Service** (or use **Blueprint** pointing to `render.yaml`).
3. Connect your GitHub repository `x-anish-y/joineazy-assignment-manager`.
4. Configure service settings:
   - **Name:** `joineazy-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci`
   - **Start Command:** `node src/server.js`
   - **Health Check Path:** `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Port for Express app |
   | `DATABASE_URL` | `<your-neon-connection-string>` | Neon PostgreSQL connection URL |
   | `DB_SSL` | `true` | Enables SSL with `rejectUnauthorized: false` |
   | `JWT_SECRET` | `<random-32-character-secret>` | Secret key for JWT signing |
   | `CORS_ORIGIN` | `https://<your-frontend>.vercel.app` | Vercel production frontend URL (or `*`) |
   | `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes window |
   | `RATE_LIMIT_MAX_REQUESTS` | `1000` | Max total requests |
   | `AUTH_RATE_LIMIT_MAX` | `100` | Max auth attempts |
6. Click **Deploy Web Service**. Once deployed, copy your Render backend URL (e.g., `https://joineazy-backend.onrender.com`).

### Step 3: Frontend Deployment on Vercel

1. Sign up / Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** > **Project** and import your repository.
3. Configure the build settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://joineazy-backend.onrender.com` | Your live Render backend URL |
5. Click **Deploy**. Vercel will build and host your app with SPA routing rewrites handled via `frontend/vercel.json`.
6. Once deployed, take your live Vercel URL (e.g. `https://joineazy.vercel.app`) and update the `CORS_ORIGIN` variable in your Render backend settings.

---

## API Documentation

All routes are prefixed with `/api` and return standardized JSON:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "...", "details": [...] } }
```

See [backend/api.http](backend/api.http) for runnable HTTP requests for every single endpoint.
