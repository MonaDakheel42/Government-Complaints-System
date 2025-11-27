import { Module } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { GovernmentEntityController } from './government-entity.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GovernmentEntityController],
  providers: [GovernmentEntityService],
})
export class GovernmentEntityModule {}
