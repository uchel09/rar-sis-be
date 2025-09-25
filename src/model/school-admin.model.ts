export interface CreateSchoolAdminRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
  dob: Date;
}

export interface UpdateSchoolAdminRequest {
  fullName?: string;
  dob?: Date;
  email?: string;
  password?: string;
  schoolId?: string;
}

export interface SchoolAdminResponse {
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
