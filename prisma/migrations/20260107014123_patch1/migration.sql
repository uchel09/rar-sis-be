/*
  Warnings:

  - A unique constraint covering the columns `[attendanceId,studentId]` on the table `AttendanceDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolId,name,academicYearId]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `StudentDraft` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId,dayOfWeek,startTime,endTime]` on the table `Timetable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDetail_attendanceId_studentId_key" ON "public"."AttendanceDetail"("attendanceId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_schoolId_name_academicYearId_key" ON "public"."Class"("schoolId", "name", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDraft_email_key" ON "public"."StudentDraft"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_classId_dayOfWeek_startTime_endTime_key" ON "public"."Timetable"("classId", "dayOfWeek", "startTime", "endTime");
