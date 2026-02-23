import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthApplicationService } from './application/auth-application.service';
import { UsersApplicationService } from '../users/application/users-application.service';
import { User } from '../users/domain/user';
import { TokenService } from './application/token.service';

describe('AuthApplicationService', () => {
  let service: AuthApplicationService;
  let usersServiceMock: {
    findByUsername: jest.Mock;
    validatePassword: jest.Mock;
  };
  let tokenServiceMock: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    usersServiceMock = {
      findByUsername: jest.fn(),
      validatePassword: jest.fn(),
    };

    tokenServiceMock = {
      sign: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthApplicationService,
        {
          provide: UsersApplicationService,
          useValue: usersServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthApplicationService>(AuthApplicationService);
  });

  it('debería devolver el usuario si las credenciales son válidas', async () => {
    const user: User = {
      id: '1',
      username: 'demo',
      passwordHash: 'hashed',
    } as User;

    usersServiceMock.findByUsername.mockResolvedValue(user);
    usersServiceMock.validatePassword.mockResolvedValue(true);

    const result = await service.validateUser('demo', 'password');

    expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('demo');
    expect(usersServiceMock.validatePassword).toHaveBeenCalledWith(
      'password',
      'hashed',
    );
    expect(result).toBe(user);
  });

  it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
    usersServiceMock.findByUsername.mockResolvedValue(null);

    await expect(
      service.validateUser('noexiste', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('debería lanzar UnauthorizedException si la contraseña es inválida', async () => {
    const user: User = {
      id: '1',
      username: 'demo',
      passwordHash: 'hashed',
    } as User;

    usersServiceMock.findByUsername.mockResolvedValue(user);
    usersServiceMock.validatePassword.mockResolvedValue(false);

    await expect(
      service.validateUser('demo', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('debería devolver un token al hacer login', async () => {
    const user: User = {
      id: '1',
      username: 'demo',
      passwordHash: 'hashed',
    } as User;

    usersServiceMock.findByUsername.mockResolvedValue(user);
    usersServiceMock.validatePassword.mockResolvedValue(true);
    tokenServiceMock.sign.mockReturnValue('jwt-token');

    const result = await service.login('demo', 'password');

    expect(tokenServiceMock.sign).toHaveBeenCalledWith({
      sub: '1',
      username: 'demo',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });
});
