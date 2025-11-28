import { Module } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { GovernmentEntityController } from './government-entity.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [GovernmentEntityController],
  providers: [GovernmentEntityService],
})
export class GovernmentEntityModule {}
