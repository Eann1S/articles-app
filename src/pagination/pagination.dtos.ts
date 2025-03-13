import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'The current page number',
    example: 1,
    default: 1,
  })
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
    default: 10,
  })
  @IsNumber()
  limit: number = 10;
}

export class PaginatedDto<T> extends PaginationDto {
  @ApiProperty({
    description: 'The total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'The data',
    type: Array,
  })
  data: T[];
}

export function paginate<T>(data: T[], dto: PaginationDto): PaginatedDto<T> {
  const { page, limit } = dto;
  const startIndex = (page - 1) * limit;
  const paginatedData = data.slice(startIndex, startIndex + limit);
  return {
    page,
    limit,
    total: data.length,
    data: paginatedData,
  };
}
