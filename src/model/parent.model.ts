export interface CreateParentRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  dob: Date;
  studentIds?: string[]; // Optional list of student IDs to link
}

export interface UpdateParentRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  dob?: Date;
  studentIds?: string[]; // Update linked students
}

export interface ParentResponse {
  id: string;
  phone?: string;
  address?: string;
  dob: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  students?: {
    id: string;
    fullName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
