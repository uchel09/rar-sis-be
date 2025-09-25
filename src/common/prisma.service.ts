import { Logger } from 'winston';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Prisma, PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'query' },
      ],
    });
  }

  onModuleInit() {
    this.$on('info', (e) => {
      this.logger.info(e.message, { target: e.target });
    });

    this.$on('warn', (e) => {
      this.logger.warn(e.message, { target: e.target });
    });

    this.$on('error', (e) => {
      this.logger.error(e.message, { target: e.target });
    });

    this.$on('query', (e) => {
      let params: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params = JSON.parse(e.params);
        // Mask password biar ga bocor
        if (Array.isArray(params)) {
          params = params.map(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            (p, i) => (i === 2 ? '***' : p), // asumsi index ke-2 itu password
          );
        }
      } catch {
        params = e.params;
      }

      this.logger.debug('Prisma Query', {
        query: e.query,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params,
        duration: `${e.duration}ms`,
      });
    });
  }
}
