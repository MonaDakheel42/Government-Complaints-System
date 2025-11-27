import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateGovernmentEntityDto } from './dto/create-government-entity.dto';
import { UpdateGovernmentEntityDto } from './dto/update-government-entity.dto';
import { PrismaService } from 'prisma/prisma.service';
import { isEmail, isNotEmpty } from 'class-validator';

@Injectable()
export class GovernmentEntityService {
  constructor(private prisma: PrismaService) {}
  
  async create(createGovernmentEntityDto: CreateGovernmentEntityDto) {
    const existing = await this.prisma.governmentEntity.findFirst({
      where: {
        name: createGovernmentEntityDto.name,
        governorate: createGovernmentEntityDto.governorate,
      },
    });
    if (existing) {
      throw new ConflictException('Government entity with same name in this governorate already exists');
    }
    const exists = await this.prisma.governmentEntity.findUnique({
      where: { contactEmail: createGovernmentEntityDto.contactEmail },
    });
    if (exists) throw new ForbiddenException('Contact email already exists');

    const created=await this.prisma.governmentEntity.create({
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
      'data':await this.prisma.governmentEntity.findMany()
    };
  }

  findOne(id: number) {
    const government=this.prisma.governmentEntity.findFirst({where: { id: id }});
    return government;
  }

  async update(id: number, updateGovernmentEntityDto: UpdateGovernmentEntityDto) {
    const existing = await this.prisma.governmentEntity.findUnique({ where: { id } });
    if (!existing) 
      throw new ForbiddenException(`Government entity with ID ${id} does not exist`);

    if (updateGovernmentEntityDto.name || updateGovernmentEntityDto.governorate) {
      const existin = await this.prisma.governmentEntity.findFirst({
        where: {
          name: updateGovernmentEntityDto.name ?? existing.name,
          governorate: updateGovernmentEntityDto.governorate ?? existing.governorate,
          NOT: { id },
        },
      });
      if (existin) throw new ConflictException('Government entity with same name in this governorate already exists');
    }

    if (updateGovernmentEntityDto.contactEmail) {
      const exists = await this.prisma.governmentEntity.findFirst({
        where: {
          contactEmail: updateGovernmentEntityDto.contactEmail,
          NOT: { id },
        },
      });
      if (exists) throw new ForbiddenException('Contact email already exists');
    }

    const updated = await this.prisma.governmentEntity.update({
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
    const existing = await this.prisma.governmentEntity.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new ForbiddenException(`Government entity with ID ${id} does not exist`);
    }

    await this.prisma.governmentEntity.delete({
      where: { id },
    });

    return {
      message: `Government entity #${id} removed successfully`,
      removedGovernmentEntity: existing,
    };
  }
}