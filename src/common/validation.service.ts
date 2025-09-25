
import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';


@Injectable()
export class VallidationService {
  validate<T>(zodType: ZodType<any>, data: unknown): T {
    return zodType.parse(data) as T;
  }
}

