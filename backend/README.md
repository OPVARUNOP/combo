# COMBO Music Streaming API

A comprehensive music streaming platform backend built with Node.js, Express, and Firebase (Firestore, Realtime Database, Authentication, and Storage).

## ???? Features

- ???? **Authentication & Authorization**: Firebase Authentication with JWT verification
- ???? **Real-time Data**: Firebase Realtime Database for live updates
- ???? **Scalable Storage**: Firebase Storage for media files
- ???? **Document Database**: Firestore for structured data
- ???? **File Storage**: Secure file uploads and downloads using Backblaze B2
- ???? **Playlist Management**: Create, update, and manage playlists with song collections
- ???? **Search Functionality**: Full-text search and filtering
- ??????? **Security**: Rate limiting, input validation, and security headers
- ???? **Health Monitoring**: Built-in health checks and monitoring endpoints
- ???? **API Documentation**: Comprehensive documentation with examples

## ???? Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **Firebase Project**: With Firestore, Realtime Database, Authentication, and Storage enabled
- **Firebase CLI**: For deployment and management
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
   # Install Firebase CLI globally
   npm install -g firebase-tools
   ```

3. **Set up Firebase**:
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (select your project)
   firebase init
   
   # Set up Firebase Admin
   npm run setup:firebase
   ```
   
   This will guide you through setting up:
   - Firebase Authentication
   - Firestore Database
   - Realtime Database
   - Storage
   - Hosting (optional)
   - Functions (if needed)

4. **Verify Firebase setup**:
   ```bash
   # Test Firebase connection
   npm run test:firebase
   
   # Or run detailed verification
   npm run verify:firebase
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000` by default.

## ???? Project Structure

```
backend/
├── config/                     # Configuration files
│   ├── firebase-admin.js       # Firebase Admin SDK configuration
│   └── firebase-service-account.json  # Service account key (gitignored)
├── scripts/                    # Utility scripts
│   ├── setup-firebase.js       # Firebase setup wizard
│   ├── test-connection.js      # Firebase connection tests
│   └── verify-firebase.js      # Detailed Firebase verification
├── src/                        # Application source code
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware
│   ├── models/                 # Data models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   │   └── firebase.service.js # Firebase service wrapper
│   └── utils/                  # Utility functions
├── .env                        # Environment variables
├── .firebaserc                 # Firebase project configuration
├── firebase.json               # Firebase deployment configuration
└── package.json                # Project dependencies and scripts
```

## ???? Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests
- `npm run test:firebase` - Test Firebase connection
- `npm run verify:firebase` - Run detailed Firebase verification
- `npm run setup:firebase` - Run Firebase setup wizard
- `firebase:login` - Login to Firebase CLI
- `firebase:init` - Initialize Firebase project
- `firebase:deploy` - Deploy to Firebase

## ???? Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | ??? |
| `FIREBASE_DATABASE_SECRET` | Firebase Database secret | ??? |
| `JWT_SECRET` | Secret key for JWT tokens | ??? |
| `B2_APPLICATION_KEY_ID` | Backblaze B2 Application Key ID | ✅ |
| `B2_APPLICATION_KEY` | Backblaze B2 Application Key | ✅ |
| `B2_BUCKET_ID` | Backblaze B2 Bucket ID | ✅ |
| `B2_BUCKET_NAME` | Backblaze B2 Bucket Name | ✅ |
| `B2_DOWNLOAD_URL` | Backblaze B2 download URL (e.g., f003.backblazeb2.com) | ✅ |
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

### File Management

#### Upload a File
```http
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Form Data:
# - file: The file to upload
# - metadata: (optional) JSON string with additional metadata
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "fileId": "4d6f6e6b65792d6d616e2d736169642d6e6f2d657870656374696e672d6d6f6e6b657973",
    "fileName": "example.jpg",
    "fileKey": "users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg",
    "downloadUrl": "https://f003.backblazeb2.com/file/your-bucket/users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg",
    "size": 12345,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-10-01T10:00:00.000Z"
  }
}
```

#### Get Download URL
```http
GET /api/files/download/:fileKey
Authorization: Bearer <token>
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://f003.backblazeb2.com/file/your-bucket/users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg?Authorization=...",
    "expiresAt": "2025-10-01T11:00:00.000Z",
    "fileKey": "users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

#### Delete a File
```http
DELETE /api/files
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileKey": "users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg",
  "fileId": "4d6f6e6b65792d6d616e2d736169642d6e6f2d657870656374696e672d6d6f6e6b657973"
}
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "fileKey": "users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg",
    "fileId": "4d6f6e6b65792d6d616e2d736169642d6e6f2d657870656374696e672d6d6f6e6b657973"
  }
}
```

#### List User's Files
```http
GET /api/files?prefix=user-123/
Authorization: Bearer <token>
```

**Query Parameters:**
- `prefix`: (optional) Filter files by prefix (e.g., 'user-123/')
- `delimiter`: (optional) Delimiter for directory-like listing (default: '/')
- `limit`: (optional) Maximum number of files to return (default: 100, max: 1000)

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "4d6f6e6b65792d6d616e2d736169642d6e6f2d657870656374696e672d6d6f6e6b657973",
        "fileName": "users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg",
        "contentLength": 12345,
        "contentType": "image/jpeg",
        "uploadTimestamp": 1664611200000,
        "downloadUrl": "https://f003.backblazeb2.com/file/your-bucket/users/user-123/550e8400-e29b-41d4-a716-446655440000.jpg"
      }
    ],
    "nextFileName": null,
    "nextFileId": null,
    "count": 1
  }
}
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
## ???? Deployment

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### Production Deployment

1. **Set up environment variables**:
   - Configure all required environment variables in your production environment
   - Ensure all secrets are properly secured

2. **Install production dependencies**:
   ```bash
   npm ci --only=production
   ```

3. **Start the production server**:
   ```bash
   npm start
   ```

### Monitoring & Logs

```bash
# Check service status
npm run status

# View logs
tail -f logs/combined.log
```

### Recommended Production Setup

For production, we recommend using:
- PM2 or similar process manager for Node.js
- Nginx as a reverse proxy
- Proper log rotation
- Monitoring and alerting setup
- Regular backups of your database

## ???? Error Handling

All endpoints return standardized error responses:
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


