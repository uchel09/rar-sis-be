import {
  Body,
  Query,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import {
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
} from 'src/model/class.model';
import { WebResponse } from 'src/model/web.model';
import { UtilService } from 'src/common/util.service';
import { Grade, Role } from '@prisma/client';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateClassRequest,
  ): Promise<WebResponse<ClassResponse>> {
    const normalizedRequest = UtilService.normalizeOptionalEmptyStrings(
      request,
      ['homeroomTeacherId'],
    );
    const result = await this.classService.create(normalizedRequest);
    return {
      data: result,
    };
  }

  @Get('/grade')
  async findAllByGrade(
    @Query('grade') grade?: Grade, // <-- pakai @Query
  ): Promise<WebResponse<ClassResponse[]>> {
    if (!grade) {
      return { data: [] };
    }

    const result = await this.classService.findAllByGrade(grade);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<ClassResponse[]>> {
    const result = await this.classService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<WebResponse<ClassResponse>> {
    const result = await this.classService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateClassRequest,
  ): Promise<WebResponse<ClassResponse>> {
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
