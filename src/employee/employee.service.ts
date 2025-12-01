import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(private db: DbService,) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const hashed = await bcrypt.hash(createEmployeeDto.password, 10);
    const created=await this.db.employee.create({
      data: {
        firstName: createEmployeeDto.firstName,
        fatherName: createEmployeeDto.fatherName,
        lastName: createEmployeeDto.lastName,
        email: createEmployeeDto.email,
        password: hashed,
        governmentId: createEmployeeDto.governmentId,
        isActive: true
      },
    });

    return {
      'message':'This action adds a new employee',
      'new employee':created,
      'password':createEmployeeDto.password
    }; 
  }

  async findAll() {
    return {
      'message':'This action returns all employees:',
      'data':await this.db.employee.findMany({select:{
        id:true,
        firstName:true,
        lastName:true,
        email:true
      }})
    };
  }

  async findOne(id: number) {
    const employee=await this.db.employee.findFirst({
      where: { id },
      select: {
        id: true,
        firstName: true,
        fatherName: true,
        lastName: true,
        email: true,
        isActive:true,
        governmentId: true,
        Government: {
          select: {
            id: true,
            name: true,
            governorate: true,
          }
        }
      }
    });
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const existing = await this.db.employee.findUnique({ where: { id } });
    if (!existing) 
      return 0;
    if(!await this.db.government.findFirst({ where: { id: updateEmployeeDto.governmentId } }))
      throw new NotFoundException(`this id of govrnment does not exist`);
    const updated = await this.db.employee.update({
      where: { id },
      data: {
        firstName: updateEmployeeDto.firstName ?? existing.firstName,
        fatherName: updateEmployeeDto.fatherName ?? existing.fatherName,
        lastName: updateEmployeeDto.lastName ?? existing.firstName,
        email: updateEmployeeDto.email ?? existing.email,
        governmentId: updateEmployeeDto.governmentId ?? existing.governmentId,
      },
    });
    return {
      message: `Government entity #${id} updated successfully`,
      updatedGovernment: updated,
    };
  }

  async remove(id: number) {
    const removed = await this.db.employee.update({
      where: { id },
      data: {
        isActive: false
      },
    });
    return {
      'message:':`This action makes a #${id} employee unactive`,
      'unactive employee:':removed
    };
  } 
}
