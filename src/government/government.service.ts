import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateGovernmentDto } from './dto/create-government.dto';
import { UpdateGovernmentDto } from './dto/update-government.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class GovernmentService {
  constructor(private db: DbService,) {
  }

  async create(createGovernmentDto: CreateGovernmentDto) {
    const created = await this.db.government.create({
      data: {
        name: createGovernmentDto.name,
        contactEmail: createGovernmentDto.contactEmail,
        description: createGovernmentDto.description,
        governorate: createGovernmentDto.governorate,
        isActive: true
      },
    });
    return {
      'message': 'This action adds a new government',
      'new government entity': created
    };
  }

  async findAll() {
    return {
      'message': 'This action returns all government:',
      'data': await this.db.government.findMany({
        select:{
          id:true,
          name:true,
          governorate:true
        }})
        }
    };

  async findAllInActivatedGovernments() {
    const governments= await this.db.government.findMany({
      where:{isActive:false},
      select: {
        id: true,
        name: true,
        governorate: true,
      }});
    return {
      'message': 'This action returns all inactivated government:',
      'data': governments
    }
  };

  async findAllActivatedGovernments() {
    const governments= await this.db.government.findMany({
      where:{isActive:true},
      select: {
        id: true,
        name: true,
        governorate: true,
      }});
    return {
      'message': 'This action returns all activated government:',
      'data': governments
    }
  };
  
  async findOne(id: number) {
    return await this.db.government.findFirst({ where: { id: id } });
  }

  async showEmployee(id: number) {
    return await this.db.government.findFirst({
      where: { id: id },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        description: true,
        governorate: true,
        isActive:true,
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true
          }
        }
      }
    });
  }

  async update(id: number, updateGovernmentDto: UpdateGovernmentDto) {
    const existing = await this.db.government.findUnique({ where: { id } });
    if (!existing) {
      return 0;
    }
    const updated = await this.db.government.update({
      where: { id },
      data: {
        name: updateGovernmentDto.name ?? existing.name,
        contactEmail: updateGovernmentDto.contactEmail ?? existing.contactEmail,
        description: updateGovernmentDto.description ?? existing.description,
        governorate: updateGovernmentDto.governorate ?? existing.governorate,
      },
    });
    return {
      message: `Government entity #${id} updated successfully`,
      updatedGovernment: updated,
    };
  }

  async inActive(id: number) {
    const updated = await this.db.government.update({
      where: { id },
      data: {
        isActive: false
      }
    });
    return {
      message: `Government #${id} inactivated successfully`,
      Government: updated
    };
  }

  async active(id: number) {
    const updated = await this.db.government.update({
      where: { id },
      data: {
        isActive: true
      }
    });
    return {
      message: `Government #${id} activated successfully`,
      Government: updated
    };

  }

  async isActive(id:number){
    const government = await this.db.government.findFirst({
      where: { id:id, isActive:true },
      select: {
        id: true,
        name: true
      }
    });
    if(government){
      return government
    }
    throw new ForbiddenException('this government is not active');
  }

}
