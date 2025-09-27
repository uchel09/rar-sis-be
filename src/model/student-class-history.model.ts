import { Semester } from 'generated/prisma';

export interface CreateStudentClassHistoryRequest {
  studentId: string;
  classId: string;
  year: number;
  semester: Semester;
}

export interface UpdateStudentClassHistoryRequest {
  classId?: string;
  year?: number;
  semester?: Semester;
}

export interface StudentClassHistoryResponse {
  id: string;
  studentId: string;
  classId: string;
  year: number;
  semester: Semester;
  createdAt: Date;
  updatedAt: Date;

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
