import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token (JWT) dùng cho các request có Bearer auth',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token (JWT) dùng để gia hạn Access Token',
  })
  refreshToken!: string;

  @ApiProperty({
    type: UserDto,
    description: 'Thông tin chi tiết người dùng vừa đăng nhập',
  })
  user!: UserDto;
}
