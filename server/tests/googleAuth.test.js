import mongoose from 'mongoose';
import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/utils/googleAuth.js', () => ({
  verifyGoogleCredential: jest.fn(),
  InvalidGoogleCredentialError: class InvalidGoogleCredentialError extends Error {},
}));

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { verifyGoogleCredential, InvalidGoogleCredentialError } = await import('../src/utils/googleAuth.js');

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  const testUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/ihros_test';
  await mongoose.connect(testUri);
});

afterEach(async () => {
  await User.deleteMany({});
  verifyGoogleCredential.mockReset();
});

afterAll(async () => {
  await mongoose.disconnect();
});

const validProfile = {
  sub: 'google-user-123',
  email: 'google.user@example.com',
  email_verified: true,
  name: 'Google User',
};

function googleSignIn(credential = 'valid-google-credential') {
  return request(app).post('/api/auth/google').send({ credential });
}

test('Google sign-in creates a verified nurse account and reuses it on later sign-ins', async () => {
  verifyGoogleCredential.mockResolvedValue(validProfile);

  const firstSignIn = await googleSignIn();
  expect(firstSignIn.status).toBe(200);
  expect(firstSignIn.body.user).toMatchObject({
    name: 'Google User',
    email: 'google.user@example.com',
    role: 'nurse',
  });
  expect(firstSignIn.body.token).toEqual(expect.any(String));
  const createdUser = await User.findOne({ googleId: validProfile.sub }).select('+password');
  expect(createdUser).not.toBeNull();
  expect(createdUser.password).toBeUndefined();

  const passwordSignIn = await request(app).post('/api/auth/login').send({
    email: validProfile.email,
    password: 'some-password',
  });
  expect(passwordSignIn.status).toBe(401);

  const secondSignIn = await googleSignIn();
  expect(secondSignIn.status).toBe(200);
  expect(secondSignIn.body.user.id).toBe(firstSignIn.body.user.id);
  expect(await User.countDocuments()).toBe(1);
});

test('Google sign-in rejects unverified email claims and invalid credentials', async () => {
  verifyGoogleCredential.mockResolvedValue({ ...validProfile, email_verified: false });
  const unverified = await googleSignIn();
  expect(unverified.status).toBe(401);

  verifyGoogleCredential.mockRejectedValue(new InvalidGoogleCredentialError());
  const invalid = await googleSignIn();
  expect(invalid.status).toBe(401);
  expect(await User.countDocuments()).toBe(0);
});

test('Google sign-in does not silently link an existing password account', async () => {
  await User.create({
    name: 'Existing User',
    email: validProfile.email,
    password: 'valid-test-password',
  });
  verifyGoogleCredential.mockResolvedValue(validProfile);

  const response = await googleSignIn();
  expect(response.status).toBe(409);
  expect(response.body.message).toMatch(/sign in with your password/i);
  expect(await User.countDocuments()).toBe(1);
});
