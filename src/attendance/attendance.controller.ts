/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceBulkResponse,
  GenerateBulkAttendanceDto,
} from 'src/model/attendance.model';
import { WebResponse } from 'src/model/web.model';
import { Semester } from 'generated/prisma';

@Controller('/api/attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ======================================================
  // ✅ CREATE (single)

  // ======================================================
  // ✅ BULK CREATE BY TIMETABLE ID
  // ======================================================
  @Post('bulk/generate')
  async generateBulkAttendance(@Body() body: GenerateBulkAttendanceDto) {
    const { classId, subjectTeacherId, semester } = body;

    return this.attendanceService.createBulkAttendanceForClassSubjectTeacher(
      classId,
      subjectTeacherId,
      semester,
    );
  }

  @Delete('bulk')
  async deleteBulkAttendance(
    @Body()
    body: GenerateBulkAttendanceDto,
  ) {
    const { classId, subjectTeacherId, semester } = body;

    return await this.attendanceService.deleteBulkAttendanceForClassSubjectTeacher(
      classId,
      subjectTeacherId,
      semester,
    );
  }
  @Get('bulk')
  async getBulkAttendanceForClassSubjectTeacher(
    @Query('classId') classId: string,
    @Query('subjectTeacherId') subjectTeacherId: string,
    @Query('semester') semester: Semester,
  ): Promise<WebResponse<AttendanceBulkResponse[]>> {
    return this.attendanceService.getBulkAttendanceForClassSubjectTeacher(
      classId,
      subjectTeacherId,
      semester,
    );
  }
}
