import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/logIn.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('login-user')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() dto: LogInDto) {
    return this.authService.loginUser(dto);
  }

  @Post('login-employee')
  @HttpCode(HttpStatus.OK)
  async loginEmployee(@Body() dto: LogInDto) {
    return this.authService.loginEmployee(dto);
  }

  @Post('login-admin')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(@Body() dto: LogInDto) {
    return this.authService.loginAdmin(dto);
  }
}
