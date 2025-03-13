import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '../config/db.config';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from '../articles/articles.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(dataSource.options),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
