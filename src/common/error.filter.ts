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
      // 🧩 Deteksi jika error dari Prisma (biasanya punya code PXXXX)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
      const isPrismaError =
        typeof exception === 'object' &&
        exception !== null &&
        'code' in exception &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (exception as any).code?.startsWith('P');

      // 🧾 Log ke console agar developer tahu apa yang sebenarnya terjadi
      if (exception instanceof Error) {
        console.error('🔥 Prisma/SQL Error:', exception.message);
      } else {
        console.error('🔥 Unknown error:', exception);
      }

      response.status(500).json({
        errors: 'Internal server error', // 🚫 tetap aman di sisi client
      });
    }
  }
}
