import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RechargesApplicationService } from './application/recharges-application.service';
import { Transaction } from './domain/transaction';
import {
  CreateRechargeDto,
  Operator,
} from './infrastructure/http/dto/create-recharge.dto';
import { TransactionRepository } from './domain/transaction.repository';

describe('RechargesApplicationService', () => {
  let service: RechargesApplicationService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    findByUserId: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findByUserId: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RechargesApplicationService,
        {
          provide: TransactionRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get<RechargesApplicationService>(
      RechargesApplicationService,
    );
  });

  it('debería lanzar error si el monto es menor al mínimo', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 500,
    };

    await expect(
      service.processRecharge('user-id', dto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debería lanzar error si el monto es mayor al máximo', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 200000,
    };

    await expect(
      service.processRecharge('user-id', dto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debería lanzar error si el número no inicia con 3', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '1001234567',
      operator: Operator.CLARO,
      amount: 5000,
    };

    await expect(
      service.processRecharge('user-id', dto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debería crear una transacción válida', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 5000,
    };

    const created = { id: 'tx-id', ...dto } as Transaction;

    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.processRecharge('user-id', dto);

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });
});
