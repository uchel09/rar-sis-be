// src/model/student.model.ts

export interface CreateStudentRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
  classId?: string;
  enrollmentNumber?: string;
  dob: Date;
  address?: string;
  parentIds?: string[]; // jika ingin langsung assign parent
}

export interface UpdateStudentRequest {
  email?: string;
  password?: string;
  fullName?: string;
  schoolId?: string;
  classId?: string;
  enrollmentNumber?: string;
  dob?: Date;
  address?: string;
  parentIds?: string[]; // update relasi parent
}

export interface StudentResponse {
  id: string;
  schoolId: string;
  class?: {
    id: string;
    name: string; // ✅ ambil field nama class
    grade: string; // kalau ada field tambahan
  } ;
  enrollmentNumber: string | null;
  dob: Date;
  address?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  parents: {
    id: string;
    fullName: string;
    email: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

