
import { PrismaClient, Role, Gender, Grade, Jurusan, StaffPosition } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
async function hashPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Start seeding...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Yayasan Pendidikan Nusantara',
      code: 'YPN001',
      address: 'Jl. Pendidikan No. 1, Jakarta',
    },
  });
  console.log(`Organization created: ${org.name}`);

  // 2. Create School
  const school = await prisma.school.create({
    data: {
      organizationId: org.id,
      name: 'SMA Negeri 1 Jakarta',
      code: 'SMAN1JKT',
      address: 'Jl. Budi Utomo No. 7, Jakarta Pusat',
    },
  });
  console.log(`School created: ${school.name}`);

  // 3. Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025/2026',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2026-06-20'),
      isActive: true,
    },
  });
  console.log(`Academic Year created: ${academicYear.name}`);

  // 4. Create School Admin
  const adminPassword = await hashPassword('password123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin.sman1@example.com',
      password: adminPassword,
      fullName: 'Budi Santoso',
      gender: Gender.MALE,
      role: Role.SCHOOL_ADMIN,
    },
  });

  await prisma.schoolAdmin.create({
    data: {
      userId: adminUser.id,
      schoolId: school.id,
      dob: new Date('1980-01-01'),
      nik: '3171000000000001',
    },
  });
  console.log(`School Admin created: ${adminUser.fullName}`);

  // 5. Create Teachers
  const teacherSubjects = [
    { name: 'Siti Aminah', subject: 'Matematika', gender: Gender.FEMALE },
    { name: 'Agus Setiawan', subject: 'Fisika', gender: Gender.MALE },
    { name: 'Dewi Sartika', subject: 'Biologi', gender: Gender.FEMALE },
    { name: 'Joko Widodo', subject: 'Bahasa Indonesia', gender: Gender.MALE },
    { name: 'Rina Marlina', subject: 'Bahasa Inggris', gender: Gender.FEMALE },
  ];

  const teachers: any[] = [];
  for (let i = 0; i < teacherSubjects.length; i++) {
    const t = teacherSubjects[i];
    const password = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        email: `guru${i + 1}@example.com`,
        password: password,
        fullName: t.name,
        gender: t.gender,
        role: Role.TEACHER,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        nik: `317100000000001${i}`,
        nip: `19800101200501100${i}`,
        hireDate: new Date('2015-01-01'),
        dob: new Date('1985-05-05'),
        phone: `08120000000${i}`,
        isActive: true,
      },
    });
    teachers.push({ ...teacher, subjectName: t.subject });
    console.log(`Teacher created: ${t.name}`);
  }

  // 6. Create Classes
  const classData = [
    { name: 'X IPA 1', grade: Grade.GRADE_10, jurusan: Jurusan.IPA },
    { name: 'XI IPA 1', grade: Grade.GRADE_11, jurusan: Jurusan.IPA },
    { name: 'XII IPA 1', grade: Grade.GRADE_12, jurusan: Jurusan.IPA },
  ];

  const classes: any[] = [];
  for (let i = 0; i < classData.length; i++) {
    const c = classData[i];
    // Assign random homeroom teacher
    const homeroom = teachers[i % teachers.length];
    
    const newClass = await prisma.class.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: c.name,
        grade: c.grade,
        Jurusan: c.jurusan,
        homeroomTeacherId: homeroom.id,
      },
    });
    classes.push(newClass);
    console.log(`Class created: ${c.name}`);
  }

  // 7. Create Subjects & Subject Teachers
  for (const t of teachers) {
    // Create Subject
    // Note: In real app, subjects are usually master data, but here we create per school/grade
    // creating for grade 10 for simplicity
    const subject = await prisma.subject.create({
      data: {
        name: t.subjectName,
        schoolId: school.id,
        grade: Grade.GRADE_10, 
      },
    });

    // Assign Teacher to Subject
    await prisma.subjectTeacher.create({
      data: {
        subjectId: subject.id,
        teacherId: t.id,
      },
    });
    console.log(`Subject created & assigned: ${t.subjectName} -> Teacher ID ${t.id}`);
  }

  // 8. Create Students
  const studentNames = [
    'Andi Pratama', 'Budi Hartono', 'Citra Lestari', 'Dedi Mulyadi', 'Eka Saputra',
    'Fajar Nugraha', 'Gita Gutawa', 'Heri Susanto', 'Indah Permata', 'Joko Anwar',
    'Kartika Putri', 'Lukman Hakim', 'Megaawati', 'Nanda Putra', 'Oki Setiana',
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
    const assignedClass = classes[i % classes.length];
    const password = await hashPassword('password123');
    
    const user = await prisma.user.create({
      data: {
        email: `siswa${i + 1}@example.com`,
        password: password,
        fullName: name,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        role: Role.STUDENT,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        classId: assignedClass.id,
        enrollmentNumber: `NIS00${i + 1}`,
        dob: new Date('2008-01-01'),
        address: 'Jakarta',
        isActive: true,
      },
    });

    // Create Student Class History
    await prisma.studentClassHistory.create({
      data: {
        studentId: student.id,
        classId: assignedClass.id,
        academicYearId: academicYear.id,
        semester: 'SEMESTER_1',
        grade: assignedClass.grade,
        remark: 'Active student',
      },
    });

    console.log(`Student created: ${name} in ${assignedClass.name}`);
  }

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
