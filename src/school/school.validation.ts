import { z } from 'zod';

export class SchoolValidation {
  static readonly CREATE = z.object({
    organizationId: z.uuid({ message: 'organizationId must be a valid UUID' }),
    code: z.string().min(3, { message: 'code must be at least 3 characters' }),
    name: z.string().min(3, { message: 'name must be at least 3 characters' }),
    address: z.string().optional(),
  });

  static readonly UPDATE = z.object({
    organizationId: z
      .uuid({ message: 'organizationId must be a valid UUID' })
      .optional(),
    name: z.string().min(3).optional(),
    address: z.string().optional(),
  });
}
