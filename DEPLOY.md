# 🚀 Hướng dẫn Deploy miễn phí: Koyeb + Neon

## Kiến trúc

```
GitHub → Koyeb (NestJS API, free, always-on) 
              ↓
         Neon PostgreSQL (free, serverless)
```

**Tại sao combo này?**
- ✅ Hoàn toàn miễn phí, không cần thẻ tín dụng
- ✅ Always-on (không sleep như Render free)
- ✅ Neon free: 512MB storage, auto-scale
- ✅ Koyeb free: 1 service, 512MB RAM, shared CPU

---

## Bước 1: Tạo Database trên Neon (free)

1. Truy cập **[neon.tech](https://neon.tech)** → Sign up với GitHub
2. **New Project** → Đặt tên `expense-manager`
3. Chọn region: **AWS / Singapore** (gần Việt Nam nhất)
4. Sau khi tạo xong → **Dashboard** → copy **Connection String**:
   ```
   postgresql://user:pass@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Lưu lại connection string này

### Chạy migrations lên Neon

```bash
# Thay DATABASE_URL bằng Neon connection string vừa copy
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require" \
  pnpm db:migrate:prod
```

---

## Bước 2: Push code lên GitHub

```bash
# Nếu chưa có git remote
git init
git add .
git commit -m "feat: initial expense manager setup"

# Tạo repo trên GitHub rồi:
git remote add origin https://github.com/<username>/expense-manager.git
git push -u origin main
```

---

## Bước 3: Deploy lên Koyeb (free)

1. Truy cập **[koyeb.com](https://app.koyeb.com)** → Sign up với GitHub
2. Click **"Create App"**
3. Chọn **"GitHub"** → chọn repo `expense-manager`
4. Cấu hình:
   | Setting | Value |
   |---------|-------|
   | **Branch** | `main` |
   | **Builder** | `Dockerfile` (auto-detect) |
   | **Run command** | *(để trống, dùng CMD trong Dockerfile)* |
   | **Port** | `3000` |

5. **Environment Variables** → Add:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://...neon.tech/...` |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | *(random string dài 64 ký tự)* |
   | `JWT_REFRESH_SECRET` | *(random string dài 64 ký tự)* |

   > Tạo JWT secret ngẫu nhiên:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   > ```

6. **Health Check**:
   | Setting | Value |
   |---------|-------|
   | **Path** | `/api/v1/health` |
   | **Port** | `3000` |

7. Click **"Deploy"** → Đợi ~3-5 phút

---

## Bước 4: Auto Deploy (CI/CD)

File `.github/workflows/deploy.yml` đã được cấu hình sẵn.

Chỉ cần thêm secret vào GitHub:
1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Thêm secret: `KOYEB_API_TOKEN`
   - Lấy token tại: Koyeb Dashboard → **Account** → **API** → **Create API token**

Sau đó mỗi khi `git push origin main` → tự động deploy! 🎉

---

## Kiểm tra sau deploy

```bash
# URL của bạn trên Koyeb có dạng:
# https://expense-manager-<hash>.koyeb.app

# Test health check
curl https://expense-manager-<hash>.koyeb.app/api/v1/health

# Response:
# {"status":"ok","timestamp":"2025-...","uptime":120,"environment":"production"}
```

---

## Local Development

```bash
# Cài dependencies
pnpm install

# Chạy local (dùng PostgreSQL local hoặc Neon)
pnpm start:dev

# Mở Prisma Studio để xem data
pnpm db:studio
```

---

## Tóm tắt file đã tạo

```
expense-manager/
├── Dockerfile                        # Multi-stage build cho production
├── .dockerignore                     # Exclude dev files khỏi Docker
├── .github/
│   └── workflows/
│       └── deploy.yml                # Auto-deploy khi push lên main
├── src/
│   ├── main.ts                       # Cấu hình CORS, validation, prefix
│   ├── app.controller.ts             # Có /health endpoint
│   └── prisma/
│       ├── prisma.service.ts         # Prisma với Neon adapter
│       └── prisma.module.ts
└── prisma/
    └── schema.prisma                 # 25 models đầy đủ
```

---

## Koyeb Free Plan Limits

| Resource | Free |
|----------|------|
| Services | 1 |
| RAM | 512 MB |
| CPU | Shared |
| Bandwidth | 100 GB/tháng |
| Sleep | ❌ Không (always-on!) |
| Custom domain | ✅ |

## Neon Free Plan Limits

| Resource | Free |
|----------|------|
| Storage | 512 MB |
| Compute | 0.25 vCPU |
| Databases | 10 |
| Branches | 10 |
| Data transfer | 5 GB/tháng |
