import { z } from 'zod';
import { Grade, Semester, StudentStatus } from '@prisma/client';

export class StudentClassHistoryValidation {
  // ✅ CREATE
  static readonly CREATE = z.object({
    studentId: z.string().uuid({ message: 'studentId must be a valid UUID' }),
    classId: z.string().uuid({ message: 'classId must be a valid UUID' }),
    academicYearId: z
      .string()
      .uuid({ message: 'academicYearId must be a valid UUID' }),
    semester: z.enum(Semester, { message: 'Invalid semester value' }),
    isRepeatedYear: z.boolean(),
    remark: z.string(),
    studentStatus: z.enum(StudentStatus, {
      message: 'Invalid Student Status value',
    }),
    grade: z.enum(Grade, { message: 'Invalid Grade value' })
  });

  // ✅ UPDATE
  static readonly UPDATE = z.object({
    studentId: z
      .string()
      .uuid({ message: 'studentId must be a valid UUID' })
      .optional(),
    classId: z.uuid({ message: 'classId must be a valid UUID' }).optional(),
    academicYearId: z
      .uuid({ message: 'academicYearId must be a valid UUID' })
      .optional(),
    semester: z
      .enum(Semester, { message: 'Invalid semester value' })
      .optional(),
    isRepeatedYear: z.boolean().optional(),
    remark: z.string().optional(),
    studentStatus: z
      .enum(StudentStatus, {
        message: 'Invalid Student Status value',
      })
      .optional(),
    grade: z.enum(Grade, { message: 'Invalid Grade value' }).optional(),
  });
}
