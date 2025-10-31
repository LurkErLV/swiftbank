import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [HealthModule, AuthModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
