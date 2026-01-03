import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from 'src/model/web.model';
import {
  RegisterUserRequest,
  RegisterUserResponse,
} from 'src/model/user.model';

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
