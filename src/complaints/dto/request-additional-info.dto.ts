import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RequestAdditionalInfoDto {
  @IsNotEmpty({ message: 'information request message required' })
  @IsString({ message: 'Information request message must be a string' })
  message: string;

  @IsNotEmpty({message: 'complaint version is required'})
  @IsNumber({},{message:'the version of the complaint must be a number'})
  version:number
}

