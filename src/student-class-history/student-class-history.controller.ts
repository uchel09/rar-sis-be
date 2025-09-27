import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { StudentClassHistoryService } from './student-class-history.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateStudentClassHistoryRequest,
  UpdateStudentClassHistoryRequest,
  StudentClassHistoryResponse,
} from 'src/model/student-class-history.model';

@Controller('/api/student-class-histories')
export class StudentClassHistoryController {
  constructor(
    private readonly studentClassHistoryService: StudentClassHistoryService,
  ) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateStudentClassHistoryRequest,
  ): Promise<WebResponse<StudentClassHistoryResponse>> {
    const result = await this.studentClassHistoryService.create(request);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<StudentClassHistoryResponse[]>> {
    const result = await this.studentClassHistoryService.findAll();
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<StudentClassHistoryResponse>> {
    const result = await this.studentClassHistoryService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateStudentClassHistoryRequest,
  ): Promise<WebResponse<StudentClassHistoryResponse>> {
    const result = await this.studentClassHistoryService.update(id, request);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.studentClassHistoryService.delete(id);
    return { data: result };
  }
}
