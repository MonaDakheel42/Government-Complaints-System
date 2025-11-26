import { UseInterceptors } from '@nestjs/common';
import { AuthRoleAspect } from '../AuthRoleAspect';

/**
 * Decorator to use AuthRoleAspect for role-based authorization
 * This decorator applies the AuthRoleAspect interceptor to check user roles
 * 
 * @param role - The required role ('admin', 'employee', or 'user')
 * 
 * @example
 * ```typescript
 * @UseRoleAspect('admin')
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard)
 * adminOnly() {
 *   return 'Admin only endpoint';
 * }
 * ```
 */
export const UseRoleAspect = (role: string) => {
  return UseInterceptors(new AuthRoleAspect(role));
};
