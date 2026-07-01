import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        passwordHash,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  private async generateTokens(userId: number, email: string, username: string) {
    const payload = { sub: userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    this.prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch((err) => {
        console.error('Error updating lastLoginAt:', err);
      });

    const tokens = await this.generateTokens(user.id, user.email, user.username);

    // Save refresh token to user_sessions table
    const refreshExpiresInRaw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    let days = 7;
    const match = refreshExpiresInRaw.match(/^(\d+)d$/);
    if (match) {
      days = parseInt(match[1], 10);
    }
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  async refresh(refreshToken: string) {
    try {
      // 1. Verify token signature
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
      });

      // 2. Check if the token exists in database and is not expired
      const session = await this.prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Refresh token không tồn tại hoặc đã bị thu hồi');
      }

      if (session.expiresAt < new Date()) {
        await this.prisma.userSession.delete({ where: { id: session.id } }).catch(() => {});
        throw new UnauthorizedException('Refresh token đã hết hạn');
      }

      // 3. Generate new tokens (Refresh Token Rotation)
      const tokens = await this.generateTokens(session.user.id, session.user.email, session.user.username);

      const refreshExpiresInRaw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      let days = 7;
      const match = refreshExpiresInRaw.match(/^(\d+)d$/);
      if (match) {
        days = parseInt(match[1], 10);
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // 4. Update the session with new refresh token and expiration
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt,
        },
      });

      return tokens;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.userSession.delete({
      where: { refreshToken },
    }).catch(() => {
      // Ignore if session does not exist
    });
    return { success: true };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }
}
