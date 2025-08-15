const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setupUATData() {
  console.log('🚀 Setting up UAT environment with comprehensive dummy data...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.grievanceStatusUpdate.deleteMany();
    await prisma.projectStatusUpdate.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.grievance.deleteMany();
    await prisma.governmentProject.deleteMany();
    await prisma.patientGrievance.deleteMany();
    await prisma.individualGrievance.deleteMany();
    await prisma.jobRequest.deleteMany();
    await prisma.tTDRequest.deleteMany();
    await prisma.visitorLog.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.whatsAppMessage.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Categories
    console.log('📂 Creating categories...');
    const categories = [
      { name: 'Water Supply', description: 'Water related issues and complaints', color: '#3B82F6' },
      { name: 'Electricity', description: 'Power and electricity related issues', color: '#F59E0B' },
      { name: 'Roads & Infrastructure', description: 'Road maintenance and infrastructure', color: '#6B7280' },
      { name: 'Healthcare', description: 'Medical facilities and health services', color: '#EF4444' },
      { name: 'Education', description: 'Schools and educational institutions', color: '#10B981' },
      { name: 'Sanitation', description: 'Cleanliness and waste management', color: '#8B5CF6' },
      { name: 'Agriculture', description: 'Farming and agricultural support', color: '#059669' },
      { name: 'Employment', description: 'Job opportunities and employment schemes', color: '#DC2626' },
      { name: 'Housing', description: 'Housing schemes and shelter programs', color: '#7C3AED' },
      { name: 'Transport', description: 'Public transportation services', color: '#0891B2' },
      { name: 'Social Welfare', description: 'Welfare schemes and social programs', color: '#BE185D' },
      { name: 'Revenue', description: 'Land records and revenue matters', color: '#92400E' }
    ];

    for (const category of categories) {
      await prisma.category.create({ data: category });
    }

    // 2. Create Users for all roles
    console.log('👥 Creating users for all roles...');
    const users = [
      // Ministers (3)
      { email: 'minister@gov.in', name: 'Hon. A. Revanth Reddy', role: 'MINISTER', phone: '9000000001' },
      { email: 'minister.health@gov.in', name: 'Hon. Damodar Rajanarsimha', role: 'MINISTER', phone: '9000000002' },
      { email: 'minister.education@gov.in', name: 'Hon. Sabitha Indra Reddy', role: 'MINISTER', phone: '9000000003' },
      
      // PA Officers (5)
      { email: 'pa@gov.in', name: 'Srinivas Reddy (PA to CM)', role: 'PA', phone: '9000000011' },
      { email: 'pa.health@gov.in', name: 'Madhavi Sharma (PA Health)', role: 'PA', phone: '9000000012' },
      { email: 'pa.education@gov.in', name: 'Rajesh Kumar (PA Education)', role: 'PA', phone: '9000000013' },
      { email: 'pa.revenue@gov.in', name: 'Lakshmi Devi (PA Revenue)', role: 'PA', phone: '9000000014' },
      { email: 'pa.transport@gov.in', name: 'Venkat Rao (PA Transport)', role: 'PA', phone: '9000000015' },
      
      // Back Officers (8)
      { email: 'back@gov.in', name: 'Senior Back Officer - Ramesh', role: 'BACK_OFFICER', phone: '9000000021' },
      { email: 'back.health@gov.in', name: 'Health Back Officer - Priya', role: 'BACK_OFFICER', phone: '9000000022' },
      { email: 'back.education@gov.in', name: 'Education Back Officer - Suresh', role: 'BACK_OFFICER', phone: '9000000023' },
      { email: 'back.water@gov.in', name: 'Water Back Officer - Kavitha', role: 'BACK_OFFICER', phone: '9000000024' },
      { email: 'back.roads@gov.in', name: 'Roads Back Officer - Mohan', role: 'BACK_OFFICER', phone: '9000000025' },
      { email: 'back.agriculture@gov.in', name: 'Agriculture Back Officer - Sita', role: 'BACK_OFFICER', phone: '9000000026' },
      { email: 'back.welfare@gov.in', name: 'Welfare Back Officer - Ravi', role: 'BACK_OFFICER', phone: '9000000027' },
      { email: 'back.revenue@gov.in', name: 'Revenue Back Officer - Geetha', role: 'BACK_OFFICER', phone: '9000000028' },
      
      // Field Officers (12)
      { email: 'field@gov.in', name: 'Senior Field Officer - Prakash', role: 'FIELD_OFFICER', phone: '9000000031' },
      { email: 'field.hyderabad@gov.in', name: 'Hyderabad FO - Anitha', role: 'FIELD_OFFICER', phone: '9000000032' },
      { email: 'field.warangal@gov.in', name: 'Warangal FO - Kiran', role: 'FIELD_OFFICER', phone: '9000000033' },
      { email: 'field.nizamabad@gov.in', name: 'Nizamabad FO - Swathi', role: 'FIELD_OFFICER', phone: '9000000034' },
      { email: 'field.karimnagar@gov.in', name: 'Karimnagar FO - Vijay', role: 'FIELD_OFFICER', phone: '9000000035' },
      { email: 'field.khammam@gov.in', name: 'Khammam FO - Sunitha', role: 'FIELD_OFFICER', phone: '9000000036' },
      { email: 'field.nalgonda@gov.in', name: 'Nalgonda FO - Arun', role: 'FIELD_OFFICER', phone: '9000000037' },
      { email: 'field.mahbubnagar@gov.in', name: 'Mahbubnagar FO - Rekha', role: 'FIELD_OFFICER', phone: '9000000038' },
      { email: 'field.adilabad@gov.in', name: 'Adilabad FO - Naresh', role: 'FIELD_OFFICER', phone: '9000000039' },
      { email: 'field.medak@gov.in', name: 'Medak FO - Padma', role: 'FIELD_OFFICER', phone: '9000000040' },
      { email: 'field.rangareddy@gov.in', name: 'Rangareddy FO - Sanjay', role: 'FIELD_OFFICER', phone: '9000000041' },
      { email: 'field.sangareddy@gov.in', name: 'Sangareddy FO - Meera', role: 'FIELD_OFFICER', phone: '9000000042' },
      
      // Admins (3)
      { email: 'admin@gov.in', name: 'System Administrator - Tech Team', role: 'ADMIN', phone: '9000000051' },
      { email: 'admin.tech@gov.in', name: 'Technical Admin - DevOps', role: 'ADMIN', phone: '9000000052' },
      { email: 'admin.data@gov.in', name: 'Data Administrator - Analytics', role: 'ADMIN', phone: '9000000053' },
      
      // Officers (4)
      { email: 'officer@gov.in', name: 'General Officer - Operations', role: 'OFFICER', phone: '9000000061' },
      { email: 'officer.revenue@gov.in', name: 'Revenue Officer - Land Records', role: 'OFFICER', phone: '9000000062' },
      { email: 'officer.welfare@gov.in', name: 'Welfare Officer - Schemes', role: 'OFFICER', phone: '9000000063' },
      { email: 'officer.monitoring@gov.in', name: 'Monitoring Officer - QA', role: 'OFFICER', phone: '9000000064' },
      
      // Public users (15)
      { email: 'public@example.com', name: 'Rajesh Kumar Reddy', role: 'PUBLIC', phone: '9000000071' },
      { email: 'citizen1@example.com', name: 'Priya Sharma', role: 'PUBLIC', phone: '9000000072' },
      { email: 'citizen2@example.com', name: 'Suresh Babu', role: 'PUBLIC', phone: '9000000073' },
      { email: 'citizen3@example.com', name: 'Lakshmi Devi', role: 'PUBLIC', phone: '9000000074' },
      { email: 'citizen4@example.com', name: 'Venkat Rao', role: 'PUBLIC', phone: '9000000075' },
      { email: 'citizen5@example.com', name: 'Kavitha Reddy', role: 'PUBLIC', phone: '9000000076' },
      { email: 'citizen6@example.com', name: 'Mohan Krishna', role: 'PUBLIC', phone: '9000000077' },
      { email: 'citizen7@example.com', name: 'Sita Mahalakshmi', role: 'PUBLIC', phone: '9000000078' },
      { email: 'citizen8@example.com', name: 'Ravi Teja', role: 'PUBLIC', phone: '9000000079' },
      { email: 'citizen9@example.com', name: 'Geetha Rani', role: 'PUBLIC', phone: '9000000080' },
      { email: 'citizen10@example.com', name: 'Prakash Reddy', role: 'PUBLIC', phone: '9000000081' },
      { email: 'citizen11@example.com', name: 'Anitha Kumari', role: 'PUBLIC', phone: '9000000082' },
      { email: 'citizen12@example.com', name: 'Kiran Kumar', role: 'PUBLIC', phone: '9000000083' },
      { email: 'citizen13@example.com', name: 'Swathi Priya', role: 'PUBLIC', phone: '9000000084' },
      { email: 'citizen14@example.com', name: 'Vijay Singh', role: 'PUBLIC', phone: '9000000085' }
    ];

    for (const user of users) {
      await prisma.user.create({
        data: { ...user, passwordHash }
      });
    }

    // Get created data for references
    const allCategories = await prisma.category.findMany();
    const categoryMap = {};
    allCategories.forEach(cat => { categoryMap[cat.name] = cat.id; });

    const publicUsers = await prisma.user.findMany({ where: { role: 'PUBLIC' } });
    const fieldOfficers = await prisma.user.findMany({ where: { role: 'FIELD_OFFICER' } });
    const backOfficers = await prisma.user.findMany({ where: { role: 'BACK_OFFICER' } });
    const paOfficers = await prisma.user.findMany({ where: { role: 'PA' } });
    const ministers = await prisma.user.findMany({ where: { role: 'MINISTER' } });

    // 3. Create Grievances (50+)
    console.log('📝 Creating grievances...');
    const grievanceTemplates = [
      { title: 'Water supply disruption in residential area', description: 'No water supply for 3 days in our colony. Residents are facing severe hardship.', category: 'Water Supply', priority: 'HIGH' },
      { title: 'Street lights not functioning', description: 'Street lights have been non-functional for 2 weeks causing safety concerns.', category: 'Electricity', priority: 'MEDIUM' },
      { title: 'Road repair needed urgently', description: 'Main road has large potholes causing vehicle damage and accidents.', category: 'Roads & Infrastructure', priority: 'HIGH' },
      { title: 'Hospital staff shortage', description: 'Local primary health center needs more doctors and nursing staff.', category: 'Healthcare', priority: 'HIGH' },
      { title: 'School building maintenance required', description: 'Government school roof is leaking during monsoon affecting classes.', category: 'Education', priority: 'MEDIUM' },
      { title: 'Irregular garbage collection', description: 'Municipal waste not collected regularly causing health hazards.', category: 'Sanitation', priority: 'MEDIUM' },
      { title: 'Crop insurance claim pending', description: 'Insurance claim for drought-damaged crops not processed for 6 months.', category: 'Agriculture', priority: 'HIGH' },
      { title: 'MGNREGA job card not issued', description: 'Applied for job card under employment guarantee scheme but no response.', category: 'Employment', priority: 'MEDIUM' },
      { title: 'Housing scheme application stuck', description: 'Applied for Indiramma housing scheme but application status unknown.', category: 'Housing', priority: 'LOW' },
      { title: 'Bus service frequency inadequate', description: 'Need more frequent bus service to connect remote villages.', category: 'Transport', priority: 'MEDIUM' },
      { title: 'Power outages affecting businesses', description: 'Daily 4-hour power cuts affecting small business operations.', category: 'Electricity', priority: 'HIGH' },
      { title: 'Contaminated water supply', description: 'Supplied water is contaminated causing stomach infections.', category: 'Water Supply', priority: 'URGENT' },
      { title: 'Bridge construction incomplete', description: 'Bridge work started 8 months ago but construction halted.', category: 'Roads & Infrastructure', priority: 'MEDIUM' },
      { title: 'Medicine shortage in PHC', description: 'Essential medicines not available at primary health center.', category: 'Healthcare', priority: 'HIGH' },
      { title: 'Teacher shortage in high school', description: 'Government high school has only 3 teachers for 300 students.', category: 'Education', priority: 'HIGH' },
      { title: 'Drainage system blocked', description: 'Sewage overflow during rains due to blocked storm water drains.', category: 'Sanitation', priority: 'HIGH' },
      { title: 'Fertilizer subsidy delayed', description: 'Subsidized fertilizer not available at cooperative society.', category: 'Agriculture', priority: 'MEDIUM' },
      { title: 'Skill development program needed', description: 'Youth need technical training programs for better employment.', category: 'Employment', priority: 'LOW' },
      { title: 'Building permission delay', description: 'House construction approval pending for 8 months.', category: 'Housing', priority: 'MEDIUM' },
      { title: 'Auto rickshaw meter tampering', description: 'Auto drivers not following government-fixed meter rates.', category: 'Transport', priority: 'LOW' }
    ];

    const districts = ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahbubnagar', 'Adilabad', 'Medak', 'Rangareddy', 'Sangareddy', 'Siddipet'];
    const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
    const villages = ['Kondapur', 'Gachibowli', 'Miyapur', 'Kukatpally', 'Ameerpet', 'Begumpet', 'Secunderabad', 'Uppal', 'LB Nagar', 'Dilsukhnagar'];
    const mandals = ['Serilingampally', 'Quthbullapur', 'Malkajgiri', 'Secunderabad', 'Tirumalagiri', 'Uppal', 'LB Nagar', 'Rajendranagar'];

    for (let i = 0; i < 60; i++) {
      const template = grievanceTemplates[i % grievanceTemplates.length];
      const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      const randomMandal = mandals[Math.floor(Math.random() * mandals.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      
      const grievance = await prisma.grievance.create({
        data: {
          referenceNumber: `GRV${Date.now()}${String(i + 1).padStart(3, '0')}`,
          title: `${template.title} - ${randomDistrict}`,
          description: `${template.description}\n\nLocation Details:\n- Village: ${randomVillage}\n- Mandal: ${randomMandal}\n- District: ${randomDistrict}\n\nContact: ${randomUser.name} (${randomUser.phone})`,
          categoryId: categoryMap[template.category],
          priority: template.priority,
          status: randomStatus,
          district: randomDistrict,
          village: randomVillage,
          mandal: randomMandal,
          state: 'Telangana',
          pincode: `5${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`,
          requesterName: randomUser.name,
          requesterPhone: randomUser.phone,
          requesterEmail: randomUser.email,
          assignedToId: randomStatus !== 'PENDING' ? randomOfficer.id : null,
          assignedBy: randomStatus !== 'PENDING' ? backOfficers[Math.floor(Math.random() * backOfficers.length)].name : null,
          assignedAt: randomStatus !== 'PENDING' ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : null,
          createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });

      // Add status updates for non-pending grievances
      if (randomStatus !== 'PENDING') {
        await prisma.grievanceStatusUpdate.create({
          data: {
            grievanceId: grievance.id,
            userId: randomOfficer.id,
            oldStatus: 'PENDING',
            newStatus: 'ASSIGNED',
            remarks: 'Grievance has been assigned to field officer for investigation and resolution.',
            createdAt: new Date(grievance.createdAt.getTime() + 24 * 60 * 60 * 1000)
          }
        });

        if (randomStatus === 'IN_PROGRESS' || randomStatus === 'UNDER_REVIEW' || randomStatus === 'RESOLVED' || randomStatus === 'CLOSED') {
          await prisma.grievanceStatusUpdate.create({
            data: {
              grievanceId: grievance.id,
              userId: randomOfficer.id,
              oldStatus: 'ASSIGNED',
              newStatus: 'IN_PROGRESS',
              remarks: 'Field verification completed. Working on resolution.',
              createdAt: new Date(grievance.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
            }
          });
        }

        if (randomStatus === 'RESOLVED' || randomStatus === 'CLOSED') {
          await prisma.grievanceStatusUpdate.create({
            data: {
              grievanceId: grievance.id,
              userId: randomOfficer.id,
              oldStatus: 'IN_PROGRESS',
              newStatus: 'RESOLVED',
              remarks: 'Issue has been resolved successfully. Necessary action has been taken.',
              createdAt: new Date(grievance.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }
    }

    // 4. Create Government Projects (20)
    console.log('🏗️ Creating government projects...');
    const projectTemplates = [
      { name: 'Rural Water Supply Scheme', description: 'Providing clean drinking water to 50 villages', cost: 15000000, status: 'IN_PROGRESS' },
      { name: 'Road Connectivity Project', description: 'Connecting remote villages with paved roads', cost: 25000000, status: 'IN_PROGRESS' },
      { name: 'Primary Health Center Upgrade', description: 'Modernizing healthcare facilities in rural areas', cost: 8000000, status: 'COMPLETED' },
      { name: 'School Infrastructure Development', description: 'Building new classrooms and facilities', cost: 12000000, status: 'IN_PROGRESS' },
      { name: 'Solar Power Installation', description: 'Installing solar panels in government buildings', cost: 6000000, status: 'YET_TO_COMPLETE' },
      { name: 'Drainage System Improvement', description: 'Upgrading storm water drainage network', cost: 18000000, status: 'IN_PROGRESS' },
      { name: 'Digital Literacy Program', description: 'Computer training centers in villages', cost: 4000000, status: 'COMPLETED' },
      { name: 'Agricultural Support Center', description: 'Setting up modern farming support facilities', cost: 10000000, status: 'IN_PROGRESS' },
      { name: 'Women Empowerment Center', description: 'Skill development center for women', cost: 5000000, status: 'YET_TO_COMPLETE' },
      { name: 'Youth Sports Complex', description: 'Modern sports facilities for youth development', cost: 20000000, status: 'IN_PROGRESS' }
    ];

    for (let i = 0; i < 20; i++) {
      const template = projectTemplates[i % projectTemplates.length];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      const randomMandal = mandals[Math.floor(Math.random() * mandals.length)];
      const randomMinister = ministers[Math.floor(Math.random() * ministers.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      
      await prisma.governmentProject.create({
        data: {
          referenceNumber: `PRJ${Date.now()}${String(i + 1).padStart(3, '0')}`,
          projectName: `${template.name} - ${randomDistrict} Phase ${i + 1}`,
          description: `${template.description} in ${randomVillage}, ${randomMandal} mandal, ${randomDistrict} district.`,
          ministerName: randomMinister.name,
          status: template.status,
          estimatedCost: template.cost + Math.floor(Math.random() * 5000000),
          actualCost: template.status === 'COMPLETED' ? template.cost + Math.floor(Math.random() * 2000000) : null,
          startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          completionDate: template.status === 'COMPLETED' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          expectedCompletionDate: template.status !== 'COMPLETED' ? new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
          village: randomVillage,
          mandal: randomMandal,
          district: randomDistrict,
          state: 'Telangana',
          beneficiaries: Math.floor(Math.random() * 5000) + 500,
          assignedToId: randomOfficer.id,
          assignedBy: randomMinister.name,
          assignedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          createdBy: randomMinister.id,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 5. Create Notifications (100+)
    console.log('🔔 Creating notifications...');
    const allUsers = await prisma.user.findMany();
    const notificationTemplates = [
      { title: 'New grievance assigned', message: 'A new grievance has been assigned to you for resolution.', type: 'ASSIGNMENT' },
      { title: 'Grievance status updated', message: 'Status of grievance has been updated. Please review.', type: 'STATUS_UPDATE' },
      { title: 'Urgent grievance requires attention', message: 'High priority grievance needs immediate action.', type: 'URGENT' },
      { title: 'Monthly report ready', message: 'Your monthly performance report is ready for review.', type: 'REPORT' },
      { title: 'System maintenance scheduled', message: 'System will be under maintenance tonight from 11 PM to 2 AM.', type: 'SYSTEM' },
      { title: 'New policy update', message: 'New government policy guidelines have been published.', type: 'POLICY' },
      { title: 'Training session scheduled', message: 'Mandatory training session scheduled for next week.', type: 'TRAINING' },
      { title: 'Performance review due', message: 'Your quarterly performance review is due this week.', type: 'REVIEW' },
      { title: 'Budget approval required', message: 'Project budget requires your approval before proceeding.', type: 'APPROVAL' },
      { title: 'Meeting reminder', message: 'Department meeting scheduled for tomorrow at 10 AM.', type: 'MEETING' }
    ];

    for (let i = 0; i < 120; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomTemplate = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      
      await prisma.notification.create({
        data: {
          title: randomTemplate.title,
          message: `${randomTemplate.message} Reference: NOT${String(i + 1).padStart(4, '0')}`,
          type: randomTemplate.type,
          userId: randomUser.id,
          isRead: Math.random() > 0.4, // 60% read, 40% unread
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // 6. Create Calendar Events (50)
    console.log('📅 Creating calendar events...');
    const eventTemplates = [
      'District Review Meeting',
      'Public Grievance Hearing',
      'Project Inspection Visit',
      'Budget Planning Session',
      'Policy Implementation Review',
      'Field Officer Training',
      'Citizen Interaction Program',
      'Development Committee Meeting',
      'Welfare Scheme Launch',
      'Infrastructure Inauguration',
      'Monthly Progress Review',
      'Stakeholder Consultation',
      'Quality Audit Meeting',
      'Performance Assessment',
      'Strategic Planning Session'
    ];

    const timeSlots = [
      { hour: 9, duration: 2 },   // 9 AM - 11 AM
      { hour: 10, duration: 3 },  // 10 AM - 1 PM
      { hour: 14, duration: 2 },  // 2 PM - 4 PM
      { hour: 15, duration: 1.5 },// 3 PM - 4:30 PM
      { hour: 16, duration: 1 }   // 4 PM - 5 PM
    ];

    for (let i = 0; i < 50; i++) {
      const randomUser = [...ministers, ...paOfficers, ...backOfficers][Math.floor(Math.random() * (ministers.length + paOfficers.length + backOfficers.length))];
      const randomTemplate = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomTimeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      // Create events for next 90 days with better distribution
      const daysFromNow = Math.floor(Math.random() * 90);
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + daysFromNow);
      baseDate.setHours(randomTimeSlot.hour, 0, 0, 0);
      
      const endDate = new Date(baseDate.getTime() + randomTimeSlot.duration * 60 * 60 * 1000);
      
      await prisma.calendarEvent.create({
        data: {
          title: `${randomTemplate} - ${randomDistrict}`,
          description: `Official ${randomTemplate.toLowerCase()} scheduled for ${randomDistrict} district. Key stakeholders and officials will participate to review progress and address concerns.`,
          startDate: baseDate,
          endDate: endDate,
          location: `${randomDistrict} District Collectorate, Conference Hall`,
          attendees: JSON.stringify([
            { name: randomUser.name, role: randomUser.role, email: randomUser.email },
            { name: `${randomDistrict} District Collector`, role: 'COLLECTOR' },
            { name: 'Local MLA', role: 'MLA' },
            { name: 'Department Officials', role: 'OFFICIALS' },
            { name: 'Field Officers', role: 'FIELD_OFFICERS' }
          ]),
          createdBy: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 7. Create Patient Grievances (25)
    console.log('🏥 Creating patient grievances...');
    for (let i = 0; i < 25; i++) {
      const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      
      await prisma.patientGrievance.create({
        data: {
          referenceNumber: `PAT${String(i + 1).padStart(4, '0')}`,
          patientName: `Patient ${i + 1} - ${randomUser.name}`,
          patientPhone: randomUser.phone,
          village: randomVillage,
          caretakerName: `Caretaker ${i + 1}`,
          caretakerPhone: `90000${String(i + 100).padStart(5, '0')}`,
          issue: `Medical issue ${i + 1}: Need specialized treatment and medication support.`,
          hospital: `${randomVillage} Primary Health Center`,
          doctor: `Dr. ${['Rajesh', 'Priya', 'Suresh', 'Kavitha'][Math.floor(Math.random() * 4)]}`,
          referredByName: randomUser.name,
          referredByNumber: randomUser.phone,
          status: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 4)],
          assignedToId: Math.random() > 0.3 ? randomOfficer.id : null,
          createdBy: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 8. Create Individual Grievances (25)
    console.log('👤 Creating individual grievances...');
    for (let i = 0; i < 25; i++) {
      const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      
      await prisma.individualGrievance.create({
        data: {
          name: `Individual ${i + 1} - ${randomUser.name}`,
          mobileNumber: randomUser.phone,
          village: randomVillage,
          contactName: `Contact ${i + 1}`,
          contactNumber: `90000${String(i + 200).padStart(5, '0')}`,
          office: `${randomVillage} Village Office`,
          subject: `Individual matter ${i + 1}: Personal documentation and certificate issues.`,
          referredByName: randomUser.name,
          referredByNumber: randomUser.phone,
          assignedToId: Math.random() > 0.3 ? randomOfficer.id : null,
          createdBy: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 9. Create Job Requests (25)
    console.log('💼 Creating job requests...');
    for (let i = 0; i < 25; i++) {
      const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      
      await prisma.jobRequest.create({
        data: {
          name: `Job Seeker ${i + 1} - ${randomUser.name}`,
          mobileNumber: randomUser.phone,
          village: randomVillage,
          contactName: `Reference ${i + 1}`,
          contactNumber: `90000${String(i + 300).padStart(5, '0')}`,
          office: `${randomVillage} Employment Office`,
          subject: `Job request ${i + 1}: Seeking employment opportunities in government sector.`,
          referredByName: randomUser.name,
          referredByNumber: randomUser.phone,
          assignedToId: Math.random() > 0.3 ? randomOfficer.id : null,
          createdBy: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 10. Create TTD Requests (15)
    console.log('🕉️ Creating TTD requests...');
    for (let i = 0; i < 15; i++) {
      const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
      const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      const randomMandal = mandals[Math.floor(Math.random() * mandals.length)];
      const darshanDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      await prisma.tTDRequest.create({
        data: {
          darshanDate: darshanDate,
          darshanType: ['Special Darshan', 'VIP Darshan', 'General Darshan'][Math.floor(Math.random() * 3)],
          accommodationFrom: darshanDate,
          accommodationTo: new Date(darshanDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          guests: JSON.stringify([
            { name: randomUser.name, age: Math.floor(Math.random() * 50) + 20, relation: 'Self' },
            { name: `Spouse ${i + 1}`, age: Math.floor(Math.random() * 45) + 25, relation: 'Spouse' },
            { name: `Child ${i + 1}`, age: Math.floor(Math.random() * 18) + 5, relation: 'Child' }
          ]),
          referenceName: randomUser.name,
          referenceNumber: randomUser.phone,
          referenceVillage: randomVillage,
          referenceMandal: randomMandal,
          assignedToId: Math.random() > 0.3 ? randomOfficer.id : null,
          createdBy: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }

    // 11. Create WhatsApp Messages (40)
    console.log('💬 Creating WhatsApp messages...');
    const whatsappMessages = [
      'Water problem in our area. Please help.',
      'Road is damaged. Need repair urgently.',
      'No electricity for 2 days. Please check.',
      'Hospital needs more doctors.',
      'School building is in bad condition.',
      'Garbage not collected for a week.',
      'Need job card for MGNREGA.',
      'Housing scheme application status?',
      'Bus service is very irregular.',
      'Street lights not working at night.'
    ];

    for (let i = 0; i < 40; i++) {
      const randomMessage = whatsappMessages[Math.floor(Math.random() * whatsappMessages.length)];
      const randomPhone = `90000${String(Math.floor(Math.random() * 90000) + 10000)}`;
      
      await prisma.whatsAppMessage.create({
        data: {
          phone: randomPhone,
          message: `Message ${i + 1}: ${randomMessage}`,
          rawText: `From: ${randomPhone}\nMessage: ${randomMessage}\nTime: ${new Date().toISOString()}`,
          isProcessed: Math.random() > 0.4, // 60% processed
          grievanceId: Math.random() > 0.5 ? null : `grv_${i + 1}`, // Some linked to grievances
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          processedAt: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : null
        }
      });
    }

    console.log('✅ UAT Data Setup Complete!');
    console.log('');
    console.log('📊 Summary of Created Data:');
    console.log(`   👥 Users: ${users.length} (Ministers: 3, PA: 5, Back Officers: 8, Field Officers: 12, Admins: 3, Officers: 4, Public: 15)`);
    console.log(`   📂 Categories: ${categories.length}`);
    console.log(`   📝 Grievances: 60 (with status updates)`);
    console.log(`   🏗️ Government Projects: 20`);
    console.log(`   🔔 Notifications: 120`);
    console.log(`   📅 Calendar Events: 50`);
    console.log(`   🏥 Patient Grievances: 25`);
    console.log(`   👤 Individual Grievances: 25`);
    console.log(`   💼 Job Requests: 25`);
    console.log(`   🕉️ TTD Requests: 15`);
    console.log(`   💬 WhatsApp Messages: 40`);
    console.log('');
    console.log('🔑 Login Credentials (Password: password123):');
    console.log('   🏛️ Minister: minister@gov.in');
    console.log('   👨‍💼 PA Officer: pa@gov.in');
    console.log('   📋 Back Officer: back@gov.in');
    console.log('   🚶 Field Officer: field@gov.in');
    console.log('   ⚙️ Admin: admin@gov.in');
    console.log('   👮 Officer: officer@gov.in');
    console.log('   👥 Public: public@example.com');
    console.log('');
    console.log('🌐 Access the demo at: http://localhost:3000/demo-login');

  } catch (error) {
    console.error('❌ UAT Setup failed:', error);
    throw error;
  }
}

setupUATData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });