import { Gender } from '@prisma/client';

export interface CreateParentRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  nik: string;
  gender: Gender;
  isActive: boolean;
  studentIds?: string[]; // Optional list of student IDs to link
}

export interface UpdateParentRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  nik?: string;
  gender: Gender;
  isActive: boolean;
  studentIds?: string[]; // Update linked students
}

export interface ParentResponse {
  id: string;
  phone?: string;
  address?: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
