import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { CreateGovernmentEntityDto } from './dto/create-government-entity.dto';
import { UpdateGovernmentEntityDto } from './dto/update-government-entity.dto';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CheckIdExists } from 'src/Aspects/decorators/check-id-exists.decorator';
import { UniqueField } from 'src/Aspects/decorators/unique-field.decorator';
import { UniqueComposite } from 'src/Aspects/decorators/unique-composite.decorator';

@Controller('government-entity')
export class GovernmentEntityController {
  constructor(private readonly governmentEntityService: GovernmentEntityService) {}
 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @UniqueField('governmentEntity', 'contactEmail')
  @UniqueComposite('governmentEntity', ['name', 'governorate'])
  create(@Body() createGovernmentEntityDto: CreateGovernmentEntityDto) {
    return this.governmentEntityService.create(createGovernmentEntityDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  findAll() {
    return this.governmentEntityService.findAll();
  }
  
  @Get('user-show-governments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')  
  userfindAll() {
    return this.governmentEntityService.findAll();
  }

  @Get('user-show-governments/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user') 
  @CheckIdExists('governmentEntity', 'id')
  userfindOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.findOne(+id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  @CheckIdExists('governmentEntity', 'id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  @CheckIdExists('governmentEntity', 'id')
  @UniqueField('governmentEntity', 'contactEmail')
  @UniqueComposite('governmentEntity', ['name', 'governorate'])
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGovernmentEntityDto: UpdateGovernmentEntityDto) {
    return this.governmentEntityService.update(+id, updateGovernmentEntityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  @CheckIdExists('governmentEntity', 'id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.remove(+id);
  }

}
