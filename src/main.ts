import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useLogger(logger);

  // ✅ aktifin CORS biar Next.js bisa akses
  app.enableCors({
    origin: ['http://localhost:3000'], // FE kamu (Next.js)
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
