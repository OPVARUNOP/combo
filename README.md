# Streamify - Music Streaming App

A Spotify alternative built with modern web technologies.

## Features

- 🎵 Music streaming from multiple sources (YouTube, SoundCloud, Audius)
- 🔒 User authentication and authorization
- 📱 Cross-platform mobile app (React Native)
- 🚀 Scalable microservices architecture
- 🎧 High-quality audio streaming
- 📊 Smart recommendations
- 💾 Offline listening

## Tech Stack

### Frontend (Coming Soon)
- React Native with TypeScript
- Redux for state management
- React Navigation
- React Native Track Player

### Backend
- Node.js with Express
- MongoDB for database
- Redis for caching
- JWT for authentication
- Backblaze B2 for file storage
- YouTube Data API v3
- SoundCloud API
- Audius API
- Swagger/OpenAPI documentation

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Docker and Docker Compose (recommended)
- API keys for YouTube, SoundCloud, and Audius

### Quick Start with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streamify.git
   cd streamify/backend
   ```

2. Copy the example environment file and update with your API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. Start the services using Docker Compose:
   ```bash
   npm run docker:up
   ```
   This will start:
   - MongoDB on port 27017
   - Redis on port 6379

4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

5. Seed the database with sample data (optional):
   ```bash
   npm run seed
   ```

6. Access the API documentation at: http://localhost:3000/api-docs

### Manual Setup

1. Install and run MongoDB and Redis

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streamify.git
   cd streamify/backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy the example environment file and update with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your database and API configuration
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. (Optional) Seed the database:
   ```bash
   npm run seed
   ```

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs-json

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed the database with sample data
- `npm run docker:up` - Start MongoDB and Redis with Docker
- `npm run docker:down` - Stop and remove Docker containers

## Environment Variables

See `.env.example` for all available environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── scripts/        # Database scripts
│   ├── services/       # Business logic and external services
│   ├── utils/          # Utility classes and functions
│   ├── app.js          # Express app
│   └── index.js        # App entry point
├── tests/              # Test files
├── .env.example        # Example environment variables
├── .eslintrc.js        # ESLint config
├── .prettierrc         # Prettier config
├── docker-compose.yml  # Docker Compose config
└── package.json
```

## Authentication

Most API endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## License

MIT

## Project Structure

```
streamify/
├── backend/           # Backend services
├── mobile/            # React Native mobile app
└── docs/              # Documentation
```

## License

MIT