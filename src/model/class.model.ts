import { Grade } from '@prisma/client';

// Request untuk CREATE Class
export interface CreateClassRequest {
  schoolId: string;
  homeroomTeacherId?: string; // opsional
  name: string;
  academicYearId: string;
  grade: Grade;
}

// Request untuk UPDATE Class
export interface UpdateClassRequest {
  schoolId?: string;
  homeroomTeacherId?: string;
  name?: string;
  academicYearId?: string;
  grade?: Grade;
}

export interface ClassResponse {
  id: string;
  schoolId: string;
  homeroomTeacher?: {
    id: string;
    fullname: string;
  };
  name: string;
  academicYear: {
    id: string;
    name: string;
  };
  grade: Grade;
  createdAt: Date;
  updatedAt: Date;
}

