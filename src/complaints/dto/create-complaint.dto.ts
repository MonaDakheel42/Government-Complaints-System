import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty({ message: 'Complaint type required' })
  @IsString({ message: 'Complaint type must be a string' })
  type: string;

  @IsNotEmpty({ message: 'Government required' })
  @IsInt({ message: 'Government id must be a number' })
  governmentId: number;

  @IsNotEmpty({ message: 'Location required' })
  @IsString({ message: 'Location must be a string' })
  location: string;

  @IsNotEmpty({ message: 'Description required' })
  @IsString({ message: 'Description must be a string' })
  description: string;
}

