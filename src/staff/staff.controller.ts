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
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { StaffService } from './staff.service';
import {
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffResponse,
} from 'src/model/staff.model';
import { WebResponse } from 'src/model/web.model';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ✅ CREATE Staff
  @Post()
  async create(
    @Body() request: CreateStaffRequest,
  ): Promise<WebResponse<StaffResponse>> {
    const result = await this.staffService.create(request);
    return {
      data: result,
    };
  }

  // ✅ GET ALL Staff
  @Get()
  async findAll(): Promise<WebResponse<StaffResponse[]>> {
    const result = await this.staffService.findAll();
    return {
      data: result,
    };
  }

  // ✅ GET Staff BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<WebResponse<StaffResponse>> {
    const result = await this.staffService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE Staff
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStaffRequest,
  ): Promise<WebResponse<StaffResponse>> {
    const result = await this.staffService.update(id, data);
    return {
      data: result,
    };
  }

  // ✅ DELETE Staff
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.staffService.delete(id);
  }
}
