import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { StudentDraftService } from './student-draft.service';
import {
  CreateStudentDraftRequest,
  UpdateStudentDraftRequest,
  StudentDraftResponse,
} from 'src/model/student-draft.model';
import { WebResponse } from 'src/model/web.model';
import { UtilService } from 'src/common/util.service';

@Controller('/api/student-drafts')
export class StudentDraftController {
  constructor(private readonly studentDraftService: StudentDraftService) {}

  // ✅ CREATE
  @Post()
  async create(
    @Body() request: CreateStudentDraftRequest,
  ): Promise<WebResponse<StudentDraftResponse>> {
    const normalizedRequest = UtilService.normalizeOptionalEmptyStrings(
      request,
      [
        'targetClassId',
        'enrollmentNumber',
        'address',
        'createdBy',
        'verifiedBy',
        'rejectionReason',
        'verifiedAt',
      ],
    );
    console.log(normalizedRequest);
    const result = await this.studentDraftService.create(normalizedRequest);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<StudentDraftResponse[]>> {
    const result = await this.studentDraftService.findAll();
    return {
      data: result,
    };
  }
  // ✅ READ ALL
  @Get("/approve-pending")
  async findAllApprovedPending(): Promise<WebResponse<StudentDraftResponse[]>> {
    const result = await this.studentDraftService.findAllApprovedPending();
    return {
      data: result,
    };
  }
  // ✅ READ ALL
  @Get("/approved")
  async findAllApproved(): Promise<WebResponse<StudentDraftResponse[]>> {
    const result = await this.studentDraftService.findAllApproved();
    return {
      data: result,
    };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<StudentDraftResponse>> {
    const result = await this.studentDraftService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateStudentDraftRequest,
  ): Promise<WebResponse<StudentDraftResponse>> {
    console.log(request);
    const result = await this.studentDraftService.update(id, request);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.studentDraftService.delete(id);
  }

  // ✅ APPROVE
  @Put(':id/approve-pending')
  async approvePending(
    @Param('id') id: string,
  ): Promise<WebResponse<StudentDraftResponse>> {
    const result = await this.studentDraftService.approvePending(id);
    return {
      data: result,
    };
  }

  // ✅ REJECT
  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ): Promise<WebResponse<StudentDraftResponse>> {
    const result = await this.studentDraftService.reject(id, rejectionReason);
    return {
      data: result,
    };
  }
}
