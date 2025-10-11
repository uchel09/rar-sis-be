import {
  HttpException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { AcademicYearValidation } from './academic-year.validation';
import {
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
} from 'src/model/academic-year.model';
import { AcademicYear } from 'generated/prisma';

@Injectable()
export class AcademicYearService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateAcademicYearRequest): Promise<AcademicYear> {
    this.logger.info(`Create AcademicYear ${JSON.stringify(request)}`);

    const createRequest: CreateAcademicYearRequest =
      this.validationService.validate(AcademicYearValidation.CREATE, request);

    // cek duplikat nama tahun ajaran
    const exist = await this.prismaService.academicYear.count({
      where: { name: createRequest.name },
    });
    if (exist !== 0) {
      throw new HttpException(
        `Academic year ${createRequest.name} already exists`,
        400,
      );
    }

    const academicYear = await this.prismaService.academicYear.create({
      data: {
        name: createRequest.name,
        startDate: createRequest.startDate,
        endDate: createRequest.endDate,
        isActive: createRequest.isActive ?? false,
      },
    });

    return academicYear;
  }

  // ✅ READ ALL
  async findAll(): Promise<AcademicYear[]> {
    this.logger.info('Find all academic years');

    const academicYears = await this.prismaService.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });

    return academicYears;
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<AcademicYear> {
    this.logger.info(`Find academic year by id: ${id}`);

    const ay = await this.prismaService.academicYear.findUnique({
      where: { id },
    });
    if (!ay)
      throw new NotFoundException(`Academic year with id ${id} not found`);

    return ay;
  }
  async findByIsActive(): Promise<AcademicYear> {
    this.logger.info('Find active academic year');

    const ay = await this.prismaService.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!ay) {
      throw new NotFoundException('No active academic year found');
    }

    return ay;
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: UpdateAcademicYearRequest,
  ): Promise<AcademicYear> {
    this.logger.info(`Update academic year ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.academicYear.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Academic year with id ${id} not found`);

    const updateRequest: UpdateAcademicYearRequest =
      this.validationService.validate(AcademicYearValidation.UPDATE, data);

    const updated = await this.prismaService.academicYear.update({
      where: { id },
      data: updateRequest,
    });

    return updated;
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete academic year by id: ${id}`);

    const exist = await this.prismaService.academicYear.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Academic year with id ${id} not found`);

    await this.prismaService.academicYear.delete({ where: { id } });
    return { message: `Academic year ${id} deleted successfully` };
  }
}
