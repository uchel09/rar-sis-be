export interface CreateAcademicYearRequest {
  name: string; // contoh "2024/2025"
  startDate: Date; // kapan mulai
  endDate: Date; // kapan berakhir
  isActive?: boolean; // optional, default false
}

export interface UpdateAcademicYearRequest {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}
export interface AcademicYearResponse {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
