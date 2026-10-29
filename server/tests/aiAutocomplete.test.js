import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { jest } from '@jest/globals';

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');

const jwtSecret = 'test-jwt-secret-at-least-32-characters-long';
const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;

beforeAll(async () => {
  process.env.JWT_SECRET = jwtSecret;
  const testUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/ihros_test';
  await mongoose.connect(testUri);
});

afterEach(async () => {
  await User.deleteMany({});
  jest.restoreAllMocks();
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
  if (originalModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModel;
});

afterAll(async () => {
  await mongoose.disconnect();
});

async function tokenFor(role = 'hospital_admin') {
  const user = await User.create({
    name: 'AI Test User',
    email: `ai-${new mongoose.Types.ObjectId()}@example.com`,
    password: 'valid-test-password',
    role,
  });
  return jwt.sign({ sub: user._id.toString(), role }, jwtSecret, { expiresIn: '1h' });
}

function providerResponse(content) {
  return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
}

test('AI autocomplete requires an authorized user', async () => {
  const response = await request(app).post('/api/ai/autocomplete').send({
    departmentName: 'Cardiology',
  });

  expect(response.status).toBe(401);
});

test('AI autocomplete sends only department metadata and returns the suggestion', async () => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  process.env.OPENAI_MODEL = 'test-model';
  const token = await tokenFor();
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(providerResponse('Cardiology and cardiovascular services'));

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({
      departmentName: 'Cardiology',
      prefix: 'Cardio',
      patientNotes: 'This data must not be sent to the provider',
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ success: true, suggestion: 'Cardiology and cardiovascular services' });
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.openai.com/v1/chat/completions',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer test-api-key' }),
      body: expect.stringContaining('"model":"test-model"'),
    }),
  );
  const providerBody = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(providerBody.messages[1].content).toContain('Cardiology');
  expect(providerBody.messages[1].content).toContain('Cardio');
  expect(providerBody.messages[1].content).not.toContain('patientNotes');
  expect(providerBody.messages[1].content).not.toContain('must not be sent');
});

test('AI autocomplete validates department metadata before calling the provider', async () => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  const token = await tokenFor();
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: '', prefix: 'x'.repeat(201) });

  expect(response.status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('AI autocomplete reports missing server configuration', async () => {
  delete process.env.OPENAI_API_KEY;
  const token = await tokenFor();
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(503);
  expect(response.body.message).toMatch(/OPENAI_API_KEY/);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('AI autocomplete reports provider failures without exposing provider details', async () => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  const token = await tokenFor();
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 401 });

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(502);
  expect(response.body.message).toMatch(/provider rejected/);
  expect(response.body.message).not.toContain('test-api-key');
});

test('AI autocomplete explains invalid keys, exhausted quota, and unavailable models', async () => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  const token = await tokenFor();
  const cases = [
    {
      status: 401,
      body: {},
      message: /rejected the server API key/i,
    },
    {
      status: 429,
      body: { error: { code: 'insufficient_quota' } },
      message: /no available quota/i,
    },
    {
      status: 404,
      body: {},
      message: /configured AI model is unavailable/i,
    },
  ];

  for (const testCase of cases) {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: testCase.status,
      json: async () => testCase.body,
    });

    const response = await request(app)
      .post('/api/ai/autocomplete')
      .set('Authorization', `Bearer ${token}`)
      .send({ departmentName: 'Cardiology' });

    expect(response.status).toBe(502);
    expect(response.body.message).toMatch(testCase.message);
    expect(response.body.message).not.toContain('test-api-key');
    jest.restoreAllMocks();
  }
});

test('AI autocomplete denies users without department editing permission', async () => {
  process.env.OPENAI_API_KEY = 'test-api-key';
  const token = await tokenFor('nurse');
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});
