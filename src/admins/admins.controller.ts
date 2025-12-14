import { Controller, Get, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseRoleAspect } from '../Aspects/decorators/use-role-aspect.decorator';
import { CheckIdExists } from 'src/Aspects/decorators/check-id-exists.decorator';
import { GetLogsDto } from './dto/get-logs.dto';

@Controller('admins')
@UseGuards(JwtAuthGuard) // Protect all admin routes
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @UseRoleAspect('admin') // Only admins can access
  findAll() {
    return this.adminsService.findAll();
  }
  
  // @Get('/showLogs')
  // @UseRoleAspect('admin') 
  // showLogs() {
  //   return this.adminsService.showLogs();
  // }
  @Get('/showLogs')
  @UseRoleAspect('admin') 
  showLogs(@Query() dto: GetLogsDto) {
    return this.adminsService.showLogs(dto);
  }

  @Get('/showLogs/:id')
  @UseRoleAspect('admin') 
  @CheckIdExists('auditLog','id')
  showLog(@Param('id',ParseIntPipe) id: number) {
    return this.adminsService.showLog(+id);
  }  
}
