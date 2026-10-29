import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const jwtSecret = 'dashboard-test-secret-at-least-32-characters';
process.env.JWT_SECRET = jwtSecret;

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Doctor } = await import('../src/models/Doctor.js');
const { default: Patient } = await import('../src/models/Patient.js');
const { default: Bed } = await import('../src/models/Bed.js');
const { default: Appointment } = await import('../src/models/Appointment.js');

afterEach(() => {
  jest.restoreAllMocks();
});

test('dashboard summary aggregates operational data and protects appointment privacy', async () => {
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', role: 'nurse' }, jwtSecret);
  const timeZone = 'Asia/Kolkata';
  const localDate = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
    .filter((part) => part.type !== 'literal')
    .map((part) => [part.type, part.value]));
  const todayKey = `${localDate.year}-${localDate.month}-${localDate.day}`;

  jest.spyOn(User, 'findById').mockReturnValue({
    select: jest.fn().mockResolvedValue({ active: true, role: 'nurse' }),
  });
  jest.spyOn(Patient, 'countDocuments').mockResolvedValue(24);
  jest.spyOn(Doctor, 'countDocuments').mockImplementation((filter = {}) => (
    Promise.resolve(filter.availability ? 3 : 5)
  ));
  jest.spyOn(Bed, 'aggregate').mockResolvedValue([
    { _id: 'Emergency', total: 10, available: 1, occupied: 8, cleaning: 1, maintenance: 0, other: 0 },
  ]);
  jest.spyOn(Appointment, 'aggregate').mockResolvedValue([
    { _id: todayKey, total: 3, scheduled: 2, completed: 1, noShows: 1 },
  ]);
  const query = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([
      { _id: '507f191e810c19729de860ea', doctorName: 'Dr. Example', date: new Date(Date.now() + 60_000) },
    ]),
  };
  jest.spyOn(Appointment, 'find').mockReturnValue(query);

  const response = await request(app)
    .get('/api/dashboard/summary')
    .query({ timezone: timeZone })
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    success: true,
    patients: 24,
    doctors: 5,
    availableDoctors: 3,
    totalBeds: 10,
    availableBeds: 1,
    occupiedBeds: 8,
    bedUtilization: 80,
    todayAppointments: 3,
    todayScheduledAppointments: 2,
  });
  expect(response.body.bedsByStatus).toEqual([
    { status: 'Available', count: 1 },
    { status: 'Occupied', count: 8 },
    { status: 'Cleaning', count: 1 },
    { status: 'Maintenance', count: 0 },
  ]);
  expect(response.body.bedsByDepartment[0]).toMatchObject({
    available: 1,
    occupied: 8,
    cleaning: 1,
    maintenance: 0,
  });
  expect(response.body.appointmentActivity).toHaveLength(7);
  expect(response.body.upcomingAppointments[0]).not.toHaveProperty('patientName');
  expect(response.body.alerts).toEqual(expect.arrayContaining([
    expect.objectContaining({ level: 'success', title: 'Bed capacity is within range' }),
    expect.objectContaining({ level: 'warning', title: 'Appointment no-shows this week' }),
  ]));
});

test('dashboard summary rejects invalid timezones', async () => {
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011', role: 'nurse' }, jwtSecret);
  jest.spyOn(User, 'findById').mockReturnValue({
    select: jest.fn().mockResolvedValue({ active: true, role: 'nurse' }),
  });

  const response = await request(app)
    .get('/api/dashboard/summary')
    .query({ timezone: 'Not/A_Timezone' })
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Invalid timezone');
});

test('dashboard summary rejects unauthenticated requests', async () => {
  const response = await request(app).get('/api/dashboard/summary');

  expect(response.status).toBe(401);
});
