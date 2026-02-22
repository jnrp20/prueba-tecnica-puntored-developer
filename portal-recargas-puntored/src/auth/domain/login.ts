import { BadRequestException } from '@nestjs/common';

export class Login {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {
    if (username.length === 0 || username.trim() === '') {
      throw new BadRequestException(`El usuario no puede estar vacío dominio`);
    }

    if (password.length === 0 || password.trim() === '') {
      throw new BadRequestException(`La contraseña no puede estar vacía`);
    }
    if (password.length < 4) {
      throw new BadRequestException(`La contraseña es demasiado corta`);
    }
  }
}
