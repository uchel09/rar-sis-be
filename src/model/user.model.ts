import { Role } from 'generated/prisma';

export class RegisterUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export class RegisterUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
}

export class UpdateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}