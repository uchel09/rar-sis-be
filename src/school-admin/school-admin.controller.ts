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
import { WebResponse } from 'src/model/web.model';

@Controller('/api/school-admins')
export class SchoolAdminController {
  constructor(private readonly schoolAdminService: SchoolAdminService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateSchoolAdminRequest,
  ): Promise<WebResponse<SchoolAdminResponse>> {
    const result = await this.schoolAdminService.create(request);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<SchoolAdminResponse[]>> {
    const result = await this.schoolAdminService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<SchoolAdminResponse>> {
    const result = await this.schoolAdminService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateSchoolAdminRequest,
  ): Promise<WebResponse<SchoolAdminResponse>> {
    const result = await this.schoolAdminService.update(id, request);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK) // default 204, bisa diubah ke 200 kalau mau return message
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.schoolAdminService.delete(id);
  }
}
