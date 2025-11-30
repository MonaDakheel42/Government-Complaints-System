import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class CreateGovernmentDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({message: 'Name must be a string' })
    name:string;

    @IsNotEmpty({message: 'Contact email is required'})
    @IsEmail({}, { message: 'Contact email must be a valid email address' })
    contactEmail:string;
    
    @IsNotEmpty({message: 'Description is required'})
    @IsString({message: 'Description must be a string' })
    description:string;
    
    @IsNotEmpty({ message: 'Governorate is required' })
    @IsString({message: 'Governorate must be a string' })
    governorate:string;
}
