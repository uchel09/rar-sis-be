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
import { UtilService } from 'src/common/util.service';
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
    const normalizedRequest = UtilService.normalizeOptionalEmptyStrings(
      request,
      ['enrollmentNumber', 'address', 'classId'],
    );
    const result = await this.studentService.create(normalizedRequest);
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
  @Get('/class/:id')
  async findAllStudentByClassId(
    @Param('id') id: string,
  ): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.findAllStudentByClassId(id);
    return {
      data: result,
    };
  }
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
    const normalizedRequest = UtilService.normalizeOptionalEmptyStrings2(data, [
      'enrollmentNumber',
      'address',
      'classId',
    ]);

    const result = await this.studentService.update(id, normalizedRequest);
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
