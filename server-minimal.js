#!/usr/bin/env node

const express = require('express');
const axios = require('axios');

const app = express();

// Use the PORT environment variable provided by Cloud Run
const PORT = process.env.PORT || 8080;

// Jamendo API Configuration
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'c1eea382';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Middleware
app.use(express.json());

// Health check - simple response
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Backend - Minimal Version',
    timestamp: new Date().toISOString()
  });
});

// Music search endpoint
app.get('/api/music/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        search: query,
        limit: 20,
        orderby: 'popularity_total',
      },
      timeout: 10000,
    });

    const tracks = response.data.results.map(track => ({
      id: track.id.toString(),
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      jamendoId: track.id,
      audioUrl: track.audio,
      imageUrl: track.image,
    }));

    res.json({
      data: {
        tracks,
        total: response.data.headers.results_count,
        query,
        source: 'jamendo',
      },
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      message: 'Search failed',
      error: error.message
    });
  }
});

// Trending music
app.get('/api/music/trending', async (req, res) => {
  try {
    const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 20,
        orderby: 'popularity_total',
      },
      timeout: 10000,
    });

    const tracks = response.data.results.map(track => ({
      id: track.id.toString(),
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      jamendoId: track.id,
      audioUrl: track.audio,
      imageUrl: track.image,
    }));

    res.json({
      data: {
        tracks,
        total: tracks.length,
        source: 'jamendo',
      },
    });
  } catch (error) {
    console.error('Trending error:', error.message);
    res.status(500).json({
      message: 'Failed to get trending music',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`???? COMBO Backend - Minimal Version running on port ${PORT}`);
  console.log(`???? Jamendo Client ID: ${JAMENDO_CLIENT_ID ? '??? Configured' : '??? Missing'}`);
  console.log(`???? Ready to stream music from Jamendo!`);
});
