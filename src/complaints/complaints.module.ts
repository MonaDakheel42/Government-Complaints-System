import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { DbModule } from '../db/db.module';
import { EmailSender } from '../mail-sender';

@Module({
  imports: [DbModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, EmailSender],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}

