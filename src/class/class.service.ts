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
  CreateClassRequest,
  UpdateClassRequest,
  ClassResponse,
} from 'src/model/class.model';
import { Logger } from 'winston';
import { ClassValidation } from './class.validation';

@Injectable()
export class ClassService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async create(request: CreateClassRequest): Promise<ClassResponse> {
    this.logger.info(`Create Class ${JSON.stringify(request)}`);

    const createRequest: CreateClassRequest = this.validationService.validate(
      ClassValidation.CREATE,
      request,
    );

    const exist = await this.prismaService.class.count({
      where: {
        schoolId: createRequest.schoolId,
        name: createRequest.name,
        year: createRequest.year,
      },
    });
    if (exist !== 0) {
      throw new HttpException(
        `Class ${createRequest.name} for year ${createRequest.year} already exists`,
        400,
      );
    }

    const cls = await this.prismaService.class.create({
      data: createRequest,
    });

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      teacherId: cls.teacherId || undefined,
      homeroomTeacherId: cls.homeroomTeacherId || undefined,
      name: cls.name,
      year: cls.year,
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ READ ALL
  async findAll(): Promise<ClassResponse[]> {
    this.logger.info('Find all classes');

    const classes = await this.prismaService.class.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return classes.map((cls) => ({
      id: cls.id,
      schoolId: cls.schoolId,
      teacherId: cls.teacherId || undefined,
      homeroomTeacherId: cls.homeroomTeacherId || undefined,
      name: cls.name,
      year: cls.year,
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    }));
  }

  // ✅ READ BY ID
  async findById(id: string): Promise<ClassResponse> {
    this.logger.info(`Find class by id: ${id}`);

    const cls = await this.prismaService.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException(`Class with id ${id} not found`);

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      teacherId: cls.teacherId || undefined,
      homeroomTeacherId: cls.homeroomTeacherId || undefined,
      name: cls.name,
      year: cls.year,
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ UPDATE
  async update(id: string, data: UpdateClassRequest): Promise<ClassResponse> {
    this.logger.info(`Update class ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.class.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException(`Class with id ${id} not found`);

    const updateRequest: UpdateClassRequest = this.validationService.validate(
      ClassValidation.UPDATE,
      data,
    );

    const cls = await this.prismaService.class.update({
      where: { id },
      data: updateRequest,
    });

    return {
      id: cls.id,
      schoolId: cls.schoolId,
      teacherId: cls.teacherId || undefined,
      homeroomTeacherId: cls.homeroomTeacherId || undefined,
      name: cls.name,
      year: cls.year,
      grade: cls.grade,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };
  }

  // ✅ DELETE
  async delete(id: string): Promise<{ message: string }> {
    this.logger.info(`Delete class by id: ${id}`);

    const exist = await this.prismaService.class.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException(`Class with id ${id} not found`);

    await this.prismaService.class.delete({ where: { id } });
    return { message: `Class ${id} deleted successfully` };
  }
}
