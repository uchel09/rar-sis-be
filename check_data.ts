
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const schoolCount = await prisma.school.count();
  const studentCount = await prisma.student.count();
  const teacherCount = await prisma.teacher.count();

  console.log('--- Data Counts ---');
  console.log(`Users: ${userCount}`);
  console.log(`Schools: ${schoolCount}`);
  console.log(`Students: ${studentCount}`);
  console.log(`Teachers: ${teacherCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
