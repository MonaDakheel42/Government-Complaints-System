import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateGovernmentEntityDto } from './dto/create-government-entity.dto';
import { UpdateGovernmentEntityDto } from './dto/update-government-entity.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class GovernmentEntityService {
  constructor(private db: DbService,) {}
  
  async create(createGovernmentEntityDto: CreateGovernmentEntityDto) {
    const created=await this.db.governmentEntity.create({
      data: {
        name: createGovernmentEntityDto.name,
        contactEmail: createGovernmentEntityDto.contactEmail,
        description: createGovernmentEntityDto.description,
        governorate: createGovernmentEntityDto.governorate
      },
    });

    return {
      'message':'This action adds a new governmentEntity',
      'new government entity':created
    };
  }

  async findAll() {
    return {
      'message':'This action returns all governmentEntity:',
      'data':await this.db.governmentEntity.findMany()
    };
  }

  async findOne(id: number) {
    const government=this.db.governmentEntity.findFirst({where: { id: id }});
    return government;
  }

  async update(id: number, updateGovernmentEntityDto: UpdateGovernmentEntityDto) {
    const existing = await this.db.governmentEntity.findUnique({ where: { id } });
    if (!existing) 
      return 0;
    const updated = await this.db.governmentEntity.update({
      where: { id },
      data: {
        name: updateGovernmentEntityDto.name ?? existing.name,
        contactEmail: updateGovernmentEntityDto.contactEmail ?? existing.contactEmail,
        description: updateGovernmentEntityDto.description ?? existing.description,
        governorate: updateGovernmentEntityDto.governorate ?? existing.governorate,
      },
    });
    return {
      message: `Government entity #${id} updated successfully`,
      updatedGovernmentEntity: updated,
    };
  }

  async remove(id: number) {
    const existing =await this.db.governmentEntity.delete({
      where: { id },
    });
    return {
      message: `Government entity #${id} removed successfully`,
      removedGovernmentEntity: existing,
    };
  }
}