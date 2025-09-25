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
import { StaffValidation } from './staff.validation';
import {
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffResponse,
} from 'src/model/staff.model';
import { Role, Prisma } from 'generated/prisma';

@Injectable()
export class StaffService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  // ✅ CREATE Staff
  async create(request: CreateStaffRequest): Promise<StaffResponse> {
    this.logger.info(`Create Staff ${JSON.stringify(request)}`);

    const createRequest = this.validationService.validate<CreateStaffRequest>(
      StaffValidation.CREATE,
      request,
    );

    // Cek email unik
    const existEmail = await this.prismaService.user.count({
      where: { email: createRequest.email },
    });
    if (existEmail !== 0) throw new HttpException('Email already exists', 400);

    // Cek NIK unik
    const existNik = await this.prismaService.staff.count({
      where: { nik: createRequest.nik },
    });
    if (existNik !== 0) throw new HttpException('NIK already exists', 400);

    // Hash password
    const hashedPassword = await bcrypt.hash(createRequest.password, 10);

    // Pakai transaction supaya jika staff gagal dibuat, user dihapus
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createRequest.email,
          password: hashedPassword,
          fullName: createRequest.fullName,
          role: Role.STAFF,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          schoolId: createRequest.schoolId,
          position: createRequest.position,
          phone: createRequest.phone,
          nik: createRequest.nik,
          nip: createRequest.nip,
          dob: createRequest.dob,
        },
        include: { user: true },
      });

      return {
        id: staff.id,
        schoolId: staff.schoolId,
        position: staff.position,
        phone: staff.phone,
        nik: staff.nik,
        nip: staff.nip || undefined,
        dob: staff.dob,
        user: {
          id: staff.user.id,
          fullName: staff.user.fullName,
          email: staff.user.email,
        },
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      };
    });
  }

  // ✅ READ ALL
  async findAll(): Promise<StaffResponse[]> {
    const staffs = await this.prismaService.staff.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return staffs.map((staff) => ({
      id: staff.id,
      schoolId: staff.schoolId,
      position: staff.position,
      phone: staff.phone,
      nik: staff.nik,
      nip: staff.nip || undefined,
      dob: staff.dob,
      user: {
        id: staff.user.id,
        fullName: staff.user.fullName,
        email: staff.user.email,
      },
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<StaffResponse> {
    const staff = await this.prismaService.staff.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!staff) throw new NotFoundException(`Staff with id ${id} not found`);

    return {
      id: staff.id,
      schoolId: staff.schoolId,
      position: staff.position,
      phone: staff.phone,
      nik: staff.nik,
      nip: staff.nip || undefined,
      dob: staff.dob,
      user: {
        id: staff.user.id,
        fullName: staff.user.fullName,
        email: staff.user.email,
      },
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  // ✅ UPDATE Staff
  async update(id: string, data: UpdateStaffRequest): Promise<StaffResponse> {
    const staff = await this.prismaService.staff.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!staff) throw new NotFoundException(`Staff with id ${id} not found`);

    const updateRequest = this.validationService.validate<UpdateStaffRequest>(
      StaffValidation.UPDATE,
      data,
    );

    // Cek email unik
    if (updateRequest.email && updateRequest.email !== staff.user.email) {
      const existEmail = await this.prismaService.user.count({
        where: { email: updateRequest.email },
      });
      if (existEmail !== 0)
        throw new HttpException('Email already exists', 400);
    }

    // Cek NIK unik
    if (updateRequest.nik && updateRequest.nik !== staff.nik) {
      const existNik = await this.prismaService.staff.count({
        where: { nik: updateRequest.nik },
      });
      if (existNik !== 0) throw new HttpException('NIK already exists', 400);
    }

    // Update User
    if (
      updateRequest.email ||
      updateRequest.fullName ||
      updateRequest.password
    ) {
      const userData: Prisma.UserUpdateInput = {};
      if (updateRequest.email) userData.email = updateRequest.email;
      if (updateRequest.fullName) userData.fullName = updateRequest.fullName;
      if (updateRequest.password)
        userData.password = await bcrypt.hash(updateRequest.password, 10);

      await this.prismaService.user.update({
        where: { id: staff.userId },
        data: userData,
      });
    }

    // Update Staff
    const updatedStaff = await this.prismaService.staff.update({
      where: { id },
      data: {
        schoolId: updateRequest.schoolId,
        position: updateRequest.position,
        phone: updateRequest.phone,
        nik: updateRequest.nik,
        nip: updateRequest.nip,
        dob: updateRequest.dob,
      },
      include: { user: true },
    });

    return {
      id: updatedStaff.id,
      schoolId: updatedStaff.schoolId,
      position: updatedStaff.position,
      phone: updatedStaff.phone,
      nik: updatedStaff.nik,
      nip: updatedStaff.nip || undefined,
      dob: updatedStaff.dob,
      user: {
        id: updatedStaff.user.id,
        fullName: updatedStaff.user.fullName,
        email: updatedStaff.user.email,
      },
      createdAt: updatedStaff.createdAt,
      updatedAt: updatedStaff.updatedAt,
    };
  }

  // ✅ DELETE Staff
  async delete(id: string): Promise<{ message: string }> {
    const staff = await this.prismaService.staff.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!staff) throw new NotFoundException(`Staff with id ${id} not found`);

    await this.prismaService.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id } });
      await tx.user.delete({ where: { id: staff.userId } });
    });

    return { message: `Staff ${staff.user.fullName} deleted successfully` };
  }
}
