# Grievance Management System (Next.js + Prisma)

Single Next.js application with API routes, NextAuth, Prisma (PostgreSQL), and Tailwind CSS.

## Features

- Authentication with credentials (NextAuth, JWT sessions)
- Roles: Admin, Officer, Public
- Grievances: submit, view, update status, assign
- Dashboard stats
- Categories API
- Prisma migrations and seed

## Prerequisites

- Node.js 18+
- PostgreSQL running locally or remote

## Setup

1) Create `.env` in project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/grievance_db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change
```

2) Install dependencies and run dev:

```bash
npm install
npx prisma generate
npm run dev
```

The dev script will ensure the database exists, run migrations, and seed initial data.

Default users:
- admin@example.com / password123 (ADMIN)
- officer@example.com / password123 (OFFICER)
- public@example.com / password123 (PUBLIC)

## API Routes

- `GET /api/dashboard/stats`
- `GET /api/categories`
- `GET /api/grievances`
- `POST /api/grievances`
- `GET /api/grievances/:id`
- `PUT /api/grievances/:id`

## Scripts

- `npm run dev` – ensure DB, migrate, seed, start Next.js
- `npm run build` – build app
- `npm run start` – start production server
- `npm run seed` – seed database

## Notes

- Environment variable `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000` for client requests.
- The older nested `backend/` and `web/` apps are not required to run; this root app is self-contained.
