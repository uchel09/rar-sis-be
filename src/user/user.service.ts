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
  RegisterUserRequest,
  RegisterUserResponse,
  UpdateUserRequest,
} from 'src/model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  // ✅ CREATE
  async register(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    this.logger.info(`Register New User ${JSON.stringify(request)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameEmail = await this.prismaService.user.count({
      where: { email: registerRequest.email },
    });
    if (totalUserWithSameEmail !== 0) {
      throw new HttpException('Email already exist', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  // ✅ READ ALL
  async findAll() {
    this.logger.info('Find all users');
    return this.prismaService.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ✅ READ BY ID
  async findById(id: string) {
    this.logger.info(`Find user by id: ${id}`);
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // ✅ UPDATE
  async update(id: string, data: Partial<UpdateUserRequest>) {
    this.logger.info(`Update user ${id} with ${JSON.stringify(data)}`);

    const exist = await this.prismaService.user.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException(`User with id ${id} not found`);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prismaService.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ✅ DELETE
  async delete(id: string) {
    this.logger.info(`Delete user by id: ${id}`);

    const exist = await this.prismaService.user.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException(`User with id ${id} not found`);

    await this.prismaService.user.delete({ where: { id } });
    return { message: `User ${id} deleted successfully` };
  }
}
