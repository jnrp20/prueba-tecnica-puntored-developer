import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { RechargesService } from './recharges.service';
import { RechargesController } from './recharges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [RechargesService],
  controllers: [RechargesController],
})
export class RechargesModule {}
