import { AttendanceStatus, DayOfWeek, Grade, Semester } from 'generated/prisma';


// Request untuk CREATE Subject
export interface CreateSubjectRequest {
  name: string;
  grade: Grade;
  schoolId: string;

  // assign banyak class & teacher melalui pivot table
  subjectClassTeacher?: {
    classId: string;
    teacherId: string;
  }[];
}


// Request untuk UPDATE Subject
export interface UpdateSubjectRequest {
  name?: string;
  grade?: Grade;
  subjectClassTeacher?: {
    classId: string;
    teacherId: string;
  }[];
}


export interface SubjectResponse {
  id: string;
  name: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  grade: Grade;
  createdAt: Date; // bisa juga Date kalau mau
  updatedAt: Date;
  attendances?: AttendanceResponse[]; // optional
  timetables?: TimetableResponse[]; // optional
  subjectClassTeacher?: SubjectClassTeacherResponse[];
}

export interface SubjectClassTeacherResponse {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
}

export interface TimetableResponse {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  semester: Semester;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  id: string;
  studentId: string;
  subjectId: string;
  schoolId: string;
  semester: Semester;
  date: string;
  status: AttendanceStatus;
  note?: string;
  timetableId?: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}