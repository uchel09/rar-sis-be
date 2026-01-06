import { Grade } from '@prisma/client';


// Request untuk CREATE Subject
export interface CreateSubjectRequest {
  name: string;
  grade: Grade;
  schoolId: string;
}


// Request untuk UPDATE Subject
export interface UpdateSubjectRequest {
  name?: string;
  grade?: Grade;
}


export interface SubjectResponse {
  id: string;
  name: string;
  grade: Grade;
  createdAt: Date;
  updatedAt: Date;
  subjectTeachers?: SubjectTeacherResponse[];
}

export interface SubjectTeacherResponse {
  id: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherFullName: string;
}

