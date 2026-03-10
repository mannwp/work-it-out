import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // Log non-HttpExceptions or 5xx errors for debugging
    if (!(exception instanceof HttpException) || status >= 500) {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let message = '';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const errorBody = exceptionResponse as Record<string, unknown>;
      const msg = errorBody.message;

      if (Array.isArray(msg)) {
        message = typeof msg[0] === 'string' ? msg[0] : 'Error';
      } else if (typeof msg === 'string') {
        message = msg;
      } else {
        message = 'Error';
      }
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      status: false,
      message: message,
      data: {},
    });
  }
}
