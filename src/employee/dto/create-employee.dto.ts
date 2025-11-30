import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateEmployeeDto {
    @IsNotEmpty({ message: 'First name is required' })
    @IsString({message: 'First name must be a string' })
    firstName:string;

    @IsNotEmpty({ message: 'Father name is required' })
    @IsString({message: 'Father name must be a string' })
    fatherName:string;
    
    @IsNotEmpty({ message: 'Last name is required' })
    @IsString({message: 'Last name must be a string' })
    lastName:string;
    
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email:string;
    
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    password: string;
    
    @IsNotEmpty({message: 'governmentId is required'})
    @IsNumber({},{message: 'governmentId must be a number' })
    governmentId: number;
}
