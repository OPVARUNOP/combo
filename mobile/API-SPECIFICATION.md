# 🎵 COMBO API Configuration

This file documents the API endpoints and their usage for the COMBO Music Streaming App.

## 🔐 Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### GET /me
Get current user profile (requires Authorization header with Bearer token).

## 🔍 Search Endpoints

### GET /search?q={query}&type={track,album,artist,playlist}
Perform search across all content types.

**Query Parameters:**
- `q`: Search query string
- `type`: Filter by content type (optional)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /search?q=blinding%20lights&type=track&limit=10
```

## 🎵 Track Endpoints

### GET /tracks/{id}
Get track details.

### GET /tracks/{id}/stream
Get audio stream URL (returns pre-signed S3 URL for secure streaming).

### PUT /me/liked-songs/{track_id}
Like a song (adds to user's library).

### DELETE /me/liked-songs/{track_id}
Unlike a song (removes from user's library).

## 💿 Album Endpoints

### GET /albums/{id}
Get album details and track listing.

### GET /albums/{id}/tracks
Get all tracks in an album.

## 🎤 Artist Endpoints

### GET /artists/{id}
Get artist details.

### GET /artists/{id}/top-tracks
Get artist's most popular tracks.

### PUT /me/follow/artists/{artist_id}
Follow an artist.

### DELETE /me/follow/artists/{artist_id}
Unfollow an artist.

## 📝 Playlist Endpoints

### GET /playlists/{id}
Get playlist details and tracks.

### POST /playlists
Create a new empty playlist.

**Request Body:**
```json
{
  "title": "My Awesome Playlist",
  "description": "A collection of my favorite songs",
  "isPublic": true
}
```

### PUT /playlists/{id}
Update playlist details.

### POST /playlists/{id}/tracks
Add a track to a playlist.

**Request Body:**
```json
{
  "track_id": "track_uuid_here"
}
```

### DELETE /playlists/{id}/tracks?track_id={track_id}
Remove a track from a playlist.

### GET /me/playlists
Get playlists created or followed by the user.

## 👤 User Library Endpoints

### GET /me/liked-songs
Get all tracks liked by the user.

### PUT /me/follow/artists/{artist_id}
Follow an artist.

### DELETE /me/follow/artists/{artist_id}
Unfollow an artist.

## 🔧 Configuration

### Environment Setup
Update the API base URL in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'https://your-backend-domain.com/api', // Change this
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### JWT Token Usage
All protected endpoints require an Authorization header:

```
Authorization: Bearer <jwt_token_here>
```

The mobile app automatically:
- Adds JWT tokens to request headers
- Handles token refresh on 401 responses
- Stores tokens securely in AsyncStorage
- Logs out users when tokens expire

## 📱 Mobile App Integration

The API service is organized into modules:

```javascript
import {
  authAPI,      // Authentication endpoints
  userAPI,      // User profile and library
  searchAPI,    // Search functionality
  trackAPI,     // Track operations
  albumAPI,     // Album operations
  artistAPI,    // Artist operations
  playlistAPI,  // Playlist management
  socialAPI,    // Social features
} from '../services/api';
```

## 🔒 Security Features

- **JWT Authentication**: All protected routes require Bearer tokens
- **Token Refresh**: Automatic token refresh on expiration
- **Secure Storage**: Tokens stored in encrypted AsyncStorage
- **Request Signing**: All requests include authentication headers
- **Error Handling**: Comprehensive error handling for auth failures

## 📊 Response Format

All API responses follow this structure:

```json
{
  "data": { ... },     // Response data
  "message": "...",    // Optional success message
  "status": "success"  // Response status
}
```

Error responses:
```json
{
  "message": "Error description",
  "status": "error",
  "code": "ERROR_CODE"
}
```

## 🚀 Deployment

1. Update the `baseURL` in `src/services/api.js` to your production API URL
2. Ensure your backend implements all the endpoints listed above
3. Test the authentication flow thoroughly
4. Configure proper CORS settings for your domain
5. Set up SSL certificates for secure communication

---

**Note**: This API specification matches the implementation in the COMBO mobile app. All endpoints are designed to work seamlessly with the React Native frontend.
