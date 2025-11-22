import { z } from 'zod';

export class SubjectTeacherValidation {
  static readonly CREATE = z.object({
    subjectId: z.string({
      message: 'Subject ID wajib diisi',
    }),
    teacherId: z.string({
      message: 'Teacher ID wajib diisi',
    }),
  });

  static readonly UPDATE = z.object({
    subjectId: z.string().optional(),
    teacherId: z.string().optional(),
  });
}
