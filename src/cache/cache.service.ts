import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  async onModuleInit() {
    await this.redis.ping();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(...keys: string[]) {
    const multi = this.redis.multi();
    keys.forEach((key) => multi.del(key));
    await multi.exec();
  }

  async flushall() {
    await this.redis.flushall();
  }

  async sadd(key: string, ...values: string[]) {
    await this.redis.sadd(key, ...values);
  }

  async smembers(key: string) {
    return await this.redis.smembers(key);
  }

  async srem(key: string, ...values: string[]) {
    await this.redis.srem(key, ...values);
  }

  async keys(pattern: string) {
    let cursor = '0';
    const keys: string[] = [];
    do {
      const result = await this.redis.scan(cursor, 'MATCH', pattern);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');
    return keys;
  }
}
