import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: true, description: 'Trạng thái xử lý đăng xuất' })
  success!: boolean;
}
