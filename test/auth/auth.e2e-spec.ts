import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app/app.module';
import { generateAuthDto, loginUser, registerUser } from './auth.e2e-utils';

describe('Auth e2e tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register', () => {
    it('should register a user', async () => {
      const dto = generateAuthDto();

      const response = await registerUser(app, dto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: dto.email,
      });
    });

    it('should not register a user with an existing email', async () => {
      const dto = generateAuthDto();
      await registerUser(app, dto);

      const response = await registerUser(app, dto);
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'User already exists',
      });
    });
  });

  describe('Login', () => {
    it('should login a user', async () => {
      const dto = generateAuthDto();
      await registerUser(app, dto);

      const response = await loginUser(app, dto);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
      });
    });

    it('should not login a user with an invalid email', async () => {
      const dto = generateAuthDto();
      await registerUser(app, dto);

      const response = await loginUser(app, {
        email: 'invalid-email@example.com',
        password: dto.password,
      });
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        message: 'User not found',
      });
    });

    it('should not login a user with an invalid password', async () => {
      const dto = generateAuthDto();
      await registerUser(app, dto);

      const response = await loginUser(app, {
        email: dto.email,
        password: 'invalid-password',
      });
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: 'Invalid password',
      });
    });
  });
});
