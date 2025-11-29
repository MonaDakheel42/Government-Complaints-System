// src/Aspects/UniqueCompositeAspect.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DbService } from '../db/db.service';
import { Reflector } from '@nestjs/core';
import { UNIQUE_COMPOSITE_META } from './decorators/unique-composite.decorator';

@Injectable()
export class UniqueCompositeAspect implements NestInterceptor {
  constructor(private db: DbService, private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    const meta = this.reflector.get<{ entityName: string; fields: string[] }>(
      UNIQUE_COMPOSITE_META,
      context.getHandler(),
    );

    if (!meta) {
      return next.handle(); // إذا ما فيه metadata، ما نعمل شي
    }

    const { entityName, fields } = meta;
    const model = this.db[entityName];

        // إذا كل الحقول فاضية، نتجاهل الفحص
    const hasValues = fields.some((field) => body[field] !== undefined && body[field] !== null && body[field] !== '');
    if (!hasValues) {
      return next.handle();
    }
    
    const where: Record<string, any> = {};
    for (const field of fields) {
      where[field] = body[field];
    }

    return from(model.findFirst({ where })).pipe(
      mergeMap((existing) => {
        if (existing) {
          throw new ConflictException(
            `Record with same ${fields.join(', ')} already exists`,
          );
        }
        return next.handle();
      }),
    );
  }
}
