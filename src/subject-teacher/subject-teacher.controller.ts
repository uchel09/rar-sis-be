import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { SubjectTeacherService } from './subject-teacher.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateSubjectTeacherRequest,
  UpdateSubjectTeacherRequest,
  SubjectTeacherResponse,
} from 'src/model/subjectTeacher.model';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/subject-teachers')
export class SubjectTeacherController {
  constructor(private readonly subjectTeacherService: SubjectTeacherService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateSubjectTeacherRequest,
  ): Promise<WebResponse<SubjectTeacherResponse>> {
    const result = await this.subjectTeacherService.create(request);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<SubjectTeacherResponse[]>> {
    const result = await this.subjectTeacherService.findAll();
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<SubjectTeacherResponse>> {
    const result = await this.subjectTeacherService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSubjectTeacherRequest,
  ): Promise<WebResponse<SubjectTeacherResponse>> {
    const result = await this.subjectTeacherService.update(id, body);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.subjectTeacherService.delete(id);
    return { data: result };
  }
}
