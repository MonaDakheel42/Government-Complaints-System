import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GovernmentEntityService } from './government-entity.service';
import { CreateGovernmentEntityDto } from './dto/create-government-entity.dto';
import { UpdateGovernmentEntityDto } from './dto/update-government-entity.dto';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('government-entity')
export class GovernmentEntityController {
  constructor(private readonly governmentEntityService: GovernmentEntityService) {}
 
  // @UseGuards(JwtAuthGuard)
  // @UseRoleAspect('admin')
  @Post()
  create(@Body() createGovernmentEntityDto: CreateGovernmentEntityDto) {
    return this.governmentEntityService.create(createGovernmentEntityDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseRoleAspect('admin')  
  @Get()
  findAll() {
    return this.governmentEntityService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  // @UseRoleAspect('admin')  
  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.findOne(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseRoleAspect('admin')
  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGovernmentEntityDto: UpdateGovernmentEntityDto) {
    return this.governmentEntityService.update(+id, updateGovernmentEntityDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseRoleAspect('admin')  
  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.governmentEntityService.remove(+id);
  }
}
