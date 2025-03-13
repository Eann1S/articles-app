import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

module.exports = async function setup() {
  const db = await new PostgreSqlContainer('postgres:alpine').start();
  process.env.DB_HOST = db.getHost();
  process.env.DB_PORT = db.getPort().toString();
  process.env.DB_USER = db.getUsername();
  process.env.DB_PASSWORD = db.getPassword();
  process.env.DB_NAME = db.getDatabase();

  const redis = await new RedisContainer('redis:alpine').start();
  process.env.REDIS_HOST = redis.getHost();
  process.env.REDIS_PORT = redis.getPort().toString();

  global.db = db;
  global.redis = redis;
};
