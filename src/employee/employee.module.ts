import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CheckIdExistsAspect } from 'src/Aspects/CheckIdExistAspect';
import { UniqueCompositeAspect } from 'src/Aspects/UniqueCompositeAspect';
import { GovernmentService } from 'src/government/government.service';

@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    GovernmentService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CheckIdExistsAspect,
    },
    UniqueCompositeAspect,  
  ],
})
export class EmployeeModule {}
