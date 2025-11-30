import { Injectable, ExecutionContext, ConflictException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UNIQUE_FIELD_META } from './decorators/unique-field.decorator';
import { Aspect } from './Aspect';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UniqueFieldAspect extends Aspect {
  constructor(
    private reflector: Reflector,
    private prisma: DbService,
  ) {
    super();
  }

  async before(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {};

    const meta = this.reflector.get(UNIQUE_FIELD_META, context.getHandler());
    if (!meta) {
      throw new Error('Missing metadata for UniqueFieldAspect');
    }

    const { entityName, fieldName } = meta;

    const value = body[fieldName];
    if (value === undefined || value === null || value === '') {
        return; // ✅ بس نرجع بدون ما نعمل أي فحص
    }

    const model = (this.prisma as any)[entityName];

    if (!model || typeof model.findFirst !== 'function') {
      throw new ConflictException(
        `Model '${entityName}' does not exist in PrismaService or doesn't support findFirst()`
      );
    }

    const exists = await model.findFirst({
      where: { [fieldName]: value },
    });

    if (exists) {
      throw new ConflictException(`${fieldName} must be unique`);
    }
  }
}
