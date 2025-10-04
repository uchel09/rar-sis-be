import { z } from 'zod';

export class AcademicYearValidation {
  static readonly CREATE = z
    .object({
      name: z
        .string()
        .regex(/^\d{4}\/\d{4}$/, { message: "Format harus 'YYYY/YYYY'" })
        .min(9)
        .max(9),
      startDate: z.coerce.date({ message: 'start date is required' }),
      endDate: z.coerce.date({ message: 'start date is required' }),

      isActive: z.boolean().optional(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: 'End date harus lebih besar dari start date',
      path: ['endDate'],
    });

  static readonly UPDATE = z
    .object({
      name: z
        .string()
        .regex(/^\d{4}\/\d{4}$/)
        .optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) =>
        !data.startDate ||
        !data.endDate ||
        (data.startDate && data.endDate && data.endDate > data.startDate),
      {
        message: 'End date harus lebih besar dari start date',
        path: ['endDate'],
      },
    );
}
