import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AdminsModule } from './admins/admins.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GovernmentModule } from './government/government.module';
import { EmailSender } from './mail-sender';
import { EmployeeModule } from './employee/employee.module';
import { BackupModule } from './backup/backup.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    AdminsModule,
    DbModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GovernmentModule,
    EmployeeModule,
    BackupModule,
    ComplaintsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService,EmailSender],
})
export class AppModule {}
