import { z } from 'zod';
import { DayOfWeek } from 'generated/prisma';

// ======================
// 🔧 Helper Functions
// ======================
function isValidTimeFormat(time: string): boolean {
  return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function isEndTimeAfterStart(startTime: string, endTime: string): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime))
    return false;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em > sh * 60 + sm;
}

// ======================
// 🧩 Validation Schema
// ======================
export class TimetableValidation {
  static readonly CREATE = z
    .object({
      schoolId: z.uuid({ message: 'schoolId harus UUID' }),
      subjectTeacherid: z

        .uuid({ message: 'subjectTeacherid harus UUID' })
        .optional(), // karena di interface optional
      classId: z.uuid({ message: 'classId harus UUID' }),
      dayOfWeek: z.enum(DayOfWeek, { message: 'dayOfWeek tidak valid' }),
      startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: 'format startTime harus HH:mm',
      }),
      endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: 'format endTime harus HH:mm',
      }),
      isActive: z.boolean(),
    })
    .refine((data) => isEndTimeAfterStart(data.startTime, data.endTime), {
      message: 'endTime harus lebih besar dari startTime',
      path: ['endTime'],
    });

  static readonly UPDATE = z
    .object({
      subjectTeacherid: z
        .uuid({ message: 'subjectTeacherId harus UUID' }),
      classId: z.uuid({ message: 'classId harus UUID' }).optional(),
      dayOfWeek: z
        .nativeEnum(DayOfWeek, { message: 'dayOfWeek tidak valid' })
        .optional(),
      startTime: z
        .string()
        .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
          message: 'format startTime harus HH:mm',
        })
        .optional(),
      endTime: z
        .string()
        .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
          message: 'format endTime harus HH:mm',
        })
        .optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) =>
        !(data.startTime && data.endTime) ||
        isEndTimeAfterStart(data.startTime, data.endTime),
      {
        message: 'endTime harus lebih besar dari startTime',
        path: ['endTime'],
      },
    );
}
