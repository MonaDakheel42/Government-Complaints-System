import { Test, TestingModule } from '@nestjs/testing';
import { GovernmentEntityController } from './government-entity.controller';
import { GovernmentEntityService } from './government-entity.service';

describe('GovernmentEntityController', () => {
  let controller: GovernmentEntityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernmentEntityController],
      providers: [GovernmentEntityService],
    }).compile();

    controller = module.get<GovernmentEntityController>(GovernmentEntityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
