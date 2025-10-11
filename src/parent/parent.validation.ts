import { Gender } from 'generated/prisma';
import { z } from 'zod';

export class ParentValidation {
  static readonly CREATE = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(3),
    phone: z.string(),
    address: z.string().optional(),
    dob: z.coerce.date(),
    nik: z.string(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),
    studentIds: z.array(z.uuid()).optional(),
  });

  static readonly UPDATE = z.object({
    email: z.email().optional(),
    password: z.string().min(6).optional(),
    fullName: z.string().min(3).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    dob: z.coerce.date().optional(),
    nik: z.string().optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }).optional(),
    studentIds: z.array(z.uuid()).optional(),
  });
}
