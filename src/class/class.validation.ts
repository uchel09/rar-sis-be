import { z } from 'zod';
import { Grade } from 'generated/prisma';


export class ClassValidation {
  // CREATE Class
  static readonly CREATE = z.object({
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    teacherId: z.uuid().optional(),
    homeroomTeacherId: z.uuid().optional(),
    name: z
      .string()
      .min(1, { message: 'Class name must be at least 1 characters' }),
    year: z
      .number()
      .int()
      .positive({ message: 'Year must be a positive integer' }),
    grade: z.enum(Object.values(Grade) as [string, ...string[]]),
  });

  // UPDATE Class
  static readonly UPDATE = z.object({
    schoolId: z.uuid().optional(),
    teacherId: z.uuid().optional(),
    homeroomTeacherId: z.string().uuid().optional(),
    name: z.string().min(1).optional(),
    year: z.number().int().positive().optional(),
    grade: z.enum(Object.values(Grade) as [string, ...string[]]).optional(),
  });
}
