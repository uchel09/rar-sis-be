// import {
//   HttpException,
//   Injectable,
//   NotFoundException,
//   Inject,
// } from '@nestjs/common';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { PrismaService } from 'src/common/prisma.service';
// import { VallidationService } from 'src/common/validation.service';
// import { Logger } from 'winston';
// import { AttendanceValidation } from './attendance.validation';
// import {
//   CreateAttendanceRequest,
//   UpdateAttendanceRequest,
//   AttendanceResponse,
// } from 'src/model/attendance.model';

// @Injectable()
// export class AttendanceService {
//   constructor(
//     private validationService: VallidationService,
//     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
//     private prismaService: PrismaService,
//   ) {}

//   // ✅ BULK CREATE
//   async createBulk(
//     requests: CreateAttendanceRequest[],
//   ): Promise<AttendanceResponse[]> {
//     this.logger.info(`Create bulk attendance ${JSON.stringify(requests)}`);

//     const validatedRequests = requests.map((r) =>
//       this.validationService.validate(AttendanceValidation.CREATE, r),
//     );

//     // Cek duplikat
//     for (const req of validatedRequests) {
//       const exist = await this.prismaService.attendance.count({
//         where: {
//           studentId: req.studentId,
//           timetableId: req.timetableId,
//           date: new Date(req.date),
//         },
//       });
//       if (exist > 0) {
//         throw new HttpException(
//           `Attendance already exists for student ${req.studentId} on timetable ${req.timetableId}`,
//           400,
//         );
//       }
//     }

//     const attendances = await this.prismaService.$transaction(
//       validatedRequests.map((r) =>
//         this.prismaService.attendance.create({
//           data: {
//             studentId: r.studentId,
//             timetableId: r.timetableId,
//             schoolId: r.schoolId,
//             date: r.date,
//             semester: r.semester,
//             status: r.status,
//             note: r.note || null,
//           },
//           include: {
//             timetable: {
//               include: {
//                 academicYear: {
//                   select: { id: true, name: true },
//                 },
//                 subjectClassTeacher: {
//                   include: {
//                     subject: { select: { id: true, name: true } },
//                     class: { select: { id: true, name: true } },
//                     teacher: {
//                       include: {
//                         user: { select: { id: true, fullName: true } },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         }),
//       ),
//     );

//     return attendances.map((att) => ({
//       id: att.id,
//       studentId: att.studentId,
//       timetableId: att.timetableId,
//       schoolId: att.schoolId,
//       date: att.date.toISOString(),
//       semester: att.semester,
//       status: att.status,
//       note: att.note || undefined,
//       approve: att.approve,
//       createdAt: att.createdAt.toISOString(),
//       updatedAt: att.updatedAt.toISOString(),
//       timetable: {
//         id: att.timetable.id,
//         dayOfWeek: att.timetable.dayOfWeek,
//         startTime: att.timetable.startTime,
//         endTime: att.timetable.endTime,
//         academicYear: {
//           id: att.timetable.academicYear.id,
//           name: att.timetable.academicYear.name,
//         },
//         subjectClassTeacher: {
//           id: att.timetable.subjectClassTeacher.id,
//           subject: att.timetable.subjectClassTeacher.subject,
//           class: att.timetable.subjectClassTeacher.class,
//           teacher: {
//             id: att.timetable.subjectClassTeacher.teacher.id,
//             user: att.timetable.subjectClassTeacher.teacher.user,
//           },
//         },
//       },
//     }));
//   }

//   // ✅ BULK UPDATE
//   async updateBulk(
//     updates: { id: string; data: UpdateAttendanceRequest }[],
//   ): Promise<AttendanceResponse[]> {
//     this.logger.info(`Update bulk attendance ${JSON.stringify(updates)}`);

//     const results: AttendanceResponse[] = [];

//     for (const { id, data } of updates) {
//       const exist = await this.prismaService.attendance.findUnique({
//         where: { id },
//       });
//       if (!exist)
//         throw new NotFoundException(`Attendance with id ${id} not found`);

