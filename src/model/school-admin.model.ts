import { Gender } from "@prisma/client";

export interface CreateSchoolAdminRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
  dob: Date;
  nik: string;
  gender: Gender;
}

export interface UpdateSchoolAdminRequest {
  fullName?: string;
  dob?: Date;
  email?: string;
  password?: string;
  schoolId?: string;
  nik?: string;
  gender: Gender;
}

export interface SchoolAdminResponse {
  id: string;
  schoolId: string;
  dob: Date;
  nik: string;
  user: {
    gender: Gender;
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
