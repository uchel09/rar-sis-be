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

@Controller('/api/teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateTeacherRequest,
  ): Promise<TeacherResponse> {
    return await this.teacherService.create(request);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<TeacherResponse[]> {
    return await this.teacherService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<TeacherResponse> {
    return await this.teacherService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTeacherRequest,
  ): Promise<TeacherResponse> {
    return await this.teacherService.update(id, data);
  }

  // ✅ DELETE
  @HttpCode(HttpStatus.OK) // = 200
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return  await this.teacherService.delete(id);
  }
}
