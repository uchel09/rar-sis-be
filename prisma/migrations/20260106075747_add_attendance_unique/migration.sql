/*
  Warnings:

  - A unique constraint covering the columns `[timetableId,date,semester]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_timetableId_date_semester_key" ON "public"."Attendance"("timetableId", "date", "semester");
