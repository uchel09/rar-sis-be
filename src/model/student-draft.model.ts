import { DraftStatus, DraftType, Gender, Grade } from 'generated/prisma';

export interface CreateStudentDraftRequest {
  email: string;
  fullName: string;
  schoolId: string;
  targetClassId?: string;
  academicYearId: string;
  studentId?: string;
  enrollmentNumber?: string;
  dob: Date;
  address?: string;
  gender: Gender;
  grade: Grade;
  createdBy?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;

  parents: {
    id?: string;
    fullName: string;
    phone: string;
    address?: string;
    email: string;
    nik: string;
    gender: Gender;
  }[];

  draftType: DraftType;
  status?: DraftStatus; // default PENDING
}

export interface UpdateStudentDraftRequest {
  email?: string;
  fullName?: string;
  targetClassId?: string;
  enrollmentNumber?: string;
  dob?: Date;
  address?: string;
  academicYearId?: string;
  gender: Gender;
  grade?: Grade;
  createdBy?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;

  parents?: {
    id?: string;
    fullName: string;
    phone?: string;
    address?: string;
    email?: string;
    nik?: string;
    gender?: Gender
  }[];

  draftType?: DraftType;
  status?: DraftStatus;
}

export interface StudentDraftResponse {
  id: string;
  email: string;
  fullName: string;
  schoolId: string;
  enrollmentNumber?: string;
  targetClassId?: string;
  gender: Gender;
  academicYear: {
    id: string;
    name: string
  }
  student?: {
    id: string;
    fullname: string;
    classId: string;
    className: string;
  }
  dob: Date;
  address?: string;
  grade: Grade;
  createdBy?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;

  parents: {
    id?: string;
    fullName: string;
    phone: string;
    address?: string;
    email: string;
    nik: string;
    gender: Gender;
  }[];

  draftType: DraftType;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
}

