# UAT Testing Guide - Grievance Management System

## 🚀 Quick Setup for UAT

### 1. Setup UAT Environment
```bash
# Reset database and populate with comprehensive dummy data
npm run uat:reset

# Or just populate data (if DB exists)
npm run uat:setup

# Start the application
npm run dev
```

### 2. Access Demo Login
Navigate to: **http://localhost:3000/demo-login**

## 👥 Test User Accounts

All accounts use password: **`password123`**

### Ministers (3 accounts)
- **minister@gov.in** - Hon. A. Revanth Reddy (Chief Minister)
- **minister.health@gov.in** - Hon. Damodar Rajanarsimha (Health Minister)  
- **minister.education@gov.in** - Hon. Sabitha Indra Reddy (Education Minister)

### PA Officers (5 accounts)
- **pa@gov.in** - PA to Chief Minister
- **pa.health@gov.in** - PA to Health Minister
- **pa.education@gov.in** - PA to Education Minister
- **pa.revenue@gov.in** - PA to Revenue Department
- **pa.transport@gov.in** - PA to Transport Department

### Back Officers (8 accounts)
- **back@gov.in** - Senior Back Officer
- **back.health@gov.in** - Health Department
- **back.education@gov.in** - Education Department
- **back.water@gov.in** - Water Department
- **back.roads@gov.in** - Roads Department
- **back.agriculture@gov.in** - Agriculture Department
- **back.welfare@gov.in** - Welfare Department
- **back.revenue@gov.in** - Revenue Department

### Field Officers (12 accounts)
- **field@gov.in** - Senior Field Officer
- **field.hyderabad@gov.in** - Hyderabad District
- **field.warangal@gov.in** - Warangal District
- **field.nizamabad@gov.in** - Nizamabad District
- **field.karimnagar@gov.in** - Karimnagar District
- **field.khammam@gov.in** - Khammam District
- **field.nalgonda@gov.in** - Nalgonda District
- **field.mahbubnagar@gov.in** - Mahbubnagar District
- **field.adilabad@gov.in** - Adilabad District
- **field.medak@gov.in** - Medak District
- **field.rangareddy@gov.in** - Rangareddy District
- **field.sangareddy@gov.in** - Sangareddy District

### Admins (3 accounts)
- **admin@gov.in** - System Administrator
- **admin.tech@gov.in** - Technical Administrator
- **admin.data@gov.in** - Data Administrator

### Officers (4 accounts)
- **officer@gov.in** - General Officer
- **officer.revenue@gov.in** - Revenue Officer
- **officer.welfare@gov.in** - Welfare Officer
- **officer.monitoring@gov.in** - Monitoring Officer

### Public Users (15 accounts)
- **public@example.com** - Rajesh Kumar Reddy
- **citizen1@example.com** - Priya Sharma
- **citizen2@example.com** - Suresh Babu
- **citizen3@example.com** - Lakshmi Devi
- **citizen4@example.com** - Venkat Rao
- **citizen5@example.com** - Kavitha Reddy
- **citizen6@example.com** - Mohan Krishna
- **citizen7@example.com** - Sita Mahalakshmi
- **citizen8@example.com** - Ravi Teja
- **citizen9@example.com** - Geetha Rani
- **citizen10@example.com** - Prakash Reddy
- **citizen11@example.com** - Anitha Kumari
- **citizen12@example.com** - Kiran Kumar
- **citizen13@example.com** - Swathi Priya
- **citizen14@example.com** - Vijay Singh

## 📊 Available Test Data

### Grievances (60 records)
- **Categories**: Water Supply, Electricity, Roads & Infrastructure, Healthcare, Education, Sanitation, Agriculture, Employment, Housing, Transport, Social Welfare, Revenue
- **Statuses**: PENDING, ASSIGNED, IN_PROGRESS, UNDER_REVIEW, RESOLVED, CLOSED
- **Priorities**: LOW, MEDIUM, HIGH, URGENT
- **Districts**: Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam, Nalgonda, Mahbubnagar, Adilabad, Medak, Rangareddy, Sangareddy, Siddipet
- **Complete workflow**: Status updates, assignments, resolution history

### Government Projects (20 records)
- **Types**: Infrastructure, Healthcare, Education, Water Supply, Power, Digital Initiatives
- **Statuses**: COMPLETED, IN_PROGRESS, YET_TO_COMPLETE
- **Budget Range**: ₹4 lakhs to ₹3 crores
- **Timeline**: Various start dates and completion schedules

### Notifications (120 records)
- **Types**: Assignments, Status Updates, Urgent Alerts, Reports, System Messages, Policy Updates, Training, Reviews, Approvals, Meetings
- **Read Status**: Mix of read/unread notifications
- **Time Range**: Last 30 days

