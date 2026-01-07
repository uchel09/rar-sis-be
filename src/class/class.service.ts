import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { ClassValidation } from './class.validation';
import {
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
} from 'src/model/class.model';
import { Grade } from '@prisma/client';

@Injectable()
export class ClassService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateClassRequest): Promise<ClassResponse> {
    this.logger.info(`Create Class ${JSON.stringify(request)}`);

    const createRequest: CreateClassRequest = this.validationService.validate(
      ClassValidation.CREATE,
      request,
    );

    // cek class exist
    const exist = await this.prismaService.class.count({
      where: {
        schoolId: createRequest.schoolId,
        name: createRequest.name,
        academicYearId: createRequest.academicYearId,
      },
    });

    if (exist > 0) {
      throw new HttpException(
        `Class ${createRequest.name} for year ${createRequest.academicYearId} already exists`,
        400,
      );
    }

    if (createRequest.homeroomTeacherId) {
      const teacher = await this.prismaService.teacher.findUnique({
        where: { id: createRequest.homeroomTeacherId },
        select: { id: true, schoolId: true },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with id ${createRequest.homeroomTeacherId} not found`,
        );
      }
      if (teacher.schoolId !== createRequest.schoolId) {
        throw new HttpException(
          'Homeroom teacher must belong to the same school',
          400,
        );
      }
    }

    // create class
    const cls = await this.prismaService.class.create({
      data: {
        schoolId: createRequest.schoolId,
        homeroomTeacherId: createRequest.homeroomTeacherId,
        name: createRequest.name,
        academicYearId: createRequest.academicYearId,
        grade: createRequest.grade,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      homeroomTeacher: cls.homeroomTeacher
        ? {
            id: cls.homeroomTeacher.id,
            fullname: cls.homeroomTeacher.user.fullName,
          }
        : undefined,
      name: cls.name,
      academicYear: {
        id: cls.academicYear.id,
        name: cls.academicYear.name,
      },
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<ClassResponse[]> {
    this.logger.info('Find all classes');

    const classes = await this.prismaService.class.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return classes.map((cls) => ({
      id: cls.id,
      schoolId: cls.schoolId,
      name: cls.name,
      grade: cls.grade,
      academicYear: {
        id: cls.academicYear.id,
        name: cls.academicYear.name,
      },
      homeroomTeacher: cls.homeroomTeacher
        ? {
            id: cls.homeroomTeacher.id,
            fullname: cls.homeroomTeacher.user.fullName,
          }
        : undefined,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    }));
  }
  async findAllByGrade(grade: Grade): Promise<ClassResponse[]> {
    this.logger.info('Find all classes by Grade');

    const classes = await this.prismaService.class.findMany({
      orderBy: { name: "asc" },
      where: { grade },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return classes.map((cls) => ({
      id: cls.id,
      schoolId: cls.schoolId,
      name: cls.name,
      grade: cls.grade,
      academicYear: {
        id: cls.academicYear.id,
        name: cls.academicYear.name,
      },
      homeroomTeacher: cls.homeroomTeacher
        ? {
            id: cls.homeroomTeacher.id,
            fullname: cls.homeroomTeacher.user.fullName,
          }
        : undefined,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<ClassResponse> {
    this.logger.info(`Find class by id: ${id}`);

    const cls = await this.prismaService.class.findUnique({
      where: { id },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!cls) throw new NotFoundException(`Class with id ${id} not found`);

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      homeroomTeacher: cls.homeroomTeacher
        ? {
            id: cls.homeroomTeacher.id,
            fullname: cls.homeroomTeacher.user.fullName,
          }
        : undefined,
      name: cls.name,
      academicYear: {
        id: cls.academicYear.id,
        name: cls.academicYear.name,
      },
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(id: string, data: UpdateClassRequest): Promise<ClassResponse> {
    this.logger.info(`Update class ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.class.findUnique({
      where: { id },
    });

    if (!exist) throw new NotFoundException(`Class with id ${id} not found`);

    const updateRequest: UpdateClassRequest = this.validationService.validate(
      ClassValidation.UPDATE,
      data,
    );

    const effectiveSchoolId = updateRequest.schoolId ?? exist.schoolId;
    const effectiveHomeroomTeacherId =
      updateRequest.homeroomTeacherId ?? exist.homeroomTeacherId;

    if (effectiveHomeroomTeacherId) {
      const teacher = await this.prismaService.teacher.findUnique({
        where: { id: effectiveHomeroomTeacherId },
        select: { id: true, schoolId: true },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with id ${effectiveHomeroomTeacherId} not found`,
        );
      }
      if (teacher.schoolId !== effectiveSchoolId) {
        throw new HttpException(
          'Homeroom teacher must belong to the same school',
          400,
        );
      }
    }

    const cls = await this.prismaService.class.update({
      where: { id },
      data: {
        schoolId: updateRequest.schoolId,
        homeroomTeacherId: updateRequest.homeroomTeacherId,
        name: updateRequest.name,
        academicYearId: updateRequest.academicYearId,
        grade: updateRequest.grade,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      homeroomTeacher: cls.homeroomTeacher
        ? {
            id: cls.homeroomTeacher.id,
            fullname: cls.homeroomTeacher.user.fullName,
          }
        : undefined,
      name: cls.name,
      academicYear: {
        id: cls.academicYear.id,
        name: cls.academicYear.name,
      },
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete class by id: ${id}`);

    const exist = await this.prismaService.class.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException(`Class with id ${id} not found`);

    await this.prismaService.class.delete({ where: { id } });
    return { message: `Class ${id} deleted successfully` };
  }
}
