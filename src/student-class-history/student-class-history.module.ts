import { Module } from '@nestjs/common';
import { StudentClassHistoryService } from './student-class-history.service';
import { StudentClassHistoryController } from './student-class-history.controller';

@Module({
  providers: [StudentClassHistoryService],
  controllers: [StudentClassHistoryController]
})
export class StudentClassHistoryModule {}
