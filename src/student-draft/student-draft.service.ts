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
import { Grade, DraftStatus, Gender } from 'generated/prisma';

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

    const exist = await this.prismaService.studentDraft.count({
      where: { email: createRequest.email },
    });
    if (exist !== 0) {
      throw new HttpException('StudentDraft email already exists', 400);
    }

    const draft = await this.prismaService.studentDraft.create({
      data: {
        email: createRequest.email,
        fullName: createRequest.fullName,
        schoolId: createRequest.schoolId, // ✅ langsung string
        academicYearId: createRequest.academicYearId,
        targetClassId: createRequest.targetClassId || undefined,
        studentId: createRequest.studentId || undefined,
        enrollmentNumber: createRequest.enrollmentNumber || undefined,
        dob: new Date(createRequest.dob),
        address: createRequest.address || undefined,
        gender: createRequest.gender,
        grade: createRequest.grade,
        draftType: createRequest.draftType,
        status: createRequest.status ?? 'PENDING',
        createdBy: createRequest.createdBy || undefined,
        verifiedBy: createRequest.verifiedBy || undefined,
        verifiedAt: createRequest.verifiedAt || undefined,
        rejectionReason: createRequest.rejectionReason || undefined,
        parents: createRequest.parents ?? [], // ✅ simpan JSON array
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                gender: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      targetClassId: draft.targetClassId || undefined,
      gender: draft.gender,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        gender: Gender;
        nik: string;
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
      where: {status: DraftStatus.PENDING},
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        gender: Gender;
        nik: string;
      }[],
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  }
  async findAllApprovedPending(): Promise<StudentDraftResponse[]> {
    this.logger.info('Find all Approve Pending StudentDrafts ');

    const drafts = await this.prismaService.studentDraft.findMany({
      orderBy: { createdAt: 'desc' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: {status: DraftStatus.APPROVED_PENDING},
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        gender: Gender;
        nik: string;
      }[],
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  }
  async findAllApproved(): Promise<StudentDraftResponse[]> {
    this.logger.info('Find all Approved StudentDrafts ');

    const drafts = await this.prismaService.studentDraft.findMany({
      orderBy: { createdAt: 'desc' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: {status: DraftStatus.APPROVED},
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        gender: Gender;
        nik: string;
      }[],
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  }

  async findByGrade(grade: Grade): Promise<StudentDraftResponse[]> {
    this.logger.info(`Find StudentDrafts by grade: ${grade}`);

    const drafts = await this.prismaService.studentDraft.findMany({
      where: { grade },
      orderBy: { createdAt: 'desc' },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
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
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!draft) {
      throw new NotFoundException(`StudentDraft with id ${id} not found`);
    }

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || '',
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
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
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || undefined,
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // ✅ APPROVE
  async approvePending(id: string): Promise<StudentDraftResponse> {
    this.logger.info(`Approve StudentDraft ${id}`);

    const draft = await this.prismaService.studentDraft.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { status: DraftStatus.APPROVED_PENDING },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || '',
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // ✅ REJECT
  async reject(id: string, reason?: string): Promise<StudentDraftResponse> {
    this.logger.info(`Reject StudentDraft ${id} with reason: ${reason || '-'}`);

    const draft = await this.prismaService.studentDraft.update({
      where: { id },
      data: {
        status: DraftStatus.REJECTED,
        // kalau punya field "rejectionReason", bisa tambahin disini
        // rejectionReason: reason,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || '',
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  // Aprove new Student ==========================================
  async approveNewStudent(id: string): Promise<StudentDraftResponse> {
    this.logger.info(`Approve StudentDraft ${id}`);

    const draft = await this.prismaService.studentDraft.update({
      where: { id },
      data: { status: DraftStatus.APPROVED },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || '',
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
      }[],
      draftType: draft.draftType,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  async createStudentParentNewStudentDraft(){}
  // Aprove new Student ==========================================

  async rejectNewStudent(
    id: string,
    reason?: string,
  ): Promise<StudentDraftResponse> {
    this.logger.info(`Reject StudentDraft ${id} with reason: ${reason || '-'}`);

    const draft = await this.prismaService.studentDraft.update({
      where: { id },
      data: {
        status: DraftStatus.REJECTED,
        // kalau punya field "rejectionReason", bisa tambahin disini
        // rejectionReason: reason,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      id: draft.id,
      email: draft.email,
      fullName: draft.fullName,
      schoolId: draft.schoolId,
      targetClassId: draft.targetClassId || '',
      enrollmentNumber: draft.enrollmentNumber || undefined,
      dob: draft.dob,
      address: draft.address || undefined,
      grade: draft.grade,
      gender: draft.gender,
      student: draft.student
        ? {
            id: draft.student.id,
            fullname: draft.student.user.fullName,
            classId: draft.student.class!.id,
            className: draft.student.class!.name,
          }
        : undefined,
      academicYear: {
        id: draft.academicYear.id,
        name: draft.academicYear.name,
      },
      parents: draft.parents as {
        id?: string;
        fullName: string;
        phone: string;
        address?: string;
        email: string;
        nik: string;
        gender: Gender;
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
