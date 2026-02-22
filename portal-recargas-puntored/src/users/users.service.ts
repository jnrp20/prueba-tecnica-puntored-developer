import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(username: string, password: string): Promise<User> {
    const validateUserExist = await this.findByUsername(username);
    if (validateUserExist) {
      throw new ConflictException(`El usuario ${username} ya existe`);
    }

    if (username.length == 0) {
      throw new ConflictException(
        `El usuario ${username} no puede estar vacío`,
      );
    }

    const passwordHash: string = await bcrypt.hash(password, 10);
    const user: User = this.usersRepository.create({ username, passwordHash });
    return this.usersRepository.save(user);
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
