import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrm } from './persistence/user.orm-entity';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrm)
    private readonly repository: Repository<UserOrm>,
  ) {
    super();
  }

  private toDomain(entity: UserOrm | null): User | null {
    if (!entity) return null;
    return new User(entity.id, entity.username, entity.passwordHash);
  }

  private toOrm(user: User): UserOrm {
    const entity = new UserOrm();
    if (user.id) {
      entity.id = user.id;
    }
    entity.username = user.username;
    entity.passwordHash = user.passwordHash;
    return entity;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return this.toDomain(entity);
  }

  create(username: string, passwordHash: string): User {
    return new User(null, username, passwordHash);
  }

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(this.toOrm(user));
    return this.toDomain(saved) as User;
  }
}
