import { UseInterceptors } from '@nestjs/common';
import { AuthRoleAspect } from '../AuthRoleAspect';

export const UseRoleAspect = (role: string) => {
  return UseInterceptors(new AuthRoleAspect(role));
};
