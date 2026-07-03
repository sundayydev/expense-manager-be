import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CategoryDto {
  @ApiProperty({ example: 1, description: 'ID danh mục' })
  id!: number;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'ID người dùng (null nếu là danh mục mặc định của hệ thống)',
  })
  userId!: number | null;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'ID danh mục cha (null nếu là danh mục gốc)',
  })
  parentId!: number | null;

  @ApiProperty({ example: 'Ăn uống', description: 'Tên danh mục' })
  name!: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Loại giao dịch (INCOME hoặc EXPENSE)',
  })
  type!: TransactionType;

  @ApiProperty({
    example: '#EF4444',
    nullable: true,
    description: 'Mã màu hiển thị dạng hex',
  })
  color!: string | null;

  @ApiProperty({
    example: 'Utensils',
    nullable: true,
    description: 'Tên icon từ thư viện Lucide React',
  })
  icon!: string | null;

  @ApiProperty({
    example: 'Chi tiêu ăn uống hàng ngày',
    nullable: true,
    description: 'Mô tả chi tiết về danh mục',
  })
  description!: string | null;

  @ApiProperty({
    example: true,
    description: 'Có phải danh mục hệ thống mặc định không',
  })
  isDefault!: boolean;

  @ApiProperty({
    example: false,
    description: 'Danh mục đã bị đưa vào kho lưu trữ chưa',
  })
  isArchived!: boolean;

  @ApiProperty({
    example: 10,
    description: 'Thứ tự sắp xếp hiển thị',
  })
  sortOrder!: number;

  @ApiProperty({
    example: '2026-07-03T09:00:00.000Z',
    description: 'Ngày tạo danh mục',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-03T09:00:00.000Z',
    description: 'Ngày cập nhật danh mục gần nhất',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => [CategoryDto],
    required: false,
    description: 'Danh sách các danh mục con (chỉ xuất hiện trong cấu trúc dạng cây)',
  })
  children?: CategoryDto[];
}
