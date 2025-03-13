import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from './user.entity';

export class UserDto {
  @ApiProperty({ description: 'The id of the user', example: 1 })
  id: number;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The created at date of the user',
    example: '2021-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The updated at date of the user',
    example: '2021-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}

export class CreateUserDto extends PickType(UserDto, ['email']) {
  @ApiProperty({
    description: 'The hashed password of the user',
    example: 'hashed_password',
  })
  @IsNotEmpty()
  @IsString()
  hashed_password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
