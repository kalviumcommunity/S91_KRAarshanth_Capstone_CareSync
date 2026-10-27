import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');

const jwtSecret = 'test-jwt-secret-at-least-32-characters-long';

beforeAll(async () => {
  process.env.JWT_SECRET = jwtSecret;
  process.env.JWT_EXPIRES_IN = '1h';
  const testUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/ihros_test';
  await mongoose.connect(testUri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

function tokenFor(user, options = {}) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, jwtSecret, options);
}

test('registration issues an expiring HS256 token accepted by a protected endpoint', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'JWT Test User',
    email: 'jwt.test@example.com',
    password: 'valid-test-password',
  });

  expect(registration.status).toBe(201);
  expect(jwt.decode(registration.body.token, { complete: true }).header.alg).toBe('HS256');
  const claims = jwt.verify(registration.body.token, jwtSecret, { algorithms: ['HS256'] });
  expect(claims).toMatchObject({ sub: registration.body.user.id, role: 'nurse' });
  expect(claims.exp - claims.iat).toBe(3600);

  const currentUser = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${registration.body.token}`);
  expect(currentUser.status).toBe(200);
  expect(currentUser.body.user).toMatchObject({
    id: registration.body.user.id,
    role: 'nurse',
  });
  expect(currentUser.body.user.password).toBeUndefined();
});

test('protected endpoint rejects missing, invalid, and expired JWTs with 401', async () => {
  const user = await User.create({
    name: 'JWT Test User',
    email: 'jwt.test@example.com',
    password: 'valid-test-password',
  });
  const expiredToken = tokenFor(user, { expiresIn: -1 });

  const missing = await request(app).get('/api/auth/me');
  const invalid = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt');
  const expired = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);

  expect(missing.status).toBe(401);
  expect(invalid.status).toBe(401);
  expect(expired.status).toBe(401);
});

test('authenticated users without the required role receive 403', async () => {
  const nurse = await User.create({
    name: 'JWT Nurse',
    email: 'jwt.nurse@example.com',
    password: 'valid-test-password',
  });
  const target = await User.create({
    name: 'Target User',
    email: 'jwt.target@example.com',
    password: 'valid-test-password',
  });

  const response = await request(app)
    .patch(`/api/auth/users/${target._id}/role`)
    .set('Authorization', `Bearer ${tokenFor(nurse)}`)
    .send({ role: 'doctor' });

  expect(response.status).toBe(403);
  expect((await User.findById(target._id)).role).toBe('nurse');
});
