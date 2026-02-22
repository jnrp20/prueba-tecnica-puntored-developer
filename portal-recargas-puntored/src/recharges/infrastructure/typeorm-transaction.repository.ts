import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionOrm } from './persistence/transaction.orm-entity';
import { Transaction, TransactionStatus } from '../domain/transaction';
import { TransactionRepository } from '../domain/transaction.repository';
import { UserOrm } from '../../users/infrastructure/persistence/user.orm-entity';

@Injectable()
export class TypeOrmTransactionRepository extends TransactionRepository {
  constructor(
    @InjectRepository(TransactionOrm)
    private readonly repository: Repository<TransactionOrm>,
  ) {
    super();
  }

  private toDomain(entity: TransactionOrm): Transaction {
    return new Transaction(
      entity.id,
      entity.phoneNumber,
      entity.operator,
      entity.amount,
      entity.status,
      entity.createdAt,
      {
        id: entity.user.id,
        username: entity.user.username,
      },
    );
  }

  private toOrm(transaction: Transaction): TransactionOrm {
    const entity = new TransactionOrm();
    if (transaction.id) {
      entity.id = transaction.id;
    }
    entity.phoneNumber = transaction.phoneNumber;
    entity.operator = transaction.operator;
    entity.amount = transaction.amount;
    entity.status = transaction.status;
    entity.createdAt = transaction.createdAt;
    entity.user = { id: transaction.user.id } as UserOrm;
    return entity;
  }

  create(data: {
    phoneNumber: string;
    operator: string;
    amount: number;
    status: TransactionStatus;
    userId: string;
  }): Transaction {
    const { userId, ...rest } = data;

    const entity = this.repository.create({
      ...rest,
      user: { id: userId } as UserOrm,
    });

    return this.toDomain(entity);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const saved = await this.repository.save(this.toOrm(transaction));
    return this.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return entities.map((entity) => this.toDomain(entity));
  }
}
