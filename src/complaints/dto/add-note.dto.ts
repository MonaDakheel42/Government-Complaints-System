import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddNoteDto {
  @IsNotEmpty({ message: 'الملاحظة مطلوبة' })
  @IsString({ message: 'الملاحظة يجب أن تكون نص' })
  note: string;

  @IsOptional()
  @IsBoolean({ message: 'isInternal يجب أن يكون boolean' })
  isInternal?: boolean;
}

