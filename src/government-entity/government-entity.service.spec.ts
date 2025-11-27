import { Test, TestingModule } from '@nestjs/testing';
import { GovernmentEntityService } from './government-entity.service';

describe('GovernmentEntityService', () => {
  let service: GovernmentEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GovernmentEntityService],
    }).compile();

    service = module.get<GovernmentEntityService>(GovernmentEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
