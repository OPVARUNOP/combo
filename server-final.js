#!/usr/bin/env node

const express = require('express');
const app = express();

// CRITICAL: Use the PORT environment variable that Cloud Run provides
const PORT = process.env.PORT || 8080;

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Backend - Final Version',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple music search endpoint (mock data for testing)
app.get('/api/music/search', (req, res) => {
  const query = req.query.q || 'rock';
  
  // Mock response for testing
  const mockTracks = [
    {
      id: '1',
      title: `Sample Track for "${query}"`,
      artist: 'Sample Artist',
      album: 'Sample Album',
      duration: 180,
      audioUrl: 'https://example.com/audio.mp3',
      imageUrl: 'https://example.com/image.jpg'
    }
  ];

  res.json({
    data: {
      tracks: mockTracks,
      total: 1,
      query: query,
      source: 'mock'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`???? Server running on port ${PORT}`);
  console.log(`???? Health check: /health`);
  console.log(`???? Music search: /api/music/search?q=rock`);
});

module.exports = app;
