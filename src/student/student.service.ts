import {
  Injectable,
  NotFoundException,
  HttpException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';
import { StudentValidation } from './student.validation';
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentResponse,
} from 'src/model/student.model';
import { Role, Prisma } from 'generated/prisma';

@Injectable()
export class StudentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  // ✅ CREATE
  async create(request: CreateStudentRequest): Promise<StudentResponse> {
    this.logger.info(`Create Student ${JSON.stringify(request)}`);
    request.dob = new Date(request.dob);

    const createRequest = this.validationService.validate<CreateStudentRequest>(
      StudentValidation.CREATE,
      request,
    );

    const existEmail = await this.prismaService.user.count({
      where: { email: createRequest.email },
    });
    if (existEmail) throw new HttpException('Email already exists', 400);

    const hashedPassword = await bcrypt.hash(createRequest.password, 10);

    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createRequest.email,
          password: hashedPassword,
          fullName: createRequest.fullName,
          role: Role.STUDENT,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId: createRequest.schoolId,
          classId: createRequest.classId,
          enrollmentNumber: createRequest.enrollmentNumber || undefined,
          dob: createRequest.dob,
          address: createRequest.address,
        },
        include: {
          user: true,
          class: true,
          parents: { include: { parent: { include: { user: true } } } },
        },
      });

      return {
        id: student.id,
        schoolId: student.schoolId,
        class: student.class
          ? {
              id: student.class.id,
              name: student.class.name,
              grade: student.class.grade,
            }
          : undefined,
        enrollmentNumber: student.enrollmentNumber,
        dob: student.dob,
        address: student.address || undefined,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        parents: student.parents.map((p) => ({
          id: p.parent.id,
          fullName: p.parent.user.fullName,
          email: p.parent.user.email,
        })),
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });
  }

  // ✅ READ ALL
  async findAll(): Promise<StudentResponse[]> {
    const students = await this.prismaService.student.findMany({
      include: {
        user: true,
        class: true,
        parents: { include: { parent: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((s) => ({
      id: s.id,
      schoolId: s.schoolId,
      class: s.class
        ? {
            id: s.class.id,
            name: s.class.name,
            grade: s.class.grade,
          }
        : undefined,
      enrollmentNumber: s.enrollmentNumber,
      dob: s.dob,
      address: s.address || undefined,
      user: {
        id: s.user.id,
        fullName: s.user.fullName,
        email: s.user.email,
      },
      parents: s.parents.map((p) => ({
        id: p.parent.id,
        fullName: p.parent.user.fullName,
        email: p.parent.user.email,
      })),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<StudentResponse> {
    const student = await this.prismaService.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        parents: { include: { parent: { include: { user: true } } } },
      },
    });

    if (!student)
      throw new NotFoundException(`Student with id ${id} not found`);

    return {
      id: student.id,
      schoolId: student.schoolId,
      class: student.class
        ? {
            id: student.class.id,
            name: student.class.name,
            grade: student.class.grade,
          }
        : undefined,
      enrollmentNumber: student.enrollmentNumber,
      dob: student.dob,
      address: student.address || undefined,
      user: {
        id: student.user.id,
        fullName: student.user.fullName,
        email: student.user.email,
      },
      parents: student.parents.map((p) => ({
        id: p.parent.id,
        fullName: p.parent.user.fullName,
        email: p.parent.user.email,
      })),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    const student = await this.prismaService.student.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!student)
      throw new NotFoundException(`Student with id ${id} not found`);

    if (data.dob) data.dob = new Date(data.dob);

    const updateRequest = this.validationService.validate<UpdateStudentRequest>(
      StudentValidation.UPDATE,
      data,
    );

    if (updateRequest.email && updateRequest.email !== student.user.email) {
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
      if (updateRequest.password)
        userData.password = await bcrypt.hash(updateRequest.password, 10);

      const updatedUser = Object.keys(userData).length
        ? await tx.user.update({
            where: { id: student.userId },
            data: userData,
          })
        : student.user;

      // Update student
      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          schoolId: updateRequest.schoolId,
          classId: updateRequest.classId,
          enrollmentNumber: updateRequest.enrollmentNumber,
          dob: updateRequest.dob,
          address: updateRequest.address,
        },
        include: {
          user: true,
          class: true,
          parents: { include: { parent: { include: { user: true } } } },
        },
      });

      return {
        id: updatedStudent.id,
        schoolId: updatedStudent.schoolId,
        class: updatedStudent.class
          ? {
              id: updatedStudent.class.id,
              name: updatedStudent.class.name,
              grade: updatedStudent.class.grade,
            }
          : undefined,
        enrollmentNumber: updatedStudent.enrollmentNumber,
        dob: updatedStudent.dob,
        address: updatedStudent.address || undefined,
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
        },
        parents: updatedStudent.parents.map((p) => ({
          id: p.parent.id,
          fullName: p.parent.user.fullName,
          email: p.parent.user.email,
        })),
        createdAt: updatedStudent.createdAt,
        updatedAt: updatedStudent.updatedAt,
      };
    });
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    const student = await this.prismaService.student.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!student)
      throw new NotFoundException(`Student with id ${id} not found`);

    await this.prismaService.$transaction(async (tx) => {
      await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    return { message: `Student ${student.user.fullName} deleted successfully` };
  }
}
