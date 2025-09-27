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
        // create pivot relations if provided
        subjectClassTeacher: {
          create: createRequest.subjectClassTeacher?.map((sct) => ({
            classId: sct.classId,
            teacherId: sct.teacherId,
          })),
        },
      },
      include: {
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    });

    return subject as unknown as SubjectResponse;
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
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    const updateRequest: UpdateSubjectRequest = this.validationService.validate(
      SubjectValidation.UPDATE,
      data,
    );

    // update pivot table if provided
    if (updateRequest.subjectClassTeacher) {
      // hapus semua relasi lama
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prismaService.subjectClassTeacher.deleteMany({
        where: { subjectId: id },
      });

      // buat relasi baru
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prismaService.subjectClassTeacher.createMany({
        data: updateRequest.subjectClassTeacher.map((sct) => ({
          subjectId: id,
          classId: sct.classId,
          teacherId: sct.teacherId,
        })),
      });
    }

    const updated = await this.prismaService.subject.update({
      where: { id },
      data: {
        name: updateRequest.name,
        grade: updateRequest.grade,
      },
      include: {
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    });

    return updated as unknown as SubjectResponse;
  }

  // ✅ READ ALL Subjects (unsafe, langsung return)
  async findAll(): Promise<SubjectResponse[]> {
    this.logger.info('Find all subjects');
    return (await this.prismaService.subject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    })) as unknown as SubjectResponse[];
  }

  // ✅ READ BY ID (unsafe, langsung return)
  async findById(id: string): Promise<SubjectResponse> {
    this.logger.info(`Find subject by id: ${id}`);
    const subject = await this.prismaService.subject.findUnique({
      where: { id },
      include: {
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    return subject as unknown as SubjectResponse;
  }

  // ✅ DELETE Subject (unsafe, langsung return message)
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete subject by id: ${id}`);
    const subject = await this.prismaService.subject.findUnique({
      where: { id },
      include: {
        attendances: true,
        timetables: true,
        subjectClassTeacher: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    await this.prismaService.$transaction(
      async (prisma: typeof this.prismaService) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await prisma.subjectClassTeacher.deleteMany({
          where: { subjectId: id },
        });
        await prisma.attendance.deleteMany({ where: { subjectId: id } });
        await prisma.timetable.deleteMany({ where: { subjectId: id } });
        await prisma.subject.delete({ where: { id } });
      },
    );

    return { message: `Subject ${subject.name} deleted successfully` };
  }
}
