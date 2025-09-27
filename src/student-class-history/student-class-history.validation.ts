import { z } from 'zod';
import { Semester } from 'generated/prisma';

export class StudentClassHistoryValidation {
  static readonly CREATE = z.object({
    studentId: z.string().min(1),
    classId: z.string().min(1),
    year: z.number().int().gte(2000).lte(2100), // bisa disesuaikan range tahunnya
    semester: z.enum(Semester),
  });

  static readonly UPDATE = z.object({
    classId: z.string().min(1).optional(),
    year: z.number().int().gte(2000).lte(2100).optional(),
    semester: z.enum(Semester).optional(),
  });
}
