import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto, UpdateArticleDto } from './articles.dtos';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
  ) {}

  async findAll(): Promise<Article[]> {
    return this.articleRepository.find({ relations: ['author'] });
  }

  async findOneBy(
    where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ): Promise<Article | null> {
    return this.articleRepository.findOne({
      where,
      relations: ['author'],
    });
  }

  async findOneOrFail(
    where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ): Promise<Article> {
    try {
      return await this.articleRepository.findOneOrFail({
        where,
        relations: ['author'],
      });
    } catch (_) {
      throw new NotFoundException('Article not found');
    }
  }

  async create(authorId: number, article: CreateArticleDto): Promise<Article> {
    const { title, description, content } = article;
    const createdArticle = await this.articleRepository.save({
      title,
      description,
      content,
      authorId,
    });
    return this.findOneOrFail({ id: createdArticle.id });
  }

  async update(id: number, article: UpdateArticleDto): Promise<Article> {
    const { title, description, content } = article;
    await this.articleRepository.update(id, {
      title,
      description,
      content,
    });
    return this.findOneOrFail({ id });
  }

  async delete(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }
}
