import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { GovernmentService } from './government.service';
import { CreateGovernmentDto } from './dto/create-government.dto';
import { UpdateGovernmentDto } from './dto/update-government.dto';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CheckIdExists } from 'src/Aspects/decorators/check-id-exists.decorator';
import { UniqueField } from 'src/Aspects/decorators/unique-field.decorator';
import { UniqueComposite } from 'src/Aspects/decorators/unique-composite.decorator';

@Controller('government')
export class GovernmentController {
  constructor(private readonly governmentService: GovernmentService) {}
 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @UniqueField('government', 'contactEmail')
  @UniqueComposite('government', ['name', 'governorate'])
  create(@Body() createGovernmentDto: CreateGovernmentDto) {
    return this.governmentService.create(createGovernmentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  findAll() {
    return this.governmentService.findAll();
  }

  @Get('inActive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  findAllInactivatedGov() {
    return this.governmentService.findAllInActivatedGovernments();
  }

  @Get('Active')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  findAllactivatedGov() {
    return this.governmentService.findAllActivatedGovernments();
  }

  @Get('user-show-governments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')  
  userFindAll() {
    return this.governmentService.findAllActivatedGovernments();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('government', 'id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentService.findOne(+id);
  }

  @Get('user-show-governments/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user') 
  @CheckIdExists('government', 'id')
  userFindOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentService.findOne(+id);
  }

  @Get(':id/showEmployee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  @CheckIdExists('government', 'id')
  showEmployee(@Param('id',ParseIntPipe) id: number) {
    return this.governmentService.showEmployee(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('government', 'id')
  @UniqueField('government', 'contactEmail')
  @UniqueComposite('government', ['name', 'governorate'])
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGovernmentDto: UpdateGovernmentDto) {
    return this.governmentService.update(+id, updateGovernmentDto);
  }

  @Get(':id/inActive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('government', 'id')
  inActive(@Param('id',ParseIntPipe) id: number) {
    return this.governmentService.inActive(+id);
  }

  @Get(':id/active')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('government', 'id')
  active(@Param('id',ParseIntPipe) id: number) {
    return this.governmentService.active(+id);
  }

}
