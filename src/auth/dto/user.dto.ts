import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ID hồ sơ' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID người dùng liên kết' })
  userId!: number;

  @ApiProperty({
    example: 'Chào mọi người!',
    nullable: true,
    description: 'Tiểu sử',
  })
  bio!: string | null;

  @ApiProperty({
    example: 'Kỹ sư phần mềm',
    nullable: true,
    description: 'Nghề nghiệp',
  })
  occupation!: string | null;

  @ApiProperty({ example: 'VND', description: 'Mã tiền tệ mặc định' })
  defaultCurrencyCode!: string;

  @ApiProperty({ example: 'vi', description: 'Ngôn ngữ sử dụng' })
  language!: string;

  @ApiProperty({ example: 'Asia/Ho_Chi_Minh', description: 'Múi giờ' })
  timezone!: string;

  @ApiProperty({ example: 1, description: 'Ngày bắt đầu tháng tài chính' })
  startDayOfMonth!: number;

  @ApiProperty({
    example: '10000000.00',
    nullable: true,
    description: 'Mục tiêu thu nhập hàng tháng',
  })
  monthlyIncomeTarget!: string | null;

  @ApiProperty({ example: '2026-07-02T08:00:00.000Z', description: 'Ngày tạo' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-02T08:30:00.000Z',
    description: 'Ngày cập nhật gần nhất',
  })
  updatedAt!: Date;
}

export class UserDto {
  @ApiProperty({ example: 1, description: 'ID người dùng' })
  id!: number;

  @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email' })
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  fullName!: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'Đường dẫn ảnh đại diện',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại',
    nullable: true,
  })
  phoneNumber!: string | null;

  @ApiProperty({
    example: '1995-01-01T00:00:00.000Z',
    description: 'Ngày sinh',
    nullable: true,
  })
  dateOfBirth!: Date | null;

  @ApiProperty({ example: false, description: 'Email đã được xác thực chưa' })
  isEmailVerified!: boolean;

  @ApiProperty({ example: true, description: 'Trạng thái hoạt động' })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-07-02T09:00:00.000Z',
    description: 'Lần đăng nhập cuối cùng',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @ApiProperty({
    example: '2026-07-02T08:00:00.000Z',
    description: 'Thời gian tạo',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-02T08:30:00.000Z',
    description: 'Thời gian cập nhật gần nhất',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: UserProfileDto,
    nullable: true,
    required: false,
    description: 'Hồ sơ người dùng mở rộng',
  })
  profile?: UserProfileDto | null;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 1, description: 'ID người dùng (subject)' })
  sub!: number;

  @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email' })
  email!: string;
}
