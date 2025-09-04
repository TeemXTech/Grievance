# Technical Documentation - Minister's Grievance Management System

## System Architecture

### Technology Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with JWT
- **UI Framework:** Tailwind CSS, Radix UI
- **Deployment:** Vercel (recommended)

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                   String    @id @default(cuid())
  name                 String
  email                String    @unique
  passwordHash         String
  role                 Role      @default(PUBLIC)
  phone                String?   @db.VarChar(32)
  status               String?   @default("active")
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

#### Grievance Model
```prisma
model Grievance {
  id                     String            @id @default(cuid())
  referenceNumber        String            @unique
  title                  String
  description            String
  status                 GrievanceStatus   @default(PENDING)
  priority               Priority          @default(MEDIUM)
  requesterName          String
  requesterPhone         String            @db.VarChar(32)
  requesterEmail         String?
  village                String?
  mandal                 String?
  district               String?
  state                  String?           @default("Telangana")
  grievanceCategory      GrievanceCategory @default(OTHER)
  estimatedCost          Float?
  expectedResolutionDate DateTime?
  actualResolutionDate   DateTime?
  assignedToId           String?
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt
}
```

### Enums
```prisma
enum Role {
  ADMIN | OFFICER | PUBLIC | MINISTER | PA | FIELD_OFFICER | BACK_OFFICER
}

enum GrievanceStatus {
  PENDING | ASSIGNED | IN_PROGRESS | UNDER_REVIEW | RESOLVED | CLOSED | REJECTED | WIP
}

enum GrievanceCategory {
  HEALTH | JOBS | CIVIL_WORK | COLLECTIVE_REQUEST | CM_FUND | EDUCATION | 
  AGRICULTURE | INFRASTRUCTURE | SOCIAL_WELFARE | TTD_SERVICES | PUBLIC_SERVICES | OTHER
}
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `GET /api/auth/session` - Get current session

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/analytics/dashboard` - Analytics data
- `GET /api/analytics/aggregated` - Aggregated analytics
- `GET /api/analytics/constituency` - Constituency-wise data
- `GET /api/analytics/critical-grievances` - Critical grievances

### Grievances Management
- `GET /api/grievances` - List all grievances
- `POST /api/grievances` - Create new grievance
- `GET /api/grievances/[id]` - Get specific grievance
- `PUT /api/grievances/[id]` - Update grievance
- `POST /api/grievances/create` - Enhanced grievance creation
- `GET /api/grievances/search` - Search grievances
- `POST /api/grievances/status-update` - Update status
- `GET /api/grievances/by-mobile` - Get by mobile number

### Specialized Grievances
- `POST /api/grievances/patient` - Patient grievances
- `POST /api/grievances/individual` - Individual grievances
- `POST /api/grievances/job` - Job requests
- `POST /api/grievances/ttd` - TTD services

### Minister Dashboard
- `GET /api/minister/dashboard` - Minister dashboard data
- `GET /api/minister/analytics` - Minister analytics
- `GET /api/minister/grievances` - Minister's grievances
- `GET /api/minister/projects` - Government projects
- `POST /api/minister/assign` - Assign grievances
- `GET /api/minister/map-data` - Map visualization data
- `GET /api/minister/events` - Calendar events

### User Management
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user

### Categories & Configuration
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification

### Reports & Printing
- `GET /api/print/receipt` - Generate receipt
- `GET /api/print/report` - Generate report
- `GET /api/reports/minister-visit` - Minister visit report

### Calendar & Events
- `GET /api/calendar` - Calendar events
- `POST /api/calendar` - Create event
- `POST /api/assign-event` - Assign event

### Field Operations
- `GET /api/field/assigned-tasks` - Field officer tasks
- `POST /api/field/update-status` - Update field status

### WhatsApp Integration
- `POST /api/whatsapp/intake` - WhatsApp message intake
- `GET /api/whatsapp/pending` - Pending WhatsApp messages
- `POST /api/whatsapp/[id]/approve` - Approve WhatsApp grievance

### Tracking
- `GET /api/track/[qrCode]` - Track by QR code

### AI Assistant
- `POST /api/assistant/query` - AI query processing
- `GET /api/assistant/health` - Health check

### Chatbot
- `POST /api/chatbot` - Chatbot interactions

## Routing Structure

