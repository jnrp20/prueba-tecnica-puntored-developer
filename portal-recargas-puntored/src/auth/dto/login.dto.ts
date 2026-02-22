import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'demo' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 4,
    example: 'demo1234',
  })
  @IsString()
  @MinLength(4)
  password: string;
}
