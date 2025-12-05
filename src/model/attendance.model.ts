import { AttendanceStatus, DayOfWeek, Semester } from 'generated/prisma';

export class GenerateBulkAttendanceDto {
  classId: string;
  subjectTeacherId: string;
  semester: Semester; // "GANJIL" atau "GENAP"
}

export interface CreateAttendanceRequest {
  studentId: string;
  timetableId: string;
  schoolId: string;
  date: Date;
  semester: Semester;
  status: AttendanceStatus;
  note?: string;
  approve: boolean; // optional, backend default bisa false
}

// enum AttendanceStatus {
//   PRESENT
//   ABSENT
//   SICK
//   EXCUSED
// }

export interface UpdateAttendanceRequest {
  id: string;
  status?: AttendanceStatus;
  note?: string;
}
export interface AttendanceResponse {
  id: string;
  date: Date;
  status: AttendanceStatus;
  note?: string;
  approve: boolean;

  student: {
    id: string;
    fullName: string;
  };

  timetable: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    classId: string;
    subjectTeacherid: string | null;
  };
}

export interface AttendanceBulkResponse {
  count: number;
  classId: string;
  subjectTeacherId: string;
  teacherName: string;
  subjectName: string;
  semester: Semester;
  attendances: AttendanceItem[];
}

export interface AttendanceItem {
  id: string;
  date: Date;
  semester: Semester;
  approve: boolean;

  timetable: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    classId: string;
    subjectTeacherid: string|null;
    
  };
}