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

@Controller('/api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateStudentRequest,
  ): Promise<StudentResponse> {
    return this.studentService.create(request);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<StudentResponse[]> {
    return this.studentService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<StudentResponse> {
    return this.studentService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    return this.studentService.update(id, data);
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.studentService.delete(id);
  }
}
