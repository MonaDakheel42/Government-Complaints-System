import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminsService {


  findAll() {
    return `This action returns all admins`;
  }

}
