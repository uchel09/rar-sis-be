/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `teacherId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `StudentClassHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `SchoolAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYearId` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Parent` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `dob` to the `SchoolAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `SchoolAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SchoolAdmin` table without a default value. This is not possible if the table is not empty.
  - Made the column `dob` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `academicYearId` to the `StudentClassHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `StudentClassHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remark` to the `StudentClassHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `StudentClassHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudentClassHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Made the column `hireDate` on table `Teacher` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'SICK', 'EXCUSED');

-- CreateEnum
CREATE TYPE "public"."Semester" AS ENUM ('SEMESTER_1', 'SEMESTER_2');

-- CreateEnum
CREATE TYPE "public"."DraftStatus" AS ENUM ('PENDING', 'APPROVED_PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DraftType" AS ENUM ('NEW_ENROLLMENT', 'TRANSFER_UP', 'TRANSFER_IN', 'TRANSFER_OUT', 'GRADUATED');

-- CreateEnum
CREATE TYPE "public"."StaffPosition" AS ENUM ('ADMINISTRATION', 'FINANCE', 'LIBRARY', 'SECURITY', 'CLEANING', 'FOODCOURT', 'SHOP', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."Jurusan" AS ENUM ('IPA', 'IPS');

-- CreateEnum
CREATE TYPE "public"."Grade" AS ENUM ('GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');

-- CreateEnum
CREATE TYPE "public"."AssessmentType" AS ENUM ('ASSIGNMENT', 'MID_EXAM', 'FINAL_EXAM', 'PRACTICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."GradingMode" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('SUPERADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'STAFF');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "teacherId",
DROP COLUMN "year",
ADD COLUMN     "Jurusan" "public"."Jurusan",
ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "grade" "public"."Grade" NOT NULL,
ADD COLUMN     "homeroomTeacherId" TEXT;

-- AlterTable
ALTER TABLE "public"."Parent" ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nik" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SchoolAdmin" ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nik" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "enrollmentNumber" DROP NOT NULL,
ALTER COLUMN "dob" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudentClassHistory" DROP COLUMN "year",
ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "grade" "public"."Grade" NOT NULL,
ADD COLUMN     "isRepeatedYear" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remark" TEXT NOT NULL,
ADD COLUMN     "semester" "public"."Semester" NOT NULL,
ADD COLUMN     "studentStatus" "public"."StudentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "hireDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "gender" "public"."Gender" NOT NULL;

-- CreateTable
CREATE TABLE "public"."StudentDraft" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "studentId" TEXT,
    "targetClassId" TEXT,
    "enrollmentNumber" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "parents" JSONB NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "grade" "public"."Grade" NOT NULL,
    "draftType" "public"."DraftType" NOT NULL,
    "status" "public"."DraftStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "position" "public"."StaffPosition" NOT NULL,
    "phone" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nip" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" "public"."Grade" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attendance" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "semester" "public"."Semester" NOT NULL,
    "approve" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceDetail" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "note" TEXT,

    CONSTRAINT "AttendanceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Timetable" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "subject_teacher_id" TEXT,
    "classId" TEXT NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubjectTeacher" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."AssessmentType" NOT NULL,
    "gradingMode" "public"."GradingMode" NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semester" "public"."Semester" NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentGrade" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "AssessmentGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "options" JSONB NOT NULL,
    "correct" TEXT NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamQuestionMedia" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ExamQuestionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentExam" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamAnswer" (
    "id" TEXT NOT NULL,
    "studentExamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentDraft_studentId_key" ON "public"."StudentDraft"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDraft_enrollmentNumber_key" ON "public"."StudentDraft"("enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "public"."Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_nik_key" ON "public"."Staff"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTeacher_subjectId_teacherId_key" ON "public"."SubjectTeacher"("subjectId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "public"."AcademicYear"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentGrade_assessmentId_studentId_key" ON "public"."AssessmentGrade"("assessmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_assessmentId_key" ON "public"."Exam"("assessmentId");

-- CreateIndex
CREATE INDEX "ExamQuestionMedia_questionId_idx" ON "public"."ExamQuestionMedia"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentExam_examId_studentId_key" ON "public"."StudentExam"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAnswer_studentExamId_questionId_key" ON "public"."ExamAnswer"("studentExamId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "public"."Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_nik_key" ON "public"."Parent"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "School_code_key" ON "public"."School"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAdmin_nik_key" ON "public"."SchoolAdmin"("nik");

-- AddForeignKey
ALTER TABLE "public"."StudentDraft" ADD CONSTRAINT "StudentDraft_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDraft" ADD CONSTRAINT "StudentDraft_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDraft" ADD CONSTRAINT "StudentDraft_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDraft" ADD CONSTRAINT "StudentDraft_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentClassHistory" ADD CONSTRAINT "StudentClassHistory_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "public"."Timetable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceDetail" ADD CONSTRAINT "AttendanceDetail_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "public"."Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceDetail" ADD CONSTRAINT "AttendanceDetail_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_subject_teacher_id_fkey" FOREIGN KEY ("subject_teacher_id") REFERENCES "public"."SubjectTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentGrade" ADD CONSTRAINT "AssessmentGrade_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentGrade" ADD CONSTRAINT "AssessmentGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamQuestionMedia" ADD CONSTRAINT "ExamQuestionMedia_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."ExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExam" ADD CONSTRAINT "StudentExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExam" ADD CONSTRAINT "StudentExam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAnswer" ADD CONSTRAINT "ExamAnswer_studentExamId_fkey" FOREIGN KEY ("studentExamId") REFERENCES "public"."StudentExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAnswer" ADD CONSTRAINT "ExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."ExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
