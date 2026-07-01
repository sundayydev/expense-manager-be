import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

function createPrismaClient(): InstanceType<typeof PrismaClient> {
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
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  } as any);
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: InstanceType<typeof PrismaClient>;

  get user() {
    return this.client.user;
  }
  get userProfile() {
    return this.client.userProfile;
  }
  get userSession() {
    return this.client.userSession;
  }
  get currency() {
    return this.client.currency;
  }
  get exchangeRate() {
    return this.client.exchangeRate;
  }
  get userCurrencySetting() {
    return this.client.userCurrencySetting;
  }
  get account() {
    return this.client.account;
  }
  get category() {
    return this.client.category;
  }
  get tag() {
    return this.client.tag;
  }
  get transaction() {
    return this.client.transaction;
  }
  get transactionTag() {
    return this.client.transactionTag;
  }
  get transactionSplit() {
    return this.client.transactionSplit;
  }
  get recurringTransaction() {
    return this.client.recurringTransaction;
  }
  get budget() {
    return this.client.budget;
  }
  get budgetAlert() {
    return this.client.budgetAlert;
  }
  get savingGoal() {
    return this.client.savingGoal;
  }
  get goalContribution() {
    return this.client.goalContribution;
  }
  get debt() {
    return this.client.debt;
  }
  get debtRepayment() {
    return this.client.debtRepayment;
  }
  get attachment() {
    return this.client.attachment;
  }
  get notification() {
    return this.client.notification;
  }
  get report() {
    return this.client.report;
  }
  get auditLog() {
    return this.client.auditLog;
  }

  // Expose raw query methods
  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client);
  }
  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client);
  }
  get $queryRawUnsafe() {
    return this.client.$queryRawUnsafe.bind(this.client);
  }
  get $executeRawUnsafe() {
    return this.client.$executeRawUnsafe.bind(this.client);
  }
  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  constructor() {
    this.client = createPrismaClient();
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  /**
   * Helper: Xóa toàn bộ dữ liệu (chỉ dùng trong môi trường test)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase chỉ được phép trong môi trường test!');
    }
    await this.client.$executeRaw`
      TRUNCATE TABLE audit_logs, notifications, reports,
        attachments, debt_repayments, debts, goal_contributions, saving_goals,
        budget_alerts, budgets, recurring_transactions, transaction_splits,
        transaction_tags, transactions, tags, categories, accounts,
        user_currency_settings, exchange_rates, currencies, user_sessions,
        user_profiles, users CASCADE
    `;
  }
}
