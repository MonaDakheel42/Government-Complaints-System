import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { RequestAdditionalInfoDto } from './dto/request-additional-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseRoleAspect } from '../Aspects/decorators/use-role-aspect.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { memoryStorage } from 'multer';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File type not supported'), false);
        }
      },
    }),
  )
  create( @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser('id') userId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.complaintsService.create(createComplaintDto, userId, files);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  findAll(@CurrentUser('id') userId: number) {
    return this.complaintsService.findAll(userId);
  }

  @Get('getComplaintsForEmployee')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  async getComplaintsForEmployee(@CurrentUser('id') employeeId: number) {
    const governmentId = await this.complaintsService.getEmployeeGovernmentId(employeeId);
    return this.complaintsService.findAllByGovernment(governmentId);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  getNotifications(@CurrentUser('id') userId: number) {
    return this.complaintsService.getNotifications(userId);
  }

  @Patch('notifications/read/:id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  markNotificationAsRead(@Param('id') id: number,
  @CurrentUser('id') userId: number) {
    return this.complaintsService.markNotificationAsRead(+id, userId);
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  markAllNotificationsAsRead(@CurrentUser('id') userId: number) {
    return this.complaintsService.markAllNotificationsAsRead(userId);
  }

  @Get('reference/:referenceNumber')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  findByReferenceNumber(@Param('referenceNumber') referenceNumber: string,
    @CurrentUser('id') userId: number
  ) {
    return this.complaintsService.findByReferenceNumber(
      referenceNumber,
      userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('user')
  findOne(@Param('id') id: number, @CurrentUser('id') userId: number) {
    return this.complaintsService.findOne(+id, userId);
  }


  @Get('getOneComplaintForEmployee/:id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  async getOneComplaintForEmployee(@Param('id') id: number,
    @CurrentUser('id') employeeId: number) {
    const governmentId = await this.complaintsService.getEmployeeGovernmentId(employeeId);
    return this.complaintsService.findOneByGovernment(+id, governmentId);
  }

  @Patch('updateStatusByEmployee/:id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  updateStatusByEmployee(@Param('id') id: number,
    @Body() updateStatusDto: UpdateComplaintStatusDto,
    @CurrentUser('id') employeeId: number,
  ) {
    return this.complaintsService.updateStatusByEmployee(+id, updateStatusDto, employeeId);
  }

  @Post('notes/:id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  addNote(@Param('id') id: number,
    @Body() addNoteDto: AddNoteDto,
    @CurrentUser('id') employeeId: number
  ) {
    return this.complaintsService.addNote(+id,employeeId,addNoteDto);
  }

  @Post('requestAdditionalInfo/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('employee')
  requestAdditionalInfo(@Param('id') id: number,
    @Body() requestInfoDto: RequestAdditionalInfoDto,
    @CurrentUser('id') employeeId: number) 
    {
    return this.complaintsService.requestAdditionalInfo(+id,employeeId,requestInfoDto);
  }

  @Patch('updateStatusByAdmin/:id')
  @UseGuards(JwtAuthGuard)
  @UseRoleAspect('admin')
  updateStatusByAdmin(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateComplaintStatusDto,
    @CurrentUser('id') adminId: number,
  ) {
    return this.complaintsService.updateStatus(+id, updateStatusDto, adminId);
  }
}

