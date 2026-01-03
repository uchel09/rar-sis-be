// src/auth/auth.controller.ts
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserLoginRequest } from 'src/model/user.model';
import * as jwt from 'jsonwebtoken';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: UserLoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1️⃣ validasi user (email + password)
    const user = await this.authService.login(body);

    // 2️⃣ buat token DI CONTROLLER
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );

    // 3️⃣ simpan token ke cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // 4️⃣ response TANPA token
    return {
      message: 'Login berhasil',
      user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');

    return {
      message: 'Logout berhasil',
    };
  }
}
