import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateComplaintDto {
  @IsOptional()
  @IsString({ message: 'Complaint type must be a string' })
  type?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNotEmpty({ message: 'Complaint version is required' })
  @IsNumber({}, { message: 'The version of the complaint must be a number' })
  version: number;
}

