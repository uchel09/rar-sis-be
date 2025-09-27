import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TimetableService } from './time-table.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateTimetableRequest,
  UpdateTimetableRequest,
  TimetableResponse,
} from 'src/model/time-table.model';

@Controller('/api/timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateTimetableRequest,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.create(request);
    return { data: result };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<TimetableResponse[]>> {
    const result = await this.timetableService.findAll();
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.findById(id);
    return { data: result };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTimetableRequest,
  ): Promise<WebResponse<TimetableResponse>> {
    const result = await this.timetableService.update(id, body);
    return { data: result };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.timetableService.delete(id);
    return { data: result };
  }
}
