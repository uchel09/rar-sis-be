import { Gender } from "generated/prisma";

export interface CreateParentRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  dob: Date;
  nik: string;
  gender: Gender
  studentIds?: string[]; // Optional list of student IDs to link
}

export interface UpdateParentRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  dob?: Date;
  nik?: string;
  gender: Gender;
  studentIds?: string[]; // Update linked students
}

export interface ParentResponse {
  id: string;
  phone?: string;
  address?: string;
  dob: Date;
  nik: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
  };
  students?: {
    id: string;
    fullName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
