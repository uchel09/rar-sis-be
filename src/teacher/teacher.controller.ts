import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeacherService } from './teacher.service';
import {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherResponse,
} from 'src/model/teacher.model';
import { WebResponse } from 'src/model/web.model';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';

const isDummyEnabled = () =>
  process.env.NODE_ENV !== 'production' ||
  process.env.ALLOW_DUMMY_ENDPOINTS === 'true';

const ensureDummyEnabled = () => {
  if (!isDummyEnabled()) {
    throw new ForbiddenException('Dummy endpoint disabled');
  }
};

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateTeacherRequest,
  ): Promise<WebResponse<TeacherResponse>> {
    const result = await this.teacherService.create(request);
    return {
      data: result,
    };
  }
  @Post('/dummy')
  async create20DummyTeacher(): Promise<WebResponse<any>> {
    ensureDummyEnabled();
    const result = await this.teacherService.create20DummyTeacher();
    return {
      data: result,
    };
  }
  @Delete('/dummy')
  @HttpCode(HttpStatus.OK)
  async deleteDummyTeacher() {
    ensureDummyEnabled();
    return this.teacherService.delete20DummyTeacher();
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<TeacherResponse[]>> {
    const result = await this.teacherService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<TeacherResponse>> {
    const result = await this.teacherService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTeacherRequest,
  ): Promise<WebResponse<TeacherResponse>> {
    const result = await this.teacherService.update(id, data);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @HttpCode(HttpStatus.OK) // = 200
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.teacherService.delete(id);
  }
}
