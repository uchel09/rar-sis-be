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
import { SchoolAdminValidation } from './school-admin.validation';
import {
  CreateSchoolAdminRequest,
  UpdateSchoolAdminRequest,
  SchoolAdminResponse,
} from 'src/model/school-admin.model';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchoolAdminService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  // ✅ CREATE SchoolAdmin
  async create(
    request: CreateSchoolAdminRequest,
  ): Promise<SchoolAdminResponse> {
    this.logger.info(`Create SchoolAdmin ${JSON.stringify(request)}`);
    if (request.dob) request.dob = new Date(request.dob);

    const createRequest =
      this.validationService.validate<CreateSchoolAdminRequest>(
        SchoolAdminValidation.CREATE,
        request,
      );

    // Cek email unik
    const existEmail = await this.prismaService.user.count({
      where: { email: createRequest.email },
    });
    if (existEmail !== 0) {
      throw new HttpException('Email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createRequest.password, 10);

    // Gunakan transaksi
    const result = await this.prismaService.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: createRequest.email,
          password: hashedPassword,
          fullName: createRequest.fullName,
          role: Role.SCHOOL_ADMIN,
          gender: createRequest.gender
        },
      });

      // Create SchoolAdmin
      const schoolAdmin = await tx.schoolAdmin.create({
        data: {
          userId: user.id,
          schoolId: createRequest.schoolId,
          dob: createRequest.dob,
          nik: createRequest.nik
        },
        include: { user: true },
      });

      return schoolAdmin;
    });

    return {
      id: result.id,
      schoolId: result.schoolId,
      dob: result.dob,
      nik: result.nik,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        gender: result.user.gender,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<SchoolAdminResponse[]> {
    this.logger.info('Find all school admins');
    const schoolAdmins = await this.prismaService.schoolAdmin.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return schoolAdmins.map((admin) => ({
      id: admin.id,
      schoolId: admin.schoolId,
      dob: admin.dob,
      nik: admin.nik,
      user: {
        id: admin.user.id,
        fullName: admin.user.fullName,
        email: admin.user.email,
        gender: admin.user.gender
      },
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<SchoolAdminResponse> {
    this.logger.info(`Find school admin by id: ${id}`);
    const schoolAdmin = await this.prismaService.schoolAdmin.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!schoolAdmin) {
      throw new NotFoundException(`SchoolAdmin with id ${id} not found`);
    }

    return {
      id: schoolAdmin.id,
      schoolId: schoolAdmin.schoolId,
      dob: schoolAdmin.dob,
      nik: schoolAdmin.nik,
      user: {
        id: schoolAdmin.user.id,
        fullName: schoolAdmin.user.fullName,
        email: schoolAdmin.user.email,
        gender: schoolAdmin.user.gender,
      },
      createdAt: schoolAdmin.createdAt,
      updatedAt: schoolAdmin.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateSchoolAdminRequest,
  ): Promise<SchoolAdminResponse> {
    this.logger.info(`Update school admin ${id} with ${JSON.stringify(data)}`);

    const schoolAdmin = await this.prismaService.schoolAdmin.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!schoolAdmin) {
      throw new NotFoundException(`SchoolAdmin with id ${id} not found`);
    }

    if (data.dob) data.dob = new Date(data.dob);

    const updateRequest =
      this.validationService.validate<UpdateSchoolAdminRequest>(
        SchoolAdminValidation.UPDATE,
        data,
      );

    // Jika email ingin diubah, cek unik
    if (updateRequest.email && updateRequest.email !== schoolAdmin.user.email) {
      const existEmail = await this.prismaService.user.count({
        where: { email: updateRequest.email },
      });
      if (existEmail !== 0) {
        throw new HttpException('Email already exists', 400);
      }
    }

    const updatedAdmin = await this.prismaService.$transaction(async (tx) => {
      // Update User
      if (
        updateRequest.email ||
        updateRequest.fullName ||
        updateRequest.password ||
        updateRequest.gender
      ) {
        const userData: Prisma.UserUpdateInput = {};
        if (updateRequest.email) userData.email = updateRequest.email;
        if (updateRequest.fullName) userData.fullName = updateRequest.fullName;
        if (updateRequest.gender) userData.gender = updateRequest.gender;
        if (updateRequest.password)
          userData.password = await bcrypt.hash(updateRequest.password, 10);

        await tx.user.update({
          where: { id: schoolAdmin.userId },
          data: userData,
        });
      }

      // Update SchoolAdmin
      return tx.schoolAdmin.update({
        where: { id },
        data: {
          schoolId: updateRequest.schoolId,
          dob: updateRequest.dob,
          nik: updateRequest.nik,
        },
        include: { user: true },
      });
    });

    return {
      id: updatedAdmin.id,
      schoolId: updatedAdmin.schoolId,
      dob: updatedAdmin.dob,
      nik: updatedAdmin.nik,
      user: {
        id: updatedAdmin.user.id,
        fullName: updatedAdmin.user.fullName,
        email: updatedAdmin.user.email,
        gender: updatedAdmin.user.gender
      },
      createdAt: updatedAdmin.createdAt,
      updatedAt: updatedAdmin.updatedAt,
    };
  }
  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete school admin by id: ${id}`);

    const schoolAdmin = await this.prismaService.schoolAdmin.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!schoolAdmin) {
      throw new NotFoundException(`SchoolAdmin with id ${id} not found`);
    }

    // Gunakan transaction untuk menghapus schoolAdmin dan user sekaligus
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.schoolAdmin.delete({ where: { id } });
      await prisma.user.delete({ where: { id: schoolAdmin.userId } });
    });

    return {
      message: `SchoolAdmin ${schoolAdmin.user.fullName} deleted successfully`,
    };
  }
}
