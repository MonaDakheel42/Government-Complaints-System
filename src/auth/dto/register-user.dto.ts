import { IsString, IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Phone must contain only numbers and valid characters' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
