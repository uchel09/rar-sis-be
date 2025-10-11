import { Gender } from 'generated/prisma';
import { z } from 'zod';

export class TeacherValidation {
  static readonly CREATE = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    schoolId: z.string().uuid({ message: 'schoolId must be a valid UUID' }),
    nik: z.string().min(3, { message: 'NIK must be at least 3 characters' }),
    nip: z.string().optional(),
    hireDate: z.date().optional(),
    dob: z.date(),
    phone: z.string().min(12),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),
  });

  static readonly UPDATE = z.object({
    email: z.email({ message: 'Invalid email address' }).optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .optional(),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' })
      .optional(),
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }).optional(),
    nik: z.string().min(3).optional(),
    nip: z.string().optional(),
    hireDate: z.date().optional(),
    phone: z.string().min(12),
    dob: z.date().optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }).optional(),
    isActive: z.boolean().optional(),
  });
}
