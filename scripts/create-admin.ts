import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'saadjennane@gmail.com';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists. Updating...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name: 'Saad Jennane',
        isAdmin: true,
      },
    });
    console.log('Admin user updated!');
  } else {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Saad Jennane',
        isAdmin: true,
      },
    });
    console.log('Admin user created!');
  }

  console.log('Email: saadjennane@gmail.com');
  console.log('Password: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
