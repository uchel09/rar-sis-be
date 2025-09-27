import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectResponse,
} from 'src/model/subject.model';

@Controller('/api/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateSubjectRequest,
  ): Promise<WebResponse<SubjectResponse>> {
    const result = await this.subjectService.create(request);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<SubjectResponse[]>> {
    const result = await this.subjectService.findAll();
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<SubjectResponse>> {
    const result = await this.subjectService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSubjectRequest,
  ): Promise<WebResponse<SubjectResponse>> {
    const result = await this.subjectService.update(id, body);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.subjectService.delete(id);
    return { data: result };
  }
}
