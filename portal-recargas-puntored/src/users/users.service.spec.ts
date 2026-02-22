import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersApplicationService } from './application/users-application.service';
import { User } from './domain/user';
import { UserRepository } from './domain/user.repository';
import { PasswordHasher } from './domain/password-hasher';

describe('UsersApplicationService', () => {
  let service: UsersApplicationService;
  let userRepositoryMock: {
    findByUsername: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let passwordHasherMock: {
    hash: jest.Mock;
    compare: jest.Mock;
  };

  beforeEach(async () => {
    userRepositoryMock = {
      findByUsername: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    passwordHasherMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersApplicationService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: PasswordHasher,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    service = moduleRef.get<UsersApplicationService>(UsersApplicationService);
  });

  it('debería lanzar ConflictException si el usuario ya existe', async () => {
    const existingUser = { id: '1', username: 'demo' } as User;
    userRepositoryMock.findByUsername.mockResolvedValue(existingUser);

    await expect(service.createUser('demo', 'password')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('debería lanzar ConflictException si el username está vacío', async () => {
    userRepositoryMock.findByUsername.mockResolvedValue(null);

    await expect(service.createUser('', 'password')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('debería crear un usuario nuevo cuando no existe', async () => {
    userRepositoryMock.findByUsername.mockResolvedValue(null);
    passwordHasherMock.hash.mockResolvedValue('hashed');

    const createdUser = {
      id: '1',
      username: 'nuevo',
      passwordHash: 'hashed',
    } as User;

    userRepositoryMock.create.mockReturnValue(createdUser);
    userRepositoryMock.save.mockResolvedValue(createdUser);

    const result = await service.createUser('nuevo', 'password');

    expect(userRepositoryMock.findByUsername).toHaveBeenCalled();
    expect(passwordHasherMock.hash).toHaveBeenCalledWith('password');
    expect(userRepositoryMock.create).toHaveBeenCalledWith('nuevo', 'hashed');
    expect(userRepositoryMock.save).toHaveBeenCalledWith(createdUser);
    expect(result).toBe(createdUser);
  });

  it('debería validar correctamente la contraseña', async () => {
    passwordHasherMock.compare.mockResolvedValue(true);

    const result = await service.validatePassword('password', 'hashed');

    expect(passwordHasherMock.compare).toHaveBeenCalledWith(
      'password',
      'hashed',
    );
    expect(result).toBe(true);
  });
});
