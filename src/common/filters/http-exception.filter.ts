import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | null = 'Internal server error';
    let type: string | null = exception.constructor?.name || 'Error';
    
    // Generate traceId or read it from request headers
    const traceId =
      request.headers?.['x-trace-id'] ||
      request.traceId ||
      crypto.randomUUID();

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resContent = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        message = (resContent as any).message || exception.message;
        if ((resContent as any).type) {
          type = (resContent as any).type;
        }
      } else {
        message = exception.message || String(resContent);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Format output message if it's an array (like in validation exceptions)
    const formattedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;

    response.status(statusCode).json({
      type,
      message: formattedMessage,
      result: false,
      statusCode,
      traceId,
    });
  }
}
