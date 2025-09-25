import { Test, TestingModule } from '@nestjs/testing';
import { StudentClassHistoryService } from './student-class-history.service';

describe('StudentClassHistoryService', () => {
  let service: StudentClassHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentClassHistoryService],
    }).compile();

    service = module.get<StudentClassHistoryService>(StudentClassHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