### Public Routes
- `/` - Landing page
- `/demo-login` - Demo login portal
- `/track/[qrCode]` - Public tracking

### Authentication Routes
- `/auth/login` - Login page
- `/bypass-login` - Development bypass
- `/demo-login` - Demo access

### Role-Based Dashboards
- `/dashboard` - General officer dashboard
- `/minister/dashboard` - Minister dashboard
- `/pa/dashboard` - PA dashboard
- `/back-officer/dashboard` - Back officer dashboard
- `/field/dashboard` - Field officer dashboard
- `/admin/dashboard` - Admin dashboard

### Specialized Pages
- `/grievances/[id]` - Grievance details
- `/print/receipt/[id]` - Print receipt
- `/print/report/[type]` - Print reports
- `/map` - Geographic visualization
- `/assistant` - AI assistant interface

## Authentication & Authorization

### NextAuth Configuration
```typescript
providers: [
  CredentialsProvider({
    credentials: {
      email: { type: "email" },
      password: { type: "password" }
    },
    authorize: async (credentials) => {
      // Bcrypt password verification
      // Role-based user validation
    }
  })
]
```

### Role-Based Access Control
- **ADMIN:** Full system access
- **MINISTER:** Dashboard, analytics, assignments
- **PA:** Minister support, scheduling
- **OFFICER:** Grievance processing
- **FIELD_OFFICER:** Field operations
- **BACK_OFFICER:** Data entry, processing
- **PUBLIC:** Limited tracking access

## Logging & Audit

### Audit Log Model
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  entityType String
  entityId   String
  userId     String
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
}
```

### Logged Actions
- User authentication
- Grievance creation/updates
- Status changes
- Assignments
- Data modifications
- System access

## Environment Variables

### Required Configuration
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Optional Configuration
```env
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Data Flow

### Grievance Lifecycle
1. **Intake:** Multiple channels (Web, WhatsApp, Field)
2. **Processing:** Auto-categorization, validation
3. **Assignment:** Role-based routing
4. **Tracking:** Real-time status updates
5. **Resolution:** Completion workflow
6. **Audit:** Complete trail logging

### Minister Dashboard Flow
1. **Data Aggregation:** Real-time statistics
2. **Analytics:** Trend analysis, insights
3. **Visualization:** Charts, maps, reports
4. **Actions:** Assignments, approvals
5. **Monitoring:** Progress tracking

## Security Features

### Data Protection
- Password hashing (bcrypt)
- JWT token authentication
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection

### Access Control
- Role-based permissions
- Route protection middleware
- API endpoint authorization
- Session management

## Performance Optimization

### Database
- Indexed queries
- Connection pooling
- Query optimization
- Pagination

### Frontend
- Server-side rendering
- Static generation
- Image optimization
- Code splitting

## Deployment Architecture

### Production Setup
```yaml
Frontend: Vercel/Netlify
Database: PostgreSQL (AWS RDS/Supabase)
Cache: Redis (optional)
Storage: AWS S3/Cloudinary
Monitoring: Sentry/LogRocket
```

### Development Setup
```bash
npm install
npx prisma generate
npm run dev
```

## Monitoring & Maintenance

### Health Checks
- Database connectivity
- API response times
- Error rates
- User activity

### Backup Strategy
- Daily database backups
- File storage backups
- Configuration backups
- Disaster recovery plan

## Integration Points

### External Services
- WhatsApp Business API
- SMS Gateway
- Email Service (SMTP)
- Maps API (optional)
- Payment Gateway (future)

### Data Import/Export
- Excel/CSV import
- PDF report generation
- Data synchronization
- Bulk operations

## Troubleshooting

### Common Issues
1. **Database Connection:** Check DATABASE_URL
2. **Authentication:** Verify NEXTAUTH_SECRET
3. **Build Errors:** Check TypeScript types
4. **Performance:** Monitor query performance

### Debug Tools
- Prisma Studio: `npx prisma studio`
- Database logs: Check PostgreSQL logs
- Application logs: Console/file logging
- Network monitoring: Browser dev tools

## Future Enhancements

### Planned Features
- Mobile application
- Advanced analytics
- ML-based categorization
- Real-time notifications
- Multi-language support
- Advanced reporting

### Scalability Considerations
- Microservices architecture
- Load balancing
- Database sharding
- CDN integration
- Caching strategies