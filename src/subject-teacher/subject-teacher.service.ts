/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { SubjectTeacherValidation } from './subject-teacher.validation';
import {
  CreateSubjectTeacherRequest,
  UpdateSubjectTeacherRequest,
  SubjectTeacherResponse,
} from 'src/model/subjectTeacher.model';

@Injectable()
export class SubjectTeacherService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  // ✅ CREATE SubjectTeacher (relasi subject + teacher)
  async create(
    request: CreateSubjectTeacherRequest,
  ): Promise<SubjectTeacherResponse> {
    this.logger.info(`Create SubjectTeacher ${JSON.stringify(request)}`);

    const createRequest: CreateSubjectTeacherRequest =
      this.validationService.validate(SubjectTeacherValidation.CREATE, request);

    const subject = await this.prismaService.subject.findUnique({
      where: { id: createRequest.subjectId },
      select: { id: true, schoolId: true },
    });
    if (!subject) {
      throw new NotFoundException(
        `Subject with id ${createRequest.subjectId} not found`,
      );
    }

    const teacher = await this.prismaService.teacher.findUnique({
      where: { id: createRequest.teacherId },
      select: { id: true, schoolId: true },
    });
    if (!teacher) {
      throw new NotFoundException(
        `Teacher with id ${createRequest.teacherId} not found`,
      );
    }

    if (subject.schoolId !== teacher.schoolId) {
      throw new HttpException(
        'Subject and teacher must belong to the same school',
        400,
      );
    }

    const exist = await this.prismaService.subjectTeacher.count({
      where: {
        subjectId: createRequest.subjectId,
        teacherId: createRequest.teacherId,
      },
    });

    if (exist !== 0) {
      throw new HttpException(
        'This teacher is already assigned to the subject',
        400,
      );
    }

    const st = await this.prismaService.subjectTeacher.create({
      data: {
        subjectId: createRequest.subjectId,
        teacherId: createRequest.teacherId,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      id: st.id,
      subject: {
        id: st.subject.id,
        name: st.subject.name,
      },
      teacher: {
        id: st.teacherId,
        user: {
          fullname: st.teacher.user.fullName,
        },
      },
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
    };
  }

  // ✅ UPDATE SubjectTeacher (ubah subject atau teacher)
  async update(
    id: string,
    request: UpdateSubjectTeacherRequest,
  ): Promise<SubjectTeacherResponse> {
    this.logger.info(
      `Update SubjectTeacher ${id} with ${JSON.stringify(request)}`,
    );

    const existing = await this.prismaService.subjectTeacher.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`SubjectTeacher with id ${id} not found`);
    }

    const updateRequest: UpdateSubjectTeacherRequest =
      this.validationService.validate(
        SubjectTeacherValidation.UPDATE,
        request,
      );

    const effectiveSubjectId = updateRequest.subjectId ?? existing.subjectId;
    const effectiveTeacherId = updateRequest.teacherId ?? existing.teacherId;

    const subject = await this.prismaService.subject.findUnique({
      where: { id: effectiveSubjectId },
      select: { id: true, schoolId: true },
    });
    if (!subject) {
      throw new NotFoundException(
        `Subject with id ${effectiveSubjectId} not found`,
      );
    }

    const teacher = await this.prismaService.teacher.findUnique({
      where: { id: effectiveTeacherId },
      select: { id: true, schoolId: true },
    });
    if (!teacher) {
      throw new NotFoundException(
        `Teacher with id ${effectiveTeacherId} not found`,
      );
    }

    if (subject.schoolId !== teacher.schoolId) {
      throw new HttpException(
        'Subject and teacher must belong to the same school',
        400,
      );
    }

    // ✅ Tambahkan pengecekan duplikat kombinasi
    const duplicate = await this.prismaService.subjectTeacher.findFirst({
      where: {
        subjectId: effectiveSubjectId,
        teacherId: effectiveTeacherId,
        NOT: { id }, // jangan hitung dirinya sendiri
      },
    });

    if (duplicate) {
      throw new HttpException(
        'This teacher is already assigned to the subject',
        400,
      );
    }

    const updated = await this.prismaService.subjectTeacher.update({
      where: { id },
      data: {
        subjectId: updateRequest.subjectId,
        teacherId: updateRequest.teacherId,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    return {
      id: updated.id,
      subject: {
        id: updated.subject.id,
        name: updated.subject.name,
      },
      teacher: {
        id: updated.teacher.id,
        user: {
          fullname: updated.teacher.user.fullName,
        },
      },
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  // ✅ FIND ALL
  async findAll(): Promise<SubjectTeacherResponse[]> {
    this.logger.info('Find all SubjectTeacher records');

    const data = await this.prismaService.subjectTeacher.findMany({
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((st) => ({
      id: st.id,
      subject: {
        id: st.subject.id,
        name: st.subject.name,
      },
      teacher: {
        id: st.teacher.id,
        user: { fullname: st.teacher.user.fullName },
      },
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
    }));
  }

  // ✅ FIND BY ID
  async findById(id: string): Promise<SubjectTeacherResponse> {
    this.logger.info(`Find SubjectTeacher by id: ${id}`);

    const st = await this.prismaService.subjectTeacher.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!st) {
      throw new NotFoundException(`SubjectTeacher with id ${id} not found`);
    }

    return {
      id: st.id,
      subject: {
        id: st.subject.id,
        name: st.subject.name,
      },
      teacher: {
        id: st.teacher.id,
        user: { fullname: st.teacher.user.fullName },
      },
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete SubjectTeacher by id: ${id}`);

    const exist = await this.prismaService.subjectTeacher.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException(`SubjectTeacher with id ${id} not found`);
    }

    await this.prismaService.subjectTeacher.delete({ where: { id } });

    return { message: `SubjectTeacher ${id} deleted successfully` };
  }
}
