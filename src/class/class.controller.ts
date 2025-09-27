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
import { ClassService } from './class.service';
import {
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
} from 'src/model/class.model';

@Controller('/api/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // ✅ CREATE
  @Post()
  async create(@Body() request: CreateClassRequest): Promise<ClassResponse> {
    return this.classService.create(request);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<ClassResponse[]> {
    return this.classService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClassResponse> {
    return this.classService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateClassRequest,
  ): Promise<ClassResponse> {
    return this.classService.update(id, data);
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.classService.delete(id);
  }
}
