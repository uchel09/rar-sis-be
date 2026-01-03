import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { SchoolModule } from './school/school.module';
import { SchoolAdminModule } from './school-admin/school-admin.module';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';
import { StudentParentModule } from './student-parent/student-parent.module';
import { TeacherModule } from './teacher/teacher.module';
import { ClassModule } from './class/class.module';
import { StudentClassHistoryModule } from './student-class-history/student-class-history.module';
import { StaffModule } from './staff/staff.module';
import { StudentDraftModule } from './student-draft/student-draft.module';
import { SubjectModule } from './subject/subject.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TimeTableModule } from './time-table/time-table.module';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { SubjectTeacherModule } from './subject-teacher/subject-teacher.module';
import { AuthMiddleware } from './common/auth.middleware';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,

    OrganizationModule,
    SchoolModule,
    SchoolAdminModule,
    StudentModule,
    ParentModule,
    StudentParentModule,
    TeacherModule,
    ClassModule,
    StudentClassHistoryModule,
    StaffModule,
    StudentDraftModule,
    SubjectModule,
    AttendanceModule,
    TimeTableModule,
    AcademicYearModule,
    SubjectTeacherModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('api/auth/login', 'api/auth/logout', 'api/auth/me')
      .forRoutes(
        // 🔒 YANG DIPROTEK
        { path: 'api/users/me', method: RequestMethod.GET },
        // { path: 'api/attendance', method: RequestMethod.ALL },
        // { path: 'api/subjects', method: RequestMethod.ALL },
        // { path: 'api/teachers', method: RequestMethod.ALL },
      );
  }
}
