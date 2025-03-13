import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional({
    description: 'The filter by title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'The description of the article',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The content of the article',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'The author of the article',
  })
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @ApiPropertyOptional({
    description: 'The start date and time the article was created',
  })
  @IsOptional()
  createdAtStart?: Date;

  @ApiPropertyOptional({
    description: 'The end date and time the article was created',
  })
  @IsOptional()
  createdAtEnd?: Date;
}
