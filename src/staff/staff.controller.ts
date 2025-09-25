import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffResponse,
} from 'src/model/staff.model';

@Controller('/api/staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ✅ CREATE Staff
  @Post()
  async create(@Body() request: CreateStaffRequest): Promise<StaffResponse> {
    return this.staffService.create(request);
  }

  // ✅ GET ALL Staff
  @Get()
  async findAll(): Promise<StaffResponse[]> {
    return this.staffService.findAll();
  }

  // ✅ GET Staff BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<StaffResponse> {
    return this.staffService.findById(id);
  }

  // ✅ UPDATE Staff
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStaffRequest,
  ): Promise<StaffResponse> {
    return this.staffService.update(id, data);
  }

  // ✅ DELETE Staff
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
   return await this.staffService.delete(id);
  }


}
