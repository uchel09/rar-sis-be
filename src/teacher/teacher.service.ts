import {
  Injectable,
  HttpException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TeacherValidation } from './teacher.validation';
import {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherResponse,
} from 'src/model/teacher.model';
import { Gender, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeacherService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async create20DummyTeacher() {
    let count = 0;
    const hashedPassword = await bcrypt.hash('guru123456', 10);
    for (let i = 0; i < 20; i++) {
      await this.prismaService.$transaction(async (prisma) => {
        // 1️⃣ Buat user dulu
        const user = await prisma.user.create({
          data: {
            email: `teacher${i + 1}@example.com`,
            password: hashedPassword, // ubah kalau mau real hash
            fullName: `Guru ${i + 1}`,
            role: Role.TEACHER,
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
          },
        });

        // 2️⃣ Buat teacher yang terhubung ke user
        await prisma.teacher.create({
          data: {
            userId: user.id,
            schoolId: 'ddd0ab48-16e0-430d-9502-94f4d006531f',
            nik: `9876543210${(i + 1).toString().padStart(2, '0')}`,
            nip: `19851231${(1000 + i + 1).toString().padStart(4, '0')}`,
            hireDate: new Date(2020, 0, 1 + i),
            dob: new Date(1990, 0, 1 + i),
            phone: `081234567${(i + 1).toString().padStart(2, '0')}`,
            isActive: true,
          },
        });
      });

      count++;
    }

    return {
      message: `✅ Berhasil membuat ${count} data dummy Teacher + User`,
      count,
    };
  }
  async delete20DummyTeacher() {
    // ambil semua user dummy teacher
    const users = await this.prismaService.user.findMany({
      where: {
        role: Role.TEACHER,
        email: {
          startsWith: 'teacher',
          endsWith: '@example.com',
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return {
        message: '⚠️ Tidak ada dummy teacher yang bisa dihapus',
        count: 0,
      };
    }

    const userIds = users.map((u) => u.id);

    // transaction biar aman
    await this.prismaService.$transaction(async (prisma) => {
      // 1️⃣ hapus teacher dulu
      await prisma.teacher.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      // 2️⃣ hapus user
      await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    });

    return {
      message: `🗑️ Berhasil menghapus ${userIds.length} data dummy Teacher + User`,
      count: userIds.length,
    };
  }

  // ✅ CREATE Teacher (sekalian create User)
  async create(request: CreateTeacherRequest): Promise<TeacherResponse> {
    this.logger.info(`Create Teacher ${JSON.stringify(request)}`);
    request.hireDate = new Date(request.hireDate);
    request.dob = new Date(request.dob);

    const createRequest: CreateTeacherRequest = this.validationService.validate(
      TeacherValidation.CREATE,
      request,
    );

    // Cek email unik
    const existEmail = await this.prismaService.user.count({
      where: { email: createRequest.email },
    });
    if (existEmail !== 0) {
      throw new HttpException('Email already exists', 400);
    }

    // Cek NIK unik
    const existNik = await this.prismaService.teacher.count({
      where: { nik: createRequest.nik },
    });
    if (existNik !== 0) {
      throw new HttpException('NIK already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createRequest.password, 10);

    // Jalankan dalam 1 transaksi
    const teacher = await this.prismaService.$transaction(async (prisma) => {
      // Create User
      const user = await prisma.user.create({
        data: {
          email: createRequest.email,
          password: hashedPassword,
          fullName: createRequest.fullName,
          role: Role.TEACHER,
          gender: createRequest.gender,
        },
      });

      // Create Teacher
      return prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId: createRequest.schoolId,
          nik: createRequest.nik,
          nip: createRequest.nip,
          hireDate: createRequest.hireDate,
          dob: createRequest.dob,
          phone: createRequest.phone,
          isActive: true,
        },

        include: {
          user: true,
          subjectTeachers: {
            include: {
              subject: true,

              teacher: {
                include: { user: true },
              },
            },
          },
        },
      });
    });

    // Return response
    return {
      id: teacher.id,
      nik: teacher.nik,
      nip: teacher.nip || undefined,
      dob: teacher.dob,
      hireDate: teacher.hireDate,
      phone: teacher.phone,
      isActive: teacher.isActive,
      user: {
        id: teacher.user.id,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        gender: teacher.user.gender,
      },
      subjectTeachers: teacher.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<TeacherResponse[]> {
    this.logger.info('Find all teachers');
    const teachers = await this.prismaService.teacher.findMany({
      include: {
        user: true,
        subjectTeachers: {
          include: {
            subject: true,

            teacher: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      nik: teacher.nik,
      nip: teacher.nip || undefined,
      schoolId: teacher.schoolId,
      dob: teacher.dob,
      phone: teacher.phone,
      hireDate: teacher.hireDate,
      isActive: teacher.isActive,
      user: {
        id: teacher.user.id,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        gender: teacher.user.gender,
      },
      subjectTeachers: teacher.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<TeacherResponse> {
    this.logger.info(`Find teacher by id: ${id}`);
    const teacher = await this.prismaService.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        subjectTeachers: {
          include: {
            subject: true,

            teacher: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return {
      id: teacher.id,
      nik: teacher.nik,
      nip: teacher.nip || undefined,
      dob: teacher.dob,
      phone: teacher.phone,
      hireDate: teacher.hireDate,
      isActive: teacher.isActive,
      user: {
        id: teacher.user.id,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        gender: teacher.user.gender,
      },
      subjectTeachers: teacher.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),

      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  // ✅ UPDATE Teacher (dan user)
  async update(
    id: string,
    data: UpdateTeacherRequest,
  ): Promise<TeacherResponse> {
    this.logger.info(`Update teacher ${id} with ${JSON.stringify(data)}`);

    const teacher = await this.prismaService.teacher.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    if (data.dob) data.dob = new Date(data.dob);

    const updateRequest: UpdateTeacherRequest = this.validationService.validate(
      TeacherValidation.UPDATE,
      data,
    );

    // ✅ Cek email unik
    if (updateRequest.email && updateRequest.email !== teacher.user.email) {
      const existEmail = await this.prismaService.user.count({
        where: { email: updateRequest.email },
      });
      if (existEmail !== 0) {
        throw new HttpException('Email already exists', 400);
      }
    }

    // ✅ Cek NIK unik
    if (updateRequest.nik && updateRequest.nik !== teacher.nik) {
      const existNik = await this.prismaService.teacher.count({
        where: { nik: updateRequest.nik },
      });
      if (existNik !== 0) {
        throw new HttpException('NIK already exists', 400);
      }
    }

    // ✅ Transaction update user + teacher
    const updatedTeacher = await this.prismaService.$transaction(
      async (prisma) => {
        // Update User
        if (
          updateRequest.email ||
          updateRequest.fullName ||
          updateRequest.password ||
          updateRequest.gender
        ) {
          const userData: Prisma.UserUpdateInput = {};
          if (updateRequest.email) userData.email = updateRequest.email;
          if (updateRequest.fullName)
            userData.fullName = updateRequest.fullName;
          if (updateRequest.gender) userData.gender = updateRequest.gender;
          if (updateRequest.password)
            userData.password = await bcrypt.hash(updateRequest.password, 10);

          await prisma.user.update({
            where: { id: teacher.userId },
            data: userData,
          });
        }

        // Update Teacher
        return prisma.teacher.update({
          where: { id },
          data: {
            nik: updateRequest.nik,
            nip: updateRequest.nip,
            hireDate: updateRequest.hireDate,
            dob: updateRequest.dob,
            phone: updateRequest.phone,
            isActive: updateRequest.isActive,
          },
          include: {
            user: true,
            subjectTeachers: {
              include: {
                subject: true,

                teacher: {
                  include: { user: true },
                },
              },
            },
          },
        });
      },
    );

    return {
      id: updatedTeacher.id,
      nik: updatedTeacher.nik,
      nip: updatedTeacher.nip || undefined,
      dob: updatedTeacher.dob,
      phone: updatedTeacher.phone,
      hireDate: updatedTeacher.hireDate,
      isActive: updatedTeacher.isActive,
      user: {
        id: updatedTeacher.user.id,
        fullName: updatedTeacher.user.fullName,
        email: updatedTeacher.user.email,
        gender: updatedTeacher.user.gender,
      },
      subjectTeachers: updatedTeacher.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt,
    };
  }

  // ✅ DELETE Teacher (dan user)
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete teacher by id: ${id}`);

    const teacher = await this.prismaService.teacher.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    // Gunakan transaction untuk menghapus teacher dan user sekaligus
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.teacher.delete({ where: { id } });
      await prisma.user.delete({ where: { id: teacher.userId } });
    });

    return { message: `Teacher ${teacher.user.fullName} deleted successfully` };
  }
}
