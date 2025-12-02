import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuditLoggingExceptionFilter, AuditLoggingInterceptor } from './Aspects/audit-logging.interceptor';
import { DbService } from './db/db.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  const dbService=app.get(DbService);
  app.useGlobalInterceptors(new AuditLoggingInterceptor(dbService));
  app.useGlobalFilters(new AuditLoggingExceptionFilter(dbService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
