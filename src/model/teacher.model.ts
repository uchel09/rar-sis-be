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
  subjectClassTeacher?: { classId: string; subjectId: string }[];
}

// Request DTO untuk UPDATE
export interface UpdateTeacherRequest {
  fullName?: string; // Bisa update nama user
  dob?: Date;
  email?: string; // Bisa update email
  password?: string; // Bisa update password
  schoolId?: string; // Pindah sekolah
  nik?: string;
  nip?: string;
  hireDate?: Date;
  phone: string;
  subjectClassTeacher?: { classId: string; subjectId: string }[];
}

// Response DTO
export interface TeacherResponse {
  id: string; // ID teacher
  nik: string;
  nip?: string;
  schoolId: string;
  dob: Date;
  hireDate?: Date;
  phone: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  subjectClassTeacher?: SubjectClassTeacherResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectClassTeacherResponse {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
}
