import { Semester, AttendanceStatus } from 'generated/prisma';

export interface CreateAttendanceRequest {
  studentId: string;
  subjectId: string;
  schoolId: string;
  semester: Semester;
  date: Date;
  status: AttendanceStatus;
  note?: string;
  timetableId: string;
  teacherId: string;
}

export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  note?: string;
  timetableId?: string;
  teacherId?: string;
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
  timetableId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkAttendanceRequest {
  subjectId: string;
  schoolId: string;
  date: Date; // Date object atau ISO string, tetap pakai date
  semester: Semester;
  attendances: {
    studentId: string;
    status: AttendanceStatus;
    note?: string;
    timetableId: string;
    teacherId?: string | null;
  }[];
}

