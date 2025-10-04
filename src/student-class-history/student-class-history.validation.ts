import { z } from 'zod';
import { Semester } from 'generated/prisma';

export class StudentClassHistoryValidation {
  // ✅ CREATE
  static readonly CREATE = z.object({
    studentId: z.string().uuid({ message: 'studentId must be a valid UUID' }),
    classId: z.string().uuid({ message: 'classId must be a valid UUID' }),
    academicYearId: z
      .string()
      .uuid({ message: 'academicYearId must be a valid UUID' }),
    semester: z.nativeEnum(Semester, { message: 'Invalid semester value' }),
  });

  // ✅ UPDATE
  static readonly UPDATE = z.object({
    classId: z
      .string()
      .uuid({ message: 'classId must be a valid UUID' })
      .optional(),
    academicYearId: z
      .string()
      .uuid({ message: 'academicYearId must be a valid UUID' })
      .optional(),
    semester: z
      .nativeEnum(Semester, { message: 'Invalid semester value' })
      .optional(),
  });
}
