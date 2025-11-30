import { PartialType } from '@nestjs/mapped-types';
import { CreateGovernmentDto } from './create-government.dto';

export class UpdateGovernmentDto extends PartialType(CreateGovernmentDto) {
    // @IsOptional()
    // @IsString({message: 'Name must be a string' })
    // name:string;
    //
    // @IsOptional()
    // @IsEmail({}, { message: 'Contact email must be a valid email address' })
    // contactEmail:string;
    //
    // @IsOptional()
    // @IsString({message: 'Description must be a string' })
    // description:string;
    //
    // @IsOptional()
    // @IsString({message: 'Governorate must be a string' })
    // governorate:string;
}
