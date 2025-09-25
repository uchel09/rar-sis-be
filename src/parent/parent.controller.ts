import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import {
  CreateParentRequest,
  UpdateParentRequest,
} from 'src/model/parent.model';
import { ParentResponse } from 'src/model/parent.model';

@Controller('/api/parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  // ✅ CREATE
  @Post()
  async create(@Body() body: CreateParentRequest): Promise<ParentResponse> {
    return this.parentService.create(body);
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<ParentResponse[]> {
    return this.parentService.findAll();
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ParentResponse> {
    return this.parentService.findById(id);
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateParentRequest,
  ): Promise<ParentResponse> {
    return this.parentService.update(id, body);
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.parentService.delete(id);
  }
}
