# COMBO Music Streaming API

A comprehensive music streaming platform backend built with Node.js, Express, and Firebase Realtime Database.

## ???? Features

- ???? **Authentication & Authorization**: JWT-based authentication with role-based access control
- ???? **Music Management**: Full CRUD operations for songs with search and filtering
- ???? **Playlist Management**: Create, update, and manage playlists with song collections
- ???? **Search Functionality**: Search songs by title, artist, or genre
- ??????? **Security**: Rate limiting, input validation, password hashing, and security headers
- ???? **Health Monitoring**: Built-in health checks and monitoring endpoints
- ???? **API Documentation**: Comprehensive documentation with examples

## ???? Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **Firebase Project**: With Realtime Database enabled
- **npm**: For package management

## ??????? Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd combo-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your Firebase credentials and configuration.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8080`

## ???? Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | ??? |
| `FIREBASE_DATABASE_SECRET` | Firebase Database secret | ??? |
| `JWT_SECRET` | Secret key for JWT tokens | ??? |
| `PORT` | Server port (default: 8080) | ??? |
| `NODE_ENV` | Environment mode | ??? |

## ???? API Endpoints

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Music Management

#### Get All Songs
```http
GET /api/music
```

#### Get Song by ID
```http
GET /api/music/:id
```

#### Create New Song
```http
POST /api/music
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Song Title",
  "artist": "Artist Name",
  "duration": 180,
  "genre": "Pop",
  "album": "Album Name"
}
```

#### Update Song
```http
PUT /api/music/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Song Title",
  "artist": "Updated Artist"
}
```

#### Delete Song
```http
DELETE /api/music/:id
Authorization: Bearer <token>
```

### Playlist Management

#### Get All Playlists
```http
GET /api/playlists
Authorization: Bearer <token>
```

#### Get Playlist by ID
```http
GET /api/playlists/:id
Authorization: Bearer <token>
```

#### Create New Playlist
```http
POST /api/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Playlist",
  "description": "A collection of my favorite songs",
  "isPublic": false
}
```

#### Add Song to Playlist
```http
POST /api/playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "songId": "song_id_here"
}
```

#### Remove Song from Playlist
```http
DELETE /api/playlists/:id/songs/:songId
Authorization: Bearer <token>
```

### Favorites Management

#### Get Favorite Songs
```http
GET /api/favorites
Authorization: Bearer <token>
```

#### Add Song to Favorites
```http
POST /api/favorites/:songId
Authorization: Bearer <token>
```

#### Remove Song from Favorites
```http
DELETE /api/favorites/:songId
Authorization: Bearer <token>
```

### Recently Played

#### Get Recently Played Songs
```http
GET /api/recently-played
Authorization: Bearer <token>
```

#### Track Song Play Event
```http
POST /api/recently-played/:songId
Authorization: Bearer <token>
Content-Type: application/json

{
  "playDuration": 180
}
```

#### Clear Recently Played History
```http
DELETE /api/recently-played
Authorization: Bearer <token>
```

### User Statistics

#### Get User Statistics
```http
GET /api/stats
Authorization: Bearer <token>
```

#### Get Top Played Songs
```http
GET /api/stats/top-songs?limit=10
Authorization: Bearer <token>
```

#### Get Listening Trends
```http
GET /api/stats/trends
Authorization: Bearer <token>
```

## ???? Database Service

The application includes a comprehensive database service that provides:

- **CRUD Operations**: Create, Read, Update, Delete
- **Query Methods**: Search, filter, and find operations
- **User Management**: User-specific operations
- **Song Management**: Music-specific operations
- **Playlist Management**: Playlist-specific operations
- **Error Handling**: Comprehensive error handling and logging

## ??????? Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable request rate limiting
- **Input Validation**: Express-validator for input sanitization
- **Security Headers**: Helmet for security headers
- **CORS Protection**: Configurable CORS settings

## ???? Health Monitoring

#### Health Check
```http
GET /health
```

Returns system health status including database connectivity and server metrics.

#### API Information
```http
GET /api
```

Returns API information and available endpoints.

## ???? Testing

Run the test suite:
```bash
npm test
```

Run Firebase connection tests:
```bash
npm run test:firebase
```

Run database service tests:
```bash
npm run demo:database
```

Run comprehensive API tests:
```bash
npm run test:api
```

## ???? Deployment

### Google Cloud Run (Manual)

1. **Build and push Docker image**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/combo-backend
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy combo-backend \
     --image gcr.io/PROJECT-ID/combo-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 1Gi \
     --cpu 1 \
     --max-instances 10 \
     --timeout 300 \
     --set-env-vars FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL,FIREBASE_DATABASE_SECRET=$FIREBASE_DATABASE_SECRET,JWT_SECRET=$JWT_SECRET
   ```

### Automated Deployment

#### Using the Deployment Script
```bash
./deploy.sh
```

#### Using GitHub Actions (CI/CD)
The project includes a GitHub Actions workflow for automated deployments:

1. **Set up GitHub Secrets**:
   - `GCP_SA_KEY`: Service account key for GCP authentication
   - `FIREBASE_DATABASE_SECRET`: Firebase database secret
   - `JWT_SECRET`: JWT secret key

2. **Push to main branch**: Triggers automatic deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `FIREBASE_DATABASE_URL`
- `FIREBASE_DATABASE_SECRET`
- `JWT_SECRET` (use a strong, unique secret)
- `NODE_ENV=production`

## ???? Monitoring

### Using the Monitoring Script
```bash
./monitor.sh
```

### Google Cloud Console Monitoring
- **Metrics**: https://console.cloud.google.com/run/detail/us-central1/combo-backend/metrics
- **Logs**: https://console.cloud.google.com/run/detail/us-central1/combo-backend/logs

### Manual Monitoring Commands
```bash
# Check service status
gcloud run services describe combo-backend --region us-central1

# View recent logs
gcloud run services logs read combo-backend --region us-central1 --limit 20

# Monitor logs in real-time
gcloud run services logs read combo-backend --region us-central1 --follow
```

## ???? Error Handling

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## ???? Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]
}
```

## ??????? Project Structure

```
combo-backend/
????????? src/
???   ????????? middleware/
???   ???   ????????? auth.middleware.js      # Authentication middleware
???   ???   ????????? validation.middleware.js # Input validation middleware
???   ????????? routes/
???   ???   ????????? music.route.js         # Music endpoints
???   ???   ????????? playlist.route.js      # Playlist endpoints
???   ???   ????????? user.route.js          # User endpoints
???   ????????? services/
???   ???   ????????? database.service.js    # Database operations
???   ????????? utils/
???       ????????? apiResponse.js         # Response utility
????????? scripts/
???   ????????? demo-database.js           # Database demo script
???   ????????? init-firebase.js           # Firebase initialization
???   ????????? setup-firebase.js          # Firebase setup
???   ????????? test-rtdb.js               # Database connection test
????????? server.js                      # Main server file
????????? package.json                   # Dependencies and scripts
????????? .env.example                   # Environment variables template
????????? README.md                      # This file
```

## ???? Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ???? License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ???? Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## ???? Changelog

### Version 1.1.0
- Added favorites management
- Added recently played tracking
- Added user statistics and analytics
- Enhanced API with additional endpoints
- Added CI/CD with GitHub Actions
- Added monitoring and health check scripts
- Improved authentication middleware
- Updated to Node.js 20 for better compatibility
