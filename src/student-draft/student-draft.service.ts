import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import {
  CreateStudentDraftRequest,
  UpdateStudentDraftRequest,
  StudentDraftResponse,
} from 'src/model/student-draft.model';
import { Logger } from 'winston';
import { StudentDraftValidation } from './student-draft.validation';

@Injectable()
export class StudentDraftService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(
    request: CreateStudentDraftRequest,
  ): Promise<StudentDraftResponse> {
    this.logger.info(`Create StudentDraft ${JSON.stringify(request)}`);
    const createRequest: CreateStudentDraftRequest =
      this.validationService.validate(StudentDraftValidation.CREATE, request);

    // Cek email unik
    const exist = await this.prismaService.studentDraft.count({
      where: { email: createRequest.email },
    });
    if (exist !== 0) {
      throw new HttpException('StudentDraft email already exists', 400);
    }

   const draft = await this.prismaService.studentDraft.create({
     data: createRequest,
     select: {
       id: true,
       email: true,
       fullName: true,
       schoolId: true,
       classId: true,
       targetClassId: true,
       enrollmentNumber: true,
       grade: true,
       dob: true,
       address: true,
       parents: true, // ✅ cukup gini
       draftType: true,
       status: true,
       createdAt: true,
       updatedAt: true,
     },
   });


    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      classId: draft.classId || undefined,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone?: string;
        address?: string;
        email?: string;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<StudentDraftResponse[]> {
    this.logger.info('Find all StudentDrafts');

    const drafts = await this.prismaService.studentDraft.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      classId: draft.classId || undefined,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone?: string;
        address?: string;
        email?: string;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<StudentDraftResponse> {
    this.logger.info(`Find StudentDraft by id: ${id}`);

    const draft = await this.prismaService.studentDraft.findUnique({
      where: { id },
    });

    if (!draft) {
      throw new NotFoundException(`StudentDraft with id ${id} not found`);
    }

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      classId: draft.classId || undefined,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone?: string;
        address?: string;
        email?: string;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateStudentDraftRequest,
  ): Promise<StudentDraftResponse> {
    this.logger.info(`Update StudentDraft ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.studentDraft.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(`StudentDraft with id ${id} not found`);
    }

    const updateRequest: UpdateStudentDraftRequest =
      this.validationService.validate(StudentDraftValidation.UPDATE, data);

    const draft = await this.prismaService.studentDraft.update({
      where: { id },
      data: updateRequest,
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      classId: draft.classId || undefined,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone?: string;
        address?: string;
        email?: string;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete StudentDraft by id: ${id}`);

    const exist = await this.prismaService.studentDraft.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(`StudentDraft with id ${id} not found`);
    }

    await this.prismaService.studentDraft.delete({ where: { id } });
    return { message: `StudentDraft ${id} deleted successfully` };
  }
}
