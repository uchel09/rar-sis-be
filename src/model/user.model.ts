import { Gender, Role } from 'generated/prisma';

export class RegisterUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  gender: Gender;
}

export class RegisterUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  gender: Gender;
  createdAt: Date;
}

export class UpdateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  gender: Gender;
}