import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as crypto from 'crypto';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  // Generate unique trace ID for each request
  app.use((req: any, res: any, next: () => void) => {
    req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
    res.setHeader('x-trace-id', req.traceId);
    next();
  });

  // Global exception filter to format all errors using the AppResponse schema
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer interceptor
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Global API prefix: tất cả routes sẽ bắt đầu bằng /api/v1
  app.setGlobalPrefix('api/v1');

  // Global validation pipe: tự động validate DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Bỏ các field không có trong DTO
      forbidNonWhitelisted: true, // Throw lỗi nếu có field lạ
      transform: true,        // Tự động transform type (string → number...)
    }),
  );

  // Swagger & Scalar configuration
  const config = new DocumentBuilder()
    .setTitle('Expense Manager API')
    .setDescription('Tài liệu hướng dẫn sử dụng API của dự án Quản lý chi tiêu (Expense Manager)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token để xác thực các endpoint',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  app.use(
    '/reference',
    apiReference({
      theme: 'purple',
      content: document,
      configuration: {
        persistAuth: true,
        authentication: {
          preferredSecurityScheme: 'JWT-auth',
        },
      },
    } as any),
  );

  // CORS: cho phép frontend gọi API
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Expense Manager API running on: http://localhost:${port}/api/v1`);
  console.log(`❤️  Health check: http://localhost:${port}/api/v1/health`);
  console.log(`📚 API Reference (Scalar): http://localhost:${port}/reference`);
}

bootstrap();

