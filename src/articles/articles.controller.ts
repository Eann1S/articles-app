import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  ArticleDto,
  ArticleWithAuthorDto,
  CreateArticleDto,
  toArticleDto,
  toArticleWithAuthorDto,
  UpdateArticleDto,
} from './articles.dtos';
import { UserDto } from '../users/user.dtos';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/auth.guard';
import { PaginatedDto, PaginationDto } from '../pagination/pagination.dtos';
import { FilterDto } from './filter.dto';

@ApiTags('articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all articles' })
  @ApiOkResponse({
    description: 'The list of articles',
    type: ArticleWithAuthorDto,
    isArray: true,
  })
  @Get()
  @Public()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterDto,
  ): Promise<PaginatedDto<ArticleWithAuthorDto>> {
    const articles = await this.articlesService.findAll(pagination, filter);
    return {
      ...articles,
      data: articles.data.map((article) => toArticleWithAuthorDto(article)),
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an article by id' })
  @ApiOkResponse({
    description: 'The article',
    type: ArticleWithAuthorDto,
  })
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: number): Promise<ArticleWithAuthorDto> {
    const article = await this.articlesService.findOneOrFail({ id });
    return toArticleWithAuthorDto(article);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an article' })
  @ApiCreatedResponse({
    description: 'The created article',
    type: ArticleDto,
  })
  @Post()
  async create(
    @Req() req: { user: UserDto },
    @Body() article: CreateArticleDto,
  ): Promise<ArticleDto> {
    const createdArticle = await this.articlesService.create(
      req.user.id,
      article,
    );
    return toArticleDto(createdArticle);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an article' })
  @ApiOkResponse({
    description: 'The updated article',
    type: ArticleWithAuthorDto,
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() article: UpdateArticleDto,
  ): Promise<ArticleWithAuthorDto> {
    const updatedArticle = await this.articlesService.update(id, article);
    return toArticleWithAuthorDto(updatedArticle);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiOkResponse({
    description: 'The article was deleted successfully',
  })
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.articlesService.delete(id);
  }
}
