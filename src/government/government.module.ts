import { Module } from '@nestjs/common';
import { GovernmentService } from './government.service';
import { GovernmentController } from './government.controller';
import { DbModule } from 'src/db/db.module';
import { CheckIdExistsAspect } from 'src/Aspects/CheckIdExistAspect';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UniqueFieldAspect } from 'src/Aspects/UniqueFieldAspect';
import { UniqueCompositeAspect } from 'src/Aspects/UniqueCompositeAspect';

@Module({
  imports: [DbModule],
  controllers: [GovernmentController],
  providers: [
    GovernmentService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CheckIdExistsAspect,
    },
    UniqueCompositeAspect,
  ],
})
export class GovernmentModule {}
