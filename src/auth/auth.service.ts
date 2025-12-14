import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { FCMnDto } from './dto/fcm-firebace.dto';


type PrincipalRole = 'user' | 'employee' | 'admin';



@Injectable()
export class AuthService {
  constructor(private readonly db: DbService,
    private readonly employeeService: EmployeeService,
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
      throw new UnauthorizedException('Email not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account not verified. Please verify your email first.');
    }

    // Check if account is locked
    const accountLockedUntil = user.accountLockedUntil;
    if (accountLockedUntil && new Date() < accountLockedUntil) {
      const minutesRemaining = Math.ceil((accountLockedUntil.getTime() - new Date().getTime()) / 60000);
      throw new ForbiddenException(`Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`);
    }

    // // Rate limiting: Check if last failed attempt was less than 5 seconds ago
    // const lastFailedLoginAttempt = (user as any).lastFailedLoginAttempt;
    // if (lastFailedLoginAttempt) {
    //   const timeSinceLastAttempt = new Date().getTime() - lastFailedLoginAttempt.getTime();
    //   const minTimeBetweenAttempts = 5000; // 5 seconds
    //   if (timeSinceLastAttempt < minTimeBetweenAttempts) {
    //     const waitTime = Math.ceil((minTimeBetweenAttempts - timeSinceLastAttempt) / 1000);
    //     throw new ForbiddenException(`Too many login attempts. Please wait ${waitTime} second(s) before trying again.`);
    //   }
    // }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxAttempts = 5;
      const lockoutDuration = 30; // 30 minutes

      let accountLockedUntil: Date | null = null;
      
      // Lock account after max attempts
      if (failedAttempts >= maxAttempts) {
        accountLockedUntil = new Date();
        accountLockedUntil.setMinutes(accountLockedUntil.getMinutes() + lockoutDuration);
        
        // Send email notification about account lockout
        try {
          const emailHtml = `
            <h2>Account Locked - Security Alert</h2>
            <p>Dear ${user.name},</p>
            <p>Your account has been temporarily locked due to ${maxAttempts} failed login attempts.</p>
            <p><strong>Account:</strong> ${user.email}</p>
            <p><strong>Lockout Duration:</strong> ${lockoutDuration} minutes</p>
            <p><strong>Locked Until:</strong> ${accountLockedUntil.toLocaleString()}</p>
            <p>If this was not you, please contact support immediately.</p>
            <p>For security reasons, please ensure you are using the correct password.</p>
          `;
          await this.mailSender.mailTransport(
            user.email,
            'Account Locked - Security Alert',
            emailHtml,
          );
        } catch (error) {
          console.error('Error sending lockout notification email:', error);
        }
      }

