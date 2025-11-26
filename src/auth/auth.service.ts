import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from './dto/logIn.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { DbService } from '../db/db.service';
import { Token } from './types/token';
import { ResendOtpDto } from './dto/resend-otp.dto';



@Injectable()
export class AuthService {
  constructor(private readonly db: DbService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService) {}

  async registerUser(dto: RegisterUserDto) {
    // Check if email already exists
    const exists = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ForbiddenException('Email already exists');

    // Check if phone already exists
    const phoneExists = await this.db.user.findUnique({
      where: { phone: dto.phone },
    });
    if (phoneExists) throw new ForbiddenException('Phone number already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const { otp, otpExpiresAt } = this.generateOtpPayload();

    await this.db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        otpCode: otp,
        otpExpiresAt: otpExpiresAt,
        otpAttempts: 0,
        isActive: false,
      },
    });

    return this.buildOtpResponse('User created. Verify OTP to activate account.', otp);
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isActive) {
      throw new ForbiddenException('Account already verified');
    }

    const { otp, otpExpiresAt } = this.generateOtpPayload();

    await this.db.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt,
        otpAttempts: 0,
      },
    });

    return this.buildOtpResponse('OTP resent successfully', otp);
  }

  // ----------------------------------
  // 2) Verify OTP
  // ----------------------------------
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.db.user.findUnique({ 
      where: { email: dto.email } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if OTP exists
    if (!user.otpCode) {
      throw new UnauthorizedException('No OTP code found. Please request a new one.');
    }

    // Check if OTP has expired
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      await this.db.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
      });
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Check if too many attempts (max 5 attempts)
    if (user.otpAttempts >= 5) {
      throw new ForbiddenException('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (user.otpCode !== dto.otp) {
      await this.db.user.update({
        where: { id: user.id },
        data: { otpAttempts: user.otpAttempts + 1 },
      });
      throw new UnauthorizedException(`Invalid OTP. ${4 - user.otpAttempts} attempts remaining.`);
    }

    // OTP is valid - activate account
    await this.db.user.update({
      where: { id: user.id },
      data: { 
        isActive: true, 
        otpCode: null, 
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    return { message: 'Account verified successfully' };
  }

  // ----------------------------------
  // 3) Login User
  // ----------------------------------
  async loginUser(dto: LogInDto) {
    const user = await this.db.user.findUnique({ 
      where: { email: dto.email } 
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account not verified. Please verify your email first.');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.getToken(user.id, 'user');

    return { token, role: 'user' };
  }

  // ----------------------------------
  // 4) Login Employee
  // ----------------------------------
  async loginEmployee(dto: LogInDto) {
    const emp = await this.db.employee.findUnique({ 
      where: { email: dto.email } 
    });
    
    if (!emp) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!emp.isActive) {
      throw new ForbiddenException('Employee account is inactive');
    }

    const match = await bcrypt.compare(dto.password, emp.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.getToken(emp.id, 'employee');

    return { token, role: 'employee' };
  }

  // ----------------------------------
  // 5) Login Admin
  // ----------------------------------
  async loginAdmin(dto: LogInDto) {
    const admin = await this.db.admin.findUnique({ 
      where: { email: dto.email } 
    });
    
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, admin.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.getToken(admin.id, 'admin');

    return { token, role: 'admin' };
  }

  // ----------------------------------
  // Generate JWT Token
  // ----------------------------------
  async getToken(id: number, role: string): Promise<Token> {
    const token = await this.jwtService.signAsync(
      {
        id: id,
        role: role,
      },
      {
        secret: this.configService.get('TOKEN_SECRET'),
        expiresIn: '6h',
      },
    );

    return { token };
  }

  private generateOtpPayload() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    return { otp, otpExpiresAt };
  }

  private buildOtpResponse(message: string, otp: string) {
    // TODO: Send OTP via email/SMS service
    console.log('OTP:', otp);

    return {
      message,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }
}
