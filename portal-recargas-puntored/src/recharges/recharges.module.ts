import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionOrm } from './infrastructure/persistence/transaction.orm-entity';
import { RechargesApplicationService } from './application/recharges-application.service';
import { RechargesController } from './infrastructure/http/recharges.controller';
import { TransactionRepository } from './domain/transaction.repository';
import { TypeOrmTransactionRepository } from './infrastructure/typeorm-transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrm])],
  providers: [
    RechargesApplicationService,
    {
      provide: TransactionRepository,
      useClass: TypeOrmTransactionRepository,
    },
  ],
  controllers: [RechargesController],
})
export class RechargesModule {}
