import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TimeTableService } from './time-table.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateTimetableRequest,
  UpdateTimetableRequest,
  TimetableResponse,
  InsertSubjectTeacherRequest,
} from 'src/model/time-table.model';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/timetables')
export class TimeTableController {
  constructor(private readonly timetableService: TimeTableService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateTimetableRequest,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.create(request);
    return { data: result };
  }
  @Post('/generate-tt')
  async generateWeeklyTimetables(
    @Body() body: { schoolId: string },
  ): Promise<WebResponse<any>> {
    await this.timetableService.generateWeeklyTimetables(body.schoolId);
    return {
      data: 'success generate',
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<TimetableResponse[]>> {
    const result = await this.timetableService.findAll();
    return { data: result };
  }
  @Get('/class')
  @Roles(
    Role.TEACHER,
    Role.STUDENT,
    Role.SCHOOL_ADMIN,
    Role.STAFF,
    Role.SUPERADMIN,
  )
  async findAllByClassId(
    @Query('schoolId') schoolId: string,
    @Query('classId') classId: string,
  ): Promise<WebResponse<TimetableResponse[]>> {
    const result = await this.timetableService.findAllByClassId(
      schoolId,
      classId,
    );
    return { count: result.length, data: result };
  }
  @Get('/teacher')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
  async findAllByTeacherId(
    @Query('teacherId') teacherId: string,
    @Query('schoolId') schoolId: string,
  ): Promise<WebResponse<TimetableResponse[]>> {
    const result = await this.timetableService.findAllByTeacherId(
      schoolId,
      teacherId,
    );

    return { count: result.length, data: result };
  }
  @Put('/subject-teacher/:id')
  async UpdateSubjectTeacher(
    @Param('id') id: string,
    @Body() body: InsertSubjectTeacherRequest,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.UpdateSubjectTeacher(id, body);
    return { data: result };
  }
  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTimetableRequest,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.update(id, body);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.timetableService.delete(id);
    return { data: result };
  }
}
