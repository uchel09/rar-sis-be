import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import {
  CreateStudentClassHistoryRequest,
  UpdateStudentClassHistoryRequest,
  StudentClassHistoryResponse,
} from 'src/model/student-class-history.model';
import { Logger } from 'winston';
import { StudentClassHistoryValidation } from './student-class-history.validation';

@Injectable()
export class StudentClassHistoryService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(
    request: CreateStudentClassHistoryRequest,
  ): Promise<StudentClassHistoryResponse> {
    this.logger.info(`Create StudentClassHistory ${JSON.stringify(request)}`);

    const createRequest =
      this.validationService.validate<CreateStudentClassHistoryRequest>(
        StudentClassHistoryValidation.CREATE,
        request,
      );

    const history = await this.prismaService.studentClassHistory.create({
      data: {
        studentId: createRequest.studentId,
        classId: createRequest.classId,
        academicYearId: createRequest.academicYearId,
        semester: createRequest.semester,
        isRepeatedYear: createRequest.isRepeatedYear,
        remark: createRequest.remark,
        studentStatus: createRequest.studentStatus,
        grade: createRequest.grade,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: history.id,
      studentId: history.studentId,
      classId: history.classId,
      academicYearId: history.academicYearId,
      semester: history.semester,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
      isRepeatedYear: history.isRepeatedYear,
      remark: history.remark,
      studentStatus: history.studentStatus,
      grade: history.grade,
      academicYear: {
        id: history.academicYear.id,
        name: history.academicYear.name,
      },
      student: {
        id: history.student.id,
        user: {
          id: history.student.user.id,
          fullName: history.student.user.fullName,
          email: history.student.user.email,
        },
      },
      class: {
        id: history.class.id,
        name: history.class.name,
      },
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<StudentClassHistoryResponse[]> {
    this.logger.info('Find all StudentClassHistory');

    const histories = await this.prismaService.studentClassHistory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return histories.map((history) => ({
      id: history.id,
      studentId: history.studentId,
      classId: history.classId,
      academicYearId: history.academicYearId,
      semester: history.semester,
      isRepeatedYear: history.isRepeatedYear,
      remark: history.remark,
      studentStatus: history.studentStatus,
      grade: history.grade,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,

      student: {
        id: history.student.id,
        user: {
          id: history.student.user.id,
          fullName: history.student.user.fullName,
          email: history.student.user.email,
        },
      },
      class: {
        id: history.class.id,
        name: history.class.name,
      },
      academicYear: {
        id: history.academicYear.id,
        name: history.academicYear.name,
      },
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<StudentClassHistoryResponse> {
    this.logger.info(`Find StudentClassHistory by id: ${id}`);

    const history = await this.prismaService.studentClassHistory.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!history) {
      throw new NotFoundException(
        `StudentClassHistory with id ${id} not found`,
      );
    }

    return {
      id: history.id,
      studentId: history.studentId,
      classId: history.classId,
      academicYearId: history.academicYear.id,
      semester: history.semester,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
      isRepeatedYear: history.isRepeatedYear,
      remark: history.remark,
      studentStatus: history.studentStatus,
      grade: history.grade,
      student: {
        id: history.student.id,
        user: {
          id: history.student.user.id,
          fullName: history.student.user.fullName,
          email: history.student.user.email,
        },
      },
      class: {
        id: history.class.id,
        name: history.class.name,
      },
      academicYear: {
        id: history.academicYear.id,
        name: history.academicYear.name,
      },
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateStudentClassHistoryRequest,
  ): Promise<StudentClassHistoryResponse> {
    this.logger.info(
      `Update StudentClassHistory ${id} with ${JSON.stringify(data)}`,
    );

    const exist = await this.prismaService.studentClassHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `StudentClassHistory with id ${id} not found`,
      );
    }

    const updateRequest =
      this.validationService.validate<UpdateStudentClassHistoryRequest>(
        StudentClassHistoryValidation.UPDATE,
        data,
      );

    const history = await this.prismaService.studentClassHistory.update({
      where: { id },
      data: updateRequest,
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: history.id,
      studentId: history.studentId,
      classId: history.classId,
      academicYearId: history.academicYear.id,
      semester: history.semester,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
      isRepeatedYear: history.isRepeatedYear,
      remark: history.remark,
      studentStatus: history.studentStatus,
      grade: history.grade,
      student: {
        id: history.student.id,
        user: {
          id: history.student.user.id,
          fullName: history.student.user.fullName,
          email: history.student.user.email,
        },
      },
      class: {
        id: history.class.id,
        name: history.class.name,
      },
      academicYear: {
        id: history.academicYear.id,
        name: history.academicYear.name,
      },
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete StudentClassHistory by id: ${id}`);

    const exist = await this.prismaService.studentClassHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `StudentClassHistory with id ${id} not found`,
      );
    }

    await this.prismaService.studentClassHistory.delete({ where: { id } });
    return { message: `StudentClassHistory ${id} deleted successfully` };
  }
}
