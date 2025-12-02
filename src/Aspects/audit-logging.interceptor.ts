import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { DbService } from 'src/db/db.service';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(private prisma: DbService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const user = (req as any).user ?? { id: 0, role: 'anonymous' };

    return next.handle().pipe(
      tap(async () => {
        await this.log(req, 'SUCCESS');
      }),

      catchError((error) => {
        return from(this.log(req, 'FAILED', error)).pipe(
          switchMap(() => throwError(() => error)),
        );
      }),
    );
  }

  private async log(
    req: Request,
    status: 'SUCCESS' | 'FAILED',
    error?: any,
  ) {
    const user = (req as any).user ?? { id: 0, role: 'anonymous' };
    const endpoint = `${req.method} ${req.url}`;
    const metadata: any = {
      body: sanitizeSensitiveData(req.body),
      params: req.params,
      query: req.query,
    };

    if (error) {
      metadata.error = error?.message || error;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: req.method,
          endpoint,
          metadata,
          status,
        },
      });
    } catch (err) {
      console.error(`Audit log (${status}) failed:`, err);
    }
  }
}

@Catch()
export class AuditLoggingExceptionFilter implements ExceptionFilter {
  constructor(private prisma: DbService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const user = (req as any).user ?? { id: 0, role: 'anonymous' };
    const endpoint = `${req.method} ${req.url}`;
    const metadata: any = {
      body: sanitizeSensitiveData(req.body),
      params: req.params,
      query: req.query,
      error: exception?.message || exception,
    };

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: req.method,
          endpoint,
          metadata,
          status: 'FAILED',
        },
      });
    } catch (err) {
      console.error('Audit log (FAILED) in ExceptionFilter failed:', err);
    }

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    res.status(status).json({
      statusCode: status,
      message: exception?.message || 'Internal server error',
    });
  }
}


export function sanitizeSensitiveData(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;

  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(clone)) {
    const val = clone[key];

    if (['password', 'pwd', 'pass', 'secret'].includes(key.toLowerCase())) {
      clone[key] = '[REDACTED]';
      continue;
    }

    if (typeof val === 'object') {
      clone[key] = sanitizeSensitiveData(val);
    }
  }

  return clone;
}
