import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
} from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import {
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
} from 'src/model/academic-year.model';
import { AcademicYear } from '@prisma/client';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/academic-years')
export class AcademicYearController {
  constructor(private readonly classService: AcademicYearService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateAcademicYearRequest,
  ): Promise<WebResponse<AcademicYear>> {
    const result = await this.classService.create(request);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<AcademicYear[]>> {
    const result = await this.classService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ACTIVE
  @Get('/active')
  async findByIsActive(): Promise<WebResponse<AcademicYear>> {
    const result = await this.classService.findByIsActive();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<WebResponse<AcademicYear>> {
    const result = await this.classService.findById(id);
    return {
      data: result,
    };
  }
  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAcademicYearRequest,
  ): Promise<WebResponse<AcademicYear>> {
    const result = await this.classService.update(id, data);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.classService.delete(id);
  }
}
