import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto, UpdateArticleDto } from './articles.dtos';
import { CacheService } from '../cache/cache.service';
import {
  paginate,
  PaginatedDto,
  PaginationDto,
} from '../pagination/pagination.dtos';
import { FilterDto } from './filter.dto';

@Injectable()
export class ArticlesService {
  private readonly cacheOptions = {
    all: {
      ttl: 300,
      key: (pagination?: PaginationDto, filter?: FilterDto): string =>
        `articles:${JSON.stringify(pagination)}:${JSON.stringify(filter)}`,
    },
    one: {
      ttl: 300,
      key: (
        where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
      ): string => {
        return `article:${JSON.stringify(where)}`;
      },
    },
    keys: {
      key: (id: number): string => `article:keys:${id}`,
    },
  };

  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    private cacheService: CacheService,
  ) {}

  async findAll(
    pagination: PaginationDto,
    filter: FilterDto,
  ): Promise<PaginatedDto<Article>> {
    const cacheKey = this.cacheOptions.all.key(pagination, filter);
    const cachedArticles =
      await this.cacheService.get<PaginatedDto<Article>>(cacheKey);
    if (cachedArticles) {
      return cachedArticles;
    }
    const where = this.buildWhereClause(filter);
    const articles = await this.articleRepository.find({
      where,
      relations: ['author'],
    });
    const paginatedArticles = paginate(articles, pagination);
    await this.cacheService.set(
      cacheKey,
      paginatedArticles,
      this.cacheOptions.all.ttl,
    );
    return paginatedArticles;
  }

  async findOneBy(
    where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ): Promise<Article | null> {
    const cacheKey = this.cacheOptions.one.key(where);
    const cachedArticle = await this.cacheService.get<Article>(cacheKey);
    if (cachedArticle) {
      return cachedArticle;
    }
    const article = await this.articleRepository.findOne({
      where,
      relations: ['author'],
    });
    if (article) {
      await this.cacheArticle(cacheKey, article);
    }
    return article;
  }

  async findOneOrFail(
    where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ): Promise<Article> {
    const cacheKey = this.cacheOptions.one.key(where);
    const cachedArticle = await this.cacheService.get<Article>(cacheKey);
    if (cachedArticle) {
      return cachedArticle;
    }
    const article = await this.findOneBy(where);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.cacheArticle(cacheKey, article);
    return article;
  }

  async create(authorId: number, article: CreateArticleDto): Promise<Article> {
    const { title, description, content } = article;
    const createdArticle = await this.articleRepository.save({
      title,
      description,
      content,
      authorId,
    });
    await this.invalidateCacheForAllArticles();
    return this.findOneOrFail({ id: createdArticle.id });
  }

  async update(id: number, article: UpdateArticleDto): Promise<Article> {
    const { title, description, content } = article;
    await this.articleRepository.update(id, {
      title,
      description,
      content,
    });
    await this.invalidateCacheForArticle(id);
    return this.findOneOrFail({ id });
  }

  async delete(id: number): Promise<void> {
    await this.invalidateCacheForArticle(id);
    await this.articleRepository.delete(id);
  }

  private buildWhereClause(filter: FilterDto): FindOptionsWhere<Article> {
    const where: FindOptionsWhere<Article> = {};
    if (filter.title) {
      where.title = filter.title;
    }
    if (filter.description) {
      where.description = filter.description;
    }
    if (filter.content) {
      where.content = filter.content;
    }
    if (filter.authorId) {
      where.authorId = filter.authorId;
    }
    if (
      filter.createdAtStart &&
      filter.createdAtEnd &&
      filter.createdAtStart <= filter.createdAtEnd
    ) {
      where.createdAt = Between(filter.createdAtStart, filter.createdAtEnd);
    }
    return where;
  }

  private async cacheArticle(
    cacheKey: string,
    article: Article,
  ): Promise<void> {
    await this.cacheService.set(cacheKey, article, this.cacheOptions.one.ttl);
    await this.cacheService.sadd(
      this.cacheOptions.keys.key(article.id),
      cacheKey,
    );
  }

  private async invalidateCacheForAllArticles(): Promise<void> {
    const keys = await this.cacheService.keys(this.cacheOptions.all.key());
    await this.cacheService.del(...keys);
  }

  private async invalidateCacheForArticle(id: number): Promise<void> {
    const cacheKeys = await this.cacheService.smembers(
      this.cacheOptions.keys.key(id),
    );
    await this.cacheService.del(...cacheKeys);
    await this.invalidateCacheForAllArticles();
  }
}
