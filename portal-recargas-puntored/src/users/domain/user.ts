import { ConflictException } from '@nestjs/common';

export class User {
  constructor(
    public id: string | null,
    public username: string,
    public passwordHash: string,
  ) {
    if (username.length === 0 || username.trim() === '') {
      throw new ConflictException(`El usuario no puede estar vacío`);
    }
  }
}
