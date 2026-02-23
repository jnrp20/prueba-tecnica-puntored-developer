import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    // Aislar la base de datos de e2e para no contaminar database.sqlite
    process.env.DB_TYPE = 'sqlite';
    process.env.DB_SQLITE_PATH = ':memory:';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) debería responder Hello World', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /error-simulado debería devolver 500', () => {
    return request(app.getHttpServer()).get('/error-simulado').expect(500);
  });

  it('POST /users debería crear un usuario nuevo', async () => {
    const username = `user_${Date.now()}`;

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ username, password: 'demo1234' })
      .expect(201);

    const body = response.body as { message: string };

    expect(body).toEqual({
      message: 'Usuario creado correctamente',
    });
  });

  it('POST /users debería devolver 400 si faltan datos', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ username: '' })
      .expect(400);

    const body = response.body as { message: string[] };

    expect(Array.isArray(body.message)).toBe(true);
  });

  it('POST /auth/login debería devolver un token con credenciales válidas', async () => {
    const username = `login_${Date.now()}`;
    const password = 'demo1234';

    await request(app.getHttpServer())
      .post('/users')
      .send({ username, password })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    const body = response.body as { access_token: string };

    expect(body.access_token).toBeDefined();
  });

  it('POST /auth/login debería devolver 401 con credenciales inválidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'noexiste', password: 'demo1234' })
      .expect(401);

    const body = response.body as { message: string };

    expect(body.message).toBe('Credenciales inválidas');
  });

  it('POST /recharges/buy debería crear una recarga válida', async () => {
    const username = `recarga_${Date.now()}`;
    const password = 'demo1234';

    await request(app.getHttpServer())
      .post('/users')
      .send({ username, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    const loginBody = loginResponse.body as { access_token: string };

    const token = loginBody.access_token;

    const response = await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phoneNumber: '3001234567',
        operator: 'CLARO',
        amount: 5000,
      })
      .expect(201);

    const body = response.body as {
      phoneNumber: string;
      amount: number;
      status: string;
    };

    expect(body.phoneNumber).toBe('3001234567');
    expect(body.amount).toBe(5000);
    expect(body.status).toBe('SUCCESS');
  });

  it('GET /recharges/history debería devolver historial sin passwordHash', async () => {
    const username = `history_${Date.now()}`;
    const password = 'demo1234';

    await request(app.getHttpServer())
      .post('/users')
      .send({ username, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    const loginBody = loginResponse.body as { access_token: string };

    const token = loginBody.access_token;

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phoneNumber: '3001234567',
        operator: 'CLARO',
        amount: 5000,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/recharges/history')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const history = response.body as Array<{
      user: {
        username: string;
        passwordHash?: string;
      };
    }>;

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].user.username).toBe(username);
    expect(history[0].user.passwordHash).toBeUndefined();
  });

  it('POST /recharges/buy debería devolver 400 si el monto es inválido', async () => {
    const username = `recarga_invalida_${Date.now()}`;
    const password = 'demo1234';

    await request(app.getHttpServer())
      .post('/users')
      .send({ username, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    const loginBody = loginResponse.body as { access_token: string };

    const token = loginBody.access_token;

    await request(app.getHttpServer())
      .post('/recharges/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phoneNumber: '3001234567',
        operator: 'CLARO',
        amount: 500,
      })
      .expect(400);
  });
});
