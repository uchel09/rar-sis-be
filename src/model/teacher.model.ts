import { Gender } from '@prisma/client';

export interface CreateTeacherRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string; // ID sekolah teacher
  nik: string; // Nomor induk teacher (unik)
  nip?: string; // Optional nomor pegawai
  hireDate: Date;
  dob: Date;
  phone: string;
  gender: Gender;
}

// Request DTO untuk UPDATE
export interface UpdateTeacherRequest {
  fullName?: string; // Bisa update nama user
  dob?: Date;
  email?: string; // Bisa update email
  password?: string; // Bisa update password
  nik?: string;
  nip?: string;
  hireDate?: Date;
  phone?: string;
  gender?: Gender;
  isActive?: boolean;
}

// Response DTO
export interface TeacherResponse {
  id: string; // ID teacher
  nik: string;
  nip?: string;
  dob: Date;
  hireDate: Date;
  phone: string;
  isActive: boolean;
  user: {
    gender: Gender;
    id: string;
    fullName: string;
    email: string;
  };
  subjectTeachers: SubjectTeacherResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectTeacherResponse {
  id: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherFullName: string;
}
