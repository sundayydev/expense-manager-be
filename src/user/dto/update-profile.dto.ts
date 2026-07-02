import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min, Max, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Đường dẫn ảnh đại diện', nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại', nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1995-01-01T00:00:00.000Z', description: 'Ngày sinh', nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Chào mọi người!', description: 'Tiểu sử', nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Kỹ sư phần mềm', description: 'Nghề nghiệp', nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: 'VND', description: 'Mã tiền tệ mặc định' })
  @IsOptional()
  @IsString()
  defaultCurrencyCode?: string;

  @ApiPropertyOptional({ example: 'vi', description: 'Ngôn ngữ sử dụng' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh', description: 'Múi giờ' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 1, description: 'Ngày bắt đầu tháng tài chính (1-28)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  startDayOfMonth?: number;

  @ApiPropertyOptional({ example: 10000000.00, description: 'Mục tiêu thu nhập hàng tháng', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncomeTarget?: number;
}
