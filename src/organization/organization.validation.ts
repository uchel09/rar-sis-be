import { z } from 'zod';

export class OrganizationValidation {
  static readonly CREATE = z.object({
    name: z.string().min(3),
    code: z.string().min(3),
    address: z.string().optional(),
  });

  static readonly UPDATE = z.object({
    name: z.string().min(3).optional(),
    code: z.string().min(3).optional(),
    address: z.string().optional(),
  });
}
