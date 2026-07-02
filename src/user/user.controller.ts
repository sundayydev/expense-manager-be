import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { UserDto } from '../auth/dto/user.dto';
import { AppResponse } from '../common/exceptions/app-response.exception';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng hiện tại' })
  @ApiSuccessResponse(UserDto, { description: 'Lấy thông tin thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại.', type: AppResponse })
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ người dùng hiện tại' })
  @ApiSuccessResponse(UserDto, { description: 'Cập nhật thông tin thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại.', type: AppResponse })
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(user.sub, updateProfileDto);
  }
}
