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
import { JwtPayload } from './strategies/jwt.strategy';
import { EmailSender } from '../mail-sender';

type PrincipalRole = 'user' | 'employee' | 'admin';



@Injectable()
export class AuthService {
  constructor(private readonly db: DbService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly mailSender: EmailSender) {}

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

    const user=await this.db.user.create({
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

   return await this.buildOtpResponse('User created. Verify OTP to activate account.', otp, dto.email);

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


    return await this.buildOtpResponse('OTP resent successfully', otp, dto.email);

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

    // return { message: 'Account verified successfully' };
    return this.issueAuthResponse('user', user.id);
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

    return this.issueAuthResponse('user', user.id);
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

    return this.issueAuthResponse('employee', emp.id);
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

    return this.issueAuthResponse('admin', admin.id);
  }

  async logoutUser(userId: number) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.persistRefreshToken('user', userId, null);

    return { message: 'Logged out successfully' };
  }

  async logoutEmployee(employeeId: number) {
    const employee = await this.db.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new UnauthorizedException('Employee not found');
    }

    await this.persistRefreshToken('employee', employeeId, null);

    return { message: 'Logged out successfully' };
  }

  async refreshUser(refreshToken: string) {
    return this.refreshTokens('user', refreshToken);
  }

  async refreshEmployee(refreshToken: string) {
    return this.refreshTokens('employee', refreshToken);
  }

  async refreshAdmin(refreshToken: string) {
    return this.refreshTokens('admin', refreshToken);
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

  // private buildOtpResponse(message: string, otp: string) {
  //   // TODO: Send OTP via email/SMS service
  //   console.log('OTP:', otp);
  //
  //   return {
  //     message,
  //     otp: process.env.NODE_ENV === 'development' ? otp : undefined,
  //   };
  // }
  private async buildOtpResponse(message: string, otp: string, email: string) {
    // send email
    await this.mailSender.mailTransport(
      email,
      'Your OTP Code',
      `<strong>Your activation code is: ${otp}</strong>`
    );

    return {
      message,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  private async issueAuthResponse(role: PrincipalRole, id: number) {
    const accessToken = await this.getToken(id, role);
    const refreshToken = await this.createRefreshToken(id, role);

    await this.persistRefreshToken(role, id, refreshToken);

    return { ...accessToken, refreshToken, role };
  }

  private async refreshTokens(role: PrincipalRole, refreshToken: string) {
    const principalId = await this.verifyRefreshToken(refreshToken, role);
    return this.issueAuthResponse(role, principalId);
  }

  private async createRefreshToken(id: number, role: PrincipalRole) {
    return this.jwtService.signAsync(
      {
        id,
        role,
        type: 'refresh',
      },
      {
        secret: this.getRefreshSecret(),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      },
    );
  }

  private getRefreshSecret() {
    return this.configService.get('REFRESH_TOKEN_SECRET') || this.configService.get('TOKEN_SECRET');
  }

  private async persistRefreshToken(role: PrincipalRole, id: number, refreshToken: string | null) {
    const hash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

    switch (role) {
      case 'user':
        await this.db.user.update({
          where: { id },
          data: { refreshTokenHash: hash } as any,
        });
        break;
      case 'employee':
        await this.db.employee.update({
          where: { id },
          data: { refreshTokenHash: hash } as any,
        });
        break;
      case 'admin':
        await this.db.admin.update({
          where: { id },
          data: { refreshTokenHash: hash } as any,
        });
        break;
    }
  }

  private async verifyRefreshToken(refreshToken: string, expectedRole: PrincipalRole) {
    let payload: JwtPayload & { type: 'refresh' };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.role !== expectedRole || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const principal = await this.findPrincipal(expectedRole, payload.id);

    if (!principal?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const match = await bcrypt.compare(refreshToken, principal.refreshTokenHash);
    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload.id;
  }

  private findPrincipal(role: PrincipalRole, id: number) {
    const select = { id: true, refreshTokenHash: true };

    switch (role) {
      case 'user':
        return this.db.user.findUnique({ where: { id }, select });
      case 'employee':
        return this.db.employee.findUnique({ where: { id }, select });
      case 'admin':
        return this.db.admin.findUnique({ where: { id }, select });
    }
  }
}
