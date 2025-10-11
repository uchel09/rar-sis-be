import {
  HttpException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { AttendanceValidation } from './attendance.validation';
import {
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceResponse,
} from 'src/model/attendance.model';
import { Attendance } from 'generated/prisma';

@Injectable()
export class AttendanceService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateAttendanceRequest): Promise<AttendanceResponse> {
    this.logger.info(`Create Attendance ${JSON.stringify(request)}`);

    const createRequest: CreateAttendanceRequest =
      this.validationService.validate(AttendanceValidation.CREATE, request);

    // Optional: cek apakah sudah ada untuk student-subject-date-timetable
    const exist = await this.prismaService.attendance.count({
      where: {
        studentId: createRequest.studentId,
        subjectId: createRequest.subjectId,
        date: new Date(createRequest.date),
        timetableId: createRequest.timetableId,
      },
    });
    if (exist !== 0) {
      throw new HttpException(
        'Attendance already exists for this student & subject & date',
        400,
      );
    }

    const attendance = await this.prismaService.attendance.create({
      data: {
        studentId: createRequest.studentId,
        subjectId: createRequest.subjectId,
        timetableId: createRequest.timetableId,
        schoolId: createRequest.schoolId,
        teacherId: createRequest.teacherId,
        date: createRequest.date,
        semester: createRequest.semester,
        status: createRequest.status,
        note: createRequest.note || null,
        academicYearId: createRequest.academicYearId
      },
    });

    return {
      id: attendance.id,
      studentId: attendance.studentId,
      subjectId: attendance.subjectId,
      schoolId: attendance.schoolId,
      timetableId: attendance.timetableId,
      teacherId: attendance.teacherId,
      academicYearId: attendance.academicYearId,
      date: attendance.date.toISOString(),
      semester: attendance.semester,
      status: attendance.status,
      note: attendance.note || undefined,
      createdAt: attendance.createdAt.toISOString(),
      updatedAt: attendance.updatedAt.toISOString(),
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<AttendanceResponse[]> {
    this.logger.info('Find all attendances');

    const attendances = await this.prismaService.attendance.findMany({
      orderBy: { date: 'desc' },
    });

    return attendances.map((att) => ({
      id: att.id,
      studentId: att.studentId,
      subjectId: att.subjectId,
      schoolId: att.schoolId,
      timetableId: att.timetableId,
      teacherId: att.teacherId,
      date: att.date.toISOString(),
      semester: att.semester,
      status: att.status,
      note: att.note || undefined,
      createdAt: att.createdAt.toISOString(),
      updatedAt: att.updatedAt.toISOString(),
      academicYearId: att.academicYearId,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<AttendanceResponse> {
    this.logger.info(`Find attendance by id: ${id}`);

    const att = await this.prismaService.attendance.findUnique({
      where: { id },
    });
    if (!att) throw new NotFoundException(`Attendance with id ${id} not found`);

    return {
      id: att.id,
      studentId: att.studentId,
      subjectId: att.subjectId,
      schoolId: att.schoolId,
      timetableId: att.timetableId,
      teacherId: att.teacherId,
      date: att.date.toISOString(),
      semester: att.semester,
      status: att.status,
      note: att.note || undefined,
      academicYearId: att.academicYearId,
      createdAt: att.createdAt.toISOString(),
      updatedAt: att.updatedAt.toISOString(),
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateAttendanceRequest,
  ): Promise<AttendanceResponse> {
    this.logger.info(`Update attendance ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.attendance.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Attendance with id ${id} not found`);

    const updateRequest: UpdateAttendanceRequest =
      this.validationService.validate(AttendanceValidation.UPDATE, data);

    const updated = await this.prismaService.attendance.update({
      where: { id },
      data: updateRequest,
    });

    return {
      id: updated.id,
      studentId: updated.studentId,
      subjectId: updated.subjectId,
      schoolId: updated.schoolId,
      timetableId: updated.timetableId,
      teacherId: updated.teacherId,
      date: updated.date.toISOString(),
      semester: updated.semester,
      status: updated.status,
      note: updated.note || undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      academicYearId: updated.academicYearId
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete attendance by id: ${id}`);

    const exist = await this.prismaService.attendance.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Attendance with id ${id} not found`);

    await this.prismaService.attendance.delete({ where: { id } });
    return { message: `Attendance ${id} deleted successfully` };
  }

  async getAttendanceByTimetable(
    timetableId: string,
    date: Date,
  ): Promise<Attendance[]> {
    const attendances = await this.prismaService.attendance.findMany({
      where: {
        timetableId,
        date: date, // pastikan field di modelmu sesuai
      },
      include: {
        student: true,
        teacher: true,
        subject: true,
      },
      orderBy: { studentId: 'asc' },
    });

    return attendances;
  }
}
