import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorData: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res?.message ?? exception.message;
      errorData = res?.error ?? null;
    } else if (exception && typeof exception === 'object') {
      message = (exception as any).message ?? message;
    }

    response.status(status).json({
      status: false,
      data: errorData,
      msg: Array.isArray(message) ? message.join('; ') : message,
      path: request.url,
    });
  }
}


