import { User } from './user';

export abstract class UserRepository {
  abstract findByUsername(username: string): Promise<User | null>;
  abstract create(username: string, passwordHash: string): User;
  abstract save(user: User): Promise<User>;
}
