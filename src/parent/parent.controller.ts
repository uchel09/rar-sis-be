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
import { WebResponse } from 'src/model/web.model';
import { CreateStudentRequest } from 'src/model/student.model';

@Controller('/api/parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() body: CreateParentRequest,
  ): Promise<WebResponse<ParentResponse>> {
    console.log(body);
    const result = await this.parentService.create(body);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<ParentResponse[]>> {
    const result = await this.parentService.findAll();
    return {
      data: result,
    };
  }
  @Post('/with-student')
  async createParentStudentDraft(
    @Body()
    body: {
      parentRequests: CreateParentRequest[];
      studentRequest: CreateStudentRequest;
    },
  ) {
     
    console.log(body.parentRequests);
    console.log(body.studentRequest);
    const res = await this.parentService.createParentStudentDraft(
      body.parentRequests,
      body.studentRequest,
    );
    return {
      data: res
    }
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<ParentResponse>> {
    const result = await this.parentService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateParentRequest,
  ): Promise<WebResponse<ParentResponse>> {
    const result = await this.parentService.update(id, body);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.parentService.delete(id);
  }
}
