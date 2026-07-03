import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ăn uống', description: 'Tên danh mục' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là một chuỗi ký tự' })
  name!: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Loại giao dịch (INCOME hoặc EXPENSE)',
  })
  @IsNotEmpty({ message: 'Loại giao dịch không được để trống' })
  @IsEnum(TransactionType, { message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' })
  type!: TransactionType;

  @ApiPropertyOptional({ example: '#EF4444', description: 'Mã màu sắc (hex)', nullable: true })
  @IsOptional()
  @IsString({ message: 'Mã màu phải là một chuỗi ký tự' })
  color?: string;

  @ApiPropertyOptional({ example: 'Utensils', description: 'Tên icon từ thư viện Lucide React', nullable: true })
  @IsOptional()
  @IsString({ message: 'Tên icon phải là một chuỗi ký tự' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục cha (nếu muốn tạo danh mục con)', nullable: true })
  @IsOptional()
  @IsInt({ message: 'ID danh mục cha phải là số nguyên' })
  @Min(1, { message: 'ID danh mục cha phải lớn hơn 0' })
  parentId?: number;

  @ApiPropertyOptional({ example: 'Mô tả chi tiết', description: 'Mô tả ngắn gọn về danh mục', nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là một chuỗi ký tự' })
  description?: string;

  @ApiPropertyOptional({ example: 0, description: 'Thứ tự hiển thị', default: 0 })
  @IsOptional()
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  sortOrder?: number;
}
