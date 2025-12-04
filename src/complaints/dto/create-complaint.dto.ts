import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty({ message: 'نوع الشكوى مطلوب' })
  @IsString({ message: 'نوع الشكوى يجب أن يكون نص' })
  type: string;

  @IsNotEmpty({ message: 'الجهة مطلوبة' })
  @IsInt({ message: 'معرف الجهة يجب أن يكون رقماً' })
  governmentId: number;

  @IsNotEmpty({ message: 'الموقع مطلوب' })
  @IsString({ message: 'الموقع يجب أن يكون نص' })
  location: string;

  @IsNotEmpty({ message: 'وصف المشكلة مطلوب' })
  @IsString({ message: 'وصف المشكلة يجب أن يكون نص' })
  description: string;
}

