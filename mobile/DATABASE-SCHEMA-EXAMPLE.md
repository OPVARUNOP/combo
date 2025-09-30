# COMBO Database Schema & Jamendo Integration Example

## Updated Database Schema for Jamendo API

Since we're using Jamendo as our music source, the database schema is simplified:

### tracks table:
```sql
-- Track record with Jamendo data
INSERT INTO tracks (
  id, title, artist_id, album_id, duration, genre,
  jamendo_id, jamendo_audio_url, jamendo_artwork_url,
  release_date, created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Blinding Lights',
  'artist-uuid-1',
  'album-uuid-1',
  200000,
  'Pop',
  123456, -- Jamendo track ID
  'https://mp3d.jamendo.com/?trackid=123456&format=mp32', -- Jamendo streaming URL
  'https://imgjam1.jamendo.com/albums/s123/123456/covers/1.200.jpg', -- Jamendo artwork
  '2019-11-29',
  NOW()
);
```

### albums table:
```sql
-- Album record with Jamendo data
INSERT INTO albums (
  id, title, artist_id, jamendo_id, jamendo_artwork_url,
  release_date, total_tracks, created_at
) VALUES (
  'album-uuid-1',
  'After Hours',
  'artist-uuid-1',
  789012, -- Jamendo album ID
  'https://imgjam1.jamendo.com/albums/s789/789012/covers/1.200.jpg',
  '2020-03-20',
  14,
  NOW()
);
```

### artists table:
```sql
-- Artist record with Jamendo data
INSERT INTO artists (
  id, name, jamendo_id, jamendo_image_url,
  verified, created_at
) VALUES (
  'artist-uuid-1',
  'The Weeknd',
  345678, -- Jamendo artist ID
  'https://imgjam1.jamendo.com/artists/s345/345678/covers/1.200.jpg',
  FALSE, -- Jamendo doesn't provide verification
  NOW()
);
```

## Updated Mobile App Data Flow with Jamendo

### 1. User Requests Track:
```javascript
// User taps play button
const playTrack = async (trackId) => {
  // Get track metadata from our database
  const trackData = await trackAPI.getById(trackId);

  // Jamendo provides the streaming URL directly
  const streamUrl = trackData.jamendo_audio_url;

  // Play audio directly from Jamendo
  await audioPlayer.play(streamUrl);
};
```

### 2. Database Response Format (Jamendo):
```json
{
  "data": {
    "track": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "duration": 200000,
      "genre": "Pop",
      "jamendo_id": 123456,
      "jamendo_audio_url": "https://mp3d.jamendo.com/?trackid=123456&format=mp32",
      "jamendo_artwork_url": "https://imgjam1.jamendo.com/albums/s123/123456/covers/1.200.jpg",
      "release_date": "2019-11-29"
    }
  }
}
```

### 3. Jamendo API Response Format:
```json
// Raw Jamendo API response
{
  "headers": {
    "status": "success",
    "results_count": 1
  },
  "results": [
    {
      "id": 123456,
      "name": "Blinding Lights",
      "artist_name": "The Weeknd",
      "album_name": "After Hours",
      "duration": 200,
      "audio": "https://mp3d.jamendo.com/?trackid=123456&format=mp32",
      "album_image": "https://imgjam1.jamendo.com/albums/s123/123456/covers/1.200.jpg",
      "releasedate": "2019-11-29"
    }
  ]
}
```

## Jamendo Database Schema

### Complete PostgreSQL Schema:
```sql
-- Tracks table (Jamendo data)
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id),
  album_id UUID REFERENCES albums(id),
  duration INTEGER, -- in seconds (Jamendo format)
  genre VARCHAR(100),
  jamendo_id INTEGER UNIQUE, -- Jamendo's track ID
  jamendo_audio_url TEXT, -- Direct streaming URL from Jamendo
  jamendo_artwork_url TEXT, -- Album artwork from Jamendo
  release_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Albums table (Jamendo data)
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id),
  jamendo_id INTEGER UNIQUE, -- Jamendo's album ID
  jamendo_artwork_url TEXT, -- Album artwork from Jamendo
  release_date DATE,
  total_tracks INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artists table (Jamendo data)
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  jamendo_id INTEGER UNIQUE, -- Jamendo's artist ID
  jamendo_image_url TEXT, -- Artist profile image from Jamendo
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User liked tracks (junction table)
CREATE TABLE user_liked_tracks (
  user_id UUID REFERENCES users(id),
  track_id UUID REFERENCES tracks(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

-- User playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlist tracks (junction table)
CREATE TABLE playlist_tracks (
  playlist_id UUID REFERENCES playlists(id),
  track_id UUID REFERENCES tracks(id),
  position INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (playlist_id, track_id)
);
```

