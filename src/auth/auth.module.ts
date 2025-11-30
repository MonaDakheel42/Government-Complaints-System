import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DbModule } from '../db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSender } from '../mail-sender';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET'),
        signOptions: { expiresIn: '6h' },
      }),
      inject: [ConfigService],
    }),
    DbModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,EmailSender],
  exports: [AuthService],
})
export class AuthModule {}
