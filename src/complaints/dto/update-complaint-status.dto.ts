import { IsNotEmpty, IsEnum } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateComplaintStatusDto {
  @IsNotEmpty({ message: 'Complaint status required' })
  @IsEnum(ComplaintStatus, { message: 'Complaint status is invalid' })
  status: ComplaintStatus;
}

