# ============================================================
# Stage 1: Builder
# Cài dependencies và build TypeScript → JavaScript
# ============================================================
FROM node:22-alpine AS builder

# Cài pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files trước (tận dụng Docker layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Cài tất cả dependencies (bao gồm devDeps để build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client + Build NestJS (một lệnh)
RUN pnpm build:all

# ============================================================
# Stage 2: Production Runner
# Chỉ giữ những gì cần thiết để chạy
# ============================================================
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Tạo user không phải root để tăng bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Chỉ cài production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built app từ builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Chuyển sang user nestjs
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# Chạy migrations rồi start app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]
