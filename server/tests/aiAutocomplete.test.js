import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { jest } from '@jest/globals';

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');

const jwtSecret = 'test-jwt-secret-at-least-32-characters-long';
const originalApiKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;

beforeAll(async () => {
  process.env.JWT_SECRET = jwtSecret;
  const testUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/ihros_test';
  await mongoose.connect(testUri);
});

afterEach(async () => {
  await User.deleteMany({});
  jest.restoreAllMocks();
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
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
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: content }] } }],
    }),
  };
}

test('AI autocomplete requires an authorized user', async () => {
  const response = await request(app).post('/api/ai/autocomplete').send({
    departmentName: 'Cardiology',
  });

  expect(response.status).toBe(401);
});

test('AI autocomplete sends only department metadata and returns the suggestion', async () => {
  process.env.GEMINI_API_KEY = 'test-api-key';
  process.env.GEMINI_MODEL = 'test-model';
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
    'https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent',
    expect.objectContaining({
      headers: expect.objectContaining({
        'X-goog-api-key': 'test-api-key',
        'Content-Type': 'application/json',
      }),
      body: expect.stringContaining('"generationConfig"'),
    }),
  );
  const providerBody = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(providerBody.systemInstruction.parts[0].text).toContain('hospital department');
  expect(providerBody.contents[0].parts[0].text).toContain('Cardiology');
  expect(providerBody.contents[0].parts[0].text).toContain('Cardio');
  expect(providerBody.contents[0].parts[0].text).not.toContain('patientNotes');
  expect(providerBody.contents[0].parts[0].text).not.toContain('must not be sent');
});

test('AI autocomplete validates department metadata before calling the provider', async () => {
  process.env.GEMINI_API_KEY = 'test-api-key';
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
  delete process.env.GEMINI_API_KEY;
  const token = await tokenFor();
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(503);
  expect(response.body.message).toMatch(/GEMINI_API_KEY/);
  expect(fetchMock).not.toHaveBeenCalled();
});

test('AI autocomplete reports provider failures without exposing provider details', async () => {
  process.env.GEMINI_API_KEY = 'test-api-key';
  const token = await tokenFor();
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 401 });

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(502);
  expect(response.body.message).toMatch(/Gemini suggestion provider rejected/);
  expect(response.body.message).not.toContain('test-api-key');
});

test('AI autocomplete explains invalid keys, exhausted quota, and unavailable models', async () => {
  process.env.GEMINI_API_KEY = 'test-api-key';
  const token = await tokenFor();
  const cases = [
    {
      status: 400,
      body: { error: { status: 'API_KEY_INVALID', message: 'API key not valid' } },
      message: /Gemini rejected the server API key/i,
    },
    {
      status: 429,
      body: { error: { status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded' } },
      message: /Gemini quota or rate limit reached/i,
    },
    {
      status: 404,
      body: { error: { status: 'NOT_FOUND', message: 'Model not found' } },
      message: /configured Gemini model is unavailable/i,
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
  process.env.GEMINI_API_KEY = 'test-api-key';
  const token = await tokenFor('nurse');
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  const response = await request(app)
    .post('/api/ai/autocomplete')
    .set('Authorization', `Bearer ${token}`)
    .send({ departmentName: 'Cardiology' });

  expect(response.status).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});
