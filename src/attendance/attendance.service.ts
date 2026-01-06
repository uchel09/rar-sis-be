/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  AttendanceBulkResponse,
  AttendanceDetailItem,
  AttendanceItem,
} from 'src/model/attendance.model';
import { AttendanceStatus, DayOfWeek, Semester } from '@prisma/client';

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

    const timetableIds = timetables.map((tt) => tt.id);

    const existing = await this.prismaService.attendance.findMany({
      where: {
        timetableId: { in: timetableIds },
        semester,
        date: { gte: start, lte: end },
      },
      select: { timetableId: true, date: true },
    });

    const existingKeys = new Set(
      existing.map(
        (item) => `${item.timetableId}|${item.date.toISOString().slice(0, 10)}`,
      ),
    );

    const toCreate = resultToCreate.filter(
      (item) =>
        !existingKeys.has(
          `${item.timetableId}|${item.date.toISOString().slice(0, 10)}`,
        ),
    );

    // ==========================
    // 5. Create bulk attendance
    // ==========================
    let createdCount = 0;
    if (toCreate.length > 0) {
      const created = await this.prismaService.attendance.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      createdCount = created.count;
    }

    return {
      created: createdCount,
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
          teacher: { include: { user: true } },
        },
      });

    const classStudents = await this.prismaService.class.findFirst({
      where: { id: classId },
      include: {
        students: { include: { user: true } },
      },
    });

    const students =
      classStudents?.students.map((s) => ({
        studentId: s.id,
        fullName: s.user.fullName,
      })) ?? [];

    const timetableIds = timetables.map((tt) => tt.id);

    const records = await this.prismaService.attendance.findMany({
      where: {
        timetableId: { in: timetableIds },
        semester,
      },
      include: {
        timetable: true,
        attendanceDetails: true, // <---- ambil detail
      },
      orderBy: {
        date: 'asc',
      },
    });

    const mapped: AttendanceItem[] = records.map((a) => ({
      id: a.id,
      date: a.date,
      semester: a.semester,
      approve: a.approve,

      // =====================
      //   Sesuai interface kamu
      // =====================
      attendancesDetails: a.attendanceDetails.map((d) => ({
        id: d.id,
        attendanceId: d.attendanceId,
        studentId: d.studentId,
        status: d.status,
        note: d.note,
      })),

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
      students,
      attendances: mapped,
    };
  }

  async createAttendanceDetailForAttendance(
    attendanceId: string,
    students: { studentId: string; fullName: string }[],
    defaultStatus: AttendanceStatus = AttendanceStatus.PRESENT,
  ) {
    // 1️⃣ Ambil existing attendance details
    const existing = await this.prismaService.attendanceDetail.findMany({
      where: { attendanceId },
      select: { studentId: true },
    });

    // 2️⃣ Filter siswa yang belum ada detail
    const toCreate = students
      .filter((s) => !existing.some((e) => e.studentId === s.studentId))
      .map((s) => ({
        attendanceId,
        studentId: s.studentId,
        status: defaultStatus,
        note: null,
      }));

    if (toCreate.length === 0) {
      throw new HttpException(
        `Attendance details for attendance ${attendanceId} already exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3️⃣ Create
    const created = await this.prismaService.attendanceDetail.createMany({
      data: toCreate,
      skipDuplicates: true, // masih aman sebagai safety net
    });

    return {
      created: created.count,
      message: `Attendance details created for attendance ${attendanceId}`,
    };
  }

  // =========================
  // 2️⃣ Get AttendanceDetail by attendanceId
  // =========================
  async getAttendanceDetailsByAttendanceId(
    attendanceId: string,
  ): Promise<AttendanceDetailItem[]> {
    const details = await this.prismaService.attendanceDetail.findMany({
      where: { attendanceId },
      include: {
        student: {
          select: {
            id: true,
            user: { select: { fullName: true } },
          },
        },
      },
    });

    if (!details || details.length === 0) {
      throw new HttpException(
        `No attendance details found for attendance ${attendanceId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return details.map((d) => ({
      id: d.id,
      studentId: d.studentId,
      studentName: d.student.user.fullName,
      status: d.status,
      note: d.note,
    }));
  }

  // =========================
  // 3️⃣ Bulk Update AttendanceDetail + Approve Attendance
  // =========================
  async bulkUpdateAndApproveAttendance(
    attendanceId: string,
    updates: { studentId: string; status?: AttendanceStatus; note?: string }[],
    approve: boolean = true, // default langsung approve
  ) {
    if (!updates || updates.length === 0) {
      throw new HttpException('No updates provided', HttpStatus.BAD_REQUEST);
    }

    // Bulk update AttendanceDetail
    const updatePromises = updates.map((u) =>
      this.prismaService.attendanceDetail.updateMany({
        where: { attendanceId, studentId: u.studentId },
        data: { status: u.status, note: u.note },
      }),
    );

    const results = await Promise.all(updatePromises);
    const totalUpdated = results.reduce((acc, r) => acc + r.count, 0);

    if (totalUpdated === 0) {
      throw new HttpException(
        `No attendance details updated for attendance ${attendanceId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update Attendance.approve
    const attendanceUpdated = await this.prismaService.attendance.update({
      where: { id: attendanceId },
      data: { approve },
    });

    return {
      totalUpdated,
      attendanceApproved: attendanceUpdated.approve,
      message: `Updated ${totalUpdated} attendance details and set approve=${approve} for attendance ${attendanceId}`,
    };
  }
}
