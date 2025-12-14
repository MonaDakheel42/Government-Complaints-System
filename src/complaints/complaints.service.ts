import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ComplaintStatus } from '@prisma/client';
import { ComplaintStatus as PrismaComplaintStatus } from '@prisma/client';
import { EmailSender } from '../mail-sender';
import * as path from 'path';
import * as fs from 'fs';
import { RequestAdditionalInfoDto } from './dto/request-additional-info.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { GovernmentService } from 'src/government/government.service';
import { EmployeeService } from 'src/employee/employee.service';
import { GetComplaintsDto } from './dto/get-complaints.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    private db: DbService,
    private emailSender: EmailSender,
    private governmentService: GovernmentService,
    private employeeService: EmployeeService,
  ) {}

  private generateReferenceNumber() {
    const today = new Date();
    const random = Math.floor(Math.random() * 10000).toString();
    return `COMP-${today.toISOString().slice(0, 19)}-${random}`;
  }

  private ensureUploadsFolder() {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'complaints');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  }


  async create(createComplaintDto: CreateComplaintDto,userId: number,files?: Express.Multer.File[]) {
    const government = await this.governmentService.isActive(createComplaintDto.governmentId);


    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const referenceNumber = this.generateReferenceNumber();

    const complaint = await this.db.complaint.create({
      data: {
        referenceNumber,
        type: createComplaintDto.type,
        location: createComplaintDto.location,
        description: createComplaintDto.description,
        status: ComplaintStatus.NEW as PrismaComplaintStatus,
        userId,
        governmentId: createComplaintDto.governmentId,
      },
    });

    if (files && files.length > 0) {
      const uploadsDir = this.ensureUploadsFolder();
      const attachments: Array<{
        complaintId: number;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
      }> = [];

      for (const file of files) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        attachments.push({
          complaintId: complaint.id,
          fileName: file.originalname,
          filePath: `uploads/complaints/${fileName}`,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }

      await this.db.complaintAttachment.createMany({
        data: attachments,
      });
    }

    await this.db.notification.create({
      data: {
        userId,
        complaintId: complaint.id,
        title: 'Complaint submitted successfully',
        message: `Your complaint has been submitted with reference number: ${referenceNumber}`,
      },
    });

    try {
      const emailHtml = `
        <h2>Complaint Submitted Successfully</h2>
        <p>Dear ${user.name},</p>
        <p>Your complaint has been submitted successfully. You can use the following reference number to track your complaint status:</p>
        <h3>${referenceNumber}</h3>
        <p>Complaint Type: ${createComplaintDto.type}</p>
        <p>Government Entity: ${government.name}</p>
        <p>Location: ${createComplaintDto.location}</p>
        <p>Thank you for using the Government Complaints System.</p>
      `;
      await this.emailSender.mailTransport(
        user.email,
        'Complaint Submitted Successfully',
        emailHtml,
      );
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return {
      message: 'Complaint submitted successfully',
      referenceNumber,
      complaint: {
        id: complaint.id,
        referenceNumber: complaint.referenceNumber,
        type: complaint.type,
        location: complaint.location,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    };
  }

  async findAll(userId: number, dto: GetComplaintsDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    
    const [complaints, total] = await Promise.all([
      this.db.complaint.findMany({
        where: { userId },
        skip,
        take: limit,
        select: {
          id: true,
          referenceNumber: true,
          type: true,
          location: true,
          description: true,
          status: true,
          additionalInfoRequested: true,
          additionalInfoMessage: true,
          createdAt: true,
          updatedAt: true,
          government: {
            select: {
              id: true,
              name: true,
              governorate: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.complaint.count({ where: { userId } }),
    ]);

    return {
      data: complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEmployeeGovernmentId(employeeId: number): Promise<number> {
    const employee = await this.db.employee.findUnique({
      where: { id: employeeId },
      select: { governmentId: true },
    });

    if (!employee) {
      throw new ForbiddenException('this employee not found');
    }

    return employee.governmentId;
  }

  async findAllByGovernment(governmentId: number, dto: GetComplaintsDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    
    const [complaints, total] = await Promise.all([
      this.db.complaint.findMany({
        where: { governmentId },
        skip,
        take: limit,
        select: {
          id: true,
          referenceNumber: true,
          type: true,
          location: true,
          description: true,
          status: true,
          additionalInfoRequested: true,
          additionalInfoMessage: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
            },
          },
          notes: {
            select: {
              id: true,
              note: true,
              createdAt: true,
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.complaint.count({ where: { governmentId } }),
    ]);

    return {
      data: complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneByGovernment(complaintId: number, governmentId: number) {
    const complaint = await this.db.complaint.findFirst({
      where: { id: complaintId, governmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            contactEmail: true,
          },
        },
        attachments: true,
        notes: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!complaint) {
      throw new ForbiddenException('this complaint not found or does not belong to this government entity');
    }

    return complaint;
  }

  async findOne(id: number, userId: number) {
    const complaint = await this.db.complaint.findFirst({
      where: { id, userId },
      include: {
        government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            contactEmail: true,
          },
        },
        attachments: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!complaint) {
      throw new ForbiddenException('Complaint not found');
    }

    return complaint;
  }

  async findByReferenceNumber(referenceNumber: string, userId: number) {
    const complaint = await this.db.complaint.findFirst({
      where: { referenceNumber, userId },
      include: {
        government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            contactEmail: true,
          },
        },
        attachments: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!complaint) {
      throw new ForbiddenException('this complaint not found');
    }

    return complaint;
  }

 
  async getNotifications(userId: number) {
    return this.db.notification.findMany({
      where: { userId },
      include: {
        complaint: {
          select: {
            id: true,
            referenceNumber: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationAsRead(notificationId: number, userId: number) {
    const notification = await this.db.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new ForbiddenException('this notification is not found');
    }

    return this.db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsAsRead(userId: number) {
    return this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  

  async updateStatusByEmployee(id: number,updateStatusDto: UpdateComplaintStatusDto,
    employeeId: number) {
    const employee = await this.employeeService.isActive(employeeId);
    const complaint = await this.db.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        government: true,
      },
    });

    if (!complaint) {
      throw new ForbiddenException('this complaint not found');
    }

    if (complaint.governmentId !== employee.Government.id) {
      throw new ForbiddenException('You do not have permission to modify this complaint');
    }

    const oldStatus = complaint.status;
    const newStatus = updateStatusDto.status;

    const updated = await this.db.complaint.update({
      where: { id },
      data: { status: newStatus },
    });

    if (oldStatus !== newStatus) {
      const statusMessages = {
        [ComplaintStatus.NEW]: 'NEW',
        [ComplaintStatus.IN_PROGRESS]: 'IN_PROGRESS',
        [ComplaintStatus.COMPLETED]: 'COMPLETED',
        [ComplaintStatus.REJECTED]: 'REJECTED',
      };

      await this.db.notification.create({
        data: {
          userId: complaint.userId,
          complaintId: complaint.id,
          title: 'Complaint Status Updated',
          message: `Your complaint status (${complaint.referenceNumber}) has been updated from "${statusMessages[oldStatus]}" to "${statusMessages[newStatus]}"`,
        },
      });

      try {
        const emailHtml = `
          <h2>Complaint Status Updated</h2>
          <p>Dear ${complaint.user.name},</p>
          <p>Your complaint status has been updated:</p>
          <p><strong>Reference Number:</strong> ${complaint.referenceNumber}</p>
          <p><strong>Previous Status:</strong> ${statusMessages[oldStatus]}</p>
          <p><strong>New Status:</strong> ${statusMessages[newStatus]}</p>
          <p>You can track your complaint status through the application.</p>
        `;
        await this.emailSender.mailTransport(
          complaint.user.email,
          'Complaint Status Updated',
          emailHtml,
        );
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    return {
      message: 'Complaint status updated successfully',
      complaint: updated,
    };
  }

  async addNote(complaintId: number,employeeId: number,addNoteDto: AddNoteDto)
  {
    const employee = await this.employeeService.isActive(employeeId);
    const complaint = await this.db.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: true,
        government: true,
      },
    });

    if (!complaint) {
      throw new ForbiddenException('this complaint not found');
    }

    if (complaint.governmentId !== employee.Government.id) {
      throw new ForbiddenException('You do not have permission to add a note to this complaint');
    }

    const complaintNote = await this.db.complaintNote.create({
      data: {
        complaintId,
        employeeId,
        note: addNoteDto.note,
        isInternal: addNoteDto.isInternal || false,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!addNoteDto.isInternal) {
      await this.db.notification.create({
        data: {
          userId: complaint.userId,
          complaintId: complaint.id,
          title: 'New Note Added',
          message: `A new note has been added to your complaint (${complaint.referenceNumber})`,
        },
      });

      try {
        const emailHtml = `
          <h2>New Note Added</h2>
          <p>Dear ${complaint.user.name},</p>
          <p>A new note has been added to your complaint:</p>
          <p><strong>Reference Number:</strong> ${complaint.referenceNumber}</p>
          <p><strong>Note:</strong> ${addNoteDto.note}</p>
          <p>You can track your complaint status through the application.</p>
        `;
        await this.emailSender.mailTransport(
          complaint.user.email,
          'New Note Added to Your Complaint',
          emailHtml,
        );
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    return {
      message: 'Note added successfully',
      note: complaintNote,
    };
  }

  async requestAdditionalInfo(complaintId: number, employeeId: number,
    requestInfoDto: RequestAdditionalInfoDto) 
    {
    const employee = await this.employeeService.isActive(employeeId);

    const complaint = await this.db.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: true,
        government: true,
      },
    });

    if (!complaint) {
      throw new ForbiddenException('this complaint not found');
    }

    if (complaint.governmentId !== employee.Government.id) {
      throw new ForbiddenException('You do not have permission to request additional information for this complaint');
    }

    const updated = await this.db.complaint.update({
      where: { id: complaintId },
      data: {
        additionalInfoRequested: true,
        additionalInfoMessage: requestInfoDto.message,
      },
    });

    await this.db.notification.create({
      data: {
        userId: complaint.userId,
        complaintId: complaint.id,
        title: 'Additional Information Requested',
        message: `Additional information has been requested regarding your complaint (${complaint.referenceNumber})`,
      },
    });

    try {
      const emailHtml = `
        <h2>Additional Information Requested</h2>
        <p>Dear ${complaint.user.name},</p>
        <p>We need additional information regarding your complaint:</p>
        <p><strong>Reference Number:</strong> ${complaint.referenceNumber}</p>
        <p><strong>Message:</strong> ${requestInfoDto.message}</p>
        <p>Please provide the requested information through the application.</p>
      `;
      await this.emailSender.mailTransport(
        complaint.user.email,
        'Additional Information Requested for Your Complaint',
        emailHtml,
      );
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return {
      message: 'Additional information requested successfully',
      complaint: updated,
    };
  }
}

