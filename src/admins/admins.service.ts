import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { GetLogsDto } from './dto/get-logs.dto';

@Injectable()
export class AdminsService {
  constructor(private db: DbService,) {}

  findAll() {
    return `This action returns all admins`;
  }

  // async showLogs(){
  //   return {
  //     'message':'This action returns all Logs whitin the system :',
  //     'data':await this.db.auditLog.findMany({
  //       select:{
  //         id:true,
  //         role:true,
  //         endpoint:true,
  //         status:true
  //       }})
  //   };
  // }

  async showLogs(dto: GetLogsDto){
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.db.auditLog.findMany({
        skip,
        take: limit,
        select:{
          id:true,
          userId:true,
          role:true,
          action:true,
          endpoint:true,
          metadata:true,
          status:true,
          createdAt:true
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async showLog(id: number) {
    const Log=await this.db.auditLog.findFirst({where: { id: id }});
    return Log;
  }

}
