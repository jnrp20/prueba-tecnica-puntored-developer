import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Operator {
  CLARO = 'CLARO',
  MOVISTAR = 'MOVISTAR',
  TIGO = 'TIGO',
  WOM = 'WOM',
  ETB = 'ETB',
  KALLEY_MOVIL = 'KALLEY_MOVIL',
  VIRGIN_MOBILE = 'VIRGIN_MOBILE',
  MOVIL_EXITO = 'MOVIL_EXITO',
  FLASH_MOBILE = 'FLASH_MOBILE',
  LIWA = 'LIWA',
}

export class CreateRechargeDto {
  @ApiProperty({
    description: 'Número de teléfono del usuario (10 dígitos)',
    example: '3001234567',
  })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Número de teléfono inválido' })
  phoneNumber: string;

  @ApiProperty({
    enum: Operator,
    description: 'Operador del servicio de telefonía',
    example: Operator.CLARO,
  })
  @IsEnum(Operator)
  operator: Operator;

  @ApiProperty({
    description: 'Monto de la recarga',
    example: 5000,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
