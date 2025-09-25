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
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolResponse,
} from 'src/model/school.model';
import { Logger } from 'winston';
import { SchoolValidation } from './school.validation';

@Injectable()
export class SchoolService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateSchoolRequest): Promise<SchoolResponse> {
    this.logger.info(`Create School ${JSON.stringify(request)}`);
    const createRequest: CreateSchoolRequest = this.validationService.validate(
      SchoolValidation.CREATE,
      request,
    );

    // Cek kode unik
    const exist = await this.prismaService.school.count({
      where: { code: createRequest.code },
    });
    if (exist !== 0) {
      throw new HttpException('School code already exists', 400);
    }

    const school = await this.prismaService.school.create({
      data: createRequest,
    });

    return {
      id: school.id,
      name: school.name,
      address: school.address || undefined,
      organizationId: school.organizationId,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<SchoolResponse[]> {
    this.logger.info('Find all schools');

    const schools = await this.prismaService.school.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return schools.map((school) => ({
      id: school.id,
      name: school.name,
      code: school.code,
      address: school.address || undefined,
      organizationId: school.organizationId,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<SchoolResponse> {
    this.logger.info(`Find school by id: ${id}`);

    const school = await this.prismaService.school.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    return {
      id: school.id,
      name: school.name,
      code: school.code,
      address: school.address || undefined,
      organizationId: school.organizationId,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(id: string, data: UpdateSchoolRequest): Promise<SchoolResponse> {
    this.logger.info(`Update school ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.school.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    const updateRequest: UpdateSchoolRequest = this.validationService.validate(
      SchoolValidation.UPDATE,
      data,
    );

    const school = await this.prismaService.school.update({
      where: { id },
      data: updateRequest,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

     return {
       id: school.id,
       name: school.name,
       address: school.address || undefined,
       organizationId: school.organizationId,
       createdAt: school.createdAt,
       updatedAt: school.updatedAt,
     };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete school by id: ${id}`);

    const exist = await this.prismaService.school.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException(`School with id ${id} not found`);
    }

    await this.prismaService.school.delete({ where: { id } });
    return { message: `School ${id} deleted successfully` };
  }
}
