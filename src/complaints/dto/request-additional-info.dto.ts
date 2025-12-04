import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAdditionalInfoDto {
  @IsNotEmpty({ message: 'information request message required' })
  @IsString({ message: 'Information request message must be a string' })
  message: string;
}

