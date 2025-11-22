export interface CreateSubjectTeacherRequest {
  subjectId: string;
  teacherId: string;
}

// Request untuk UPDATE Subject
export interface UpdateSubjectTeacherRequest {
  subjectId?: string;
  teacherId?: string;
}

export interface SubjectTeacherResponse {
  id: string;
  subject?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    user: {
      fullname: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
