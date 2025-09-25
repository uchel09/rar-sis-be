import { Module } from '@nestjs/common';
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

@Module({
  imports: [CommonModule, UserModule, AuthModule, OrganizationModule, SchoolModule, SchoolAdminModule, StudentModule, ParentModule, StudentParentModule, TeacherModule, ClassModule, StudentClassHistoryModule, StaffModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
