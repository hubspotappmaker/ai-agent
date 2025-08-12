import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If controller already returned a wrapped object that matches our shape, keep it
        if (data && typeof data === 'object' && 'status' in data && 'data' in data && 'msg' in data) {
          return data;
        }
        return {
          status: true,
          data: data ?? null,
          msg: 'OK',
        };
      }),
    );
  }
}


