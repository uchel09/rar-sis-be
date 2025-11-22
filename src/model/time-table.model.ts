import { DayOfWeek, Grade } from 'generated/prisma';

export interface CreateTimetableRequest {
  schoolId: string;
  subjectTeacherid?: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
}

export interface UpdateTimetableRequest {
  subjectTeacherid: string;
  classId?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface TimetableResponse {
  id: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  class?: {
    id: string;
    name: string;
    grade: Grade;
  } | null;
  subjectTeacher?: {
    id: string;
    teacherId: string;
    teacherFullname: string;
    subjectId: string;
    subjectName: string;
  } | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
