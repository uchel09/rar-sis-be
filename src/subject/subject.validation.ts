import { z } from 'zod';
import { Grade } from 'generated/prisma';

export class SubjectValidation {
  static readonly CREATE = z.object({
    name: z.string().min(1, 'Nama subject harus diisi'),
    schoolId: z.string().uuid('School ID harus valid UUID'),
    grade: z.enum(Grade),
    subjectClassTeacher: z
      .array(
        z.object({
          classId: z.string().uuid('Class ID harus valid UUID'),
          teacherId: z.string().uuid('Teacher ID harus valid UUID'),
        }),
      )
      .optional(),
  });

  static readonly UPDATE = z.object({
    name: z.string().min(1).optional(),
    grade: z.enum(Grade).optional(),
    subjectClassTeacher: z
      .array(
        z.object({
          classId: z.string().uuid('Class ID harus valid UUID'),
          teacherId: z.string().uuid('Teacher ID harus valid UUID'),
        }),
      )
      .optional(),
  });
}
