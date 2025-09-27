import { Module } from '@nestjs/common';
import { StudentDraftController } from './student-draft.controller';
import { StudentDraftService } from './student-draft.service';

@Module({
  controllers: [StudentDraftController],
  providers: [StudentDraftService]
})
export class StudentDraftModule {}
