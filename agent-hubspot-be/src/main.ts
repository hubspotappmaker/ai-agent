import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync("/Users/huudung/Desktop/qimtf/duplicator-hubspot-object/Duplicator-be/localhost.key"),
    cert: fs.readFileSync("/Users/huudung/Desktop/qimtf/duplicator-hubspot-object/Duplicator-be/localhost.crt"),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8386);
}
bootstrap();
