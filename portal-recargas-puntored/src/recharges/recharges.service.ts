import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { User } from '../users/user.entity';
import { TransactionHistoryItem } from './dto/recharges.interface';

@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async processRecharge(
    userId: string,
    dto: CreateRechargeDto,
  ): Promise<Transaction> {
    if (dto.amount < 1000 || dto.amount > 100000) {
      throw new BadRequestException('Monto fuera de rango permitido');
    }

    if (dto.phoneNumber.charAt(0) !== '3') {
      throw new BadRequestException('Número de teléfono debe iniciar con 3');
    }

    const transaction = this.transactionsRepository.create({
      phoneNumber: dto.phoneNumber,
      operator: dto.operator,
      amount: dto.amount,
      status: 'SUCCESS',
      user: { id: userId } as User,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findUserHistory(userId: string): Promise<TransactionHistoryItem[]> {
    const transactions = await this.transactionsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      phoneNumber: transaction.phoneNumber,
      operator: transaction.operator,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
      user: {
        id: transaction.user.id,
        username: transaction.user.username,
      },
    }));
  }
}
