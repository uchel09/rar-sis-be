// import {
//   HttpException,
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { PrismaService } from 'src/common/prisma.service';
// import { VallidationService } from 'src/common/validation.service';
// import {
//   CreateTimetableRequest,
//   UpdateTimetableRequest,
//   TimetableResponse,
// } from 'src/model/time-table.model';
// import { Logger } from 'winston';
// import { TimetableValidation } from './time-table.validation';

// @Injectable()
// export class TimeTableService {
//   constructor(
//     private validationService: VallidationService,
//     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
//     private prismaService: PrismaService,
//   ) {}

//   // ✅ CREATE
//   async create(request: CreateTimetableRequest): Promise<TimetableResponse> {
//     this.logger.info(`Create Timetable ${JSON.stringify(request)}`);
//     const createRequest: CreateTimetableRequest =
//       this.validationService.validate(TimetableValidation.CREATE, request);

//     const conflict = await this.prismaService.timetable.findFirst({
//       where: {
//         classId: createRequest.classId,
//         dayOfWeek: createRequest.dayOfWeek,
//         startTime: createRequest.startTime,
//         endTime: createRequest.endTime,
//       },
//     });
//     if (conflict) {
//       throw new HttpException('Timetable already exists at this time', 400);
//     }
//     createRequest.isActive = true
//     const timetable = await this.prismaService.timetable.create({
//       data: createRequest,
//       select: {
//         id: true,
//         schoolId: true,
//         classId: true,
//         subjectId: true,
//         teacherId: true,
//         semester: true,
//         dayOfWeek: true,
//         startTime: true,
//         endTime: true,
//         createdAt: true,
//         updatedAt: true,
//         isActive: true,
//         class: { select: { id: true, name: true } },
//         subject: { select: { id: true, name: true } },
//         teacher: {
//           select: {
//             id: true,
//             user: { select: { fullName: true } }, // ✅ ambil dari user
//           },
//         },
//       },
//     });

//     return {
//       id: timetable.id,
//       schoolId: timetable.schoolId,
//       classId: timetable.classId,
//       subjectId: timetable.subjectId,
//       teacherId: timetable.teacherId,
//       semester: timetable.semester,
//       dayOfWeek: timetable.dayOfWeek,
//       startTime: timetable.startTime,
//       endTime: timetable.endTime,
//       createdAt: timetable.createdAt,
//       updatedAt: timetable.updatedAt,
//       class: timetable.class,
//       subject: timetable.subject,
//       isActive: timetable.isActive,
//       teacher: {
//         id: timetable.teacher.id,
//         fullName: timetable.teacher.user.fullName,
//       },
//     };
//   }

//   // ✅ READ ALL
//   async findAll(): Promise<TimetableResponse[]> {
//     this.logger.info('Find all timetables');

//     const timetables = await this.prismaService.timetable.findMany({
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         schoolId: true,
//         classId: true,
//         subjectId: true,
//         teacherId: true,
//         semester: true,
//         dayOfWeek: true,
//         startTime: true,
//         endTime: true,
//         createdAt: true,
//         updatedAt: true,
//         isActive: true,
//         class: { select: { id: true, name: true } },
//         subject: { select: { id: true, name: true } },
//         teacher: {
//           select: {
//             id: true,
//             user: { select: { fullName: true } }, // ✅ ambil dari user
//           },
//         },
//       },
//     });

//     return timetables.map((tt) => ({
//       id: tt.id,
//       schoolId: tt.schoolId,
//       classId: tt.classId,
//       subjectId: tt.subjectId,
//       teacherId: tt.teacherId,
//       semester: tt.semester,
//       dayOfWeek: tt.dayOfWeek,
//       startTime: tt.startTime,
//       endTime: tt.endTime,
//       createdAt: tt.createdAt,
//       updatedAt: tt.updatedAt,
//       isActive: tt.isActive,
//       class: tt.class,
//       subject: tt.subject,
//       teacher: {
//         id: tt.teacher.id,
//         fullName: tt.teacher.user.fullName, // ✅ dari user
//       },
//     }));
//   }

