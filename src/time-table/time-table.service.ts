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
  InsertSubjectTeacherRequest,
} from 'src/model/time-table.model';
import { Logger } from 'winston';
import { TimetableValidation } from './time-table.validation';
import { DayOfWeek, Grade } from '@prisma/client';

@Injectable()
export class TimeTableService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prisma: PrismaService,
  ) {}

  private mergeTime(base: Date, time?: string): Date {
    if (!time) return base;
    const [hour, minute] = time.split(':').map(Number);
    const result = new Date(base);
    result.setUTCHours(hour, minute, 0, 0);
    return result;
  }

  private buildTime(time: string): Date {
    return new Date(`1970-01-01T${time}:00Z`);
  }

  // ✅ CREATE
  async create(request: CreateTimetableRequest): Promise<TimetableResponse> {
    this.logger.info(`Create Timetable ${JSON.stringify(request)}`);

    const createRequest: CreateTimetableRequest =
      this.validationService.validate(TimetableValidation.CREATE, request);

    const cls = await this.prisma.class.findUnique({
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

    if (createRequest.subjectTeacherid) {
      const subjectTeacher = await this.prisma.subjectTeacher.findUnique({
        where: { id: createRequest.subjectTeacherid },
        select: {
          id: true,
          subject: { select: { schoolId: true } },
          teacher: { select: { schoolId: true } },
        },
      });
      if (!subjectTeacher) {
        throw new NotFoundException(
          `SubjectTeacher with id ${createRequest.subjectTeacherid} not found`,
        );
      }
      if (
        subjectTeacher.subject.schoolId !== createRequest.schoolId ||
        subjectTeacher.teacher.schoolId !== createRequest.schoolId
      ) {
        throw new HttpException(
          'SubjectTeacher must belong to the same school',
          400,
        );
      }
    }

    const startTime = this.buildTime(createRequest.startTime);
    const endTime = this.buildTime(createRequest.endTime);

    // 🧩 Cek jadwal bentrok dalam 1 kelas (hari & waktu)
    const conflict = await this.prisma.timetable.findFirst({
      where: {
        classId: createRequest.classId,
        dayOfWeek: createRequest.dayOfWeek,
        AND: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
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

    const tt = await this.prisma.timetable.create({
      data: {
        schoolId: createRequest.schoolId,
        classId: createRequest.classId,
        subjectTeacherid: createRequest.subjectTeacherid,
        dayOfWeek: createRequest.dayOfWeek,
        startTime,
        endTime,
        isActive: createRequest.isActive ?? true,
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

    const existingTimetables = await this.prisma.timetable.findMany({
      where: {
        schoolId,
        classId: { in: classes.map((cls) => cls.id) },
      },
      select: {
        classId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
    });

    const existingKeys = new Set(
      existingTimetables.map(
        (tt) =>
          `${tt.classId}|${tt.dayOfWeek}|${tt.startTime.toISOString()}|${tt.endTime.toISOString()}`,
      ),
    );

    const toCreate: {
      schoolId: string;
      classId: string;
      dayOfWeek: DayOfWeek;
      subjectTeacherid: string | null;
      startTime: Date;
      endTime: Date;
      isActive: boolean;
    }[] = [];

    for (const cls of classes) {
      for (const day of days) {
        const sessions = day === 'FRIDAY' ? fridaySessions : normalSessions;

        for (const s of sessions) {
          const startTime = new Date(`1970-01-01T${s.start}:00Z`);
          const endTime = new Date(`1970-01-01T${s.end}:00Z`);
          const key = `${cls.id}|${day}|${startTime.toISOString()}|${endTime.toISOString()}`;

          if (existingKeys.has(key)) {
            continue;
          }

          existingKeys.add(key);
          toCreate.push({
            schoolId,
            classId: cls.id,
            dayOfWeek: day,
            subjectTeacherid: null,
            startTime,
            endTime,
            isActive: true,
          });
        }
      }
    }

    if (toCreate.length > 0) {
      const created = await this.prisma.timetable.createMany({
        data: toCreate,
      });

      this.logger.info(
        `Timetable generation completed: created ${created.count} entries`,
      );
    }
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
  async findAllByTeacherId(
    schoolId: string,
    teacherId: string,
  ): Promise<TimetableResponse[]> {
    this.logger.info(
      `Find all timetables for schoolId=${schoolId}, teacherId=${teacherId}`,
    );
    const timetables = await this.prisma.timetable.findMany({
      where: { schoolId, subjectTeacher: { teacherId } },
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

  //untuk login tiap dashboard teacher

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

    if (updateRequest.classId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: updateRequest.classId },
        select: { id: true, schoolId: true },
      });
      if (!cls) {
        throw new NotFoundException(
          `Class with id ${updateRequest.classId} not found`,
        );
      }
      if (cls.schoolId !== exist.schoolId) {
        throw new HttpException('Class must belong to the same school', 400);
      }
    }

    if (updateRequest.subjectTeacherid) {
      const subjectTeacher = await this.prisma.subjectTeacher.findUnique({
        where: { id: updateRequest.subjectTeacherid },
        select: {
          id: true,
          subject: { select: { schoolId: true } },
          teacher: { select: { schoolId: true } },
        },
      });
      if (!subjectTeacher) {
        throw new NotFoundException(
          `SubjectTeacher with id ${updateRequest.subjectTeacherid} not found`,
        );
      }
      if (
        subjectTeacher.subject.schoolId !== exist.schoolId ||
        subjectTeacher.teacher.schoolId !== exist.schoolId
      ) {
        throw new HttpException(
          'SubjectTeacher must belong to the same school',
          400,
        );
      }
    }

    // 🧩 Cek konflik waktu saat update (jika waktu dan hari berubah)
    if (
      updateRequest.dayOfWeek ||
      updateRequest.startTime ||
      updateRequest.endTime ||
      updateRequest.classId
    ) {
      const effectiveDay = updateRequest.dayOfWeek ?? exist.dayOfWeek;
      const effectiveClassId = updateRequest.classId ?? exist.classId;
      const effectiveStartTime = this.mergeTime(
        exist.startTime,
        updateRequest.startTime,
      );
      const effectiveEndTime = this.mergeTime(
        exist.endTime,
        updateRequest.endTime,
      );

      const conflict = await this.prisma.timetable.findFirst({
        where: {
          id: { not: id },
          classId: effectiveClassId,
          dayOfWeek: effectiveDay,
          AND: [
            {
              startTime: { lt: effectiveEndTime },
              endTime: { gt: effectiveStartTime },
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
        startTime: updateRequest.startTime
          ? this.mergeTime(exist.startTime, updateRequest.startTime)
          : undefined,
        endTime: updateRequest.endTime
          ? this.mergeTime(exist.endTime, updateRequest.endTime)
          : undefined,
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
  async UpdateSubjectTeacher(
    id: string,
    data: InsertSubjectTeacherRequest,
  ): Promise<TimetableResponse> {
    this.logger.info(`Update subjectTeacher timetable ${id}`);

    // ==========================
    // CEK EXISTING TIMETABLE
    // ==========================
    const exist = await this.prisma.timetable.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException(`Timetable dengan id ${id} tidak ditemukan`);
    }

    const insertSubjectTeacherRequest: InsertSubjectTeacherRequest =
      this.validationService.validate(TimetableValidation.INSERT, data);

    if (!insertSubjectTeacherRequest.subjectTeacherid) {
      throw new HttpException('subjectTeacherid wajib diisi', 400);
    }

    // =====================================================
    // Ambil subjectTeacher baru -> untuk dapatkan teacher.id
    // =====================================================
    const subjectTeacher = await this.prisma.subjectTeacher.findUnique({
      where: { id: insertSubjectTeacherRequest.subjectTeacherid },
      select: {
        id: true,
        subject: { select: { schoolId: true } },
        teacher: {
          select: {
            id: true,
            schoolId: true,
            user: { select: { fullName: true } }, // utk pesan error (opsional)
          },
        },
      },
    });

    if (!subjectTeacher) {
      throw new NotFoundException(
        `SubjectTeacher dengan id ${insertSubjectTeacherRequest.subjectTeacherid} tidak ditemukan`,
      );
    }

    if (
      subjectTeacher.teacher.schoolId !== exist.schoolId ||
      subjectTeacher.subject.schoolId !== exist.schoolId
    ) {
      throw new HttpException(
        'SubjectTeacher must belong to the same school',
        400,
      );
    }

    const teacherId = subjectTeacher.teacher.id;
    const teacherName = subjectTeacher.teacher.user?.fullName ?? 'Guru terkait';

    // =====================================================
    // ❗ CEK BENTROK WAKTU UNTUK GURU YANG SAMA
    //    Bentrok jika:
    //    - hari sama
    //    - waktu overlap (start < otherEnd && end > otherStart)
    //    - dan jadwal itu milik guru yang sama (bukan berdasarkan subjectTeacherid)
    // =====================================================

    const conflict = await this.prisma.timetable.findFirst({
      where: {
        id: { not: id },
        dayOfWeek: exist.dayOfWeek,
        // filter relasi: cari timetable yang subjectTeacher.teacher.id == teacherId
        subjectTeacher: {
          is: {
            teacher: { is: { id: teacherId } },
          },
        },
        AND: [
          { startTime: { lt: exist.endTime } }, // jadwal lain mulai sebelum jadwal ini berakhir
          { endTime: { gt: exist.startTime } }, // jadwal lain berakhir setelah jadwal ini mulai
        ],
      },
      select: {
        id: true,
        class: { select: { id: true, name: true } },
        startTime: true,
        endTime: true,
        subjectTeacher: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (conflict) {
      throw new HttpException(
        `Guru ${teacherName} bentrok: sudah mengajar di kelas ${conflict.class.name} dari ${conflict.startTime
          .toISOString()
          .substring(11, 16)} sampai ${conflict.endTime
          .toISOString()
          .substring(11, 16)}`,
        400,
      );
    }

    // ==========================
    // UPDATE subjectTeacher SAJA
    // ==========================
    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        subjectTeacherid: insertSubjectTeacherRequest.subjectTeacherid,
        isActive: insertSubjectTeacherRequest.isActive,
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
          select: { id: true, name: true, grade: true },
        },
        subjectTeacher: {
          select: {
            id: true,
            teacher: {
              select: { id: true, user: { select: { fullName: true } } },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    // RETURN
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
