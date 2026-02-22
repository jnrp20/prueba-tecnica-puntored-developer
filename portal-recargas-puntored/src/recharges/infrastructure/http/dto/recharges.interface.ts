import { Transaction } from '../../../domain/transaction';

export interface UserPublic {
  id: string;
  username: string;
}

export interface TransactionHistoryItem {
  id: string | null;
  phoneNumber: string;
  operator: string;
  amount: number;
  status: Transaction['status'];
  createdAt: Date;
  user: UserPublic;
}