//       const validated = this.validationService.validate(
//         AttendanceValidation.UPDATE,
//         data,
//       );

//       const updated = await this.prismaService.attendance.update({
//         where: { id },
//         data: validated,
//         include: {
//           timetable: {
//             include: {
//               academicYear: { select: { id: true, name: true } },
//               subjectClassTeacher: {
//                 include: {
//                   subject: { select: { id: true, name: true } },
//                   class: { select: { id: true, name: true } },
//                   teacher: {
//                     include: {
//                       user: { select: { id: true, fullName: true } },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });

//       results.push({
//         id: updated.id,
//         studentId: updated.studentId,
//         timetableId: updated.timetableId,
//         schoolId: updated.schoolId,
//         date: updated.date.toISOString(),
//         semester: updated.semester,
//         status: updated.status,
//         note: updated.note || undefined,
//         approve: updated.approve,
//         createdAt: updated.createdAt.toISOString(),
//         updatedAt: updated.updatedAt.toISOString(),
//         timetable: {
//           id: updated.timetable.id,
//           dayOfWeek: updated.timetable.dayOfWeek,
//           startTime: updated.timetable.startTime,
//           endTime: updated.timetable.endTime,
//           academicYear: {
//             id: updated.timetable.academicYear.id,
//             name: updated.timetable.academicYear.name,
//           },
//           subjectClassTeacher: {
//             id: updated.timetable.subjectClassTeacher.id,
//             subject: updated.timetable.subjectClassTeacher.subject,
//             class: updated.timetable.subjectClassTeacher.class,
//             teacher: {
//               id: updated.timetable.subjectClassTeacher.teacher.id,
//               user: updated.timetable.subjectClassTeacher.teacher.user,
//             },
//           },
//         },
//       });
//     }

//     return results;
//   }

//   // ✅ FIND ALL BY TIMETABLE + DATE
//   async findAllByTimetableAndDate(
//     timetableId: string,
//     date: Date,
//   ): Promise<AttendanceResponse[]> {
//     this.logger.info(
//       `Find attendance by timetable ${timetableId} and date ${date}`,
//     );

//     const attendances = await this.prismaService.attendance.findMany({
//       where: {
//         timetableId,
//         date,
//       },
//       include: {
//         timetable: {
//           include: {
//             academicYear: { select: { id: true, name: true } },
//             subjectClassTeacher: {
//               include: {
//                 subject: { select: { id: true, name: true } },
//                 class: { select: { id: true, name: true } },
//                 teacher: {
//                   include: {
//                     user: { select: { id: true, fullName: true } },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       orderBy: { studentId: 'asc' },
//     });

//     return attendances.map((att) => ({
//       id: att.id,
//       studentId: att.studentId,
//       timetableId: att.timetableId,
//       schoolId: att.schoolId,
//       date: att.date.toISOString(),
//       semester: att.semester,
//       status: att.status,
//       note: att.note || undefined,
//       approve: att.approve,
//       createdAt: att.createdAt.toISOString(),
//       updatedAt: att.updatedAt.toISOString(),
//       timetable: {
//         id: att.timetable.id,
//         dayOfWeek: att.timetable.dayOfWeek,
//         startTime: att.timetable.startTime,
//         endTime: att.timetable.endTime,
//         academicYear: {
//           id: att.timetable.academicYear.id,
//           name: att.timetable.academicYear.name,
//         },
//         subjectClassTeacher: {
//           id: att.timetable.subjectClassTeacher.id,
//           subject: att.timetable.subjectClassTeacher.subject,
//           class: att.timetable.subjectClassTeacher.class,
//           teacher: {
//             id: att.timetable.subjectClassTeacher.teacher.id,
//             user: att.timetable.subjectClassTeacher.teacher.user,
//           },
//         },
//       },
//     }));
//   }
// }
