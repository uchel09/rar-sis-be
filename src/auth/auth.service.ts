// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { VallidationService } from 'src/common/validation.service';
import { AuthValidation } from './auth.validation';
import { UserLoginRequest, UserLoginResponse } from 'src/model/user.model';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private validationService: VallidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async login(request: UserLoginRequest): Promise<UserLoginResponse> {
    this.logger.info(`Login attempt ${request.email}`);

    const loginRequest: UserLoginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    const user = await this.prisma.user.findUnique({
      where: { email: loginRequest.email },
      include: {
        student: true,
        teacher: true,
        parent: true,
        staff: true,
        schoolAdmins: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    /**
     * Role Context
     * dipakai FE / backend buat tahu user ini siapa
     */
    let profileId: string | null = null;

    switch (user.role) {
      case Role.STUDENT:
        profileId = user.student?.id ?? null;
        break;

      case Role.TEACHER:
        profileId = user.teacher?.id ?? null;
        break;

      case Role.PARENT:
        profileId = user.parent?.id ?? null;
        break;

      case Role.STAFF:
        profileId = user.staff?.id ?? null;
        break;

      case Role.SCHOOL_ADMIN:
        profileId = user.schoolAdmins?.[0]?.id ?? null;
        break;

      case Role.SUPERADMIN:
        profileId = null;
        break;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileId,
    };
  }
}
