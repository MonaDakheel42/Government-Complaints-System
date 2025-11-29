// src/Aspects/decorators/unique-composite.decorator.ts
import { SetMetadata, UseInterceptors, Type } from '@nestjs/common';
import { UniqueCompositeAspect } from '../UniqueCompositeAspect';

export const UNIQUE_COMPOSITE_META = 'UNIQUE_COMPOSITE_META';

export const UniqueComposite = (entityName: string, fields: string[]) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(UNIQUE_COMPOSITE_META, { entityName, fields })(target, key, descriptor);
    UseInterceptors(UniqueCompositeAspect)(target, key, descriptor);
  };
};
