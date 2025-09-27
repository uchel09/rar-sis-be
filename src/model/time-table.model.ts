import { Semester, DayOfWeek } from 'generated/prisma';

export interface CreateTimetableRequest {
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  semester: Semester;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface UpdateTimetableRequest {
  teacherId?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
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
  createdAt: Date;
  updatedAt: Date;

  class?: { id: string; name: string };
  subject?: { id: string; name: string };
  teacher?: { id: string; fullName: string };
}
