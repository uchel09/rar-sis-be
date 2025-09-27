import { DraftStatus, DraftType, Grade } from 'generated/prisma';
import { z } from 'zod';

export class StudentDraftValidation {
  static readonly PARENT = z.object({
    id: z.uuid().optional(),
    fullName: z
      .string()
      .min(3, { message: 'Parent full name must be at least 3 characters' }),
    phone: z.string().min(10).optional(),
    address: z.string().optional(),
    email: z.email({ message: 'Invalid email address' }).optional(),
  });

  static readonly CREATE = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    classId: z.uuid({ message: 'classId must be a valid UUID' }).optional(),
    targetClassId: z
      .uuid({ message: 'targetClassId must be a valid UUID' })
      .optional(),
    enrollmentNumber: z
      .string()
      .min(1, { message: 'Enrollment number is required' }),
    dob: z.coerce.date(),
    address: z.string().optional(),
    grade: z.enum(Grade),

    parents: z.array(StudentDraftValidation.PARENT),

    draftType: z.enum(Object.values(DraftType) as [string, ...string[]]),
  });

  static readonly UPDATE = z.object({
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' })
      .optional(),
    classId: z.uuid({ message: 'classId must be a valid UUID' }).optional(),
    targetClassId: z
      .uuid({ message: 'targetClassId must be a valid UUID' })
      .optional(),
    enrollmentNumber: z.string().optional(),
    dob: z.coerce.date().optional(),
    address: z.string().optional(),
    parents: z.array(StudentDraftValidation.PARENT).optional(),
    
    grade: z.enum(Grade).optional(),
    draftType: z
      .enum(Object.values(DraftType) as [string, ...string[]])
      .optional(),
    draftStatus: z
      .enum(Object.values(DraftStatus) as [string, ...string[]])
      .optional(),
  });
}
