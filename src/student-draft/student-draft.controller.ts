import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { StudentDraftService } from './student-draft.service';
import {
  CreateStudentDraftRequest,
  UpdateStudentDraftRequest,
  StudentDraftResponse,
} from 'src/model/student-draft.model';
import { WebResponse } from 'src/model/web.model';
import { UtilService } from 'src/common/util.service';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

const isDummyEnabled = () =>
  process.env.NODE_ENV !== 'production' ||
  process.env.ALLOW_DUMMY_ENDPOINTS === 'true';

const ensureDummyEnabled = () => {
  if (!isDummyEnabled()) {
    throw new ForbiddenException('Dummy endpoint disabled');
  }
};

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/student-drafts')
export class StudentDraftController {
  constructor(private readonly studentDraftService: StudentDraftService) {}
  @Post('sider')
  async create50Dummy() {
    ensureDummyEnabled();
    return this.studentDraftService.create50Dummy();
  }
  @Delete('delete-sider')
  async deleteDummy() {
    ensureDummyEnabled();
    return this.studentDraftService.deleteSider();
  }
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
  @Get('/approve-pending')
  async findAllApprovedPending(): Promise<WebResponse<StudentDraftResponse[]>> {
    const result = await this.studentDraftService.findAllApprovedPending();
    return {
      data: result,
    };
  }
  // ✅ READ ALL
  @Get('/approved')
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
