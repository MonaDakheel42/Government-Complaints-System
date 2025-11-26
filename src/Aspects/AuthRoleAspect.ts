import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Aspect } from './Aspect';

export const ROLE_ASPECT_KEY = 'role_aspect';

@Injectable()
export class AuthRoleAspect extends Aspect {
  private role?: string;

  constructor(role?: string) {
    super();
    
    this.role = role;
  }

  setRole(role: string) {
    this.role = role;
    return this;
  }

  before(context: ExecutionContext, ...parameters: any[]) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Get role from metadata if not set in constructor
    const role = this.role || this.getRoleFromMetadata(context);

    if (!role) {
      throw new ForbiddenException('Access Denied: Role is required');
    }

    if (!user) {
      throw new ForbiddenException('Unauthorized: User not authenticated');
    }

    switch (role) {
      case 'admin':
        if (user.role !== 'admin') {
          throw new ForbiddenException('Unauthorized: Admins only');
        }
        break;

      case 'employee':
        if (user.role !== 'employee') {
          throw new ForbiddenException('Unauthorized: Employees only');
        }
        break;

      case 'user':
        if (user.role !== 'user') {
          throw new ForbiddenException('Unauthorized: Users only');
        }
        break;

      default:
        throw new ForbiddenException(`Unknown role: ${role}`);
    }
  }

  private getRoleFromMetadata(context: ExecutionContext): string | undefined {
    // Try to get role from handler metadata
    const handler = context.getHandler();
    return (handler as any)[ROLE_ASPECT_KEY];
  }
}
