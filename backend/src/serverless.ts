import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let app: any;

export async function getApp() {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule, { logger: false });
    nestApp.enableCors({ origin: true, credentials: true });
    nestApp.setGlobalPrefix('api/v1');
    nestApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
    );
    await nestApp.init();
    app = nestApp.getHttpAdapter().getInstance();
  }
  return app;
}
