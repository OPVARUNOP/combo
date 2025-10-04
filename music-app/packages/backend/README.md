# Music App Backend

This is the backend service for the Music App, built with NestJS, TypeScript, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Users**: User management and profiles
- **Artists**: Artist profiles and discographies
- **Albums**: Album management with tracks
- **Tracks**: Music tracks with metadata
- **Playlists**: User-created playlists
- **Search**: Full-text search across artists, albums, and tracks

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

## Development

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Database Migrations

```bash
# Generate a new migration
$ npm run migration:generate -- -n MigrationName

# Run migrations
$ npm run migration:run

# Revert the last migration
$ npm run migration:revert
```

## Environment Variables

See `.env.example` for all available environment variables.

## API Documentation

API documentation is available at `/api` when the application is running in development mode.

## License

This project is [MIT licensed](LICENSE).
