import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dtos';
import { UpdateUserDto } from './user.dtos';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
  private readonly cacheOptions = {
    all: {
      ttl: 300,
      key: (): string => 'users',
    },
    one: {
      ttl: 300,
      key: (
        where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
      ): string => {
        return `user:${JSON.stringify(where)}`;
      },
    },
    keys: {
      key: (id: number): string => `user:keys:${id}`,
    },
  };

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private cacheService: CacheService,
  ) {}

  async findAll(): Promise<User[]> {
    const cacheKey = this.cacheOptions.all.key();
    const cachedUsers = await this.cacheService.get<User[]>(cacheKey);
    if (cachedUsers) {
      return cachedUsers;
    }
    const users = await this.userRepository.find();
    await this.cacheService.set(cacheKey, users, this.cacheOptions.all.ttl);
    return users;
  }

  async findOneByOrFail(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User> {
    const cacheKey = this.cacheOptions.one.key(where);
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.findOneBy(where);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.cacheUser(cacheKey, user);
    return user;
  }

  async findOneBy(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User | null> {
    const cacheKey = this.cacheOptions.one.key(where);
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.userRepository.findOneBy(where);
    if (user) {
      await this.cacheUser(cacheKey, user);
    }
    return user;
  }

  async create(user: CreateUserDto): Promise<User> {
    const { email, hashed_password } = user;
    await this.cacheService.del(this.cacheOptions.all.key());
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
    await this.invalidateCacheForUser(id);
    return this.findOneByOrFail({ id });
  }

  async delete(id: number): Promise<void> {
    await this.invalidateCacheForUser(id);
    await this.userRepository.delete(id);
  }

  private async cacheUser(cacheKey: string, user: User): Promise<void> {
    await this.cacheService.set(cacheKey, user, this.cacheOptions.one.ttl);
    await this.cacheService.sadd(this.cacheOptions.keys.key(user.id), cacheKey);
  }

  private async invalidateCacheForUser(id: number): Promise<void> {
    const cacheKeys = await this.cacheService.smembers(
      this.cacheOptions.keys.key(id),
    );
    await this.cacheService.del(...cacheKeys);
    await this.cacheService.del(this.cacheOptions.all.key());
  }
}
