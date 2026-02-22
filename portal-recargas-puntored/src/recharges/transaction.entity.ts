import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type TransactionStatus = 'SUCCESS' | 'FAILED';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column()
  operator: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;
}
