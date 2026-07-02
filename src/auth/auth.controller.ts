import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { UserDto } from './dto/user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { AppResponse } from '../common/exceptions/app-response.exception';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiSuccessResponse(UserDto, { statusCode: 201, description: 'Đăng ký thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 409, description: 'Email hoặc tên đăng nhập đã được sử dụng.', type: AppResponse })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiSuccessResponse(LoginResponseDto, { description: 'Đăng nhập thành công và trả về JWT token.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác.', type: AppResponse })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  @ApiSuccessResponse(TokenResponseDto, { description: 'Làm mới token thành công.' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn.', type: AppResponse })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất và thu hồi Refresh Token' })
  @ApiSuccessResponse(LogoutResponseDto, { description: 'Đăng xuất thành công.' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiSuccessResponse(UserDto, { description: 'Lấy thông tin thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token không hợp lệ.', type: AppResponse })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.sub);
  }
}
