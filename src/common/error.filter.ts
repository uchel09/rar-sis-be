import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      response.status(status).json({
        errors: errorResponse,
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: 'Validation Error',
        details: exception.issues.map((issue: ZodIssue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    } else {
      response.status(500).json({
        errors:
          exception instanceof Error
            ? exception.message
            : 'Internal server error',
      });
    }
  }
}
