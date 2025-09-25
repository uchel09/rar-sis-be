import { z } from 'zod';

export class SchoolAdminValidation {
  static readonly CREATE = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    schoolId: z.string().uuid({ message: 'schoolId must be a valid UUID' }),
    dob: z.coerce.date(), // otomatis parse string jadi Date
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
    schoolId: z
      .string()
      .uuid({ message: 'schoolId must be a valid UUID' })
      .optional(),
    dob: z.coerce.date().optional(),
  });
}
