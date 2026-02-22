import { BadRequestException } from '@nestjs/common';
export type TransactionStatus = 'SUCCESS' | 'FAILED';

export class Transaction {
  constructor(
    public id: string | null,
    public phoneNumber: string,
    public operator: string,
    public amount: number,
    public status: TransactionStatus,
    public createdAt: Date,
    public user: {
      id: string;
      username: string;
    },
  ) {
    if (amount < 1000 || amount > 100000) {
      throw new BadRequestException('Monto fuera de rango permitido');
    }

    if (phoneNumber.charAt(0) !== '3') {
      throw new BadRequestException('Número de teléfono debe iniciar con 3');
    }
    if (phoneNumber.length !== 10) {
      throw new BadRequestException('Número de teléfono debe tener 10 dígitos');
    }
  }
}
