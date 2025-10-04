import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// User management
app.post('/users', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    const userData = {
      uid,
      email,
      displayName,
      photoURL,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        theme: 'dark',
        autoplay: true,
        explicitContent: false,
        language: 'en',
      },
    };

    await admin.firestore().collection('users').doc(uid).set(userData);

    res.status(201).json({ success: true, userId: uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user profile
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user preferences
app.patch('/users/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    await admin.firestore().collection('users').doc(userId).update({
      preferences: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Track streaming data
app.post('/tracks/:trackId/stream', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { userId, duration, timestamp } = req.body;

    // Record stream in analytics
    await admin
      .firestore()
      .collection('analytics')
      .add({
        type: 'stream',
        trackId,
        userId,
        duration,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      });

    // Update track play count
    await admin
      .firestore()
      .collection('tracks')
      .doc(trackId)
      .update({
        playCount: admin.firestore.FieldValue.increment(1),
        lastPlayed: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording stream:', error);
    res.status(500).json({ error: 'Failed to record stream' });
  }
});

// Playlist management
app.post('/playlists', async (req, res) => {
  try {
    const { userId, title, description, isPublic, tracks } = req.body;

    const playlistData = {
      userId,
      title,
      description,
      isPublic: isPublic || false,
      tracks: tracks || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      playCount: 0,
      likes: 0,
    };

    const playlistRef = await admin.firestore().collection('playlists').add(playlistData);

    res.status(201).json({
      success: true,
      playlistId: playlistRef.id,
      playlist: playlistData,
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Social features - Follow user
app.post('/users/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    // Add to follower's following list
    await admin
      .firestore()
      .collection('user_connections')
      .doc(followerId)
      .collection('following')
      .doc(userId)
      .set({
        followedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Add to user's followers list
    await admin
      .firestore()
      .collection('user_connections')
      .doc(userId)
      .collection('followers')
      .doc(followerId)
      .set({
        followedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Search API
app.get('/search', async (req, res) => {
  try {
    const { q, type = 'tracks', limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    let results = [];

    if (type === 'tracks' || type === 'all') {
      const tracksSnapshot = await admin
        .firestore()
        .collection('tracks')
        .where('title', '>=', q as string)
        .where('title', '<=', q + '\uf8ff')
        .limit(parseInt(limit as string))
        .get();
      results = results.concat(
        tracksSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'track',
          ...doc.data(),
        })),
      );
    }

    if (type === 'users' || type === 'all') {
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where('displayName', '>=', q)
        .where('displayName', '<=', q + '\uf8ff')
        .limit(parseInt(limit as string))
        .get();

      results = results.concat(
        usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'user',
          ...doc.data(),
        })),
      );
    }

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get trending content
app.get('/trending', async (req, res) => {
  try {
    const { type = 'tracks', period = '7d', limit = '20' } = req.query;

    // Get analytics data for the specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    const analyticsSnapshot = await admin
      .firestore()
      .collection('analytics')
      .where('type', '==', 'stream')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get();

    // Process analytics to get trending items
    const trendingMap = new Map();

    analyticsSnapshot.forEach((doc) => {
      const data = doc.data();
      const key = data.trackId;
      if (trendingMap.has(key)) {
        trendingMap.set(key, trendingMap.get(key) + 1);
      } else {
        trendingMap.set(key, 1);
      }
    });

    // Sort by stream count and get top items
    const trendingItems = Array.from(trendingMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit as string))
      .map(([trackId, streams]) => ({ trackId, streams }));

    res.json({ trending: trendingItems, period, type });
  } catch (error) {
    console.error('Error getting trending content:', error);
    res.status(500).json({ error: 'Failed to get trending content' });
  }
});

// Music recommendations (simplified)
app.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Get user's listening history
    const historySnapshot = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('listeningHistory')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const listenedTracks = historySnapshot.docs.map((doc) => doc.data().trackId);

    if (listenedTracks.length === 0) {
      // Return popular tracks for new users
      const popularTracksSnapshot = await admin
        .firestore()
        .collection('tracks')
        .orderBy('playCount', 'desc')
        .limit(parseInt(limit as string))
        .get();

      const recommendations = popularTracksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        reason: 'popular',
      }));

      return res.json({ recommendations });
    }

    // Simple collaborative filtering - find tracks similar to user's preferences
    const recommendations = [];

    // This is a simplified recommendation algorithm
    // In production, you'd use more sophisticated ML algorithms
    for (const trackId of listenedTracks.slice(0, 5)) {
      // Find tracks by same artist or similar genre
      const trackDoc = await admin.firestore().collection('tracks').doc(trackId).get();
      if (trackDoc.exists) {
        const trackData = trackDoc.data();

        // Get tracks by same artist
        const similarTracksSnapshot = await admin
          .firestore()
          .collection('tracks')
          .where('artist', '==', trackData.artist)
          .where('id', '!=', trackId)
          .limit(3)
          .get();

        similarTracksSnapshot.docs.forEach((doc) => {
          if (!listenedTracks.includes(doc.id)) {
            recommendations.push({
              id: doc.id,
              ...doc.data(),
              reason: 'same_artist',
            });
          }
        });
      }
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((track, index, self) => self.findIndex((t) => t.id === track.id) === index)
      .slice(0, parseInt(limit as string));

    res.json({ recommendations: uniqueRecommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
