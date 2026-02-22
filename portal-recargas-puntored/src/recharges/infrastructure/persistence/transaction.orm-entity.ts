import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrm } from '../../../users/infrastructure/persistence/user.orm-entity';

export type TransactionStatus = 'SUCCESS' | 'FAILED';

@Entity()
export class TransactionOrm {
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

  @ManyToOne(() => UserOrm)
  user: UserOrm;
}
