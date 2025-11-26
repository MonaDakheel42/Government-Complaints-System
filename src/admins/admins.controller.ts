import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseRoleAspect } from '../Aspects/decorators/use-role-aspect.decorator';

@Controller('admins')
@UseGuards(JwtAuthGuard) // Protect all admin routes
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @UseRoleAspect('admin') // Only admins can access
  findAll() {
    return this.adminsService.findAll();
  }
}
