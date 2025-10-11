import { z } from 'zod';
import { Gender, StaffPosition } from 'generated/prisma';

export class StaffValidation {
  static readonly CREATE = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    schoolId: z.string().uuid({ message: 'schoolId must be a valid UUID' }),
    position: z.enum(Object.values(StaffPosition) as [string, ...string[]]),
    phone: z
      .string()
      .min(8, { message: 'Phone number must be at least 8 digits' }),
    nik: z.string().min(3, { message: 'NIK must be at least 3 characters' }),
    nip: z.string().optional(),
    dob: z.coerce.date(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),
  });

  static readonly UPDATE = z.object({
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .optional(),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' })
      .optional(),
    schoolId: z
      .string()
      .uuid({ message: 'schoolId must be a valid UUID' })
      .optional(),
    position: z
      .enum(Object.values(StaffPosition) as [string, ...string[]])
      .optional(),
    phone: z.string().min(8).optional(),
    nik: z.string().min(3).optional(),
    nip: z.string().optional(),
    dob: z.coerce.date().optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }).optional(),
    isActive: z.boolean().optional(),
  });
}
