import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { toUserDto, UserDto } from '../users/user.dtos';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Article } from './article.entity';
export class ArticleDto {
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the article',
    example: 'My first article',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'The description of the article',
    example: 'This is the description of my first article',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The content of the article',
    example: 'This is the content of my first article',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The unique identifier of the author',
    example: 1,
  })
  authorId: number;

  @ApiProperty({
    description: 'The date and time the article was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class ArticleWithAuthorDto extends ArticleDto {
  @ApiProperty({
    description: 'The author of the article',
    example: {
      id: 1,
      email: 'john.doe@example.com',
    },
  })
  author: UserDto;
}

export class CreateArticleDto extends PickType(ArticleDto, [
  'title',
  'description',
  'content',
]) {}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export function toArticleDto(article: Article): ArticleDto {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    authorId: article.authorId,
    createdAt: article.createdAt,
  };
}

export function toArticleWithAuthorDto(article: Article): ArticleWithAuthorDto {
  return {
    ...toArticleDto(article),
    author: toUserDto(article.author),
  };
}
