import { ArticleDto } from '../../src/articles/articles.dtos';
import { INestApplication } from '@nestjs/common';
import {
  CreateArticleDto,
  UpdateArticleDto,
} from '../../src/articles/articles.dtos';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { PaginationDto } from '../../src/pagination/pagination.dtos';
import { FilterDto } from '../../src/articles/filter.dto';

export const getArticles = async (
  app: INestApplication,
  pagination: PaginationDto = { page: 1, limit: 10 },
  filter?: FilterDto,
) => {
  const req = request(app.getHttpServer()).get('/articles').query(pagination);
  if (filter) {
    req.query(filter);
  }
  return req;
};

export const getArticle = async (app: INestApplication, id: number) => {
  const response = await request(app.getHttpServer()).get(`/articles/${id}`);
  return response;
};

export const createArticle = async (
  app: INestApplication,
  article: CreateArticleDto,
  token: string,
) => {
  const response = await request(app.getHttpServer())
    .post('/articles')
    .send(article)
    .set('Authorization', `Bearer ${token}`);
  return response;
};

export const createRandomArticle = async (
  app: INestApplication,
  token: string,
) => {
  const article = generateCreateArticleDto();
  const response = await createArticle(app, article, token);
  return response.body as ArticleDto;
};

export const updateArticle = async (
  app: INestApplication,
  id: number,
  article: UpdateArticleDto,
  token: string,
) => {
  const response = await request(app.getHttpServer())
    .put(`/articles/${id}`)
    .send(article)
    .set('Authorization', `Bearer ${token}`);
  return response;
};

export const deleteArticle = async (
  app: INestApplication,
  id: number,
  token: string,
) => {
  const response = await request(app.getHttpServer())
    .delete(`/articles/${id}`)
    .set('Authorization', `Bearer ${token}`);
  return response;
};

export const generateCreateArticleDto = (): CreateArticleDto => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    description: faker.lorem.sentence(),
  };
};

export const generateUpdateArticleDto = (): UpdateArticleDto => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    description: faker.lorem.sentence(),
  };
};
