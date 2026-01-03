/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceBulkResponse,
  CreateAttendanceDetailDto,
  GenerateBulkAttendanceDto,
  UpdateAttendanceDetailDto,
} from 'src/model/attendance.model';
import { WebResponse } from 'src/model/web.model';
import { AttendanceStatus, Semester } from 'generated/prisma';

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

  @Post('details/:attendanceId')
  async createAttendanceDetail(
    @Param('attendanceId') attendanceId: string,
    @Body() dto: CreateAttendanceDetailDto,
  ) {
    if (!dto.students || dto.students.length === 0) {
      throw new HttpException('No students provided', HttpStatus.BAD_REQUEST);
    }

    return this.attendanceService.createAttendanceDetailForAttendance(
      attendanceId,
      dto.students,
      dto.defaultStatus ?? AttendanceStatus.PRESENT,
    );
  }

  // =========================
  // 2️⃣ Get AttendanceDetail
  // GET /attendance/:attendanceId/details
  // =========================
  @Get('details/:attendanceId')
  async getAttendanceDetail(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.getAttendanceDetailsByAttendanceId(
      attendanceId,
    );
  }

  // =========================
  // 3️⃣ Bulk Update + Approve AttendanceDetail
  // PATCH /attendance/:attendanceId/details
  // =========================
  @Patch('details/:attendanceId')
  async bulkUpdateAttendanceDetail(
    @Param('attendanceId') attendanceId: string,
    @Body() dto: UpdateAttendanceDetailDto,
  ) {
    if (!dto.updates || dto.updates.length === 0) {
      throw new HttpException('No updates provided', HttpStatus.BAD_REQUEST);
    }

    return this.attendanceService.bulkUpdateAndApproveAttendance(
      attendanceId,
      dto.updates,
      dto.approve ?? true,
    );
  }
}