//   // ✅ READ BY ID
//   async findById(id: string): Promise<TimetableResponse> {
//     this.logger.info(`Find timetable by id: ${id}`);

//     const timetable = await this.prismaService.timetable.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         schoolId: true,
//         classId: true,
//         subjectId: true,
//         teacherId: true,
//         semester: true,
//         dayOfWeek: true,
//         startTime: true,
//         endTime: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//         class: { select: { id: true, name: true } },
//         subject: { select: { id: true, name: true } },
//         teacher: {
//           select: {
//             id: true,
//             user: { select: { fullName: true } }, // ✅ ambil dari user
//           },
//         },
//       },
//     });

//     if (!timetable) {
//       throw new NotFoundException(`Timetable with id ${id} not found`);
//     }

//     return {
//       id: timetable.id,
//       schoolId: timetable.schoolId,
//       classId: timetable.classId,
//       subjectId: timetable.subjectId,
//       teacherId: timetable.teacherId,
//       semester: timetable.semester,
//       dayOfWeek: timetable.dayOfWeek,
//       startTime: timetable.startTime,
//       endTime: timetable.endTime,
//       isActive: timetable.isActive,
//       createdAt: timetable.createdAt,
//       updatedAt: timetable.updatedAt,
//       class: timetable.class,
//       subject: timetable.subject,
//       teacher: {
//         id: timetable.teacher.id,
//         fullName: timetable.teacher.user.fullName,
//       },
//     };
//   }

//   // ✅ UPDATE
//   async update(
//     id: string,
//     data: UpdateTimetableRequest,
//   ): Promise<TimetableResponse> {
//     this.logger.info(`Update timetable ${id} with ${JSON.stringify(data)}`);

//     const exist = await this.prismaService.timetable.findUnique({
//       where: { id },
//     });
//     if (!exist) {
//       throw new NotFoundException(`Timetable with id ${id} not found`);
//     }

//     const updateRequest: UpdateTimetableRequest =
//       this.validationService.validate(TimetableValidation.UPDATE, data);

//     const timetable = await this.prismaService.timetable.update({
//       where: { id },
//       data: updateRequest,
//       select: {
//         id: true,
//         schoolId: true,
//         classId: true,
//         subjectId: true,
//         teacherId: true,
//         semester: true,
//         dayOfWeek: true,
//         startTime: true,
//         endTime: true,
//         createdAt: true,
//         updatedAt: true,
//         isActive: true,
//         class: { select: { id: true, name: true } },
//         subject: { select: { id: true, name: true } },
//         teacher: {
//           select: {
//             id: true,
//             user: { select: { fullName: true } }, // ✅ ambil dari user
//           },
//         },
//       },
//     });

//     return {
//       id: timetable.id,
//       schoolId: timetable.schoolId,
//       classId: timetable.classId,
//       subjectId: timetable.subjectId,
//       teacherId: timetable.teacherId,
//       semester: timetable.semester,
//       dayOfWeek: timetable.dayOfWeek,
//       startTime: timetable.startTime,
//       endTime: timetable.endTime,
//       isActive: timetable.isActive,
//       createdAt: timetable.createdAt,
//       updatedAt: timetable.updatedAt,
//       class: timetable.class,
//       subject: timetable.subject,
//       teacher: {
//         id: timetable.teacher.id,
//         fullName: timetable.teacher.user.fullName,
//       },
//     };
//   }

//   // ✅ DELETE
//   async delete(id: string): Promise<{ message: string }> {
//     this.logger.info(`Delete timetable by id: ${id}`);

//     const exist = await this.prismaService.timetable.findUnique({
//       where: { id },
//     });
//     if (!exist) {
//       throw new NotFoundException(`Timetable with id ${id} not found`);
//     }

//     await this.prismaService.timetable.delete({ where: { id } });
//     return { message: `Timetable ${id} deleted successfully` };
//   }
// }
