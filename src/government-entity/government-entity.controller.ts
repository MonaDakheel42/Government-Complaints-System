import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { CreateGovernmentEntityDto } from './dto/create-government-entity.dto';
import { UpdateGovernmentEntityDto } from './dto/update-government-entity.dto';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('government-entity')
export class GovernmentEntityController {
  constructor(private readonly governmentEntityService: GovernmentEntityService) {}
 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
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
  userfindOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.findOne(+id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGovernmentEntityDto: UpdateGovernmentEntityDto) {
    return this.governmentEntityService.update(+id, updateGovernmentEntityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.remove(+id);
  }

}
