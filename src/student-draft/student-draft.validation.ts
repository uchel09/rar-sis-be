import { DraftStatus, DraftType, Gender, Grade } from '@prisma/client';
import { z } from 'zod';

export class StudentDraftValidation {
  static readonly PARENT = z.object({
    id: z.uuid().optional(),
    fullName: z
      .string()
      .min(3, { message: 'Parent full name must be at least 3 characters' }),
    phone: z.string().min(10, { message: 'Phone number too short' }),
    address: z.string().optional(),
    email: z.email({ message: 'Invalid email address' }),
    nik: z.string(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),

  });

  static readonly CREATE = z.object({
    email: z.email({ message: 'Invalid email address' }),
    fullName: z
      .string()
      .min(3, { message: 'Full name must be at least 3 characters' }),
    academicYearId: z
      .string()
      .uuid({ message: 'academicYearId must be a valid UUID' }),
    classId: z.uuid().optional(),
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    targetClassId: z.uuid().optional(),
    studentId: z.uuid().optional(),
    enrollmentNumber: z.string().optional(),
    dob: z.coerce.date(),
    address: z.string().optional(),
    grade: z.enum(Grade),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }),

    parents: z.array(StudentDraftValidation.PARENT),

    draftType: z.enum(DraftType),
    status: z.enum(DraftStatus).optional(),
    createdBy: z.uuid().optional(),
    verifiedBy: z.uuid().optional(),
    verifiedAt: z.coerce.date().optional(),
    rejectionReason: z.string().optional(),
  });

  static readonly UPDATE = z.object({
    email: z.email().optional(),
    fullName: z.string().min(3).optional(),
    targetClassId: z.uuid().optional(),
    studentId: z.uuid().optional(),
    schoolId: z.uuid({ message: 'schoolId must be a valid UUID' }),
    enrollmentNumber: z.string().optional(),
    academicYearId: z.uuid().optional(),
    dob: z.coerce.date().optional(),
    address: z.string().optional(),
    grade: z.enum(Grade).optional(),
    gender: z.enum(Gender, { message: 'Invalid Gender value' }).optional(),
    parents: z.array(StudentDraftValidation.PARENT).optional(),
    draftType: z.enum(DraftType).optional(),
    status: z.enum(DraftStatus).optional(),
    createdBy: z.uuid().optional(),
    verifiedBy: z.uuid().optional(),
    verifiedAt: z.coerce.date().optional(),
    rejectionReason: z.string().optional(),
  });
}
