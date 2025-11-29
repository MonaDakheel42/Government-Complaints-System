import { Module } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { GovernmentEntityController } from './government-entity.controller';
import { DbModule } from 'src/db/db.module';
import { CheckIdExistsAspect } from 'src/Aspects/CheckIdExistAspect';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UniqueFieldAspect } from 'src/Aspects/UniqueFieldAspect';
import { UniqueCompositeAspect } from 'src/Aspects/UniqueCompositeAspect';

@Module({
  imports: [DbModule],
  controllers: [GovernmentEntityController],
  providers: [
    GovernmentEntityService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CheckIdExistsAspect,
    },
    UniqueCompositeAspect,
  ],
})
export class GovernmentEntityModule {}
