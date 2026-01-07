/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceBulkResponse,
  CreateAttendanceDetailDto,
  GenerateBulkAttendanceDto,
  UpdateAttendanceDetailDto,
} from 'src/model/attendance.model';
import { AttendanceStatus, Role, Semester } from '@prisma/client';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
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
    @Query('classId') classId?: string,
    @Query('subjectTeacherId') subjectTeacherId?: string,
    @Query('semester') semester?: Semester,
    @Body() body?: GenerateBulkAttendanceDto,
  ) {
    const payload = {
      classId: classId ?? body?.classId,
      subjectTeacherId: subjectTeacherId ?? body?.subjectTeacherId,
      semester: semester ?? body?.semester,
    };

    if (!payload.classId || !payload.subjectTeacherId || !payload.semester) {
      throw new HttpException(
        'Missing bulk attendance parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.attendanceService.deleteBulkAttendanceForClassSubjectTeacher(
      payload.classId,
      payload.subjectTeacherId,
      payload.semester,
    );
  }
  @Get('bulk')
  async getBulkAttendanceForClassSubjectTeacher(
    @Query('classId') classId: string,
    @Query('subjectTeacherId') subjectTeacherId: string,
    @Query('semester') semester: Semester,
  ): Promise<AttendanceBulkResponse> {
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
