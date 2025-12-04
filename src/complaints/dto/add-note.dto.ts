import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddNoteDto {
  @IsNotEmpty({ message: 'Note required' })
  @IsString({ message: 'Note must be a string' })
  note: string;

  @IsOptional()
  @IsBoolean({ message: 'isInternal must be a boolean' })
  isInternal?: boolean;
}

