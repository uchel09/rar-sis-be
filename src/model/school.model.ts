// ✅ Request DTO untuk CREATE
export class CreateSchoolRequest {
  organizationId: string;
  code: string; 
  name: string;
  address?: string;
}

// ✅ Request DTO untuk UPDATE
export class UpdateSchoolRequest {
  organizationId?: string;
  name?: string;
  address?: string;
}

// ✅ Response DTO
export class SchoolResponse {
  id: string;
  name: string;
  code?: string
  address?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
