import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/logIn.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseRoleAspect } from '../Aspects/decorators/use-role-aspect.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

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

  @Get('logout-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  async logoutUser(@CurrentUser('id') userId: number) {
    return this.authService.logoutUser(userId);
  }

  @Get('logout-employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  async logoutEmployee(@CurrentUser('id') employeeId: number) {
    return this.authService.logoutEmployee(employeeId);
  }

  @Post('refresh-user')
  @HttpCode(HttpStatus.OK)
  async refreshUser(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshUser(dto.refreshToken);
  }

  @Post('refresh-employee')
  @HttpCode(HttpStatus.OK)
  async refreshEmployee(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshEmployee(dto.refreshToken);
  }

  @Post('refresh-admin')
  @HttpCode(HttpStatus.OK)
  async refreshAdmin(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAdmin(dto.refreshToken);
  }
}
