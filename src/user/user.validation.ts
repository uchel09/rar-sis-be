import { z } from 'zod';
import { Gender, Role } from '@prisma/client';

export class UserValidation {
  static readonly REGISTER = z.object({
    email: z.email(),
    password: z.string().min(8),
    fullName: z.string().min(3),
    role: z.enum(Object.values(Role) as [string, ...string[]]), // ✅ no warning
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),
  });
}
