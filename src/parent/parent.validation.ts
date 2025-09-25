import { z } from 'zod';

export class ParentValidation {
  static readonly CREATE = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(3),
    phone: z.string(),
    address: z.string().optional(),
    dob: z.coerce.date(),
    studentIds: z.array(z.uuid()).optional(),
  });

  static readonly UPDATE = z.object({
    email: z.email().optional(),
    password: z.string().min(6).optional(),
    fullName: z.string().min(3).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    dob: z.coerce.date().optional(),
    studentIds: z.array(z.uuid()).optional(),
  });
}
