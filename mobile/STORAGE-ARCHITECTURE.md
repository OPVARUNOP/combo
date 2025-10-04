# 🎵 COMBO Music Streaming - Storage & Database Setup Guide

## 📊 Database Schema Requirements

Your PostgreSQL database should include these core tables:

### **tracks** table:

```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id),
  album_id UUID REFERENCES albums(id),
  duration INTEGER, -- in milliseconds
  genre VARCHAR(100),
  audio_url_low TEXT,     -- S3 URL for low quality (96kbps)
  audio_url_medium TEXT,  -- S3 URL for medium quality (160kbps)
  audio_url_high TEXT,    -- S3 URL for high quality (320kbps)
  audio_url_hq TEXT,      -- S3 URL for HQ (lossless)
  artwork_url TEXT,       -- Album art S3 URL
  release_date DATE,
  isrc VARCHAR(12),       -- International Standard Recording Code
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **albums** table:

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id),
  artwork_url TEXT,       -- S3 URL for album cover
  release_date DATE,
  total_tracks INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **artists** table:

```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image_url TEXT, -- S3 URL for artist photo
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## ☁️ S3 Storage Structure

Organize your S3 bucket like this:

```
combo-music/
├── audio/
│   ├── low/
│   │   ├── {track_id}.mp3
│   │   └── ...
│   ├── medium/
│   │   ├── {track_id}.mp3
│   │   └── ...
│   ├── high/
│   │   ├── {track_id}.mp3
│   │   └── ...
│   └── hq/
│       ├── {track_id}.flac
│       └── ...
├── artwork/
│   ├── albums/
│   │   ├── {album_id}.jpg
│   │   └── ...
│   ├── artists/
│   │   ├── {artist_id}.jpg
│   │   └── ...
│   └── tracks/
│       ├── {track_id}.jpg
│       └── ...
└── metadata/
    ├── lyrics/
    └── ...
```

## 🔄 Data Flow Implementation

### **1. Content Ingestion Process:**

```
Music Files → License Verification → S3 Upload → Database Metadata → CDN Distribution
```

### **2. Streaming Process:**

```
User Request → API → Database Lookup → S3 Pre-signed URL → Direct Stream → Analytics
```

### **3. Quality Selection Logic:**

```javascript
// In your backend API
const getStreamUrl = (trackId, quality = 'medium') => {
  const track = await db.tracks.findById(trackId);

  switch (quality) {
    case 'low': return track.audio_url_low;
    case 'medium': return track.audio_url_medium;
    case 'high': return track.audio_url_high;
    case 'hq': return track.audio_url_hq;
    default: return track.audio_url_medium;
  }
};
```

## ⚙️ Backend API Endpoints (Current Implementation)

The mobile app expects these endpoints:

### **Track Streaming:**

```
GET /tracks/{id}/stream
```

**Response:** Pre-signed S3 URL for streaming

### **Track Details:**

```
GET /tracks/{id}
```

**Response:** Track metadata including S3 URLs

### **Search:**

```
GET /search?q={query}&type=track
```

**Response:** Tracks with metadata and streaming URLs

## 🔐 Security Implementation

### **S3 Pre-signed URLs:**

```javascript
// Backend generates time-limited URLs
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const getSignedUrl = (key, expires = 3600) => {
  return s3.getSignedUrl('getObject', {
    Bucket: 'combo-music',
    Key: key,
    Expires: expires,
  });
};
```

### **CDN Configuration:**

- Use CloudFront with S3 origin
- Enable HTTPS and security headers
- Set appropriate cache policies for audio files

## 📈 Scaling Considerations

### **Database Optimization:**

- Index on frequently queried fields
- Partition large tables by date
- Use read replicas for heavy read loads

### **S3 Performance:**

- Use CloudFront CDN for global distribution
- Enable S3 Transfer Acceleration
- Use appropriate storage classes (Standard, IA, Glacier)

### **Monitoring:**

- Track S3 access patterns
- Monitor database query performance
- Set up alerts for storage costs

## 🚀 Deployment Steps

### **1. Infrastructure Setup:**

```bash
# AWS CLI commands
aws s3 mb s3://combo-music --region us-east-1
aws cloudfront create-distribution --distribution-config file://cf-config.json
```

### **2. Content Pipeline:**

```bash
# Example upload script
aws s3 cp /local/music/audio/ s3://combo-music/audio/ --recursive
aws s3 cp /local/music/artwork/ s3://combo-music/artwork/ --recursive
```

### **3. Database Population:**

```sql
-- Bulk insert tracks
COPY tracks FROM '/path/to/tracks.csv' WITH CSV HEADER;

-- Update S3 URLs
UPDATE tracks SET
  audio_url_medium = 'https://combo-music.s3.amazonaws.com/audio/medium/' || id || '.mp3',
  artwork_url = 'https://combo-music.s3.amazonaws.com/artwork/tracks/' || id || '.jpg';
```

## 💰 Cost Estimation

### **S3 Storage Costs:**

- Audio files: ~$0.023/GB/month
- Artwork: ~$0.023/GB/month
- Requests: $0.0004 per 1,000 requests

### **CloudFront CDN:**

- Data transfer: $0.085/GB (first 10TB)
- HTTPS requests: $0.01 per 10,000 requests

### **Database (RDS):**

- PostgreSQL t3.micro: ~$15/month
- Storage: $0.10/GB/month

## 🔧 Mobile App Integration

The current mobile app implementation is ready for this architecture:

✅ **API Service** - Configured for S3 streaming URLs  
✅ **Audio Player** - Supports multiple quality streams  
✅ **Offline Support** - Downloads from S3 URLs  
✅ **CDN Integration** - Optimized for global delivery  
✅ **Quality Selection** - UI for different audio qualities

## 🎯 Next Steps

1. **Set up AWS Infrastructure** - S3 buckets, CloudFront, RDS
2. **Implement Content Pipeline** - Upload and metadata management
3. **Configure CDN** - Global content delivery optimization
4. **Test Streaming** - Verify audio quality and performance
5. **Monitor Costs** - Set up billing alerts and optimization

---

**Note:** This architecture follows industry standards used by Spotify, Apple Music, and other major streaming platforms. The mobile app is fully compatible with this setup and ready for production deployment.
