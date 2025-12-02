import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';
import { UniqueField } from 'src/Aspects/decorators/unique-field.decorator';
import { UniqueComposite } from 'src/Aspects/decorators/unique-composite.decorator';
import { CheckIdExists } from 'src/Aspects/decorators/check-id-exists.decorator';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @UniqueField('employee', 'email')
  @UniqueComposite('employee', ['firstName', 'fatherName','lastName'])
  @CheckIdExists('government','governmentId')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('employee','id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.employeeService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('employee','id')
  @UniqueField('employee', 'email')
  @UniqueComposite('employee', ['firstName', 'fatherName','lastName'])
  update(@Param('id',ParseIntPipe) id: number, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('employee','id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.employeeService.remove(+id);
  }

  @Get('unActive/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('employee', 'id')
  unActive(@Param('id') id: number) {
    return this.employeeService.unActive(+id);
  }

  @Get('active/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('employee', 'id')
  active(@Param('id') id: number) {
    return this.employeeService.active(+id);
  }
}