      await this.db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          accountLockedUntil,
        } as any,
      });

      const remainingAttempts = maxAttempts - failedAttempts;
      if (failedAttempts >= maxAttempts) {
        throw new ForbiddenException(`Account locked due to too many failed login attempts. Please try again after ${lockoutDuration} minutes.`);
      }
      
      throw new UnauthorizedException(`The password is incorrect. ${remainingAttempts} attempt(s) remaining.`);
    }

    // Successful login - reset failed attempts
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      await this.db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
        } as any,
      });
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
      throw new UnauthorizedException('Email not found');
    }
    await this.employeeService.isActive(emp.id);
    // if (!emp.isActive) {
    //   throw new ForbiddenException('Employee account is inactive');
    // }

    // Check if account is locked
    const empAccountLockedUntil = emp.accountLockedUntil;
    if (empAccountLockedUntil && new Date() < empAccountLockedUntil) {
      const minutesRemaining = Math.ceil((empAccountLockedUntil.getTime() - new Date().getTime()) / 60000);
      throw new ForbiddenException(`Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`);
    }

    // Rate limiting: Check if last failed attempt was less than 5 seconds ago
    // const empLastFailedLoginAttempt = emp.lastFailedLoginAttempt;
    // if (empLastFailedLoginAttempt) {
    //   const timeSinceLastAttempt = new Date().getTime() - empLastFailedLoginAttempt.getTime();
    //   const minTimeBetweenAttempts = 5000; // 5 seconds
    //   if (timeSinceLastAttempt < minTimeBetweenAttempts) {
    //     const waitTime = Math.ceil((minTimeBetweenAttempts - timeSinceLastAttempt) / 1000);
    //     throw new ForbiddenException(`Too many login attempts. Please wait ${waitTime} second(s) before trying again.`);
    //   }
    // }

    const match = await bcrypt.compare(dto.password, emp.password);
    if (!match) {
      // Increment failed attempts
      const failedAttempts = (emp.failedLoginAttempts || 0) + 1;
      const maxAttempts = 5;
      const lockoutDuration = 30; // 30 minutes

      let accountLockedUntil: Date | null = null;
      
      // Lock account after max attempts
      if (failedAttempts >= maxAttempts) {
        accountLockedUntil = new Date();
        accountLockedUntil.setMinutes(accountLockedUntil.getMinutes() + lockoutDuration);
        
        // Send email notification about account lockout
        try {
          const employeeName = `${emp.firstName} ${emp.lastName}`;
          const emailHtml = `
            <h2>Account Locked - Security Alert</h2>
            <p>Dear ${employeeName},</p>
            <p>Your employee account has been temporarily locked due to ${maxAttempts} failed login attempts.</p>
            <p><strong>Account:</strong> ${emp.email}</p>
            <p><strong>Lockout Duration:</strong> ${lockoutDuration} minutes</p>
            <p><strong>Locked Until:</strong> ${accountLockedUntil.toLocaleString()}</p>
            <p>If this was not you, please contact your administrator immediately.</p>
            <p>For security reasons, please ensure you are using the correct password.</p>
          `;
          await this.mailSender.mailTransport(
            emp.email,
            'Employee Account Locked - Security Alert',
            emailHtml,
          );
        } catch (error) {
          console.error('Error sending lockout notification email:', error);
        }
      }

      await this.db.employee.update({
        where: { id: emp.id },
        data: {
          failedLoginAttempts: failedAttempts,
          accountLockedUntil,
        } as any,
      });

      const remainingAttempts = maxAttempts - failedAttempts;
      if (failedAttempts >= maxAttempts) {
        throw new ForbiddenException(`Account locked due to too many failed login attempts. Please try again after ${lockoutDuration} minutes.`);
      }
      
      throw new UnauthorizedException(`The password is incorrect. ${remainingAttempts} attempt(s) remaining.`);
    }

    // Successful login - reset failed attempts
    if (emp.failedLoginAttempts > 0 || emp.accountLockedUntil) {
      await this.db.employee.update({
        where: { id: emp.id },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        } as any,
      });
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
      throw new UnauthorizedException('Email not found');
    }
    const match = await bcrypt.compare(dto.password, admin.password);
    if (!match) { 
      throw new UnauthorizedException(`The password is incorrect.`);
    }

    return this.issueAuthResponse('admin', admin.id);
  }

  // ----------------------------------
  // 5) Logout user
  // ----------------------------------
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

  // ----------------------------------
  // 5) Logout employee
  // ----------------------------------
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


  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const employee = await this.db.employee.findUnique({
      where: { email: resetPasswordDto.email },
      select: { id: true, email: true ,firstName:true} });

    if (!employee) {
      throw new BadRequestException('employee not found!');
    }

    const newHashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.db.employee.update({
      where: { id: employee.id },
      data: { password: newHashedPassword },
    });
    return {
      message: `the password for this employee ${employee.firstName} has been updated successfully`,
    };
  }

  // ----------------------------------
  // Forget Password (User only)
  // ----------------------------------
  async forgetPassword(dto: ForgetPasswordDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is not active. Please verify your account first.');
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

    // Send OTP via email
    await this.mailSender.mailTransport(
      user.email,
      'Password Reset OTP',
      `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password. Please use the following OTP code to reset your password:</p>
        <p><strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    );

    return {
      message: 'OTP code has been sent to your email. Please check your inbox.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  // ----------------------------------
  // Reset Password with OTP (User only)
  // ----------------------------------
  async resetPasswordWithOtp(dto: ResetPasswordWithOtpDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found!');
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

    // OTP is valid - reset password
    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.db.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    return {
      message: 'Password has been reset successfully. You can now login with your new password.',
    };
  }



  // ----------------------------------
  // 5) Refresh user
  // ----------------------------------
  async refreshUser(refreshToken: string) {
    return this.refreshTokens('user', refreshToken);
  }

  // ----------------------------------
  // 5) Refresh employee
  // ----------------------------------
  async refreshEmployee(refreshToken: string) {
    return this.refreshTokens('employee', refreshToken);
  }

  // ----------------------------------
  // 5) Refresh admin
  // ----------------------------------
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
  // ----------------------------------
  // Generate OTP Code
  // ----------------------------------
  private generateOtpPayload() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    return { otp, otpExpiresAt };
  }

  // ----------------------------------
  // Send OTP Code
  // ----------------------------------
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

  // ----------------------------------
  // Generate Access & Refresh Tokens
  // ----------------------------------
  private async issueAuthResponse(role: PrincipalRole, id: number) {
    const accessToken = await this.getToken(id, role);
    const refreshToken = await this.createRefreshToken(id, role);

    await this.persistRefreshToken(role, id, refreshToken);

    return { ...accessToken, refreshToken, role };
  }

  // ----------------------------------
  //  Refresh Token
  // ----------------------------------
  private async refreshTokens(role: PrincipalRole, refreshToken: string) {
    const principalId = await this.verifyRefreshToken(refreshToken, role);
    return this.issueAuthResponse(role, principalId);
  }


  // ----------------------------------
  // Generate Refresh Tokens
  // ----------------------------------
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
  
  async updateFcmToken(userId: number, dto: FCMnDto) {
    return this.db.user.update({
      where: { id: userId },
      data: { fcmToken:dto.fcmToken },
    });
  }

}
