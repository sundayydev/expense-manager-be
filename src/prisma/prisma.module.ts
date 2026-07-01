import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Global module để inject PrismaService vào bất kỳ module nào
 * @Global() giúp không cần import PrismaModule trong từng module con
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
