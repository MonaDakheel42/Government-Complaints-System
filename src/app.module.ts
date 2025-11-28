import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AdminsModule } from './admins/admins.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GovernmentEntityModule } from './government-entity/government-entity.module';

@Module({
  imports: [
    UsersModule,
    AdminsModule,
    DbModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GovernmentEntityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
