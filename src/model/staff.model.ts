// REQUESTS
export interface CreateStaffRequest {
  email: string; // dari User
  password: string; // dari User
  fullName: string; // dari User
  schoolId: string;
  position: string;
  phone: string;
  nik: string;
  nip?: string;
  dob: Date | string;
}

export interface UpdateStaffRequest {
  email?: string; // dari User
  password?: string; // dari User
  fullName?: string; // dari User
  schoolId?: string;
  position?: string;
  phone?: string;
  nik?: string;
  nip?: string;
  dob?: Date | string;
}

// RESPONSE
export interface StaffResponse {
  id: string;
  schoolId: string;
  position: string;
  phone: string;
  nik: string;
  nip?: string;
  dob: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
