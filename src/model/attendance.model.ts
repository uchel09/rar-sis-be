import {
  AttendanceDetail,
  AttendanceStatus,
  DayOfWeek,
  Semester,
} from 'generated/prisma';

export class GenerateBulkAttendanceDto {
  classId: string;
  subjectTeacherId: string;
  semester: Semester; // "GANJIL" atau "GENAP"
}

// enum AttendanceStatus {
//   PRESENT
//   ABSENT
//   SICK
//   EXCUSED
// }

export interface AttendanceBulkResponse {
  count: number;
  classId: string;
  subjectTeacherId: string;
  teacherName: string;
  subjectName: string;
  semester: Semester;
  students: {
    studentId: string;
    fullName: string;
  }[];
  attendances: AttendanceItem[];
}

export interface AttendanceItem {
  id: string;
  date: Date;
  semester: Semester;
  approve: boolean;
  attendancesDetails: AttendanceDetail[];
  timetable: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    classId: string;
    subjectTeacherid: string | null;
  };
}

export interface CreateAttendanceDetailDto {
  students: { studentId: string; fullName: string }[];
  defaultStatus?: AttendanceStatus;
}

// DTO untuk bulk update
export interface UpdateAttendanceDetailDto {
  updates: { studentId: string; status?: AttendanceStatus; note?: string }[];
  approve?: boolean;
}

export interface AttendanceDetailItem {
  id: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note: string | null;
}
