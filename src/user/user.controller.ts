/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { WebResponse } from 'src/model/web.model';
import {
  RegisterUserRequest,
  RegisterUserResponse,
} from 'src/model/user.model';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.SUPERADMIN)
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  // ✅ CREATE
  @Post()
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<RegisterUserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  // ✅ READ ALL
  @Get()
  async findAll(): Promise<WebResponse<RegisterUserResponse[]>> {
    const result = await this.userService.findAll();
    return {
      data: result,
    };
  }

  @Get('/me')
  @Roles(
    Role.SUPERADMIN,
    Role.SCHOOL_ADMIN,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
    Role.STAFF,
  )
  async me(@Req() req): Promise<WebResponse<any>> {
    const userId = req.user.id; // dari middleware
    const result = await this.userService.findMe(userId);
    return { data: result };
  }

  // ✅ READ BY ID
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<WebResponse<RegisterUserResponse>> {
    const result = await this.userService.findById(id);
    return {
      data: result,
    };
  }

  // ✅ UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<RegisterUserRequest>,
  ): Promise<WebResponse<RegisterUserResponse>> {
    const result = await this.userService.update(id, body);
    return {
      data: result,
    };
  }

  // ✅ DELETE
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<WebResponse<{ message: string }>> {
    const result = await this.userService.delete(id);
    return {
      data: result,
    };
  }
}
