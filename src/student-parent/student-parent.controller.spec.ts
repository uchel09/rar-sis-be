import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentController } from './student-parent.controller';

describe('StudentParentController', () => {
  let controller: StudentParentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentParentController],
    }).compile();

    controller = module.get<StudentParentController>(StudentParentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
