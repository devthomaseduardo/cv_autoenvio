import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Security ──────────────────────────────
  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  // ── Validation Pipe ────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,         // auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── API Prefix ─────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger (only in dev) ──────────────────
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('JobTailor API')
      .setDescription(
        '🎯 AI-Powered Professional Job Matching System\n\n' +
        'Paste a job URL → AI analyzes → tailors your resume → generates cover letter → tracks applications.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('auth', 'Authentication & Authorization')
      .addTag('users', 'User Profile Management')
      .addTag('jobs', 'Job Discovery & Analysis')
      .addTag('resumes', 'Resume Management & Tailoring')
      .addTag('applications', 'Application Tracking')
      .addTag('ai', 'AI Engine')
      .addTag('analytics', 'Dashboard & Analytics')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });

    logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  // ── Graceful Shutdown ─────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 JobTailor running on http://localhost:${port}/api/v1`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
