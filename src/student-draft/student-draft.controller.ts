import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { StudentDraftService } from './student-draft.service';
import {
  CreateStudentDraftRequest,
  UpdateStudentDraftRequest,
  StudentDraftResponse,
} from 'src/model/student-draft.model';

@Controller('/api/student-drafts')
export class StudentDraftController {
  constructor(private readonly studentDraftService: StudentDraftService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateStudentDraftRequest,
  ): Promise<StudentDraftResponse> {
    return this.studentDraftService.create(request);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<StudentDraftResponse[]> {
    return this.studentDraftService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<StudentDraftResponse> {
    return this.studentDraftService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateStudentDraftRequest,
  ): Promise<StudentDraftResponse> {
    return this.studentDraftService.update(id, request);
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.studentDraftService.delete(id);
  }
}