## Jamendo Data Mapping

### Track Data Mapping:
```javascript
// Jamendo → Database mapping
const mapJamendoTrack = (jamendoTrack) => ({
  jamendo_id: jamendoTrack.id,
  title: jamendoTrack.name,
  artist_id: findOrCreateArtist(jamendoTrack.artist_name, jamendoTrack.artist_id),
  album_id: findOrCreateAlbum(jamendoTrack.album_name, jamendoTrack.album_id),
  duration: jamendoTrack.duration,
  genre: jamendoTrack.genre,
  jamendo_audio_url: jamendoTrack.audio,
  jamendo_artwork_url: jamendoTrack.album_image,
  release_date: jamendoTrack.releasedate
});
```

### Album Data Mapping:
```javascript
const mapJamendoAlbum = (jamendoAlbum) => ({
  jamendo_id: jamendoAlbum.id,
  title: jamendoAlbum.name,
  artist_id: findOrCreateArtist(jamendoAlbum.artist_name, jamendoAlbum.artist_id),
  jamendo_artwork_url: jamendoAlbum.image,
  release_date: jamendoAlbum.releasedate,
  total_tracks: jamendoAlbum.tracks_count
});
```

### Artist Data Mapping:
```javascript
const mapJamendoArtist = (jamendoArtist) => ({
  jamendo_id: jamendoArtist.id,
  name: jamendoArtist.name,
  jamendo_image_url: jamendoArtist.image,
  verified: false // Jamendo doesn't provide verification status
});
```

## Jamendo Integration Workflow

### 1. Search & Discovery:
```
User searches "rock" → Backend calls Jamendo API → Format results → Store in database → Return to mobile app
```

### 2. Track Playback:
```
User clicks play → Backend gets Jamendo track → Return streaming URL → Mobile app plays directly from Jamendo
```

### 3. Data Synchronization:
```sql
-- Sync new tracks from Jamendo
INSERT INTO tracks (jamendo_id, title, artist_id, ...)
SELECT jamendo_id, title, artist_id, ...
FROM jamendo_tracks
WHERE jamendo_id NOT IN (SELECT jamendo_id FROM tracks);
```

## Jamendo Audio Quality

### Streaming URLs:
- **MP3 32kbps**: `https://mp3d.jamendo.com/?trackid=123&format=mp32`
- **MP3 128kbps**: `https://mp3d.jamendo.com/?trackid=123&format=mp31`
- **MP3 320kbps**: `https://mp3d.jamendo.com/?trackid=123&format=mp3`

### Quality Selection:
```javascript
const getJamendoQualityUrl = (baseUrl, quality) => {
  switch (quality) {
    case 'low': return baseUrl.replace('format=mp32', 'format=mp32');
    case 'medium': return baseUrl.replace('format=mp32', 'format=mp31');
    case 'high': return baseUrl.replace('format=mp32', 'format=mp3');
    default: return baseUrl;
  }
};
```

## Performance Optimization

### Database Indexes:
```sql
-- Optimize searches
CREATE INDEX idx_tracks_jamendo_id ON tracks(jamendo_id);
CREATE INDEX idx_tracks_title ON tracks(title);
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_albums_jamendo_id ON albums(jamendo_id);
CREATE INDEX idx_artists_jamendo_id ON artists(jamendo_id);

-- Optimize queries
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_release_date ON tracks(release_date);
```

### Caching Strategy:
- Cache Jamendo API responses (Redis)
- Cache popular tracks and artists
- Cache search results for 1 hour
- Cache track details for 24 hours

## Security Considerations

### API Rate Limiting:
- Jamendo allows 30 requests/minute (free tier)
- Implement request queuing
- Cache responses to reduce API calls

### Data Validation:
```javascript
// Validate Jamendo data before storing
const validateJamendoTrack = (track) => {
  return track.id && track.name && track.audio && track.duration > 0;
};
```

---

**Benefits of Jamendo Integration:**
✅ **No storage costs** - Audio hosted by Jamendo  
✅ **No licensing fees** - Legal music included  
✅ **Simple database schema** - Just store metadata  
✅ **Direct streaming** - No S3 upload/download  
✅ **Automatic updates** - Fresh content from Jamendo  
✅ **Quality options** - Multiple audio bitrates available  

This architecture is perfect for a legal, free music streaming app! 🎵
