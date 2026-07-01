import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface ApiResponse<T> {
  type: string | null;
  message: string | null;
  result: boolean;
  statusCode: number;
  traceId: string | null;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<any>();
    const response = ctx.getResponse<any>();
    const statusCode = response.statusCode;

    // Get the custom message metadata from decorator
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Thao tác thành công';

    return next.handle().pipe(
      map((data) => {
        // If the return value is already in standard response structure, bypass
        if (
          data &&
          typeof data === 'object' &&
          'result' in data &&
          'statusCode' in data
        ) {
          return data;
        }

        return {
          type: 'Success',
          message,
          result: true,
          statusCode,
          traceId: request.traceId || null,
          data: data !== undefined ? data : null,
        };
      }),
    );
  }
}
