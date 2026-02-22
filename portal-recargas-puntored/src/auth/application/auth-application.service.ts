import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersApplicationService } from '../../users/application/users-application.service';
import { User } from '../../users/domain/user';
import { TokenService } from './token.service';

@Injectable()
export class AuthApplicationService {
  constructor(
    private readonly usersService: UsersApplicationService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isValid = await this.usersService.validatePassword(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(username, password);
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.tokenService.sign(payload),
    };
  }
}
