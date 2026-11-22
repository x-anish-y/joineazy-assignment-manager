# JoinEazy Assignment Manager

A full-stack student, group & assignment management system with role-based access control.

## Stack

- **Frontend:** React (Vite, JavaScript) + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + raw SQL (pg)
- **Database:** PostgreSQL
- **Auth:** JWT with student/admin roles
- **Deployment:** Docker + docker-compose

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL (or a hosted Neon DB)

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm install
npm run db:init         # create tables (idempotent)
npm run seed            # seed demo data
npm run dev             # start with nodemon
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Demo Accounts (after seeding)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | prof@joineazy.test  | Admin@123   |
| Student | stu1@joineazy.test  | Student@123 |
| Student | stu2@joineazy.test  | Student@123 |

## API Documentation

See `backend/api.http` for a complete list of endpoints with example requests.
