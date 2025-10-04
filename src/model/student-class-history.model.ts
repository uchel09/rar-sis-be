import { Semester } from 'generated/prisma';

export interface CreateStudentClassHistoryRequest {
  studentId: string;
  classId: string;
  academicYearId: string;
  semester: Semester;
}

export interface UpdateStudentClassHistoryRequest {
  classId?: string;
  academicYearId: string;
  semester?: Semester;
}

export interface StudentClassHistoryResponse {
  id: string;
  studentId: string;
  classId: string;
  semester: Semester;
  createdAt: Date;
  updatedAt: Date;
  academicYearId: string;
  academicYear?: {
    id: string;
    name: string;
  }
  student?: {
    id: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  class: {
    id: string;
    name: string;
  };
}
