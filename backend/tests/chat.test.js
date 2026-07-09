const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('chat route rejects missing auth', async () => {
  const response = await request(app).post('/api/chat');
  assert.equal(response.status, 401);
});
