import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dtos';
import { UpdateUserDto } from './user.dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneByOrFail(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User> {
    const user = await this.findOneBy(where);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneBy(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User | null> {
    return this.userRepository.findOneBy(where);
  }

  async create(user: CreateUserDto): Promise<User> {
    const { email, hashed_password } = user;
    return this.userRepository.save({
      email,
      hashed_password,
    });
  }

  async update(id: number, user: UpdateUserDto): Promise<User> {
    const { email, hashed_password } = user;
    await this.userRepository.update(id, {
      email,
      hashed_password,
    });
    return this.findOneByOrFail({ id });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
