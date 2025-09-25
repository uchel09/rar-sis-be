import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolResponse,
} from 'src/model/school.model';

@Controller('/api/schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateSchoolRequest,
  ): Promise<WebResponse<SchoolResponse>> {
    const result = await this.schoolService.create(request);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<SchoolResponse[]>> {
    const result = await this.schoolService.findAll();
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<SchoolResponse>> {
    const result = await this.schoolService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSchoolRequest,
  ): Promise<WebResponse<SchoolResponse>> {
    const result = await this.schoolService.update(id, body);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.schoolService.delete(id);
    return { data: result };
  }
}
