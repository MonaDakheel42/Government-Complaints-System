import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { DbModule } from '../db/db.module';
import { EmailSender } from '../mail-sender';
import { EmployeeService } from 'src/employee/employee.service';
import { GovernmentService } from 'src/government/government.service';

@Module({
  imports: [DbModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, EmailSender,EmployeeService,GovernmentService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}

