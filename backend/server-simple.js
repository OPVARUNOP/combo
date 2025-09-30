#!/usr/bin/env node

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Use the PORT environment variable provided by Cloud Run
const PORT = process.env.PORT || 8080;

// Jamendo API Configuration
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'c1eea382';
const JAMENDO_CLIENT_SECRET = process.env.JAMENDO_CLIENT_SECRET || '245483b397b6bd04e7e3937d4458e5f2';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Backend - Simple Version',
    jamendo_client_id: JAMENDO_CLIENT_ID ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString()
  });
});

// Music search endpoint
app.get('/api/music/search', async (req, res) => {
  try {
    const { q: query, limit = 20, offset = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    console.log(`Searching Jamendo for: ${query}`);

    const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        search: query,
        limit: parseInt(limit),
        offset: parseInt(offset),
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
      releaseDate: track.releasedate,
      jamendoId: track.id,
      audioUrl: track.audio,
      imageUrl: track.image,
      license: track.license_ccurl,
      tags: track.tags?.split(',').map(tag => tag.trim()) || [],
    }));

    res.json({
      data: {
        tracks,
        total: response.data.headers.results_count,
        query,
        type: 'track',
        source: 'jamendo',
      },
    });
  } catch (error) {
    console.error('Search error:', error.message);
    if (error.response) {
      console.error('Jamendo API error:', error.response.data);
      res.status(error.response.status).json({
        message: 'Jamendo API error',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        message: 'Search failed',
        error: error.message
      });
    }
  }
});

// Trending music
app.get('/api/music/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    console.log('Getting trending tracks from Jamendo');

    const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: parseInt(limit),
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
      releaseDate: track.releasedate,
      jamendoId: track.id,
      audioUrl: track.audio,
      imageUrl: track.image,
      license: track.license_ccurl,
      popularity: track.popularity_total,
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
    if (error.response) {
      res.status(error.response.status).json({
        message: 'Jamendo API error',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to get trending music',
        error: error.message
      });
    }
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`?????? COMBO Backend - Simple Version running on port ${PORT}`);
  console.log(`???? Jamendo Client ID: ${JAMENDO_CLIENT_ID ? '??? Configured' : '??? Missing'}`);
  console.log(`???? API Base URL: /api`);
  console.log(`???? Health Check: /health`);
  console.log(`???? Music Search: /api/music/search?q=rock`);
  console.log(`???? Trending: /api/music/trending`);
  console.log(`???? Ready to stream music from Jamendo!`);
});
