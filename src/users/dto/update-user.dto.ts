import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from '../../auth/dto/register-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {

}
