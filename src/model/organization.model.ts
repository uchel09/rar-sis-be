export interface CreateOrganizationRequest {
  name: string;
  code: string;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  address?: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  code: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  schools?: SchoolBrief[];
}


export interface SchoolBrief {
  id: string;
  name: string;
  code: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
