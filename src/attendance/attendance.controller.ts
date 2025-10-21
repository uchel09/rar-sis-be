// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Put,
//   HttpCode,
// } from '@nestjs/common';
// import { AttendanceService } from './attendance.service';
// import {
//   CreateAttendanceRequest,
//   UpdateAttendanceRequest,
//   AttendanceResponse,
// } from 'src/model/attendance.model';
// import { WebResponse } from 'src/model/web.model';

// @Controller('/api/attendances')
// export class AttendanceController {
//   constructor(private readonly attendanceService: AttendanceService) {}

//   // ✅ CREATE
//   @Post()
//   async create(
//     @Body() request: CreateAttendanceRequest,
//   ): Promise<WebResponse<AttendanceResponse>> {
//     const result = await this.attendanceService.create(request);
//     return { data: result };
//   }

//   // ✅ READ ALL
//   @Get()
//   async findAll(): Promise<WebResponse<AttendanceResponse[]>> {
//     const result = await this.attendanceService.findAll();
//     return { data: result };
//   }

//   // ✅ READ BY ID
//   @Get(':id')
//   async findById(
//     @Param('id') id: string,
//   ): Promise<WebResponse<AttendanceResponse>> {
//     const result = await this.attendanceService.findById(id);
//     return { data: result };
//   }

//   // ✅ UPDATE
//   @Put(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() data: UpdateAttendanceRequest,
//   ): Promise<WebResponse<AttendanceResponse>> {
//     const result = await this.attendanceService.update(id, data);
//     return { data: result };
//   }

//   // ✅ DELETE
//   @Delete(':id')
//   @HttpCode(200)
//   async delete(@Param('id') id: string): Promise<{ message: string }> {
//     return this.attendanceService.delete(id);
//   }
// }
