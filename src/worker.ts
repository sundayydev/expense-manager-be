/**
 * Cloudflare Workers Entry Point
 *
 * NestJS không thể chạy trực tiếp trên Workers vì Workers dùng mô hình
 * fetch() handler, không phải HTTP server truyền thống.
 *
 * Giải pháp: Dùng NestJS với Express adapter, sau đó wrap vào fetch handler
 * thông qua @cloudflare/workers-nodejs-compat.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export interface Env {
  DATABASE_URL: string;
  NODE_ENV: string;
}

// Cache NestJS app instance để tái sử dụng giữa các requests (warm start)
let app: Awaited<ReturnType<typeof NestFactory.create>> | null = null;

async function getApp(env: Env) {
  if (app) return app;

  // Inject env variables vào process.env để Prisma và các module khác đọc được
  process.env.DATABASE_URL = env.DATABASE_URL;
  process.env.NODE_ENV = env.NODE_ENV || 'production';

  app = await NestFactory.create(AppModule, {
    // Tắt logger trong production để tiết kiệm CPU
    logger: env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined,
  });

  // Cấu hình CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global prefix cho tất cả routes
  app.setGlobalPrefix('api/v1');

  // Khởi tạo app nhưng không lắng nghe port (Workers dùng fetch handler)
  await app.init();

  return app;
}

/**
 * Cloudflare Workers fetch handler
 * Được gọi cho mỗi HTTP request đến Worker
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const nestApp = await getApp(env);

      // Lấy Express instance từ NestJS
      const httpAdapter = nestApp.getHttpAdapter();
      const expressApp = httpAdapter.getInstance();

      // Convert Cloudflare Request → Node.js IncomingMessage
      return await handleRequest(request, expressApp);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          statusCode: 500,
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },
};

/**
 * Chuyển đổi Cloudflare Request sang format Express có thể xử lý
 */
async function handleRequest(
  request: Request,
  expressApp: any,
): Promise<Response> {
  const url = new URL(request.url);

  // Đọc body nếu có
  let body: string | undefined;
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    request.method !== 'OPTIONS'
  ) {
    body = await request.text();
  }

  // Build headers object
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return new Promise<Response>((resolve) => {
    // Mock Node.js IncomingMessage
    const req = {
      method: request.method,
      url: url.pathname + url.search,
      headers,
      body,
      // Simulate readable stream
      on: (event: string, cb: Function) => {
        if (event === 'data' && body) cb(Buffer.from(body));
        if (event === 'end') cb();
        return req;
      },
      pipe: () => req,
      resume: () => req,
    };

    // Mock Node.js ServerResponse
    const chunks: Buffer[] = [];
    const responseHeaders: Record<string, string> = {};
    let statusCode = 200;

    const res = {
      statusCode,
      setHeader: (name: string, value: string) => {
        responseHeaders[name.toLowerCase()] = value;
      },
      getHeader: (name: string) => responseHeaders[name.toLowerCase()],
      removeHeader: (name: string) => {
        delete responseHeaders[name.toLowerCase()];
      },
      write: (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      },
      end: (chunk?: Buffer | string) => {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks);
        resolve(
          new Response(body, {
            status: res.statusCode,
            headers: responseHeaders,
          }),
        );
      },
      on: () => res,
      once: () => res,
      emit: () => false,
      writable: true,
      headersSent: false,
    };

    // Xử lý request qua Express
    expressApp(req, res);
  });
}
