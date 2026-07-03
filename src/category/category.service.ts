import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateCategoryDto) {
    // 1. Kiểm tra danh mục cha nếu có parentId
    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: {
          id: dto.parentId,
          OR: [
            { userId: null, isDefault: true },
            { userId: userId },
          ],
          isArchived: false,
        },
      });

      if (!parent) {
        throw new NotFoundException('Danh mục cha không tồn tại hoặc không khả dụng');
      }

      if (parent.type !== dto.type) {
        throw new BadRequestException('Danh mục con phải cùng loại giao dịch với danh mục cha');
      }
    }

    // 2. Tạo danh mục mới của người dùng
    return this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        color: dto.color ?? null,
        icon: dto.icon ?? null,
        parentId: dto.parentId ?? null,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isDefault: false,
        userId: userId,
      },
    });
  }

  async findAll(userId: number, type?: TransactionType, tree: boolean = false) {
    // Lấy tất cả danh mục của hệ thống (userId = null) hoặc của riêng user đó
    const categories = await this.prisma.category.findMany({
      where: {
        isArchived: false,
        AND: [
          {
            OR: [
              { userId: null, isDefault: true },
              { userId: userId },
            ],
          },
          type ? { type } : {},
        ],
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    if (tree) {
      // 1. Lọc ra các danh mục gốc (không có parentId)
      const roots = categories.filter((c) => c.parentId === null);
      
      // 2. Nhóm các danh mục con theo parentId để tìm kiếm nhanh O(N)
      const childrenMap = new Map<number, typeof categories>();
      for (const cat of categories) {
        if (cat.parentId !== null) {
          if (!childrenMap.has(cat.parentId)) {
            childrenMap.set(cat.parentId, []);
          }
          childrenMap.get(cat.parentId)!.push(cat);
        }
      }

      // 3. Ghép danh mục con vào danh mục cha
      return roots.map((parent) => ({
        ...parent,
        children: childrenMap.get(parent.id) || [],
      }));
    }

    return categories;
  }

  async findOne(userId: number, id: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        isArchived: false,
        OR: [
          { userId: null, isDefault: true },
          { userId: userId },
        ],
      },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại hoặc bạn không có quyền truy cập');
    }

    return category;
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    // 1. Tìm kiếm danh mục và kiểm tra quyền sở hữu
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.isArchived) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    if (category.userId !== userId || category.isDefault) {
      throw new ForbiddenException('Không thể chỉnh sửa danh mục mặc định của hệ thống');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    // 2. Xử lý cập nhật parentId
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parentId = null;
      } else {
        if (dto.parentId === id) {
          throw new BadRequestException('Danh mục cha không thể là chính nó');
        }

        const parent = await this.prisma.category.findFirst({
          where: {
            id: dto.parentId,
            OR: [
              { userId: null, isDefault: true },
              { userId: userId },
            ],
            isArchived: false,
          },
        });

        if (!parent) {
          throw new NotFoundException('Danh mục cha không tồn tại hoặc không khả dụng');
        }

        if (parent.type !== category.type) {
          throw new BadRequestException('Danh mục con phải cùng loại giao dịch với danh mục cha');
        }

        updateData.parentId = dto.parentId;
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: number, id: number) {
    // 1. Tìm danh mục và kiểm tra quyền sở hữu
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.isArchived) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    if (category.userId !== userId || category.isDefault) {
      throw new ForbiddenException('Không thể xóa danh mục mặc định của hệ thống');
    }

    // 2. Kiểm tra xem danh mục có đang được sử dụng ở đâu không
    const [hasTransactions, hasBudgets, hasRecurring] = await Promise.all([
      this.prisma.transaction.findFirst({ where: { categoryId: id } }),
      this.prisma.budget.findFirst({ where: { categoryId: id } }),
      this.prisma.recurringTransaction.findFirst({ where: { categoryId: id } }),
    ]);

    if (hasTransactions || hasBudgets || hasRecurring) {
      throw new BadRequestException(
        'Danh mục đang được sử dụng trong các giao dịch hoặc thiết lập ngân sách, không thể xóa'
      );
    }

    // 3. Gỡ liên kết danh mục cha cho các danh mục con (chuyển các con thành danh mục gốc)
    await this.prisma.category.updateMany({
      where: { parentId: id, userId: userId },
      data: { parentId: null },
    });

    // 4. Xóa danh mục
    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Đã xóa danh mục thành công' };
  }
}
