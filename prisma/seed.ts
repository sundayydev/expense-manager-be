import { neon } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TransactionType } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

function createPrismaClient(): PrismaClient {
  const useNeon = process.env.USE_NEON_ADAPTER === 'true';
  const connectionString = process.env.DATABASE_URL!;

  if (useNeon) {
    const sql = neon(connectionString);
    const adapter = new PrismaNeon(sql as any);
    return new PrismaClient({ adapter } as any);
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
  } as any);
}

const prisma = createPrismaClient();

const incomeCategories = [
  {
    name: 'Lương',
    type: TransactionType.INCOME,
    color: '#10B981',
    icon: 'Briefcase',
    sortOrder: 1,
  },
  {
    name: 'Đầu tư / Lãi',
    type: TransactionType.INCOME,
    color: '#3B82F6',
    icon: 'TrendingUp',
    sortOrder: 2,
  },
  {
    name: 'Thưởng',
    type: TransactionType.INCOME,
    color: '#F59E0B',
    icon: 'Gift',
    sortOrder: 3,
  },
  {
    name: 'Tiết kiệm',
    type: TransactionType.INCOME,
    color: '#EC4899',
    icon: 'PiggyBank',
    sortOrder: 4,
  },
  {
    name: 'Thu nhập khác',
    type: TransactionType.INCOME,
    color: '#14B8A6',
    icon: 'Wallet',
    sortOrder: 5,
  },
];

