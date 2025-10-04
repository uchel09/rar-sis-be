import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { StudentService } from './student.service';
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentResponse,
} from 'src/model/student.model';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateStudentRequest,
  ): Promise<WebResponse<StudentResponse>> {
    if (request.classId === '') {
      request.classId = undefined;
    }
    const result = await this.studentService.create(request);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<StudentResponse>> {
    const result = await this.studentService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStudentRequest,
  ): Promise<WebResponse<StudentResponse>> {
    if (data.classId === '') {
      data.classId = undefined;
    }
    const result = await this.studentService.update(id, data);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.studentService.delete(id);
  }
}
