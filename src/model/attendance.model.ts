import { Semester, AttendanceStatus, DayOfWeek } from 'generated/prisma';

export interface CreateAttendanceRequest {
  studentId: string;
  timetableId: string;
  schoolId: string;
  date: Date;
  semester: Semester;
  status: AttendanceStatus;
  note?: string;
}

export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  note?: string;
}

export interface AttendanceResponse {
  id: string;
  studentId: string;
  timetableId: string;
  schoolId: string;
  date: Date;
  semester: Semester;
  status: AttendanceStatus;
  note?: string;
  approve: boolean;
  createdAt: Date;
  updatedAt: Date;

  timetable: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    academicYear: {
      id: string;
      name: string;
    };
    subjectClassTeacher: {
      id: string;
      subject: {
        id: string;
        name: string;
      };
      class: {
        id: string;
        name: string;
      };
      teacher: {
        id: string;
        user: {
          id: string;
          fullName: string;
        };
      };
    };
  };
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
