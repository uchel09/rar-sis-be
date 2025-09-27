import { Grade } from 'generated/prisma';

// Request untuk CREATE Class
export interface CreateClassRequest {
  schoolId: string;
  teacherId?: string; // Guru pengajar utama
  homeroomTeacherId?: string; // Wali kelas
  name: string;
  year: number;
  grade: Grade;
}

// Request untuk UPDATE Class
export interface UpdateClassRequest {
  schoolId?: string;
  teacherId?: string;
  homeroomTeacherId?: string;
  name?: string;
  year?: number;
  grade?: Grade;
}

// Response model Class
export interface ClassResponse {
  id: string;
  schoolId: string;
  teacherId?: string;
  homeroomTeacherId?: string;
  name: string;
  year: number;
  grade: Grade;
  createdAt: Date; 
  updatedAt: Date; 
}
