import { PartialType } from '@nestjs/mapped-types';
import { CreateGovernmentEntityDto } from './create-government-entity.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateGovernmentEntityDto{
    @IsOptional()
    @IsString({message: 'Name must be a string' })
    name:string;

    @IsOptional()
    @IsEmail({}, { message: 'Contact email must be a valid email address' })
    contactEmail:string;
    
    @IsOptional()
    @IsString({message: 'Description must be a string' })
    description:string;
    
    @IsOptional()
    @IsString({message: 'Governorate must be a string' })
    governorate:string;    
}
