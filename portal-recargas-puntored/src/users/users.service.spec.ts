import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
    repository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  });

  it('debería lanzar ConflictException si el usuario ya existe', async () => {
    const existingUser = { id: '1', username: 'demo' } as User;
    jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser);

    await expect(
      service.createUser('demo', 'password'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('debería lanzar ConflictException si el username está vacío', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(
      service.createUser('', 'password'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('debería crear un usuario nuevo cuando no existe', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const createdUser = {
      id: '1',
      username: 'nuevo',
      passwordHash: 'hashed',
    } as User;

    jest.spyOn(repository, 'create').mockReturnValue(createdUser);
    jest.spyOn(repository, 'save').mockResolvedValue(createdUser);

    const result = await service.createUser('nuevo', 'password');

    expect(repository.findOne).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(repository.create).toHaveBeenCalledWith({
      username: 'nuevo',
      passwordHash: 'hashed',
    });
    expect(repository.save).toHaveBeenCalledWith(createdUser);
    expect(result).toBe(createdUser);
  });

  it('debería validar correctamente la contraseña', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validatePassword('password', 'hashed');

    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
    expect(result).toBe(true);
  });
});
