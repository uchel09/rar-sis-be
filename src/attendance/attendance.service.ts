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
import { AttendanceValidation } from './attendance.validation';
import {
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceResponse,
  AttendanceBulkResponse,
  AttendanceItem,
} from 'src/model/attendance.model';
import { AttendanceStatus, DayOfWeek, Semester } from 'generated/prisma';

@Injectable()
export class AttendanceService {
  constructor(
    private prismaService: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  private dayMap: Record<DayOfWeek, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  async createBulkAttendanceForClassSubjectTeacher(
    classId: string,
    subjectTeacherid: string,
    semester: Semester,
  ) {
    // ==========================
    // 1. Tentukan range semester
    // ==========================
    const year = new Date().getFullYear();

    const semesterRange = {
      SEMESTER_1: {
        start: new Date(`${year}-07-01`),
        end: new Date(`${year}-12-31`),
      },
      SEMESTER_2: {
        start: new Date(`${year}-01-01`),
        end: new Date(`${year}-06-30`),
      },
    };

    const { start, end } = semesterRange[semester];

    // ==========================
    // 2. Ambil semua timetable kelas + guru
    // ==========================
    const timetables = await this.prismaService.timetable.findMany({
      where: {
        classId,
        subjectTeacherid,
      },
    });

    if (timetables.length === 0) {
      throw new Error(
        'Class ini tidak memiliki timetable untuk subjectTeacher tersebut.',
      );
    }

    const resultToCreate: any[] = [];

    // ==========================
    // 3. Loop semua tanggal semester
    // ==========================
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dayName = dt
        .toLocaleString('en-US', { weekday: 'long' })
        .toUpperCase();

      // Ambil semua timetable yg hari nya cocok
      const todaysTT = timetables.filter((tt) => tt.dayOfWeek === dayName);
      if (todaysTT.length === 0) continue;

      // ==========================
      // 4. Tambahkan attendance
      // ==========================
      for (const tt of todaysTT) {
        resultToCreate.push({
          timetableId: tt.id,
          schoolId: tt.schoolId,
          date: new Date(dt),
          semester,
          approve: false,
        });
      }
    }

    // ==========================
    // 5. Create bulk attendance
    // ==========================
    await this.prismaService.attendance.createMany({
      data: resultToCreate,
      skipDuplicates: true,
    });

    return {
      created: resultToCreate.length,
      range: { start, end },
      message: 'Bulk attendance created for class + subjectTeacher',
    };
  }

  async deleteBulkAttendanceForClassSubjectTeacher(
    classId: string,
    subjectTeacherId: string,
    semester: Semester,
  ) {
    // ==========================
    // 1. Ambil semua timetable class + subjectTeacher
    // ==========================
    const timetables = await this.prismaService.timetable.findMany({
      where: {
        classId,
        subjectTeacherid: subjectTeacherId,
      },
      select: { id: true },
    });

    if (timetables.length === 0) {
      throw new Error(
        'Tidak ada timetable untuk class + subjectTeacher tersebut.',
      );
    }

    const timetableIds = timetables.map((t) => t.id);

    // ==========================
    // 2. Hapus semua attendance berdasarkan semester + timetableIds
    // ==========================

    const deleted = await this.prismaService.attendance.deleteMany({
      where: {
        timetableId: { in: timetableIds },
        semester: semester,
      },
    });

    return {
      deleted: deleted.count,
      message: 'Bulk attendance deleted successfully',
      classId,
      subjectTeacherId,
      semester,
    };
  }

  async getBulkAttendanceForClassSubjectTeacher(
    classId: string,
    subjectTeacherId: string,
    semester: Semester,
  ): Promise<AttendanceBulkResponse> {
    const timetables = await this.prismaService.timetable.findMany({
      where: {
        classId,
        subjectTeacherid: subjectTeacherId,
      },
    });

    if (timetables.length === 0) {
      throw new Error(
        'Tidak ditemukan timetable untuk class dan subjectTeacher tersebut.',
      );
    }
    const subjectTeacherDetail =
      await this.prismaService.subjectTeacher.findFirst({
        where: { id: subjectTeacherId },
        include: {
          subject: true,
          teacher: {
            include: { user: true }
          },
        },
      });

    const timetableIds = timetables.map((tt) => tt.id);

    const records = await this.prismaService.attendance.findMany({
      where: {
        timetableId: { in: timetableIds },
        semester,
      },
      include: {
        timetable: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // =============== MAP to DTO ===============
    const mapped: AttendanceItem[] = records.map((a) => ({
      id: a.id,
      date: a.date,
      semester: a.semester,
      approve: a.approve,
      timetable: {
        id: a.timetable.id,
        dayOfWeek: a.timetable.dayOfWeek,
        startTime: a.timetable.startTime,
        endTime: a.timetable.endTime,
        classId: a.timetable.classId,
        subjectTeacherid: a.timetable.subjectTeacherid,
      },
    }));

    return {
      count: mapped.length,
      classId,
      subjectTeacherId,
      teacherName: subjectTeacherDetail?.teacher.user.fullName || '',
      subjectName: subjectTeacherDetail?.subject.name || '',
      semester,
      attendances: mapped,
    };
  }
}
