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
import * as bcrypt from 'bcrypt';
import { ParentValidation } from './parent.validation';
import {
  CreateParentRequest,
  UpdateParentRequest,
  ParentResponse,
} from 'src/model/parent.model';
import { Role, Prisma } from 'generated/prisma';
import { CreateStudentRequest } from 'src/model/student.model';
import { StudentValidation } from 'src/student/student.validation';

@Injectable()
export class ParentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  // ✅ CREATE Parent
  async create(request: CreateParentRequest): Promise<ParentResponse> {
    this.logger.info(`Create Parent ${JSON.stringify(request)}`);

    const createRequest = this.validationService.validate<CreateParentRequest>(
      ParentValidation.CREATE,
      request,
    );

    const existEmail = await this.prismaService.user.count({
      where: { email: createRequest.email },
    });

    const existNik = await this.prismaService.user.count({
      where: { parent: { nik: createRequest.nik } },
    });
    if (existEmail !== 0) throw new HttpException('Email already exists', 400);
    if (existNik !== 0) {
      throw new HttpException('Nik already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(createRequest.password, 10);

    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createRequest.email,
          password: hashedPassword,
          fullName: createRequest.fullName,
          role: Role.PARENT,
          gender: createRequest.gender,
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          phone: createRequest.phone,
          address: createRequest.address,
          nik: createRequest.nik,
          isActive: createRequest.isActive || true,
        },
      });

      return {
        id: parent.id,
        dob: parent.dob,
        phone: parent.phone || undefined,
        address: parent.address || undefined,
        nik: parent.nik,
        isActive: parent.isActive,
        user: {
          gender: user.gender,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        students: [],
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
      };
    });
  }
  async createParentStudentDraft(
    parentRequests: CreateParentRequest[],
    studentRequest: CreateStudentRequest,
  ): Promise<any> {
    this.logger.info(`Create Parent Student Draft`);

    // ✅ Validasi semua request
    const validatedParentRequests = parentRequests.map((parent) =>
      this.validationService.validate<CreateParentRequest>(
        ParentValidation.CREATE,
        parent,
      ),
    );

    const createStudentRequest =
      this.validationService.validate<CreateStudentRequest>(
        StudentValidation.CREATE,
        studentRequest,
      );

    // ✅ Jalankan semua logika di dalam satu transaksi
    await this.prismaService.$transaction(async (tx) => {
      const parentIds: string[] = [];

      // 🔁 Loop semua parent
      for (const p of validatedParentRequests) {
        // 🔍 Cek apakah parent sudah ada berdasarkan NIK atau email user
        const existingParent = await tx.parent.findFirst({
          where: {
            OR: [{ nik: p.nik }, { user: { email: p.email } }],
          },
          include: { user: true },
        });

        if (existingParent) {
          parentIds.push(existingParent.id);
          continue;
        }

        // 🔐 Buat user dan parent baru
        const hashedPassword = await bcrypt.hash(p.password, 10);
        const userParent = await tx.user.create({
          data: {
            email: p.email,
            password: hashedPassword,
            fullName: p.fullName,
            role: Role.PARENT,
            gender: p.gender,
          },
        });

        const parent = await tx.parent.create({
          data: {
            userId: userParent.id,
            phone: p.phone,
            address: p.address,
            nik: p.nik,
            isActive: p.isActive ?? true,
          },
        });

        parentIds.push(parent.id);
      }

      // 👦 Buat student baru
      const hashedPasswordStudent = await bcrypt.hash(
        createStudentRequest.password,
        10,
      );

      const userStudent = await tx.user.create({
        data: {
          email: createStudentRequest.email,
          password: hashedPasswordStudent,
          fullName: createStudentRequest.fullName,
          role: Role.STUDENT,
          gender: createStudentRequest.gender,
        },
      });

      const studentRes = await tx.student.create({
        data: {
          userId: userStudent.id,
          schoolId: createStudentRequest.schoolId,
          classId: createStudentRequest.classId,
          enrollmentNumber: createStudentRequest.enrollmentNumber || undefined,
          dob: createStudentRequest.dob,
          address: createStudentRequest.address,
          isActive: true,
        },
      });

      // 🔗 Buat relasi manual di tabel pivot StudentParent
      await tx.studentParent.createMany({
        data: parentIds.map((parentId) => ({
          studentId: studentRes.id,
          parentId,
        })),
      });

      return {
        message: 'Parent dan Student berhasil dibuat dalam satu transaksi',
        studentId: studentRes.id,
        parentIds,
      };
    });

    return { message: 'approve berhasil' };
  }

  // ✅ READ ALL
  async findAll(): Promise<ParentResponse[]> {
    const parents = await this.prismaService.parent.findMany({
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true, // pastikan include user agar ada fullName
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return parents.map((p) => ({
      id: p.id,
      dob: p.dob,
      phone: p.phone || undefined,
      address: p.address || undefined,
      nik: p.nik,
      user: {
        gender: p.user.gender,
        id: p.user.id,
        fullName: p.user.fullName,
        email: p.user.email,
      },
      students: p.students.map((s) => ({
        id: s.student.id,
        fullName: s.student.user.fullName, // ambil dari student.user
      })),
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<ParentResponse> {
    const parent = await this.prismaService.parent.findUnique({
      where: { id },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true, // pastikan ada user supaya fullName bisa diambil
              },
            },
          },
        },
      },
    });

    if (!parent) throw new NotFoundException(`Parent with id ${id} not found`);

    return {
      id: parent.id,
      phone: parent.phone || undefined,
      address: parent.address || undefined,
      nik: parent.nik,
      isActive: parent.isActive,
      user: {
        id: parent.user.id,
        fullName: parent.user.fullName,
        email: parent.user.email,
        gender: parent.user.gender,
      },
      students: parent.students.map((s) => ({
        id: s.student.id,
        fullName: s.student.user.fullName, // ambil dari student.user
      })),
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }

  async findByNik(nik: string): Promise<ParentResponse> {
    const parent = await this.prismaService.parent.findUnique({
      where: { nik: nik },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true, // pastikan ada user supaya fullName bisa diambil
              },
            },
          },
        },
      },
    });

    if (!parent) throw new NotFoundException(`Parent with id ${nik} not found`);

    return {
      id: parent.id,
      phone: parent.phone || undefined,
      address: parent.address || undefined,
      nik: parent.nik,
      isActive: parent.isActive,
      user: {
        gender: parent.user.gender,
        id: parent.user.id,
        fullName: parent.user.fullName,
        email: parent.user.email,
      },
      students: parent.students.map((s) => ({
        id: s.student.id,
        fullName: s.student.user.fullName, // ambil dari student.user
      })),
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }
  // ✅ UPDATE Parent
  async update(id: string, data: UpdateParentRequest): Promise<ParentResponse> {
    const parent = await this.prismaService.parent.findUnique({
      where: { id },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: { user: true }, // pastikan bisa ambil fullName siswa
            },
          },
        },
      },
    });

    if (!parent) throw new NotFoundException(`Parent with id ${id} not found`);

    const updateRequest = this.validationService.validate<UpdateParentRequest>(
      ParentValidation.UPDATE,
      data,
    );

    // Cek email unik jika berubah
    if (updateRequest.email && updateRequest.email !== parent.user.email) {
      const existEmail = await this.prismaService.user.count({
        where: { email: updateRequest.email },
      });
      if (existEmail) throw new HttpException('Email already exists', 400);
    }

    return this.prismaService.$transaction(async (tx) => {
      // Update user
      const userData: Prisma.UserUpdateInput = {};
      if (updateRequest.email) userData.email = updateRequest.email;
      if (updateRequest.fullName) userData.fullName = updateRequest.fullName;
      if (updateRequest.gender) userData.gender = updateRequest.gender;
      if (updateRequest.password)
        userData.password = await bcrypt.hash(updateRequest.password, 10);

      const updatedUser = Object.keys(userData).length
        ? await tx.user.update({ where: { id: parent.userId }, data: userData })
        : parent.user;

      // Update parent
      const updatedParent = await tx.parent.update({
        where: { id },
        data: {
          phone: updateRequest.phone,
          address: updateRequest.address,
          nik: updateRequest.nik,
        },
        include: {
          students: {
            include: {
              student: { include: { user: true } },
            },
          },
        },
      });

      return {
        id: updatedParent.id,
        dob: updatedParent.dob,
        phone: updatedParent.phone || undefined,
        address: updatedParent.address || undefined,
        nik: updatedParent.nik,
        isActive: updatedParent.isActive,
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          gender: updatedUser.gender,
        },
        students: updatedParent.students.map((s) => ({
          id: s.student.id,
          fullName: s.student.user.fullName,
        })),
        createdAt: updatedParent.createdAt,
        updatedAt: updatedParent.updatedAt,
      };
    });
  }

  // ✅ DELETE Parent
  async delete(id: string): Promise<{ message: string }> {
    const parent = await this.prismaService.parent.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!parent) throw new NotFoundException(`Parent with id ${id} not found`);

    await this.prismaService.$transaction(async (tx) => {
      await tx.studentParent.deleteMany({
        where: { parentId: id },
      });
      await tx.parent.delete({ where: { id } });
      await tx.user.delete({ where: { id: parent.userId } });
    });

    return { message: `Parent ${parent.user.fullName} deleted successfully` };
  }
}
