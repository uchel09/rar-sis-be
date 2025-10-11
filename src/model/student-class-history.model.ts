import { Grade, Semester, StudentStatus } from 'generated/prisma';

export interface CreateStudentClassHistoryRequest {
  studentId: string;
  classId: string;
  academicYearId: string;
  semester: Semester;
  isRepeatedYear: boolean;
  remark: string;
  studentStatus: StudentStatus;
  grade: Grade;
}

export interface UpdateStudentClassHistoryRequest {
  classId?: string;
  academicYearId?: string;
  semester?: Semester;
  isRepeatedYear?: boolean;
  remark?: string;
  studentStatus?: StudentStatus;
  grade?: Grade;
}

export interface StudentClassHistoryResponse {
  id: string;
  studentId: string;
  classId: string;
  semester: Semester;
  createdAt: Date;
  updatedAt: Date;
  academicYearId: string;
  remark: string;
  isRepeatedYear: boolean;
  studentStatus: StudentStatus;
  grade: Grade;
  academicYear?: {
    id: string;
    name: string;
  };
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
