import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateComplaintStatusDto {
  @IsNotEmpty({ message: 'Complaint status required' })
  @IsEnum(ComplaintStatus, { message: 'Complaint status is invalid' })
  status: ComplaintStatus;

  @IsNotEmpty({message: 'complaint version is required'})
  @IsNumber({},{message:'the version of the complaint must be a number'})
  version:number
}

