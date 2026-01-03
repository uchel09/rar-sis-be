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

export class UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profileId: string | null
}
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  profileId: string | null
}