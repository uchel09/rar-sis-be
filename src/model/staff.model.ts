import { Gender, StaffPosition } from '@prisma/client';
export interface CreateStaffRequest {
  email: string; // dari User
  password: string; // dari User
  fullName: string; // dari User
  schoolId: string;
  position: StaffPosition
  phone: string;
  nik: string;
  nip?: string;
  gender: Gender;
  dob: Date | string;
}

export interface UpdateStaffRequest {
  email?: string; // dari User
  password?: string; // dari User
  fullName?: string; // dari User
  schoolId?: string;
  position?: StaffPosition;
  phone?: string;
  nik?: string;
  nip?: string;
  dob?: Date | string;
  gender: Gender;
  isActive?: boolean;
}

// RESPONSE
export interface StaffResponse {
  id: string;
  schoolId: string;
  position: StaffPosition
  phone: string;
  nik: string;
  nip?: string;
  dob: Date;
  isActive: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
  };
  createdAt: Date;
  updatedAt: Date;
}
