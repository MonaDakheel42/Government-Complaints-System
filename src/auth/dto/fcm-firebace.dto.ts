import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class FCMnDto {
  @IsNotEmpty({ message: 'fcm is required' })
  @IsString({ message: 'fcm token must be a string' })
  fcmToken: string;
}
