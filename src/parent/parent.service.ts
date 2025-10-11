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
    request.dob = new Date(request.dob);

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
      const parent = await this.findByNik(createRequest.nik);
      return parent;
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
          dob: createRequest.dob,
          phone: createRequest.phone,
          address: createRequest.address,
          nik: createRequest.nik,
        },
      });

      return {
        id: parent.id,
        dob: parent.dob,
        phone: parent.phone || undefined,
        address: parent.address || undefined,
        nik: parent.nik,
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
      dob: parent.dob,
      phone: parent.phone || undefined,
      address: parent.address || undefined,
      nik: parent.nik,
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
      dob: parent.dob,
      phone: parent.phone || undefined,
      address: parent.address || undefined,
      nik: parent.nik,
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

    if (data.dob) data.dob = new Date(data.dob);

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
      if (updateRequest.gender) userData.fullName = updateRequest.gender;
      if (updateRequest.password)
        userData.password = await bcrypt.hash(updateRequest.password, 10);

      const updatedUser = Object.keys(userData).length
        ? await tx.user.update({ where: { id: parent.userId }, data: userData })
        : parent.user;

      // Update parent
      const updatedParent = await tx.parent.update({
        where: { id },
        data: {
          dob: updateRequest.dob,
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
      await tx.parent.delete({ where: { id } });
      await tx.user.delete({ where: { id: parent.userId } });
    });

    return { message: `Parent ${parent.user.fullName} deleted successfully` };
  }
}