const expenseCategories = [
  {
    name: 'Ăn uống',
    type: TransactionType.EXPENSE,
    color: '#EF4444',
    icon: 'Utensils',
    sortOrder: 10,
    children: [
      { name: 'Ăn ngoài', color: '#EF4444', icon: 'Utensils', sortOrder: 11 },
      { name: 'Cà phê', color: '#F59E0B', icon: 'Coffee', sortOrder: 12 },
      {
        name: 'Siêu thị',
        color: '#10B981',
        icon: 'ShoppingCart',
        sortOrder: 13,
      },
    ],
  },
  {
    name: 'Di chuyển',
    type: TransactionType.EXPENSE,
    color: '#3B82F6',
    icon: 'Car',
    sortOrder: 20,
    children: [
      { name: 'Xe cộ', color: '#3B82F6', icon: 'Car', sortOrder: 21 },
      { name: 'Xăng dầu', color: '#F97316', icon: 'Fuel', sortOrder: 22 },
      {
        name: 'Giao thông công cộng',
        color: '#06B6D4',
        icon: 'Bus',
        sortOrder: 23,
      },
    ],
  },
  {
    name: 'Hóa đơn',
    type: TransactionType.EXPENSE,
    color: '#6366F1',
    icon: 'Home',
    sortOrder: 30,
    children: [
      { name: 'Nhà cửa', color: '#6366F1', icon: 'Home', sortOrder: 31 },
      { name: 'Điện', color: '#EAB308', icon: 'Zap', sortOrder: 32 },
      { name: 'Nước', color: '#0EA5E9', icon: 'Droplet', sortOrder: 33 },
      { name: 'Internet', color: '#8B5CF6', icon: 'Wifi', sortOrder: 34 },
      {
        name: 'Điện thoại',
        color: '#EC4899',
        icon: 'Smartphone',
        sortOrder: 35,
      },
    ],
  },
  {
    name: 'Mua sắm',
    type: TransactionType.EXPENSE,
    color: '#EC4899',
    icon: 'ShoppingBag',
    sortOrder: 40,
    children: [
      {
        name: 'Mua sắm chung',
        color: '#EC4899',
        icon: 'ShoppingBag',
        sortOrder: 41,
      },
      { name: 'Quần áo', color: '#F43F5E', icon: 'Shirt', sortOrder: 42 },
      {
        name: 'Thiết bị điện tử',
        color: '#A855F7',
        icon: 'Monitor',
        sortOrder: 43,
      },
    ],
  },
  {
    name: 'Giải trí',
    type: TransactionType.EXPENSE,
    color: '#8B5CF6',
    icon: 'Gamepad2',
    sortOrder: 50,
    children: [
      { name: 'Phim ảnh', color: '#D946EF', icon: 'Film', sortOrder: 51 },
      { name: 'Giải trí', color: '#8B5CF6', icon: 'Gamepad2', sortOrder: 52 },
      { name: 'Âm nhạc', color: '#6366F1', icon: 'Music', sortOrder: 53 },
    ],
  },
  {
    name: 'Sức khỏe',
    type: TransactionType.EXPENSE,
    color: '#10B981',
    icon: 'HeartPulse',
    sortOrder: 60,
    children: [
      { name: 'Sức khỏe', color: '#10B981', icon: 'HeartPulse', sortOrder: 61 },
      { name: 'Thuốc', color: '#14B8A6', icon: 'Pill', sortOrder: 62 },
      { name: 'Thể thao', color: '#F59E0B', icon: 'Dumbbell', sortOrder: 63 },
    ],
  },
  {
    name: 'Khác',
    type: TransactionType.EXPENSE,
    color: '#64748B',
    icon: 'GraduationCap',
    sortOrder: 70,
    children: [
      {
        name: 'Học hành',
        color: '#64748B',
        icon: 'GraduationCap',
        sortOrder: 71,
      },
      { name: 'Con cái', color: '#EC4899', icon: 'Baby', sortOrder: 72 },
      { name: 'Thú cưng', color: '#F97316', icon: 'PawPrint', sortOrder: 73 },
    ],
  },
];

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu seed cho danh mục (Categories)...');

  try {
    await prisma.category.deleteMany({
      where: {
        isDefault: true,
        userId: null,
        parentId: { not: null },
      },
    });
    await prisma.category.deleteMany({
      where: {
        isDefault: true,
        userId: null,
        parentId: null,
      },
    });
    console.log('🧹 Đã dọn dẹp các danh mục mặc định cũ.');
  } catch (err) {
    console.warn(
      '⚠️ Cảnh báo: Không thể dọn dẹp một số danh mục mặc định do ràng buộc khóa ngoại. Sẽ tiến hành cập nhật/upsert.',
    );
  }

  const findExisting = async (
    name: string,
    type: TransactionType,
    isParent: boolean,
    parentId: number | null,
  ) => {
    return await prisma.category.findFirst({
      where: {
        name,
        type,
        userId: null,
        isDefault: true,
        parentId: isParent ? null : parentId ? parentId : { not: null },
      },
    });
  };

  const upsertCategory = async (data: {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
    sortOrder: number;
    isParent: boolean;
    parentId?: number | null;
  }) => {
    const parentIdValue = data.parentId ?? null;
    const existing = await findExisting(
      data.name,
      data.type,
      data.isParent,
      parentIdValue,
    );

    if (existing) {
      if (
        existing.color !== data.color ||
        existing.icon !== data.icon ||
        existing.sortOrder !== data.sortOrder ||
        existing.parentId !== parentIdValue
      ) {
        const updated = await prisma.category.update({
          where: { id: existing.id },
          data: {
            color: data.color,
            icon: data.icon,
            sortOrder: data.sortOrder,
            parentId: parentIdValue,
          },
        });
        console.log(`✅ Đã cập nhật danh mục: "${data.name}" (${data.type})`);
        return updated;
      }
      return existing;
    } else {
      const created = await prisma.category.create({
        data: {
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon,
          sortOrder: data.sortOrder,
          isDefault: true,
          userId: null,
          parentId: parentIdValue,
        },
      });
      console.log(`🆕 Đã tạo mới danh mục: "${data.name}" (${data.type})`);
      return created;
    }
  };

  for (const cat of incomeCategories) {
    await upsertCategory({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      isParent: true,
    });
  }

  for (const parentCat of expenseCategories) {
    const parent = await upsertCategory({
      name: parentCat.name,
      type: parentCat.type,
      color: parentCat.color,
      icon: parentCat.icon,
      sortOrder: parentCat.sortOrder,
      isParent: true,
    });

    if (parentCat.children) {
      for (const childCat of parentCat.children) {
        await upsertCategory({
          name: childCat.name,
          type: parentCat.type,
          color: childCat.color,
          icon: childCat.icon,
          sortOrder: childCat.sortOrder,
          isParent: false,
          parentId: parent.id,
        });
      }
    }
  }

  console.log('🎉 Hoàn thành gieo mầm dữ liệu danh mục thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi thực hiện seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
