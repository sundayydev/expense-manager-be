import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Ăn uống (đã chỉnh sửa)', description: 'Tên danh mục' })
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là một chuỗi ký tự' })
  name?: string;

  @ApiPropertyOptional({ example: '#FF5733', description: 'Mã màu sắc (hex)', nullable: true })
  @IsOptional()
  @IsString({ message: 'Mã màu phải là một chuỗi ký tự' })
  color?: string;

  @ApiPropertyOptional({ example: 'Coffee', description: 'Tên icon từ thư viện Lucide React', nullable: true })
  @IsOptional()
  @IsString({ message: 'Tên icon phải là một chuỗi ký tự' })
  icon?: string;

  @ApiPropertyOptional({ example: null, description: 'ID danh mục cha (nếu muốn làm danh mục gốc, hãy truyền null)', nullable: true })
  @IsOptional()
  @IsInt({ message: 'ID danh mục cha phải là số nguyên' })
  @Min(1, { message: 'ID danh mục cha phải lớn hơn 0' })
  parentId?: number | null;

  @ApiPropertyOptional({ example: 'Mô tả đã thay đổi', description: 'Mô tả ngắn gọn về danh mục', nullable: true })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là một chuỗi ký tự' })
  description?: string;

  @ApiPropertyOptional({ example: 5, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  sortOrder?: number;
}
