# Grievance Management System – Technical Bible

---

## 1. Executive Summary
A full-stack, multi-role grievance management platform for government/public sector use. Enables citizens to submit grievances, tracks their resolution, and provides dashboards for various government roles (Minister, PA, Back Officer, Field Officer, etc.).

---

## 2. Table of Contents
1. Executive Summary
2. Table of Contents
3. System Architecture
4. Tech Stack & Dependencies
5. Folder & File Structure
6. Environment Variables & Secrets
7. Database Schema & Models
8. API Design & Endpoints
9. Authentication & Authorization
10. Role-Based Access Control
11. UI/UX & Component Library
12. State Management & Hooks
13. Error Handling & Logging
14. Testing & QA
15. DevOps, CI/CD & Deployment
16. Seeding, Demo Data & Test Users
17. Security Best Practices
18. Troubleshooting & FAQ
19. Contribution Guide
20. Contact & Ownership

---

## 3. System Architecture
- **Monorepo**: Next.js (frontend & API), Prisma ORM, PostgreSQL, Docker, Playwright, Vercel, Kubernetes (optional)
- **App Router**: Modular routing, API endpoints, and role-based layouts
- **API**: RESTful, stateless, with JWT authentication
- **Database**: PostgreSQL, managed by Prisma ORM
- **Auth**: NextAuth.js, JWT, role-based middleware
- **UI**: Tailwind CSS, shadcn/ui, React, accessibility-first
- **Maps**: Leaflet/React-Leaflet for geospatial features

---

## 4. Tech Stack & Dependencies
- **Frontend**: Next.js 13/14, React 18+, TypeScript, Tailwind CSS, shadcn/ui, react-leaflet
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Auth**: NextAuth.js, bcrypt, JWT
- **Testing**: Playwright, Jest (optional)
- **DevOps**: Docker, docker-compose, Vercel, Kubernetes (k8s)
- **Other**: zod (validation), dotenv, @prisma/client

---

## 5. Folder & File Structure
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

---

## 6. Environment Variables & Secrets
- `.env.local` (never commit to Git)
```
DATABASE_URL=postgresql://user:password@localhost:5432/grievance_db
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```
- See `.env.example` for all required variables

---

## 7. Database Schema & Models
- **Prisma ORM**: Models for User, Grievance, Project, Category, PatientGrievance, IndividualGrievance, JobRequest, TTDRequest, etc.
- **Migrations**: Managed via Prisma
- **Seed Data**: `prisma/seed-comprehensive.js`, `seed-data.sql`
- **ER Diagram**: (Add diagram if available)

---

## 8. API Design & Endpoints
- **RESTful API** under `/app/api/`
- **Grievances**: `/api/grievances`, `/api/grievances/[id]`, `/api/grievances/search`
- **Projects**: `/api/government-projects`, `/api/government-projects/[id]`, `/api/government-projects/[id]/assign`
- **Users**: `/api/users`, `/api/auth` (NextAuth)
- **Categories**: `/api/categories`
- **Reports/Print**: `/api/print/receipt`, `/api/print/report`
- **Field/Minister/PA**: `/api/field/assigned-tasks`, `/api/minister/analytics`, etc.
- **Attachments**: `/api/field/upload`, etc.
- **API Documentation**: See `API_DOCUMENTATION.md` for request/response samples

---

## 9. Authentication & Authorization
- **NextAuth.js** for login/session
- **Role-based access**: Middleware restricts routes by user role
- **JWT**: Used for API authentication
- **Session Management**: Cookies, JWT, refresh tokens (if needed)

---

## 10. Role-Based Access Control
- **Roles**: ADMIN, MINISTER, PA, BACK_OFFICER, FIELD_OFFICER, PUBLIC
- **Access Matrix**: (Add table for which role can access which route/module)
- **Middleware**: `/middleware.ts` enforces access

---

## 11. UI/UX & Component Library
- **Reusable UI**: All forms, tables, cards in `/components/ui/`
- **Forms**: Grievance, project, assignment, search, etc.
- **Print templates**: `/components/print/`
- **Map**: Leaflet integration for location-based features
- **Accessibility**: Keyboard navigation, ARIA labels
- **Mobile Responsive**: All dashboards and forms

---

## 12. State Management & Hooks
- **React State**: useState, useEffect, useContext
- **Custom Hooks**: `/hooks/use-api.ts`, `/hooks/use-toast.ts`, etc.
- **Context Providers**: Auth, Notification, Theme

---

## 13. Error Handling & Logging
- **API Errors**: Standardized error responses, error boundaries
- **Client Errors**: Toast notifications, error boundaries
- **Logging**: Console, server logs, (add Sentry or similar for production)

---

## 14. Testing & QA
- **Playwright**: End-to-end tests in `/tests/e2e/`
- **Manual**: Use seeded users to test all flows
- **Unit Tests**: (Add with Jest if needed)
- **CI/CD**: (Describe pipeline if set up)

---

## 15. DevOps, CI/CD & Deployment
- **Docker**: `Dockerfile`, `docker-compose.yml` for local/prod
- **Vercel**: `vercel.json` for cloud deployment
- **Kubernetes**: `k8s/` manifests for advanced deployment
- **Build & Start**:
  - `npm install` or `pnpm install`
  - `npx prisma migrate dev`
  - `node prisma/seed-comprehensive.js` or `npx prisma db execute --file seed-data.sql`
  - `npm run dev` or `pnpm dev`

---

## 16. Seeding, Demo Data & Test Users
- **Comprehensive seed**: `prisma/seed-comprehensive.js` (JS, all roles, categories, test data)
- **Simple SQL seed**: `seed-data.sql` (basic data)
- **Test credentials**: See `quick-start.js` or seed scripts for demo logins

---

## 17. Security Best Practices
- Never commit `.env.local` or secrets to Git
- Use HTTPS in production
- Sanitize all user input (zod, Prisma)
- Use strong passwords and hashing (bcrypt)
- Restrict API access by role
- Regularly update dependencies

---

## 18. Troubleshooting & FAQ
- **Red folders/files in VS Code**: Uncommitted Git changes, not code errors
- **Blank page on startup**: Check for build/runtime errors in terminal
- **Database errors**: Check `DATABASE_URL` and run migrations/seed
- **Auth errors**: Check NextAuth config and secrets
- **API not working**: Check route, method, and request body
- **How to reset DB?**: Use `prisma migrate reset` or re-run seed scripts

---

## 19. Contribution Guide
- Use feature branches, PRs, and code reviews
- Follow code style in `.editorconfig` and `tsconfig.json`
- Document new APIs and components
- Add/Update tests for new features
- Update documentation as needed

---

## 20. Contact & Ownership
- **Lead Developer/CTO**: [Add contact here]
- **Docs maintained by**: [Add name/email]
- **For support**: [Add support email/Slack/Teams]

---

## Appendix
- **ER Diagrams, API schemas, and more**: (Add as needed)
- **See also**: `README.md`, `API_DOCUMENTATION.md`, code comments

---

This document is the technical bible for the Grievance Management System. Keep it updated as the project evolves. For any questions, contact the project maintainer.
