import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';




@Injectable()
export class DbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // log: ['query'/*, 'info'*/, 'warn', 'error'],
    });
  }

  async onModuleInit() {
    const maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.$connect();
        console.log('Prisma connected');
        break;
      } catch (err) {
        attempt++;
        const wait = 2000 * attempt; // backoff
        console.warn(`Prisma connect attempt ${attempt} failed. Retrying in ${wait}ms`);
        await new Promise((res) => setTimeout(res, wait));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('SIGINT', async () => {
      console.log('Received SIGINT. Closing Prisma...');
      await this.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM. Closing Prisma...');
      await this.$disconnect();
      process.exit(0);
    });
  }
}