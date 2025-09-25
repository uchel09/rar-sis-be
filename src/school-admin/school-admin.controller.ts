import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SchoolAdminService } from './school-admin.service';
import {
  CreateSchoolAdminRequest,
  UpdateSchoolAdminRequest,
  SchoolAdminResponse,
} from 'src/model/school-admin.model';

@Controller('/api/school-admins')
export class SchoolAdminController {
  constructor(private readonly schoolAdminService: SchoolAdminService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateSchoolAdminRequest,
  ): Promise<SchoolAdminResponse> {
    return await this.schoolAdminService.create(request);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<SchoolAdminResponse[]> {
    return await this.schoolAdminService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<SchoolAdminResponse> {
    return await this.schoolAdminService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateSchoolAdminRequest,
  ): Promise<SchoolAdminResponse> {
    return await this.schoolAdminService.update(id, request);
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK) // default 204, bisa diubah ke 200 kalau mau return message
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.schoolAdminService.delete(id);
  }
}
