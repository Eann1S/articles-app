import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app/app.module';
import {
  createArticle,
  createRandomArticle,
  deleteArticle,
  generateCreateArticleDto,
  generateUpdateArticleDto,
  getArticle,
  getArticles,
  updateArticle,
} from './articles.e2e-utils';
import { createRandomUser } from '../auth/auth.e2e-utils';
import { CacheService } from '../../src/cache/cache.service';

describe('Articles e2e tests', () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    cacheService = app.get<CacheService>(CacheService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cacheService.flushall();
  });

  describe('GET /articles', () => {
    it('should return a list of articles', async () => {
      const { accessToken } = await createRandomUser(app);
      const article = await createRandomArticle(app, accessToken);

      const response = await getArticles(app);

      expect(response.status).toBe(200);
      expect(response.body.data).toContainEqual(
        expect.objectContaining(article),
      );
    });

    it('should return a list of articles with pagination', async () => {
      const { accessToken } = await createRandomUser(app);
      await createRandomArticle(app, accessToken);
      await createRandomArticle(app, accessToken);

      const response = await getArticles(app, { page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body).toMatchObject({
        page: '1',
        limit: '1',
      });
    });

    describe('GET /articles filter', () => {
      it('should return a list of articles with title filter', async () => {
        const { accessToken } = await createRandomUser(app);
        const article = await createRandomArticle(app, accessToken);
        await createRandomArticle(app, accessToken);

        const response = await getArticles(
          app,
          { page: 1, limit: 10 },
          { title: article.title },
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data).toContainEqual(
          expect.objectContaining(article),
        );
      });

      it('should return a list of articles with description filter', async () => {
        const { accessToken } = await createRandomUser(app);
        const article = await createRandomArticle(app, accessToken);
        await createRandomArticle(app, accessToken);

        const response = await getArticles(
          app,
          { page: 1, limit: 10 },
          { description: article.description },
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data).toContainEqual(
          expect.objectContaining(article),
        );
      });

      it('should return a list of articles with content filter', async () => {
        const { accessToken } = await createRandomUser(app);
        const article = await createRandomArticle(app, accessToken);
        await createRandomArticle(app, accessToken);
        const response = await getArticles(
          app,
          { page: 1, limit: 10 },
          { content: article.content },
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data).toContainEqual(
          expect.objectContaining(article),
        );
      });

      it('should return a list of articles with authorId filter', async () => {
        const { accessToken } = await createRandomUser(app);
        const { accessToken: accessToken2 } = await createRandomUser(app);
        const article = await createRandomArticle(app, accessToken);
        await createRandomArticle(app, accessToken2);

        const response = await getArticles(
          app,
          { page: 1, limit: 10 },
          { authorId: article.authorId },
        );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data).toContainEqual(
          expect.objectContaining(article),
        );
      });
    });
  });

  describe('GET /articles/:id', () => {
    it('should return an article by id', async () => {
      const { accessToken } = await createRandomUser(app);
      const article = await createRandomArticle(app, accessToken);

      const response = await getArticle(app, article.id);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(article);
    });

    it('should return a 404 error if the article does not exist', async () => {
      const response = await getArticle(app, 9999);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        message: 'Article not found',
      });
    });
  });

  describe('POST /articles', () => {
    it('should create an article', async () => {
      const { accessToken } = await createRandomUser(app);
      const dto = generateCreateArticleDto();

      const response = await createArticle(app, dto, accessToken);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(dto);
    });

    it('should return a 401 error if the user is not authenticated', async () => {
      const dto = generateCreateArticleDto();

      const response = await createArticle(app, dto, 'invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: 'Invalid token',
      });
    });
  });

  describe('PUT /articles/:id', () => {
    it('should update an article', async () => {
      const { accessToken } = await createRandomUser(app);
      const article = await createRandomArticle(app, accessToken);
      const dto = generateUpdateArticleDto();

      const response = await updateArticle(app, article.id, dto, accessToken);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(dto);
    });
  });

  describe('DELETE /articles/:id', () => {
    it('should delete an article', async () => {
      const { accessToken } = await createRandomUser(app);
      const article = await createRandomArticle(app, accessToken);

      const response = await deleteArticle(app, article.id, accessToken);

      expect(response.status).toBe(200);
    });
  });
});
