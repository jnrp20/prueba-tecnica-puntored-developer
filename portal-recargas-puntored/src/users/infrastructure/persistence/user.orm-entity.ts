import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column()
  passwordHash: string;
}
