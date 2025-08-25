import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync("/Users/huudung/Desktop/agent-hubspot/agent-hubspot-be/localhost.key"),
    cert: fs.readFileSync("/Users/huudung/Desktop/agent-hubspot/agent-hubspot-be/localhost.crt"),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Agent Hubspot API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8386);
  console.log(`Server is running on https://localhost:${process.env.PORT ?? 8386}`);
  console.log(`docs is running on https://localhost:${process.env.PORT ?? 8386}/docs`);
}
bootstrap();
