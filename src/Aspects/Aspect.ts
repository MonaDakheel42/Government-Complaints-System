import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError, from } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

@Injectable()
export abstract class Aspect implements NestInterceptor {
  /**
   * قبل تنفيذ الدالة
   */
  before(context: ExecutionContext, ...parameters: any[]): void | Promise<void> {}

  /**
   * بعد تنفيذ الدالة
   */
  after(context: ExecutionContext, result: any, ...parameters: any[]): void | Promise<void> {}

  /**
   * عند حصول أي خطأ
   */
  onException(error: any, ...parameters: any[]): Observable<any> {
    const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    return throwError(() => new HttpException(
      { message: error?.message || 'Internal server error' },
      status,
    ));
  }

  intercept(context: ExecutionContext, next: CallHandler, ...parameters: any[]): Observable<any> {
    // نفذ قبل التنفيذ
    const before$ = from(Promise.resolve(this.before(context, ...parameters)));

    return before$.pipe(
      mergeMap(() =>
        next.handle().pipe(
          mergeMap((result) =>
            // نفذ بعد التنفيذ
            from(Promise.resolve(this.after(context, result, ...parameters))).pipe(
              mergeMap(() => from([result])) // نرجع نفس النتيجة
            )
          ),
          catchError((err) => this.onException(err, ...parameters))
        )
      )
    );
  }
}
