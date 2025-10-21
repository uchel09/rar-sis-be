import { z } from 'zod';
import { Grade } from 'generated/prisma';

export class ClassValidation {
  // ✅ CREATE Class
  static readonly CREATE = z.object({
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    homeroomTeacherId: z.uuid().optional(),
    name: z
      .string()
      .min(1, { message: 'Class name must be at least 1 character' }),
    academicYearId: z
      .uuid({ message: 'academicYearId must be a valid UUID' }),
    grade: z.enum(Object.values(Grade) as [string, ...string[]]),
  
  });

  // ✅ UPDATE Class
  static readonly UPDATE = z.object({
    schoolId: z.uuid().optional(),
    homeroomTeacherId: z.uuid().optional(),
    name: z.string().min(1).optional(),
    academicYearId: z.uuid().optional(),
    grade: z.enum(Object.values(Grade) as [string, ...string[]]).optional(),
  });
}
