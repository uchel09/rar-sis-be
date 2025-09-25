import { Test, TestingModule } from '@nestjs/testing';
import { StudentClassHistoryController } from './student-class-history.controller';

describe('StudentClassHistoryController', () => {
  let controller: StudentClassHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentClassHistoryController],
    }).compile();

    controller = module.get<StudentClassHistoryController>(StudentClassHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
