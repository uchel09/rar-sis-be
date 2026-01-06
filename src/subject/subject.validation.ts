import { z } from 'zod';
import { Grade } from '@prisma/client';

export class SubjectValidation {
  static readonly CREATE = z.object({
    name: z.string().min(1, 'Nama subject harus diisi'),
    schoolId: z.string().uuid('School ID harus valid UUID'),
    grade: z.enum(Grade),
  });

  static readonly UPDATE = z.object({
    name: z.string().min(1).optional(),
    grade: z.enum(Grade).optional(),
  });
}
