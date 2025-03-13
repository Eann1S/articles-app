# Articles App

## Overview

Articles App is a backend application built with NestJS designed to manage articles, users, authentication, and caching. It leverages modern technologies such as TypeScript, TypeORM, PostgreSQL, and Redis (via KeyDB) to provide robust functionality and scalable performance.

## Key Features
- RESTful API built with NestJS
- Articles management
- User authentication and authorization using JWT and Argon2
- Database integration with PostgreSQL with migrations managed by TypeORM
- Caching support using Redis/KeyDB
- API documentation via Swagger (if enabled)
- Dockerized deployment with Docker and Docker Compose

## Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL database
- Redis or KeyDB instance

Alternatively, you can run the application using Docker.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd articles-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Configuration

Create a `.env` file in the project root based on the `.env.example` file. For example:

```ini
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=secret
JWT_EXPIRATION_TIME=86400
```
```bash
cp .env.example .env
```

Adjust these values to match your local setup.

## Running the Application

### Development Mode

Start the application in development mode with hot-reloading:

```bash
npm run start:dev
```

## Database Migrations

This project uses TypeORM to manage database migrations. The following npm scripts are available:

- Generate a new migration:
  ```bash
  npm run migration:generate -- <path/to/your/migration>
  ```
- Create a new empty migration:
  ```bash
  npm run migration:create -- <path/to/your/migration>
  ```
- Run migrations:
  ```bash
  npm run migration:run
  ```
- Revert last migration:
  ```bash
  npm run migration:revert
  ```

## Running with Docker

The project includes a `Dockerfile` and `docker-compose.yml` for containerized deployment.

### Steps:

1. Ensure Docker and Docker Compose are installed.
2. Build and run the containers:
   ```bash
   docker-compose up -d --build
   ```

Services included:
- **app**: The NestJS application running on the specified PORT.
- **db**: PostgreSQL database.
- **keydb**: Redis instance using KeyDB.

## Testing

For end-to-end tests:

```bash
npm run test:e2e
```

## Technologies Used

- [NestJS](https://nestjs.com)
- [TypeScript](https://www.typescriptlang.org)
- [TypeORM](https://typeorm.io)
- [PostgreSQL](https://www.postgresql.org)
- [Redis/KeyDB](https://keydb.dev)
- [Docker](https://www.docker.com)
- [Jest](https://jestjs.io) for testing
