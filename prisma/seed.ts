import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'password', 12);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@avopro.com' },
    update: {},
    create: {
      email: 'admin@avopro.com',
      name: 'Admin User',
      hashedPassword: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      annualLeaveBalance: 25,
      sickLeaveBalance: 15,
      maternityLeaveBalance: 90,
      paternityLeaveBalance: 14,
      compassionateLeaveBalance: 5,
      unpaidLeaveBalance: 0,
    },
  });

  console.log({ admin });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
