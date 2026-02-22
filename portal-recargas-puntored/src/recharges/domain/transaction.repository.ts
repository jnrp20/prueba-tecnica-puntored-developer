import { Transaction, TransactionStatus } from './transaction';

export abstract class TransactionRepository {
  abstract create(data: {
    phoneNumber: string;
    operator: string;
    amount: number;
    status: TransactionStatus;
    userId: string;
  }): Transaction;

  abstract save(transaction: Transaction): Promise<Transaction>;

  abstract findByUserId(userId: string): Promise<Transaction[]>;
}
