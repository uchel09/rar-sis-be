import { Module } from '@nestjs/common';
import { StudentParentService } from './student-parent.service';
import { StudentParentController } from './student-parent.controller';

@Module({
  providers: [StudentParentService],
  controllers: [StudentParentController]
})
export class StudentParentModule {}
