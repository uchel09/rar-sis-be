import { Grade } from 'generated/prisma';

// Request untuk CREATE Class
export interface CreateClassRequest {
  schoolId: string;
  homeroomTeacherId?: string; // opsional
  name: string;
  academicYearId: string;
  grade: Grade;
  subjectClassTeacher?: { teacherId: string; subjectId: string }[]; // relasi wajib untuk create
}

// Request untuk UPDATE Class
export interface UpdateClassRequest {
  schoolId?: string;
  homeroomTeacherId?: string;
  name?: string;
  academicYearId?: string;
  grade?: Grade;
  subjectTeachers?: { teacherId: string; subjectId: string }[]; // update relasi guru mata pelajaran
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
  subjectClassTeacher?: SubjectClassTeacherResponse[];
}

export interface SubjectClassTeacherResponse {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
}
