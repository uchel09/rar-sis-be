import { z } from 'zod';

export class AuthValidation {
  // ✅ CREATE Class
  static readonly LOGIN = z.object({
    email: z.email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
  });
}
