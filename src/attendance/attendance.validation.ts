import { z } from 'zod';
import { AttendanceStatus, Semester } from 'generated/prisma';

export class AttendanceValidation {
  // Validasi CREATE Attendance
  static readonly CREATE = z.object({
    studentId: z.uuid('Student ID harus valid UUID'),
    subjectId: z.uuid('Subject ID harus valid UUID'),
    schoolId: z.uuid('School ID harus valid UUID'),
    timetableId: z.uuid(),
    teacherId: z.uuid(),
    date: z.coerce.date(),
    semester: z.enum(Semester, 'Semester harus valid'),
    status: z.enum(AttendanceStatus, 'Status harus valid'),
    note: z.string().optional(),
    academicYearId: z.uuid('Academic Year ID harus valid UUID'),
  });

  // Validasi UPDATE Attendance
  static readonly UPDATE = z.object({
    status: z.enum(AttendanceStatus, 'Status harus valid').optional(),
    note: z.string().optional(),
  });
}
