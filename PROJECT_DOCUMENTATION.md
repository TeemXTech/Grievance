# Grievance Management System – Technical Documentation

## Overview
This project is a full-stack, multi-role grievance management platform for government/public sector use. It enables citizens to submit grievances, tracks their resolution, and provides dashboards for various government roles (Minister, PA, Back Officer, Field Officer, etc.).

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
4. [Folder Structure](#folder-structure)
5. [Environment Variables](#environment-variables)
6. [Running the Project](#running-the-project)
7. [API Routes](#api-routes)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database & ORM](#database--orm)
10. [Seeding & Test Data](#seeding--test-data)
11. [UI/UX & Components](#uiux--components)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Contributing](#contributing)
15. [Contact](#contact)

---

## 1. Project Structure
- **Monorepo**: Contains both frontend (Next.js) and backend (API, Prisma) in a single repository.
- **App Router**: Uses Next.js 13/14 App Router for modular routing and API endpoints.
- **Role-based Dashboards**: Separate dashboards for Minister, PA, Back Officer, Field Officer, etc.

## 2. Tech Stack
- **Frontend**: Next.js (React, TypeScript), Tailwind CSS, shadcn/ui, react-leaflet (maps)
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Auth**: NextAuth.js (JWT, credentials, role-based access)
- **Other**: Docker, Playwright (testing), Vercel (optional deployment)

## 3. Key Features
- Citizen grievance capture (multi-language, QR receipt)
- Project management (government projects, assignment, status tracking)
- Role-based dashboards (analytics, drill-down, field updates)
- File uploads (attachments, photos)
- Print-ready receipts and reports
- Map integration (Leaflet)
- Comprehensive API for all entities
- Seed/test data for demo and development

## 4. Folder Structure
```
/app                # Next.js app router, pages, API routes
/backend            # (Optional) Backend-specific code
/components         # Reusable React components (forms, UI, cards)
/hooks              # Custom React hooks
/lib                # Utility functions, API clients, context
/prisma             # Prisma schema, migrations, seed scripts
/public             # Static assets (images, geojson, logos)
/scripts            # Deployment and DB scripts
/styles             # Global CSS
/tests              # Playwright and other tests
/types              # TypeScript types
/web                # (Optional) Web-specific code
```

## 5. Environment Variables
Create a `.env.local` file in the root with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/grievance_db
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

## 6. Running the Project
1. **Install dependencies**: `npm install` or `pnpm install`
2. **Setup DB**: `npx prisma migrate dev` (creates tables)
3. **Seed DB**: `node prisma/seed-comprehensive.js` or `npx prisma db execute --file seed-data.sql`
4. **Start app**: `npm run dev` or `pnpm dev`
5. **Access**: Open [http://localhost:3000](http://localhost:3000)

## 7. API Routes
- **RESTful API** under `/app/api/`
- **Grievances**: `/api/grievances`, `/api/grievances/[id]`, `/api/grievances/search`
- **Projects**: `/api/government-projects`, `/api/government-projects/[id]`, `/api/government-projects/[id]/assign`
- **Users**: `/api/users`, `/api/auth` (NextAuth)
- **Categories**: `/api/categories`
- **Reports/Print**: `/api/print/receipt`, `/api/print/report`
- **Field/Minister/PA**: `/api/field/assigned-tasks`, `/api/minister/analytics`, etc.
- **Attachments**: `/api/field/upload`, etc.

## 8. Authentication & Authorization
- **NextAuth.js** for login/session
- **Role-based access**: Middleware restricts routes by user role
- **JWT**: Used for API authentication

## 9. Database & ORM
- **Prisma ORM**: Models for User, Grievance, Project, Category, etc.
- **PostgreSQL**: Main database
- **Migrations**: Managed via Prisma

## 10. Seeding & Test Data
- **Comprehensive seed**: `prisma/seed-comprehensive.js` (JS, all roles, categories, test data)
- **Simple SQL seed**: `seed-data.sql` (basic data)
- **Test credentials**: See `quick-start.js` or seed scripts for demo logins

## 11. UI/UX & Components
- **Reusable UI**: All forms, tables, cards in `/components/ui/`
- **Forms**: Grievance, project, assignment, search, etc.
- **Print templates**: `/components/print/`
- **Map**: Leaflet integration for location-based features
- **Accessibility**: Keyboard navigation, ARIA labels

## 12. Testing
- **Playwright**: End-to-end tests in `/tests/e2e/`
- **Manual**: Use seeded users to test all flows

## 13. Deployment
- **Docker**: `Dockerfile`, `docker-compose.yml` for local/prod
- **Vercel**: `vercel.json` for cloud deployment
- **Kubernetes**: `k8s/` manifests for advanced deployment

## 14. Contributing
- Use feature branches, PRs, and code reviews
- Follow code style in `.editorconfig` and `tsconfig.json`
- Document new APIs and components

## 15. Contact
- **Lead Developer/CTO**: [Add contact here]
- **Docs maintained by**: [Add name/email]

---

## Additional Notes
- **All code is TypeScript-first and modular.**
- **Sensitive data**: Never commit `.env.local` or secrets to Git.
- **For more details**: See `README.md`, `API_DOCUMENTATION.md`, and code comments.

---

This documentation should be updated as the project evolves. For any questions, contact the project maintainer.
