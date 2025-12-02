import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseRoleAspect } from 'src/Aspects/decorators/use-role-aspect.decorator';

@Controller('backup')
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Post()
  createBackup() {
    return this.backupService.createBackup();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')  
  listBackups() {
    return this.backupService.listBackups();
  }
}
