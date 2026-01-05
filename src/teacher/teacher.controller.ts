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
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherResponse,
} from 'src/model/teacher.model';
import { WebResponse } from 'src/model/web.model';

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
    const result = await this.teacherService.create20DummyTeacher();
    return {
      data: result,
    };
  }
  @Delete('/dummy')
  @HttpCode(HttpStatus.OK)
  async deleteDummyTeacher() {
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
