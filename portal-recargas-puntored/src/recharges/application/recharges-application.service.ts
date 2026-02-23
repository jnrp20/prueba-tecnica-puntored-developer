import { BadRequestException, Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction';
import { TransactionHistoryItem } from '../infrastructure/http/dto/recharges.interface';
import { TransactionRepository } from '../domain/transaction.repository';

@Injectable()
export class RechargesApplicationService {
  constructor(private readonly transactionsRepository: TransactionRepository) {}

  async processRecharge(
    userId: string,
    dto: {
      phoneNumber: string;
      operator: string;
      amount: number;
    },
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
      userId,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findUserHistory(userId: string): Promise<TransactionHistoryItem[]> {
    const transactions = await this.transactionsRepository.findByUserId(userId);

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
