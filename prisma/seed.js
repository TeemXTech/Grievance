const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: '$2a$10$VJmxYqXK8bXZutQIV/ZuweH.BVEpnGK/yqPQmBdhPouY9Xh.w1pO6', // "password123"
      role: 'ADMIN',
      phone: '1234567890'
    }
  });

  // Create default PA user
  await prisma.user.upsert({
    where: { email: 'pa@example.com' },
    update: {},
    create: {
      email: 'pa@example.com',
      name: 'Personal Assistant',
      passwordHash: '$2a$10$VJmxYqXK8bXZutQIV/ZuweH.BVEpnGK/yqPQmBdhPouY9Xh.w1pO6', // "password123"
      role: 'PA',
      phone: '1234567891'
    }
  });

  // Create default Back Officer user
  await prisma.user.upsert({
    where: { email: 'back@example.com' },
    update: {},
    create: {
      email: 'back@example.com',
      name: 'Back Officer',
      passwordHash: '$2a$10$VJmxYqXK8bXZutQIV/ZuweH.BVEpnGK/yqPQmBdhPouY9Xh.w1pO6', // "password123"
      role: 'BACK_OFFICER',
      phone: '1234567892'
    }
  });

  console.log('Database has been seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
