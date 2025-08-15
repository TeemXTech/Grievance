const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seeding...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create categories first
  const categories = [
    { name: 'Water Supply', description: 'Water related issues' },
    { name: 'Electricity', description: 'Power and electricity issues' },
    { name: 'Roads', description: 'Road infrastructure issues' },
    { name: 'Healthcare', description: 'Medical and health services' },
    { name: 'Education', description: 'School and education matters' },
    { name: 'Sanitation', description: 'Cleanliness and waste management' },
    { name: 'Agriculture', description: 'Farming and agricultural support' },
    { name: 'Employment', description: 'Job and employment related' },
    { name: 'Housing', description: 'Housing and shelter issues' },
    { name: 'Transport', description: 'Public transport issues' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create users for all roles
  const users = [
    // Ministers
    { email: 'minister@gov.in', name: 'Hon. Chief Minister', role: 'MINISTER', phone: '9000000001' },
    { email: 'minister.health@gov.in', name: 'Hon. Health Minister', role: 'MINISTER', phone: '9000000002' },
    { email: 'minister.education@gov.in', name: 'Hon. Education Minister', role: 'MINISTER', phone: '9000000003' },
    
    // PA Officers
    { email: 'pa@gov.in', name: 'PA to Chief Minister', role: 'PA', phone: '9000000011' },
    { email: 'pa.health@gov.in', name: 'PA to Health Minister', role: 'PA', phone: '9000000012' },
    { email: 'pa.education@gov.in', name: 'PA to Education Minister', role: 'PA', phone: '9000000013' },
    
    // Back Officers
    { email: 'back@gov.in', name: 'Senior Back Officer', role: 'BACK_OFFICER', phone: '9000000021' },
    { email: 'back.health@gov.in', name: 'Health Back Officer', role: 'BACK_OFFICER', phone: '9000000022' },
    { email: 'back.education@gov.in', name: 'Education Back Officer', role: 'BACK_OFFICER', phone: '9000000023' },
    { email: 'back.water@gov.in', name: 'Water Supply Back Officer', role: 'BACK_OFFICER', phone: '9000000024' },
    
    // Field Officers
    { email: 'field@gov.in', name: 'Senior Field Officer', role: 'FIELD_OFFICER', phone: '9000000031' },
    { email: 'field.hyderabad@gov.in', name: 'Hyderabad Field Officer', role: 'FIELD_OFFICER', phone: '9000000032' },
    { email: 'field.warangal@gov.in', name: 'Warangal Field Officer', role: 'FIELD_OFFICER', phone: '9000000033' },
    { email: 'field.nizamabad@gov.in', name: 'Nizamabad Field Officer', role: 'FIELD_OFFICER', phone: '9000000034' },
    { email: 'field.karimnagar@gov.in', name: 'Karimnagar Field Officer', role: 'FIELD_OFFICER', phone: '9000000035' },
    
    // Admins
    { email: 'admin@gov.in', name: 'System Administrator', role: 'ADMIN', phone: '9000000041' },
    { email: 'admin.tech@gov.in', name: 'Technical Administrator', role: 'ADMIN', phone: '9000000042' },
    
    // Officers
    { email: 'officer@gov.in', name: 'General Officer', role: 'OFFICER', phone: '9000000051' },
    { email: 'officer.revenue@gov.in', name: 'Revenue Officer', role: 'OFFICER', phone: '9000000052' },
    
    // Public users
    { email: 'public@example.com', name: 'Rajesh Kumar', role: 'PUBLIC', phone: '9000000061' },
    { email: 'citizen1@example.com', name: 'Priya Sharma', role: 'PUBLIC', phone: '9000000062' },
    { email: 'citizen2@example.com', name: 'Suresh Reddy', role: 'PUBLIC', phone: '9000000063' }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        passwordHash
      }
    });
  }

  // Create sample grievances
  const grievanceTemplates = [
    { title: 'Water supply disruption in Colony', description: 'No water supply for 3 days in our residential area', category: 'Water Supply', priority: 'HIGH' },
    { title: 'Street light not working', description: 'Street lights have been non-functional for 2 weeks', category: 'Electricity', priority: 'MEDIUM' },
    { title: 'Road repair needed urgently', description: 'Main road has large potholes causing accidents', category: 'Roads', priority: 'HIGH' },
    { title: 'Hospital staff shortage', description: 'Local hospital needs more doctors and nurses', category: 'Healthcare', priority: 'HIGH' },
    { title: 'School building maintenance', description: 'School roof is leaking during monsoon', category: 'Education', priority: 'MEDIUM' },
    { title: 'Garbage collection irregular', description: 'Waste not collected regularly in our area', category: 'Sanitation', priority: 'MEDIUM' },
    { title: 'Crop insurance claim pending', description: 'Insurance claim for damaged crops not processed', category: 'Agriculture', priority: 'HIGH' },
    { title: 'Job card not issued', description: 'MGNREGA job card application pending for months', category: 'Employment', priority: 'MEDIUM' },
    { title: 'Housing scheme application', description: 'Applied for housing scheme but no response', category: 'Housing', priority: 'LOW' },
    { title: 'Bus service frequency low', description: 'Need more frequent bus service to remote villages', category: 'Transport', priority: 'MEDIUM' },
    { title: 'Power outage frequent', description: 'Daily power cuts affecting business operations', category: 'Electricity', priority: 'HIGH' },
    { title: 'Water quality poor', description: 'Supplied water is contaminated and unsafe', category: 'Water Supply', priority: 'URGENT' },
    { title: 'Road construction incomplete', description: 'Road work started 6 months ago but not completed', category: 'Roads', priority: 'MEDIUM' },
    { title: 'Medicine shortage in PHC', description: 'Primary health center lacks essential medicines', category: 'Healthcare', priority: 'HIGH' },
    { title: 'Teacher shortage in school', description: 'Government school has only 2 teachers for 200 students', category: 'Education', priority: 'HIGH' },
    { title: 'Drainage system blocked', description: 'Sewage overflow during rains due to blocked drains', category: 'Sanitation', priority: 'HIGH' },
    { title: 'Fertilizer subsidy delayed', description: 'Subsidized fertilizer not available at cooperative', category: 'Agriculture', priority: 'MEDIUM' },
    { title: 'Skill development program needed', description: 'Youth need training programs for employment', category: 'Employment', priority: 'LOW' },
    { title: 'House construction approval', description: 'Building permission application under review for months', category: 'Housing', priority: 'MEDIUM' },
    { title: 'Auto rickshaw overcharging', description: 'Auto drivers not following meter rates', category: 'Transport', priority: 'LOW' }
  ];

  const districts = ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahbubnagar', 'Adilabad', 'Medak', 'Rangareddy'];
  const statuses = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  
  // Get category IDs
  const categoryMap = {};
  const allCategories = await prisma.category.findMany();
  allCategories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  // Get user IDs
  const publicUsers = await prisma.user.findMany({ where: { role: 'PUBLIC' } });
  const fieldOfficers = await prisma.user.findMany({ where: { role: 'FIELD_OFFICER' } });

  // Create 50+ grievances
  for (let i = 0; i < 25; i++) {
    const template = grievanceTemplates[i % grievanceTemplates.length];
    const randomUser = publicUsers[Math.floor(Math.random() * publicUsers.length)];
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomOfficer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
    
    const grievance = await prisma.grievance.create({
      data: {
        referenceNumber: `GRV${Date.now()}${String(i + 1).padStart(3, '0')}`,
        title: `${template.title} - ${randomDistrict} ${i + 1}`,
        description: `${template.description}. Location: ${randomDistrict} District. Reference: GRV${String(i + 1).padStart(4, '0')}`,
        categoryId: categoryMap[template.category],
        priority: template.priority,
        status: randomStatus === 'SUBMITTED' ? 'PENDING' : randomStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : randomStatus === 'RESOLVED' ? 'RESOLVED' : 'CLOSED',
        district: randomDistrict,
        requesterName: randomUser.name,
        requesterPhone: randomUser.phone || '+919000000000',
        requesterEmail: randomUser.email,
        assignedToId: randomStatus !== 'SUBMITTED' ? randomOfficer.id : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date()
      }
    });

    // Add some status updates
    if (randomStatus !== 'SUBMITTED') {
      await prisma.grievanceStatusUpdate.create({
        data: {
          grievanceId: grievance.id,
          userId: randomOfficer.id,
          oldStatus: 'PENDING',
          newStatus: 'IN_PROGRESS',
          remarks: 'Grievance has been assigned to field officer for investigation.',
          createdAt: new Date(grievance.createdAt.getTime() + 24 * 60 * 60 * 1000)
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
          remarks: 'Issue has been resolved. Necessary action has been taken.',
          createdAt: new Date(grievance.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  // Create notifications
  const allUsers = await prisma.user.findMany();
  const notificationTemplates = [
    'New grievance assigned to you',
    'Grievance status updated',
    'Urgent grievance requires attention',
    'Monthly report is ready',
    'System maintenance scheduled',
    'New policy update available',
    'Training session scheduled',
    'Performance review due',
    'Budget approval required',
    'Meeting scheduled for tomorrow'
  ];

  for (let i = 0; i < 30; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomTemplate = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    
    await prisma.notification.create({
      data: {
        title: randomTemplate,
        message: `${randomTemplate}. Please check your dashboard for more details.`,
        userId: randomUser.id,
        type: 'INFO',
        isRead: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log('✅ Comprehensive seeding completed!');
  console.log('📊 Created:');
  console.log('   - 10 Categories');
  console.log('   - 22 Users (all roles)');
  console.log('   - 25+ Grievances with status updates');
  console.log('   - 30 Notifications');
  console.log('');
  console.log('🔑 Login credentials (all users have password: password123):');
  console.log('   Minister: minister@gov.in');
  console.log('   PA: pa@gov.in');
  console.log('   Back Officer: back@gov.in');
  console.log('   Field Officer: field@gov.in');
  console.log('   Admin: admin@gov.in');
  console.log('   Officer: officer@gov.in');
  console.log('   Public: public@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });