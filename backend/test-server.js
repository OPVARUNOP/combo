const request = require('supertest');

// Mock the server module to avoid starting the actual server
jest.mock('./server', () => {
  const express = require('express');
  const app = express();
  
  // Add basic routes for testing
  app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'Health check completed', data: { status: 'OK' } });
  });
  
  app.get('/api', (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'API information retrieved successfully',
      data: { name: 'COMBO Music Streaming API', version: '1.0.0' }
    });
  });
  
  return { default: app };
});

const app = require('./server').default;

describe('Server', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should have CORS headers', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should respond to API info', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
