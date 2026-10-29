import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Bed from '../models/Bed.js';
import Appointment from '../models/Appointment.js';
import { ApiError } from '../utils/apiError.js';

const router = Router();

function dateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts
    .filter((part) => part.type !== 'literal')
    .map((part) => [part.type, Number(part.value)]));
}

function shiftDate(parts, days) {
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

function dateKey(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function zonedMidnight(parts, timeZone) {
  const targetUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let timestamp = targetUtc;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const formatted = Object.fromEntries(formatter.formatToParts(new Date(timestamp))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]));
    const representedUtc = Date.UTC(
      formatted.year,
      formatted.month - 1,
      formatted.day,
      formatted.hour,
      formatted.minute,
      formatted.second,
    );
    timestamp += targetUtc - representedUtc;
  }

  return new Date(timestamp);
}

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const now = new Date();
    const timeZone = req.query.timezone ?? 'UTC';
    if (typeof timeZone !== 'string') throw new ApiError(400, 'Invalid timezone');
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
    } catch {
      throw new ApiError(400, 'Invalid timezone');
    }

    const todayParts = dateParts(now, timeZone);
    const weekStartParts = shiftDate(todayParts, -6);
    const tomorrowParts = shiftDate(todayParts, 1);
    const todayStart = zonedMidnight(todayParts, timeZone);
    const weekStart = zonedMidnight(weekStartParts, timeZone);
    const tomorrowStart = zonedMidnight(tomorrowParts, timeZone);

    const [
      patients,
      doctors,
      availableDoctors,
      bedGroups,
      weeklyAppointments,
      upcomingAppointments,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ availability: 'Available' }),
      Bed.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$department', 'Unassigned'] },
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
            occupied: { $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } },
            cleaning: { $sum: { $cond: [{ $eq: ['$status', 'Cleaning'] }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] } },
            other: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Available', 'Occupied', 'Cleaning', 'Maintenance']] },
                  0,
                  1,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        { $match: { date: { $gte: weekStart, $lt: tomorrowStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: timeZone } },
            total: { $sum: 1 },
            scheduled: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
            noShows: { $sum: { $cond: [{ $eq: ['$status', 'No-show'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Appointment.find({ date: { $gte: now }, status: 'Scheduled' })
        .sort({ date: 1 })
        .limit(5)
        .select('doctorName date')
        .lean(),
    ]);

    const totalBeds = bedGroups.reduce((total, group) => total + group.total, 0);
    const availableBeds = bedGroups.reduce((total, group) => total + group.available, 0);
    const occupiedBeds = bedGroups.reduce((total, group) => total + group.occupied, 0);
    const bedsByStatus = [
      { status: 'Available', count: bedGroups.reduce((total, group) => total + group.available, 0) },
      { status: 'Occupied', count: bedGroups.reduce((total, group) => total + group.occupied, 0) },
      { status: 'Cleaning', count: bedGroups.reduce((total, group) => total + group.cleaning, 0) },
      { status: 'Maintenance', count: bedGroups.reduce((total, group) => total + group.maintenance, 0) },
    ];
    const otherBeds = bedGroups.reduce((total, group) => total + group.other, 0);
    if (otherBeds) bedsByStatus.push({ status: 'Other', count: otherBeds });
    const todayKey = dateKey(todayParts);
    const todayActivity = weeklyAppointments.find((day) => day._id === todayKey);
    const todayAppointments = todayActivity?.total ?? 0;
    const todayScheduledAppointments = todayActivity?.scheduled ?? 0;
    const appointmentActivity = Array.from({ length: 7 }, (_, index) => {
      const key = dateKey(shiftDate(weekStartParts, index));
      const activity = weeklyAppointments.find((day) => day._id === key);
      return {
        date: key,
        total: activity?.total ?? 0,
        scheduled: activity?.scheduled ?? 0,
        completed: activity?.completed ?? 0,
        noShows: activity?.noShows ?? 0,
      };
    });
    const bedUtilization = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const alerts = [];

    if (!totalBeds) {
      alerts.push({ level: 'info', title: 'No bed capacity recorded', detail: 'Add bed records to monitor availability and occupancy.' });
    } else if (availableBeds === 0) {
      alerts.push({ level: 'critical', title: 'No beds available', detail: 'All recorded beds are occupied, in cleaning, or under maintenance.' });
    } else if (bedUtilization >= 85) {
      alerts.push({ level: 'warning', title: 'High bed utilization', detail: `${bedUtilization}% of beds are occupied. Review capacity before accepting additional admissions.` });
    } else {
      alerts.push({ level: 'success', title: 'Bed capacity is within range', detail: `${availableBeds} of ${totalBeds} beds are available.` });
    }

    if (!availableDoctors && doctors) {
      alerts.push({ level: 'warning', title: 'No doctors marked available', detail: 'Review doctor availability records to keep staffing information current.' });
    } else if (!doctors) {
      alerts.push({ level: 'info', title: 'No doctors recorded', detail: 'Add doctor records to include staffing in operational planning.' });
    }

    const weekAppointments = appointmentActivity.reduce((sum, day) => sum + day.total, 0);
    if (weekAppointments && appointmentActivity.reduce((sum, day) => sum + day.noShows, 0) > 0) {
      const noShows = appointmentActivity.reduce((sum, day) => sum + day.noShows, 0);
      alerts.push({ level: 'warning', title: 'Appointment no-shows this week', detail: `${noShows} appointment${noShows === 1 ? '' : 's'} marked as no-show. Review follow-up needs.` });
    }

    res.json({
      success: true,
      patients,
      doctors,
      availableDoctors,
      totalBeds,
      availableBeds,
      occupiedBeds,
      todayAppointments,
      todayScheduledAppointments,
      bedUtilization,
      bedsByDepartment: bedGroups,
      bedsByStatus,
      appointmentActivity,
      upcomingAppointments,
      alerts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
