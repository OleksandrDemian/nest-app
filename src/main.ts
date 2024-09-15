import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // use fastify adapter for better performance
  const app = await NestFactory.create(AppModule, new FastifyAdapter());

  // enable payload validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // throw an error if a non-whitelisted property is present in the payload
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Explorer')
    .setDescription('Explore ecommerce API')
    .setVersion('0.0.1')
    .addTag('ecommerce')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-explorer', app, document);

  await app.listen(3000);
}
bootstrap();
