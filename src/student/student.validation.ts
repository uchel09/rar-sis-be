// src/validation/student.validation.ts
import { Gender } from 'generated/prisma';
import { z } from 'zod';

export class StudentValidation {
  static readonly CREATE = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    classId: z.uuid({ message: 'classId must be a valid UUID' }).optional(),
    enrollmentNumber: z
      .string()
      .min(3, { message: 'Enrollment number must be at least 3 characters' })
      .optional(),
    dob: z.coerce.date(),
    isActive: z.boolean(),
    address: z.string().optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),
    parentIds: z.array(z.uuid()).optional(),
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
    classId: z.uuid({ message: 'classId must be a valid UUID' }).optional(),
    enrollmentNumber: z.string().min(3).optional(),
    dob: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
    address: z.string().optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }).optional(),
    parentIds: z.array(z.uuid()).optional(),
  });
}
