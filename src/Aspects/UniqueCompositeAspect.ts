import { Injectable, ExecutionContext, ConflictException } from '@nestjs/common';
import { Aspect } from './Aspect';
import { DbService } from 'src/db/db.service';
import { Reflector } from '@nestjs/core';
import { UNIQUE_COMPOSITE_META } from './decorators/unique-composite.decorator';

@Injectable()
export class UniqueCompositeAspect extends Aspect {
  constructor(private db: DbService, private reflector: Reflector) {
    super();
  }

  async before(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {}; 

    const meta = this.reflector.get<{ entityName: string; fields: string[] }>(
      UNIQUE_COMPOSITE_META,
      context.getHandler(),
    );
    if (!meta) return;

    const { entityName, fields } = meta;
    const model = this.db[entityName];
    if (!model) return;

    const hasValues = fields.some(
      (field) => body[field] !== undefined && body[field] !== null && body[field] !== ''
    );
    if (!hasValues) return;

    
    const where: Record<string, any> = {};
    for (const field of fields) {
      let value = body[field];

      if (value === undefined || value === null || value === '') {
        return; 
      }
      
      if (typeof value === 'number') {
        value = value.toString();
      }
      where[field] = value;
    }

    const existing = await model.findFirst({ where });
    if (existing) {
      throw new ConflictException(
        `Record with same ${fields.join(', ')} already exists`,
      );
    }
  }
}
