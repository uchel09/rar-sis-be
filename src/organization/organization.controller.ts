import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from 'src/model/organization.model';

@Controller('/api/organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateOrganizationRequest,
  ): Promise<WebResponse<any>> {
    const result = await this.organizationService.create(request);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<any[]>> {
    const result = await this.organizationService.findAll();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<WebResponse<any>> {
    const result = await this.organizationService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrganizationRequest,
  ): Promise<WebResponse<any>> {
    const result = await this.organizationService.update(id, body);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.organizationService.delete(id);
    return {
      data: result,
    };
  }
}
