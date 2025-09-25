import { z } from 'zod';

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
    position: z
      .string()
      .min(2, { message: 'Position must be at least 2 characters' }),
    phone: z
      .string()
      .min(8, { message: 'Phone number must be at least 8 digits' }),
    nik: z.string().min(3, { message: 'NIK must be at least 3 characters' }),
    nip: z.string().optional(),
    dob: z.coerce.date(),
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
    position: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
    nik: z.string().min(3).optional(),
    nip: z.string().optional(),
    dob: z.coerce.date().optional(),
  });
}
