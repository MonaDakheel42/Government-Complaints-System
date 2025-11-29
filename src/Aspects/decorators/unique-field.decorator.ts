import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { UniqueFieldAspect } from '../UniqueFieldAspect';

export const UNIQUE_FIELD_META = 'UNIQUE_FIELD_META';

export function UniqueField(entityName: string, fieldName: string) {
  return applyDecorators(
    SetMetadata(UNIQUE_FIELD_META, { entityName, fieldName }),
    UseInterceptors(UniqueFieldAspect)
  );
}
