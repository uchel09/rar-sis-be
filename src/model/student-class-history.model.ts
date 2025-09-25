export interface CreateStudentRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
  dob: Date;
}

export interface UpdateStudentRequest {
  fullName?: string;
  dob?: Date;
  email?: string;
  password?: string;
  schoolId?: string;
}

export interface StudentResponse {
  id: string;
  schoolId: string;
  dob: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
