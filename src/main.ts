import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ErrorFilter } from './common/error.filter';
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useLogger(logger);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser())
  // ✅ aktifin CORS biar Next.js bisa akses
  app.enableCors({
    origin: ['http://localhost:3000'], // FE kamu (Next.js)
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
