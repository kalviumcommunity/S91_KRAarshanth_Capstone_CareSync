import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mkdtemp, readdir, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.UPLOAD_DIR = await mkdtemp(path.join(tmpdir(), 'ihros-file-upload-'));

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Patient } = await import('../src/models/Patient.js');
const { default: PatientFile } = await import('../src/models/PatientFile.js');

beforeAll(async () => {
  const testUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/ihros_test';
  await mongoose.connect(testUri);
});

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Patient.deleteMany({}), PatientFile.deleteMany({})]);
  const files = await readdir(process.env.UPLOAD_DIR);
  await Promise.all(files.map((file) => unlink(path.join(process.env.UPLOAD_DIR, file))));
});

afterAll(async () => {
  await mongoose.disconnect();
  await rm(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

async function createUploadContext(role = 'hospital_admin') {
  const user = await User.create({
    name: 'Hospital Admin',
    email: `${role}-${new mongoose.Types.ObjectId()}@example.com`,
    password: 'valid-test-password',
    role,
  });
  const patient = await Patient.create({
    name: 'Test Patient',
    age: 30,
    gender: 'Other',
    condition: 'Routine checkup',
  });
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { patientId: patient._id.toString(), token };
}

function parseBinary(response, callback) {
  const chunks = [];
  response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
}

test('authenticated admins can upload, list, and download patient files', async () => {
  const { patientId, token } = await createUploadContext();
  const pdf = Buffer.from('%PDF-1.7\nPatient report content');
  const uploaded = await request(app)
    .post(`/api/patients/${patientId}/files`)
    .set('Authorization', `Bearer ${token}`)
    .attach('file', pdf, { filename: 'patient-report.pdf', contentType: 'application/pdf' });

  expect(uploaded.status).toBe(201);
  expect(uploaded.body.data).toMatchObject({
    originalName: 'patient-report.pdf',
    mimeType: 'application/pdf',
    size: pdf.length,
  });

  const listed = await request(app)
    .get(`/api/patients/${patientId}/files`)
    .set('Authorization', `Bearer ${token}`);
  expect(listed.status).toBe(200);
  expect(listed.body.data).toHaveLength(1);
  expect(listed.body.data[0].uploadedBy.name).toBe('Hospital Admin');

  const unrelatedPatient = await Patient.create({
    name: 'Unrelated Patient',
    age: 45,
    gender: 'Other',
    condition: 'Follow-up',
  });
  const mismatchedPatientDownload = await request(app)
    .get(`/api/patients/${unrelatedPatient._id}/files/${uploaded.body.data._id}/download`)
    .set('Authorization', `Bearer ${token}`);
  expect(mismatchedPatientDownload.status).toBe(404);

  const downloaded = await request(app)
    .get(`/api/patients/${patientId}/files/${uploaded.body.data._id}/download`)
    .set('Authorization', `Bearer ${token}`)
    .buffer(true)
    .parse(parseBinary);
  expect(downloaded.status).toBe(200);
  expect(downloaded.headers['content-type']).toMatch(/application\/pdf/);
  expect(downloaded.body.equals(pdf)).toBe(true);
});

test('upload rejects unsupported file types and spoofed content', async () => {
  const { patientId, token } = await createUploadContext();
  const unsupported = await request(app)
    .post(`/api/patients/${patientId}/files`)
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from('plain text'), { filename: 'notes.txt', contentType: 'text/plain' });
  expect(unsupported.status).toBe(400);

  const spoofed = await request(app)
    .post(`/api/patients/${patientId}/files`)
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from('not a real PDF'), { filename: 'report.pdf', contentType: 'application/pdf' });
  expect(spoofed.status).toBe(400);
  expect(await PatientFile.countDocuments()).toBe(0);
  expect(await readdir(process.env.UPLOAD_DIR)).toHaveLength(0);
});

test('upload enforces the maximum file size and manager role', async () => {
  const { patientId, token } = await createUploadContext();
  const oversized = await request(app)
    .post(`/api/patients/${patientId}/files`)
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'large.pdf', contentType: 'application/pdf' });
  expect(oversized.status).toBe(413);

  const { patientId: secondPatientId, token: nurseToken } = await createUploadContext('nurse');
  const denied = await request(app)
    .post(`/api/patients/${secondPatientId}/files`)
    .set('Authorization', `Bearer ${nurseToken}`)
    .attach('file', Buffer.from('%PDF-1.7\nreport'), { filename: 'report.pdf', contentType: 'application/pdf' });
  expect(denied.status).toBe(403);
  expect(await readdir(process.env.UPLOAD_DIR)).toHaveLength(0);
});

test('file routes require authentication and return not found for unknown patients', async () => {
  const { patientId, token } = await createUploadContext();
  const unauthorized = await request(app).get(`/api/patients/${patientId}/files`);
  expect(unauthorized.status).toBe(401);

  const missingPatient = await request(app).get(`/api/patients/${new mongoose.Types.ObjectId()}/files`).set('Authorization', `Bearer ${token}`);
  expect(missingPatient.status).toBe(404);
});
