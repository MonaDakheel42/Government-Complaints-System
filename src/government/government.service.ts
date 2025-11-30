import {  Injectable } from '@nestjs/common';
import { CreateGovernmentDto } from './dto/create-government.dto';
import { UpdateGovernmentDto } from './dto/update-government.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class GovernmentService {
  constructor(private db: DbService,) {}
  
  async create(createGovernmentDto: CreateGovernmentDto) {
    const created=await this.db.government.create({
      data: {
        name: createGovernmentDto.name,
        contactEmail: createGovernmentDto.contactEmail,
        description: createGovernmentDto.description,
        governorate: createGovernmentDto.governorate
      },
    });

    return {
      'message':'This action adds a new government',
      'new government entity':created
    };
  }

  async findAll() {
    return {
      'message':'This action returns all government:',
      'data':await this.db.government.findMany()
    };
  }

  async findOne(id: number) {
    const government=await this.db.government.findFirst({where: { id: id }});
    return government;
  }

  async update(id: number, updateGovernmentDto: UpdateGovernmentDto) {
    const existing = await this.db.government.findUnique({ where: { id } });
    if (!existing) 
      return 0;
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

  async remove(id: number) {
    const existing =await this.db.government.delete({
      where: { id :id},
    });
    return {
      message: `Government entity #${id} removed successfully`,
      removedGovernment: existing,
    };
  }
}