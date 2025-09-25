import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentService } from './student-parent.service';

describe('StudentParentService', () => {
  let service: StudentParentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentParentService],
    }).compile();

    service = module.get<StudentParentService>(StudentParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
