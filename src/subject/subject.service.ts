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
import { SubjectValidation } from './subject.validation';
import {
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectResponse,
} from 'src/model/subject.model';

@Injectable()
export class SubjectService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}
  async create(request: CreateSubjectRequest): Promise<SubjectResponse> {
    this.logger.info(`Create Subject ${JSON.stringify(request)}`);

    const createRequest: CreateSubjectRequest = this.validationService.validate(
      SubjectValidation.CREATE,
      request,
    );

    const exist = await this.prismaService.subject.count({
      where: {
        name: createRequest.name,
        schoolId: createRequest.schoolId,
        grade: createRequest.grade,
      },
    });
    if (exist !== 0) {
      throw new HttpException(
        'Subject already exists in this school & grade',
        400,
      );
    }

    const subject = await this.prismaService.subject.create({
      data: {
        name: createRequest.name,
        grade: createRequest.grade,
        schoolId: createRequest.schoolId,
      },
      include: {
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

    return {
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      subjectTeachers: subject.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
    };
  }

  // ✅ CREATE Subject (safe)
  async update(
    id: string,
    data: UpdateSubjectRequest,
  ): Promise<SubjectResponse> {
    this.logger.info(`Update subject ${id} with ${JSON.stringify(data)}`);

    const subject = await this.prismaService.subject.findUnique({
      where: { id },
      include: {
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

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    const updateRequest: UpdateSubjectRequest = this.validationService.validate(
      SubjectValidation.UPDATE,
      data,
    );
    const updated = await this.prismaService.subject.update({
      where: { id },
      data: {
        name: updateRequest.name,
        grade: updateRequest.grade,
      },
      include: {
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

    return {
      id: updated.id,
      name: updated.name,
      grade: updated.grade,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      subjectTeachers: updated.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
    };
  }

  async findAll(): Promise<SubjectResponse[]> {
    this.logger.info('Find all subjects');

    const subjects = await this.prismaService.subject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subjectTeachers: {
          include: {
            subject: true,
            teacher: { include: { user: true } },
          },
        },
      },
    });

    return subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      subjectTeachers: subject.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
    }));
  }

  async findById(id: string): Promise<SubjectResponse> {
    this.logger.info(`Find subject by id: ${id}`);

    const subject = await this.prismaService.subject.findUnique({
      where: { id },
      include: {
        subjectTeachers: {
          include: {
            subject: true,
            teacher: { include: { user: true } },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    return {
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      subjectTeachers: subject.subjectTeachers.map((s) => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        teacherId: s.teacher.id,
        teacherFullName: s.teacher.user.fullName,
      })),
    };
  }

  // ✅ DELETE Subject
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete subject by id: ${id}`);

    const subject = await this.prismaService.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    await this.prismaService.subject.delete({ where: { id } });
    return { message: `Subject ${id} deleted successfully` };
  }
}
