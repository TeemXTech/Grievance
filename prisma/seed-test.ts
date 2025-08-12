import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Wipe test data in safe order (FKs)
  await prisma.notification.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Category
  const category = await prisma.category.create({
    data: {
      name: 'Infrastructure',
      description: 'Infrastructure related grievances',
      color: '#FF0000',
    },
  });

  // Hash once, reuse
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Test user
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
      role: 'PUBLIC',
      status: 'active', // important so login passes your check
    },
  });

  // Admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Test Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'active', // important
    },
  });

  // A sample grievance
  await prisma.grievance.create({
    data: {
      title: 'Test Grievance',
      description: 'This is a test grievance',
      status: 'PENDING',
      priority: 'MEDIUM',
      requesterName: 'Test User',
      requesterPhone: '+910000000000',
      category: { connect: { id: category.id } },
    },
  });

  console.log('Seed complete. Users: test@example.com/password123, admin@example.com/password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });