const request = require('supertest');
const express = require('express');

// Simple health check test
const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('Health Check', () => {
  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});