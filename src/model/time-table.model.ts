import { Semester, DayOfWeek } from 'generated/prisma';

export interface CreateTimetableRequest {
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  semester: Semester;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean
}

export interface UpdateTimetableRequest {
  teacherId?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

export interface TimetableResponse {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  semester: Semester;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  class?: { id: string; name: string };
  subject?: { id: string; name: string };
  teacher?: { id: string; fullName: string };
}
