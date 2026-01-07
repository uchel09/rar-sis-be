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
import { Role, Prisma } from '@prisma/client';

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

    if (createRequest.classId) {
      const cls = await this.prismaService.class.findUnique({
        where: { id: createRequest.classId },
        select: { id: true, schoolId: true },
      });
      if (!cls) {
        throw new NotFoundException(
          `Class with id ${createRequest.classId} not found`,
        );
      }
      if (cls.schoolId !== createRequest.schoolId) {
        throw new HttpException('Class must belong to the same school', 400);
      }
    }

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
          gender: createRequest.gender,
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
          isActive: createRequest.isActive ?? true,
        },
        include: {
          user: true,
          class: true,
          parents: { include: { parent: { include: { user: true } } } },
        },
      });

      const parentIds = Array.from(new Set(createRequest.parentIds ?? []));
      if (parentIds.length > 0) {
        const parents = await tx.parent.findMany({
          where: { id: { in: parentIds } },
          select: { id: true },
        });

        if (parents.length !== parentIds.length) {
          throw new HttpException('Some parentIds not found', 400);
        }

        await tx.studentParent.createMany({
          data: parentIds.map((parentId) => ({
            studentId: student.id,
            parentId,
          })),
          skipDuplicates: true,
        });
      }

      const studentWithRelations =
        parentIds.length > 0
          ? await tx.student.findUnique({
              where: { id: student.id },
              include: {
                user: true,
                class: true,
                parents: {
                  include: { parent: { include: { user: true } } },
                },
              },
            })
          : student;

      if (!studentWithRelations) {
        throw new HttpException('Student not found after creation', 500);
      }

      return {
        id: studentWithRelations.id,
        schoolId: studentWithRelations.schoolId,
        class: studentWithRelations.class
          ? {
              id: studentWithRelations.class.id,
              name: studentWithRelations.class.name,
              grade: studentWithRelations.class.grade,
            }
          : undefined,
        enrollmentNumber: studentWithRelations.enrollmentNumber,
        dob: studentWithRelations.dob,
        address: studentWithRelations.address || undefined,
        user: {
          id: studentWithRelations.user.id,
          fullName: studentWithRelations.user.fullName,
          email: studentWithRelations.user.email,
          gender: studentWithRelations.user.gender,
        },
        parents: studentWithRelations.parents.map((p) => ({
          id: p.parent.id,
          fullName: p.parent.user.fullName,
          email: p.parent.user.email,
        })),
        isActive: studentWithRelations.isActive,
        createdAt: studentWithRelations.createdAt,
        updatedAt: studentWithRelations.updatedAt,
      };
    });
  }

  // ✅ READ ALL
  async findAllStudentByClassId(id: string): Promise<StudentResponse[]> {
    const students = await this.prismaService.student.findMany({
      where: { classId:id },
      include: {
        user: true,
        class: true,
        parents: { include: { parent: { include: { user: true } } } },
      },
      orderBy: { user: { fullName: 'desc' } },
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
        gender: s.user.gender,
      },
      parents: s.parents.map((p) => ({
        id: p.parent.id,
        fullName: p.parent.user.fullName,
        email: p.parent.user.email,
      })),
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
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
        gender: s.user.gender,
      },
      parents: s.parents.map((p) => ({
        id: p.parent.id,
        fullName: p.parent.user.fullName,
        email: p.parent.user.email,
      })),
      isActive: s.isActive,
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
        gender: student.user.gender,
      },
      parents: student.parents.map((p) => ({
        id: p.parent.id,
        fullName: p.parent.user.fullName,
        email: p.parent.user.email,
      })),
      isActive: student.isActive,
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

    const effectiveSchoolId = updateRequest.schoolId ?? student.schoolId;
    if (updateRequest.classId) {
      const cls = await this.prismaService.class.findUnique({
        where: { id: updateRequest.classId },
        select: { id: true, schoolId: true },
      });
      if (!cls) {
        throw new NotFoundException(
          `Class with id ${updateRequest.classId} not found`,
        );
      }
      if (cls.schoolId !== effectiveSchoolId) {
        throw new HttpException('Class must belong to the same school', 400);
      }
    } else if (updateRequest.schoolId && student.classId) {
      const cls = await this.prismaService.class.findUnique({
        where: { id: student.classId },
        select: { id: true, schoolId: true },
      });
      if (cls && cls.schoolId !== updateRequest.schoolId) {
        throw new HttpException(
          'Existing class must belong to the updated school',
          400,
        );
      }
    }

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
      if (updateRequest.gender) userData.gender = updateRequest.gender;
      if (updateRequest.password)
        userData.password = await bcrypt.hash(updateRequest.password, 10);

      const updatedUser = Object.keys(userData).length
        ? await tx.user.update({
            where: { id: student.userId },
            data: userData,
          })
        : student.user;

      // Update student
      await tx.student.update({
        where: { id },
        data: {
          schoolId: updateRequest.schoolId,
          classId: updateRequest.classId,
          enrollmentNumber: updateRequest.enrollmentNumber,
          dob: updateRequest.dob,
          address: updateRequest.address,
          isActive: updateRequest.isActive,
        },
        include: {
          user: true,
          class: true,
          parents: { include: { parent: { include: { user: true } } } },
        },
      });

      if (updateRequest.parentIds !== undefined) {
        const parentIds = Array.from(new Set(updateRequest.parentIds ?? []));
        const parents = await tx.parent.findMany({
          where: { id: { in: parentIds } },
          select: { id: true },
        });

        if (parents.length !== parentIds.length) {
          throw new HttpException('Some parentIds not found', 400);
        }

        await tx.studentParent.deleteMany({
          where: { studentId: id },
        });

        if (parentIds.length > 0) {
          await tx.studentParent.createMany({
            data: parentIds.map((parentId) => ({
              studentId: id,
              parentId,
            })),
            skipDuplicates: true,
          });
        }
      }

      const refreshedStudent = await tx.student.findUnique({
        where: { id },
        include: {
          user: true,
          class: true,
          parents: { include: { parent: { include: { user: true } } } },
        },
      });

      if (!refreshedStudent) {
        throw new HttpException('Student not found after update', 500);
      }

      return {
        id: refreshedStudent.id,
        schoolId: refreshedStudent.schoolId,
        class: refreshedStudent.class
          ? {
              id: refreshedStudent.class.id,
              name: refreshedStudent.class.name,
              grade: refreshedStudent.class.grade,
            }
          : undefined,
        enrollmentNumber: refreshedStudent.enrollmentNumber,
        dob: refreshedStudent.dob,
        address: refreshedStudent.address || undefined,
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          gender: updatedUser.gender,
        },
        parents: refreshedStudent.parents.map((p) => ({
          id: p.parent.id,
          fullName: p.parent.user.fullName,
          email: p.parent.user.email,
        })),
        isActive: refreshedStudent.isActive,
        createdAt: refreshedStudent.createdAt,
        updatedAt: refreshedStudent.updatedAt,
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

    const [
      classHistoryCount,
      attendanceDetailCount,
      assessmentGradeCount,
      studentExamCount,
      studentDraftCount,
    ] = await Promise.all([
      this.prismaService.studentClassHistory.count({ where: { studentId: id } }),
      this.prismaService.attendanceDetail.count({ where: { studentId: id } }),
      this.prismaService.assessmentGrade.count({ where: { studentId: id } }),
      this.prismaService.studentExam.count({ where: { studentId: id } }),
      this.prismaService.studentDraft.count({ where: { studentId: id } }),
    ]);

    if (
      classHistoryCount > 0 ||
      attendanceDetailCount > 0 ||
      assessmentGradeCount > 0 ||
      studentExamCount > 0 ||
      studentDraftCount > 0
    ) {
      throw new HttpException(
        'Student has related records; deactivate instead',
        409,
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.studentParent.deleteMany({
        where: { studentId: id },
      });
      await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    return { message: `Student ${student.user.fullName} deleted successfully` };
  }
}
