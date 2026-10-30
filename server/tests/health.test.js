import request from 'supertest';

process.env.CLIENT_URL = 'https://frontend.example.test,https://ihros.netlify.app';

const { default: app } = await import('../src/app.js');

test('health endpoint returns the API health payload', async () => {
  const response = await request(app).get('/api/health');

  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toMatch(/application\/json/);
  expect(response.body).toEqual({
    success: true,
    service: 'IHROS API',
    status: 'healthy',
  });
});

test('health endpoint allows the configured frontend origin', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'https://frontend.example.test');

  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBe('https://frontend.example.test');
});

test('health endpoint allows an additional configured frontend origin', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'https://ihros.netlify.app');

  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBe('https://ihros.netlify.app');
});

test('health endpoint supports HEAD requests for monitoring clients', async () => {
  const response = await request(app).head('/api/health');

  expect(response.status).toBe(200);
  expect(response.text).toBeUndefined();
});
