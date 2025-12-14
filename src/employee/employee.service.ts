import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';
import { GovernmentService } from 'src/government/government.service';
import { GetEmployeesDto } from './dto/getEmployee.dto';

@Injectable()
export class EmployeeService {
  constructor(private db: DbService,
    private governmentService: GovernmentService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const hashed = await bcrypt.hash(createEmployeeDto.password, 10);
    // const government= await this.db.government.findFirst({where:{
    //   id:createEmployeeDto.governmentId,
    //     isActive:true
    //   }});
    const government=await this.governmentService.isActive(createEmployeeDto.governmentId)
    
    if (government){
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
        select:{
          id: true,
          firstName: true,
          fatherName: true,
          lastName: true,
          email: true,
          isActive: true,
          governmentId: true,
          refreshTokenHash:false
        },
      });
      return {
        'message':'This action adds a new employee',
        'new employee':created,
        'password':createEmployeeDto.password
      };
    }
    throw new ConflictException(`The selected government is incorrect. Choose an activated government and try again`);
  }

  // async findAll() {
  //   return {
  //     'message':'This action returns all employees:',
  //     'data':await this.db.employee.findMany({select:{
  //       id:true,
  //       firstName:true,
  //       lastName:true,
  //       email:true,
  //       isActive:true
  //     }})
  //   };
  // }

  async findAll(dto: GetEmployeesDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    
    const [employees, total] = await Promise.all([
      this.db.employee.findMany({
        skip,
        take: limit,
         select:{
          firstName:true,
          fatherName:true,
          lastName:true,
          email:true,
          isActive:true,
          createdAt:true,
          updatedAt:true,
          Government: { select: { id: true, name: true } },
        },
        orderBy: [ { isActive: 'desc' }, { firstName: 'asc' } ],
      }),
      this.db.employee.count(),
    ]);

    return {
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: number) {
    return await this.db.employee.findFirst({
      where: { id },
      select: {
        id: true,
        firstName: true,
        fatherName: true,
        lastName: true,
        email: true,
        isActive: true,
        governmentId: true,
        Government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            isActive:true
          }
        }
      }
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const existing = await this.db.employee.findUnique({ where: { id } });
    if (!existing) 
      return 0;
    // const government=await this.db.government.findFirst({ where: { id: updateEmployeeDto.governmentId } });
    // if(!government)
    //   throw new NotFoundException(`this id of govrnment does not exist`);
    const government= await this.governmentService.isActive(existing.governmentId)
    if(government){
      const updated = await this.db.employee.update({
        where: { id },
        select:{
          id: true,
          firstName: true,
          fatherName: true,
          lastName: true,
          email: true,
          isActive: true,
          governmentId: true
        },
        data: {
          firstName: updateEmployeeDto.firstName ?? existing.firstName,
          fatherName: updateEmployeeDto.fatherName ?? existing.fatherName,
          lastName: updateEmployeeDto.lastName ?? existing.firstName,
          email: updateEmployeeDto.email ?? existing.email,
          governmentId: updateEmployeeDto.governmentId ?? existing.governmentId,
        },
      });
      return {
        message: `Employee #${id} updated successfully`,
        updatedGovernment: updated,
      };
    }
    throw new ConflictException(`The selected government is incorrect. Choose an activated government and try again`);
  }

  async inActive(id: number) {
   const updated = await this.db.employee.update({
      where: { id },
      select:{
        id: true,
        firstName: true,
        fatherName: true,
        lastName: true,
        email: true,
        isActive: true,
        governmentId: true,
        Government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            isActive:true
          }
        }
      },
      data: {
        isActive: false
      }
    });
    return {
      message: `Employee #${id} unactivated successfully`,
      Employee: updated
    };
  }

  async active(id: number) {
    const updated = await this.db.employee.update({
      where: { id },
      select:{
        id: true,
        firstName: true,
        fatherName: true,
        lastName: true,
        email: true,
        isActive: true,
        governmentId: true,
        Government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            isActive:true
          }
        }
      },
      data: {
        isActive: true
      }
    });
    return {
      message: `Employee #${id} activated successfully`,
      Employee: updated
    };

  }

  async showActive(){
    return {
      'message':'This action returns all active employees:',
      'data':await this.db.employee.findMany({
        where:{isActive:true},
        select:{
        id:true,
        firstName:true,
        lastName:true,
        email:true
      }})
    };    
  }

  async showInActive(){
    return {
      'message':'This action returns all inactive employees:',
      'data':await this.db.employee.findMany({
        where:{isActive:false},
        select:{
        id:true,
        firstName:true,
        lastName:true,
        email:true
      }})
    };     
  }

  async isActive(id:number){
    const employee = await this.db.employee.findFirst({
      where: { 
        id: id,
        isActive: true,
        Government: {
          isActive: true
        }
      },
      include:{
        Government: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });
    if(employee){
      return employee
    }
    throw new ForbiddenException(`this employee is not active or the government is not active`);
  }

  async showRealActive(){
    return await this.db.employee.findMany({
      where: { 
        isActive:true,
        Government:{
          isActive:true
        }
       },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        Government: {
          select: {
            id: true,
            name: true,
            governorate: true,
            isActive:true
          }
        }     
      }
    });
  }

}
