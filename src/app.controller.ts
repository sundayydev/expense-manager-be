import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { ApiSuccessResponse } from './common/decorators/api-response.decorator';
import { ProfileResponseDto } from './auth/dto/user.dto';
import { AppResponse } from './common/exceptions/app-response.exception';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Trạng thái hoạt động' })
  status!: string;

  @ApiProperty({ example: '2026-07-02T09:00:00.000Z', description: 'Thời gian hiện tại của hệ thống' })
  timestamp!: string;

  @ApiProperty({ example: 120, description: 'Thời gian hệ thống đã chạy liên tục (giây)' })
  uptime!: number;

  @ApiProperty({ example: 'development', description: 'Môi trường chạy ứng dụng' })
  environment!: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint chào mừng' })
  @ApiSuccessResponse('string', { description: 'Trả về chuỗi chào mừng' })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint
   * Koyeb và các platform khác dùng endpoint này để kiểm tra app còn sống không
   * GET /api/v1/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hệ thống' })
  @ApiSuccessResponse(HealthCheckResponseDto, { description: 'Trạng thái hoạt động của hệ thống' })
  healthCheck(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Protected demo endpoint
   * GET /api/v1/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin profile người dùng đăng nhập' })
  @ApiSuccessResponse(ProfileResponseDto, { description: 'Lấy thông tin profile thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token không hợp lệ.', type: AppResponse })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
