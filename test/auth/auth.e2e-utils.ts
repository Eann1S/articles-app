import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthDto } from '../../src/auth/auth.dtos';
import { faker } from '@faker-js/faker';
import { UserDto } from '../../src/users/user.dtos';

export async function registerUser(app: INestApplication, dto: AuthDto) {
  return request(app.getHttpServer()).post('/auth/register').send(dto);
}

export async function loginUser(app: INestApplication, dto: AuthDto) {
  return request(app.getHttpServer()).post('/auth/login').send(dto);
}

export async function createRandomUser(app: INestApplication) {
  const dto = generateAuthDto();
  const user = await registerUser(app, dto);
  const loginResponse = await loginUser(app, dto);
  return {
    accessToken: loginResponse.body.accessToken,
    user: user.body as UserDto,
  };
}

export function generateAuthDto(): AuthDto {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}
