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
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from 'src/model/organization.model';
import { Logger } from 'winston';
import { OrganizationValidation } from './organization.validation';

@Injectable()
export class OrganizationService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateOrganizationRequest) {
    this.logger.info(`Create Organization ${JSON.stringify(request)}`);
    const createRequest: CreateOrganizationRequest =
      this.validationService.validate(OrganizationValidation.CREATE, request);

    const exist = await this.prismaService.organization.count({
      where: { code: createRequest.code },
    });
    if (exist !== 0) {
      throw new HttpException('Organization code already exists', 400);
    }

    return this.prismaService.organization.create({
      data: createRequest,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ✅ READ ALL
  async findAll() {
    this.logger.info('Find all organizations');
    return this.prismaService.organization.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        schools: true
      },
    });
  }

  // ✅ READ BY ID
  async findById(id: string) {
    this.logger.info(`Find organization by id: ${id}`);
    const org = await this.prismaService.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        schools: true,
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return org;
  }

  // ✅ UPDATE
  async update(id: string, data: UpdateOrganizationRequest) {
    this.logger.info(`Update organization ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.organization.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Organization with id ${id} not found`);

    const updateRequest: UpdateOrganizationRequest =
      this.validationService.validate(OrganizationValidation.UPDATE, data);

    return this.prismaService.organization.update({
      where: { id },
      data: updateRequest,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        schools: true
      },
    });
  }

  // ✅ DELETE
  async delete(id: string) {
    this.logger.info(`Delete organization by id: ${id}`);

    const exist = await this.prismaService.organization.findUnique({
      where: { id },
    });
    if (!exist)
      throw new NotFoundException(`Organization with id ${id} not found`);

    await this.prismaService.organization.delete({ where: { id } });
    return { message: `Organization ${id} deleted successfully` };
  }
}
