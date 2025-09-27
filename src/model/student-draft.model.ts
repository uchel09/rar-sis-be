import { DraftStatus, DraftType, Grade } from "generated/prisma";

export interface CreateStudentDraftRequest {
  email: string;
  fullName: string;
  schoolId: string;
  classId?: string;
  targetClassId?: string;
  enrollmentNumber: string;
  dob: Date;
  address?: string;
  grade: Grade;

  parents: {
    id?: string;
    fullName: string;
    phone?: string;
    address?: string;
    email?: string;
  }[];

  draftType: DraftType;
  status: DraftStatus;
}

export interface UpdateStudentDraftRequest {
  email?: string;
  fullName?: string;
  classId?: string;
  targetClassId?: string;
  enrollmentNumber?: string;
  dob?: Date;
  address?: string;
  grade: Grade;

  parents?: {
    id?: string;
    fullName: string;
    phone?: string;
    address?: string;
    email?: string;
  }[];

  draftType: DraftType;
  status: DraftStatus;
}
export interface StudentDraftResponse {
  id: string;
  email: string;
  fullName: string;
  schoolId: string;
  classId?: string;
  targetClassId?: string;
  enrollmentNumber: string;
  dob: Date;
  address?: string;
  grade: Grade;

  parents: {
    id?: string;
    fullName: string;
    phone?: string;
    address?: string;
    email?: string;
  }[];

  draftType: DraftType;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
}
