import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'root@gmail.com',
    description: 'Địa chỉ email người dùng',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ tên đầy đủ' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName!: string;

  @ApiProperty({
    example: 'Admin@2026',
    description: 'Mật khẩu đăng nhập',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;
}