### Calendar Events (30 records)
- **Types**: District Reviews, Public Hearings, Project Inspections, Budget Sessions, Policy Reviews, Training Programs, Citizen Interactions
- **Attendees**: Ministers, PA Officers, Back Officers, District Officials
- **Timeline**: Next 60 days

### Specialized Grievances
- **Patient Grievances (25)**: Healthcare-related issues with hospital details
- **Individual Grievances (25)**: Personal documentation and certificate issues
- **Job Requests (25)**: Employment-related requests and applications
- **TTD Requests (15)**: Temple visit and accommodation requests

### WhatsApp Integration (40 messages)
- **Status**: Mix of processed and unprocessed messages
- **Content**: Various grievance types received via WhatsApp
- **Timeline**: Last 7 days

## 🧪 UAT Test Scenarios

### 1. Role-Based Access Testing
- **Test**: Login with different roles and verify dashboard access
- **Expected**: Each role should see appropriate dashboard and features
- **Data**: Use accounts from different role categories

### 2. Grievance Lifecycle Testing
- **Test**: Create, assign, update, and resolve grievances
- **Expected**: Complete workflow with status tracking
- **Data**: Use existing grievances in various statuses

### 3. Multi-District Operations
- **Test**: Filter and manage grievances across different districts
- **Expected**: Proper filtering and district-wise data segregation
- **Data**: Grievances spread across 12 districts

### 4. Notification System Testing
- **Test**: Check notification delivery and read status
- **Expected**: Real-time notifications with proper categorization
- **Data**: 120+ notifications across all user types

### 5. Project Management Testing
- **Test**: Track government projects and their progress
- **Expected**: Project timeline, budget tracking, status updates
- **Data**: 20 projects in various stages

### 6. Reporting and Analytics
- **Test**: Generate reports and view analytics dashboards
- **Expected**: Accurate data representation and export functionality
- **Data**: Comprehensive data across all modules

### 7. Search and Filter Testing
- **Test**: Search grievances by various criteria
- **Expected**: Fast and accurate search results
- **Data**: 60+ grievances with diverse metadata

### 8. Mobile Responsiveness
- **Test**: Access system on mobile devices
- **Expected**: Responsive design and touch-friendly interface
- **Data**: All existing data should be accessible

### 9. Performance Testing
- **Test**: System performance with substantial data
- **Expected**: Fast loading times and smooth navigation
- **Data**: 400+ total records across all modules

### 10. Integration Testing
- **Test**: WhatsApp integration and external system connectivity
- **Expected**: Proper message processing and system integration
- **Data**: 40 WhatsApp messages in various states

## 📋 UAT Checklist

### Authentication & Authorization
- [ ] Login with all role types
- [ ] Role-based dashboard access
- [ ] Permission-based feature access
- [ ] Session management
- [ ] Logout functionality

### Grievance Management
- [ ] Create new grievances
- [ ] Assign grievances to officers
- [ ] Update grievance status
- [ ] Add comments and attachments
- [ ] Track grievance history
- [ ] Generate grievance reports

### Project Management
- [ ] View project listings
- [ ] Track project progress
- [ ] Update project status
- [ ] Monitor budget utilization
- [ ] Generate project reports

### Notification System
- [ ] Receive real-time notifications
- [ ] Mark notifications as read
- [ ] Filter notifications by type
- [ ] Notification preferences

### Calendar & Events
- [ ] View calendar events
- [ ] Create new events
- [ ] Manage event attendees
- [ ] Event reminders

### Reporting & Analytics
- [ ] Dashboard statistics
- [ ] Generate various reports
- [ ] Export data functionality
- [ ] Data visualization charts

### Search & Filter
- [ ] Search grievances
- [ ] Filter by category/status/district
- [ ] Advanced search options
- [ ] Sort functionality

### Mobile Experience
- [ ] Responsive design
- [ ] Touch navigation
- [ ] Mobile-optimized forms
- [ ] Offline capability (if applicable)

## 🔧 Troubleshooting

### Database Issues
```bash
# Reset database completely
npx prisma db push --force-reset
npm run uat:setup
```

### Missing Data
```bash
# Re-populate data
npm run uat:setup
```

### Login Issues
- Ensure you're using the correct email format
- Password is always: `password123`
- Try the demo login page: `/demo-login`

### Performance Issues
- Clear browser cache
- Check network connectivity
- Verify database connection

## 📞 Support

For UAT support and issues:
- Check console logs for errors
- Verify database connectivity
- Ensure all dependencies are installed
- Review the application logs

## 🎯 Success Criteria

UAT is successful when:
- [ ] All user roles can access their respective dashboards
- [ ] Grievance workflow operates smoothly
- [ ] Data is accurately displayed and updated
- [ ] Reports generate correctly
- [ ] System performance is acceptable
- [ ] Mobile experience is satisfactory
- [ ] Integration features work properly
- [ ] Security and permissions are enforced

---

**Ready for UAT!** 🚀 The system now contains comprehensive dummy data across all modules for thorough testing.