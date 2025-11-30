import { Injectable, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Aspect } from 'src/Aspects/Aspect'; 
import { DbService } from 'src/db/db.service';
import { CHECK_ID_EXISTS_KEY } from './decorators/check-id-exists.decorator';

@Injectable()
export class CheckIdExistsAspect extends Aspect {
  constructor(
    private reflector: Reflector,
    private db: DbService,
  ) {
    super();
  }

  async before(context: ExecutionContext, ...parameters: any[]) {
    const meta = this.reflector.get<{ table: string; idField: string }>(CHECK_ID_EXISTS_KEY, context.getHandler());
    if (!meta) return;

    const { table, idField } = meta;
    const request = context.switchToHttp().getRequest();

    const idValue = request.params?.[idField] ?? request.body?.[idField];
    if (!idValue) return;

    const id = Number(idValue);

    const model = (this.db as any)[table];
    if (!model) {
      throw new NotFoundException(`Model '${table}' not found in DbService.`);
    }

    const record = await model.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${table} with ID ${id} does not exist`);
    }
  }
}
