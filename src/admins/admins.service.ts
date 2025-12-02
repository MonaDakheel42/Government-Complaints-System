import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class AdminsService {
  constructor(private db: DbService,) {}

  findAll() {
    return `This action returns all admins`;
  }

  async showLogs(){
    return {
      'message':'This action returns all Logs whitin the system :',
      'data':await this.db.auditLog.findMany({
        select:{
          id:true,
          role:true,
          endpoint:true,
          status:true
        }})
    };
  }

  async showLog(id: number) {
    const Log=await this.db.auditLog.findFirst({where: { id: id }});
    return Log;
  }

}
