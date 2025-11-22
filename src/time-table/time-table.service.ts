/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import {
  CreateTimetableRequest,
  UpdateTimetableRequest,
  TimetableResponse,
} from 'src/model/time-table.model';
import { Logger } from 'winston';
import { TimetableValidation } from './time-table.validation';
import { DayOfWeek, Grade } from 'generated/prisma';

@Injectable()
export class TimeTableService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateTimetableRequest): Promise<TimetableResponse> {
    this.logger.info(`Create Timetable ${JSON.stringify(request)}`);

    const createRequest: CreateTimetableRequest =
      this.validationService.validate(TimetableValidation.CREATE, request);

    // 🧩 Cek jadwal bentrok dalam 1 kelas (hari & waktu)
    const conflict = await this.prisma.timetable.findFirst({
      where: {
        classId: createRequest.classId,
        dayOfWeek: createRequest.dayOfWeek,
        AND: [
          {
            startTime: { lt: createRequest.endTime },
            endTime: { gt: createRequest.startTime },
          },
        ],
      },
    });

    if (conflict) {
      throw new HttpException(
        'Sudah ada jadwal pada waktu yang sama untuk kelas ini',
        400,
      );
    }

    createRequest.isActive = true;

    const tt = await this.prisma.timetable.create({
      data: {
        schoolId: createRequest.schoolId,
        classId: createRequest.classId,
        subjectTeacherid: createRequest.subjectTeacherid,
        dayOfWeek: createRequest.dayOfWeek,
        startTime: createRequest.startTime,
        endTime: createRequest.endTime,
        isActive: createRequest.isActive,
      },
      select: {
        id: true,
        classId: true,
        subjectTeacherid: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 💡 Type-safe mapping (tidak ada unsafe assignment)
    const response: TimetableResponse = {
      id: tt.id,
      classId: tt.classId,
      startTime: tt.startTime.toISOString().substring(11, 16),
      endTime: tt.endTime.toISOString().substring(11, 16),
      dayOfWeek: tt.dayOfWeek,
      isActive: tt.isActive,
      createdAt: tt.createdAt,
      updatedAt: tt.updatedAt,
      class: tt.class
        ? {
            id: (tt.class as { id: string }).id,
            name: (tt.class as { name: string }).name,
            grade: (tt.class as { grade: Grade }).grade,
          }
        : undefined,

      subjectTeacher: tt.subjectTeacher
        ? {
            id: (tt.subjectTeacher as { id: string }).id,
            teacherId: (tt.subjectTeacher.teacher as { id: string }).id,
            teacherFullname: (
              tt.subjectTeacher.teacher.user as { fullName: string }
            ).fullName,
            subjectId: (tt.subjectTeacher.subject as { id: string }).id,
            subjectName: (tt.subjectTeacher.subject as { name: string }).name,
          }
        : undefined,
    };

    return response;
  }

  async generateWeeklyTimetables(schoolId: string): Promise<void> {
    this.logger.info(`Generate weekly timetables for schoolId=${schoolId}`);

    const classes = await this.prisma.class.findMany({
      where: { schoolId },
      select: { id: true },
    });
    console.log(classes);

    if (!classes.length) {
      throw new HttpException('Tidak ada kelas ditemukan', 404);
    }

    // Daftar hari (Senin - Sabtu)
    const days: DayOfWeek[] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    // Jadwal normal (Senin-Kamis & Sabtu)
    const normalSessions = [
      { start: '07:00', end: '08:00' },
      { start: '08:00', end: '09:30' },
      // 09:30 - 10:00 istirahat
      { start: '10:00', end: '11:30' },
      { start: '11:30', end: '12:30' },
      { start: '12:30', end: '13:30' },
    ];

    // Jadwal hari Jumat (sampai 11:30)
    const fridaySessions = [
      { start: '07:00', end: '08:00' },
      { start: '08:00', end: '09:30' },
      // 09:30 - 10:00 istirahat
      { start: '10:00', end: '11:30' },
    ];

    for (const cls of classes) {
      for (const day of days) {
        const sessions = day === 'FRIDAY' ? fridaySessions : normalSessions;

        for (const s of sessions) {
          await this.prisma.timetable.create({
            data: {
              schoolId,
              classId: cls.id,
              dayOfWeek: day,
              subjectTeacherid: null,
              startTime: new Date(`1970-01-01T${s.start}:00Z`),
              endTime: new Date(`1970-01-01T${s.end}:00Z`),
              isActive: true,
            },
          });
        }
      }
    }

    this.logger.info(
      `✅ Timetable generated successfully for ${classes.length} classes (Mon–Sat)`,
    );
  }
  async findAllByClassId(
    schoolId: string,
    classId: string,
  ): Promise<TimetableResponse[]> {
    this.logger.info(
      `Find all timetables for schoolId=${schoolId}, classId=${classId}`,
    );

    const timetables = await this.prisma.timetable.findMany({
      where: { schoolId, classId },
      select: {
        id: true,
        classId: true,
        subjectTeacherid: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 🧩 Urutkan manual berdasarkan hari & waktu mulai
    const dayOrder: Record<string, number> = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7,
    };

    const sorted = timetables.sort((a, b) => {
      const dayDiff = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.getTime() - b.startTime.getTime();
    });

    return sorted.map((tt) => ({
      id: tt.id,
      classId: tt.classId,
      startTime: tt.startTime.toISOString().substring(11, 16), // 👉 ambil hanya jam & menit
      endTime: tt.endTime.toISOString().substring(11, 16),
      dayOfWeek: tt.dayOfWeek,
      isActive: tt.isActive,
      createdAt: tt.createdAt,
      updatedAt: tt.updatedAt,
      class: tt.class
        ? {
            id: tt.class.id,
            name: tt.class.name,
            grade: tt.class.grade,
          }
        : undefined,
      subjectTeacher: tt.subjectTeacher
        ? {
            id: tt.subjectTeacher.id,
            teacherId: tt.subjectTeacher.teacher.id,
            teacherFullname: tt.subjectTeacher.teacher.user.fullName,
            subjectId: tt.subjectTeacher.subject.id,
            subjectName: tt.subjectTeacher.subject.name,
          }
        : undefined,
    }));
  }

  // ✅ READ ALL
  async findAll(): Promise<TimetableResponse[]> {
    this.logger.info('Find all timetables');

    const timetables = await this.prisma.timetable.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        classId: true,
        subjectTeacherid: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    return timetables.map((tt) => ({
      id: tt.id,
      classId: tt.classId,
      startTime: tt.startTime.toISOString().substring(11, 16),
      endTime: tt.endTime.toISOString().substring(11, 16),
      dayOfWeek: tt.dayOfWeek,
      isActive: tt.isActive,
      createdAt: tt.createdAt,
      updatedAt: tt.updatedAt,
      class: tt.class,
      subjectTeacher: tt.subjectTeacher
        ? {
            id: tt.subjectTeacher.id,
            teacherId: tt.subjectTeacher.teacher.id,
            teacherFullname: tt.subjectTeacher.teacher.user.fullName,
            subjectId: tt.subjectTeacher.subject.id,
            subjectName: tt.subjectTeacher.subject.name,
          }
        : undefined,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<TimetableResponse> {
    this.logger.info(`Find timetable by id: ${id}`);

    const tt = await this.prisma.timetable.findUnique({
      where: { id },
      select: {
        id: true,
        classId: true,
        subjectTeacherid: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!tt)
      throw new NotFoundException(`Timetable dengan id ${id} tidak ditemukan`);

    return {
      id: tt.id,
      classId: tt.classId,
      startTime: tt.startTime.toISOString().substring(11, 16),
      endTime: tt.endTime.toISOString().substring(11, 16),
      dayOfWeek: tt.dayOfWeek,
      isActive: tt.isActive,
      createdAt: tt.createdAt,
      updatedAt: tt.updatedAt,
      class: tt.class,
      subjectTeacher: tt.subjectTeacher
        ? {
            id: tt.subjectTeacher.id,
            teacherId: tt.subjectTeacher.teacher.id,
            teacherFullname: tt.subjectTeacher.teacher.user.fullName,
            subjectId: tt.subjectTeacher.subject.id,
            subjectName: tt.subjectTeacher.subject.name,
          }
        : undefined,
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateTimetableRequest,
  ): Promise<TimetableResponse> {
    this.logger.info(`Update timetable ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prisma.timetable.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException(`Timetable dengan id ${id} tidak ditemukan`);
    }

    const updateRequest: UpdateTimetableRequest =
      this.validationService.validate(TimetableValidation.UPDATE, data);

    // 🧩 Cek konflik waktu saat update (jika waktu dan hari berubah)
    if (
      updateRequest.startTime &&
      updateRequest.endTime &&
      updateRequest.dayOfWeek
    ) {
      const conflict = await this.prisma.timetable.findFirst({
        where: {
          id: { not: id },
          classId: exist.classId,
          dayOfWeek: updateRequest.dayOfWeek,
          AND: [
            {
              startTime: { lt: updateRequest.endTime },
              endTime: { gt: updateRequest.startTime },
            },
          ],
        },
      });

      if (conflict) {
        throw new HttpException(
          'Jadwal bentrok dengan jadwal lain di kelas ini',
          400,
        );
      }
    }

    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        subjectTeacherid: updateRequest.subjectTeacherid,
        classId: updateRequest.classId,
        dayOfWeek: updateRequest.dayOfWeek,
        startTime: updateRequest.startTime,
        endTime: updateRequest.endTime,
        isActive: updateRequest.isActive,
      },
      select: {
        id: true,
        classId: true,
        subjectTeacherid: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    return {
      id: updated.id,
      classId: updated.classId,
      startTime: updated.startTime.toISOString().substring(11, 16),
      endTime: updated.endTime.toISOString().substring(11, 16),
      dayOfWeek: updated.dayOfWeek,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      class: updated.class,
      subjectTeacher: updated.subjectTeacher
        ? {
            id: updated.subjectTeacher.id,
            teacherId: updated.subjectTeacher.teacher.id,
            teacherFullname: updated.subjectTeacher.teacher.user.fullName,
            subjectId: updated.subjectTeacher.subject.id,
            subjectName: updated.subjectTeacher.subject.name,
          }
        : undefined,
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete timetable by id: ${id}`);

    const exist = await this.prisma.timetable.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException(`Timetable dengan id ${id} tidak ditemukan`);
    }

    await this.prisma.timetable.delete({ where: { id } });
    return { message: `Timetable ${id} berhasil dihapus` };
  }
}
