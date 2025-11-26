import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseRoleAspect } from '../Aspects/decorators/use-role-aspect.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: RegisterUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin') // Only admins can see all users
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user') // Users can see their own profile
  findMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin') // Only admins can see specific user
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin') // Only admins can update users
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin') // Only admins can delete users
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
