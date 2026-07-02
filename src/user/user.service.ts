import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const {
      fullName,
      avatarUrl,
      phoneNumber,
      dateOfBirth,
      bio,
      occupation,
      defaultCurrencyCode,
      language,
      timezone,
      startDayOfMonth,
      monthlyIncomeTarget,
    } = dto;

    const profileData: any = {};
    if (bio !== undefined) profileData.bio = bio;
    if (occupation !== undefined) profileData.occupation = occupation;
    if (defaultCurrencyCode !== undefined) profileData.defaultCurrencyCode = defaultCurrencyCode;
    if (language !== undefined) profileData.language = language;
    if (timezone !== undefined) profileData.timezone = timezone;
    if (startDayOfMonth !== undefined) profileData.startDayOfMonth = startDayOfMonth;
    if (monthlyIncomeTarget !== undefined) profileData.monthlyIncomeTarget = monthlyIncomeTarget;

    const hasProfileUpdate = Object.keys(profileData).length > 0;

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

    if (hasProfileUpdate) {
      updateData.profile = {
        upsert: {
          create: profileData,
          update: profileData,
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        profile: true,
      },
    });

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }
}
