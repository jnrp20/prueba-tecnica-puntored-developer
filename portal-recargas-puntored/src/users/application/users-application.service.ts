import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { PasswordHasher } from '../domain/password-hasher';

@Injectable()
export class UsersApplicationService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async createUser(username: string, password: string): Promise<User> {
    const validateUserExist = await this.findByUsername(username);
    if (validateUserExist) {
      throw new ConflictException(`El usuario ${username} ya existe`);
    }
    if (password.length === 0 || password.trim() === '') {
      throw new BadRequestException(`La contraseña no puede estar vacía`);
    }
    if (password.length < 4) {
      throw new BadRequestException(`La contraseña es demasiado corta`);
    }
    const passwordHash: string = await this.passwordHasher.hash(password);
    const user: User = this.usersRepository.create(username, passwordHash);
    return this.usersRepository.save(user);
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return this.passwordHasher.compare(password, passwordHash);
  }
}
