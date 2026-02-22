import { Transaction } from '../transaction.entity';

export interface UserPublic {
  id: string;
  username: string;
}

export interface TransactionHistoryItem {
  id: string;
  phoneNumber: string;
  operator: string;
  amount: number;
  status: Transaction['status'];
  createdAt: Date;
  user: UserPublic;
}
