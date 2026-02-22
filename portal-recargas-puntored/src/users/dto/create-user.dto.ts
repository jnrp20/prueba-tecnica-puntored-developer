import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'mireyapineda',
  })
  @IsNotEmpty({ message: 'El nombre de usuario no debe estar vacío' })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 4,
    example: 'demo1234',
  })
  @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;
}
