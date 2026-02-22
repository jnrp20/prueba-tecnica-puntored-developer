import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RechargesService } from './recharges.service';
import { Transaction } from './transaction.entity';
import { CreateRechargeDto, Operator } from './dto/create-recharge.dto';

describe('RechargesService', () => {
  let service: RechargesService;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RechargesService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<RechargesService>(RechargesService);
    repository = moduleRef.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('debería lanzar error si el monto es menor al mínimo', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 500,
    };

    await expect(service.processRecharge('user-id', dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('debería lanzar error si el monto es mayor al máximo', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 200000,
    };

    await expect(service.processRecharge('user-id', dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('debería lanzar error si el número no inicia con 3', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '1001234567',
      operator: Operator.CLARO,
      amount: 5000,
    };

    await expect(service.processRecharge('user-id', dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('debería crear una transacción válida', async () => {
    const dto: CreateRechargeDto = {
      phoneNumber: '3001234567',
      operator: Operator.CLARO,
      amount: 5000,
    };

    const created = { id: 'tx-id', ...dto } as Transaction;

    jest.spyOn(repository, 'create').mockReturnValue(created);
    jest.spyOn(repository, 'save').mockResolvedValue(created);

    const result = await service.processRecharge('user-id', dto);

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });
});
