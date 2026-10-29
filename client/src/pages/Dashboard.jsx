import { Activity, AlertTriangle, BedDouble, CalendarCheck, CheckCircle2, Clock3, Info, Stethoscope, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import './Dashboard.css';

const alertIcons = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const bedStatusColors = {
  Available: '#279879',
  Occupied: '#4778a8',
  Cleaning: '#e1a943',
  Maintenance: '#9b7ac4',
  Other: '#96a3aa',
};

function formatDay(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
}

function formatAppointmentDate(date) {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    api.get('/dashboard/summary', { params: { timezone } })
      .then((response) => setStats(response.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load operational insights'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading operational insights…" />;
  if (error) return <div className="alert error">{error}</div>;

  const maxAppointments = Math.max(1, ...stats.appointmentActivity.map((day) => day.total));
  const bedStatusTotal = stats.bedsByStatus.reduce((total, item) => total + item.count, 0);
  let chartOffset = 0;
  const bedChartStops = stats.bedsByStatus
    .filter((item) => item.count > 0)
    .map((item) => {
      const start = chartOffset;
      chartOffset += (item.count / bedStatusTotal) * 100;
      return `${bedStatusColors[item.status] || bedStatusColors.Other} ${start}% ${chartOffset}%`;
    });

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Live overview"
        title="Today at a glance"
        description="Operational signals from your hospital records."
        action={<StatusBadge>API online</StatusBadge>}
      />

      <div className="stats-grid">
        <StatCard label="Patients" value={stats.patients} hint="registered records" icon={Users} />
        <StatCard label="Doctors" value={stats.doctors} hint={`${stats.availableDoctors} available`} icon={Stethoscope} />
        <StatCard label="Beds" value={`${stats.availableBeds}/${stats.totalBeds}`} hint="available / total" icon={BedDouble} />
        <StatCard label="Appointments" value={stats.todayScheduledAppointments} hint="scheduled today" icon={CalendarCheck} />
      </div>

      <div className="dashboard-panels">
        <section className="panel dashboard-panel">
          <div className="panel-title">
            <div>
              <span className="kicker">Capacity</span>
              <h3>Bed utilization</h3>
            </div>
            <Activity aria-hidden="true" />
          </div>
          <div
            className="meter"
            role="progressbar"
            aria-label="Bed utilization"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={stats.bedUtilization}
          >
            <div style={{ width: `${stats.bedUtilization}%` }} />
          </div>
          <div className="metric-row">
            <strong>{stats.bedUtilization}%</strong>
            <span>{stats.occupiedBeds} occupied of {stats.totalBeds} beds</span>
          </div>
          <div className="bed-status-section">
            <h4>Bed status distribution</h4>
            {bedStatusTotal ? (
              <div className="bed-status-content">
                <div
                  className="bed-status-donut"
                  role="img"
                  aria-label={stats.bedsByStatus
                    .filter((item) => item.count > 0)
                    .map((item) => `${item.status}: ${item.count}`)
                    .join(', ')}
                  style={{ backgroundImage: `conic-gradient(${bedChartStops.join(', ')})` }}
                >
                  <div><strong>{bedStatusTotal}</strong><span>Total beds</span></div>
                </div>
                <ul className="bed-status-legend">
                  {stats.bedsByStatus.map((item) => (
                    <li key={item.status}>
                      <span className="bed-status-label">
                        <i style={{ backgroundColor: bedStatusColors[item.status] || bedStatusColors.Other }} />
                        {item.status}
                      </span>
                      <strong>{item.count}</strong>
                      <small>{Math.round((item.count / bedStatusTotal) * 100)}%</small>
                    </li>
                  ))}
                </ul>
              </div>
            ) : <p className="dashboard-empty">No bed records available to analyze yet.</p>}
          </div>
          <div className="department-capacity">
            <h4>By department</h4>
            {stats.bedsByDepartment.length ? stats.bedsByDepartment.map((department) => {
              const utilization = Math.round((department.occupied / department.total) * 100);
              return (
                <div className="department-row" key={department._id}>
                  <div className="department-label">
                    <span>{department._id}</span>
                    <small>{department.available} available · {department.occupied}/{department.total} occupied</small>
                  </div>
                  <div className="department-meter" aria-label={`${department._id}: ${utilization}% occupied`}>
                    <div style={{ width: `${utilization}%` }} />
                  </div>
                </div>
              );
            }) : <p className="dashboard-empty">No bed records yet. Add beds to see capacity insights.</p>}
          </div>
        </section>

        <section className="panel dashboard-panel">
          <div className="panel-title">
            <div>
              <span className="kicker">Appointments</span>
              <h3>Last 7 days</h3>
            </div>
            <CalendarCheck aria-hidden="true" />
          </div>
          <div className="activity-chart" aria-label="Appointment volume over the last 7 days">
            {stats.appointmentActivity.map((day) => (
              <div className="activity-day" key={day.date} title={`${day.total} appointments, ${day.completed} completed, ${day.noShows} no-shows`}>
                <div className="activity-bar-wrap">
                  <div className="activity-bar" style={{ height: `${Math.max(4, (day.total / maxAppointments) * 100)}%` }} />
                </div>
                <span>{formatDay(day.date)}</span>
                <strong>{day.total}</strong>
              </div>
            ))}
          </div>
          <div className="activity-summary">
            <span><CheckCircle2 size={14} /> {stats.appointmentActivity.reduce((sum, day) => sum + day.completed, 0)} completed</span>
            <span><AlertTriangle size={14} /> {stats.appointmentActivity.reduce((sum, day) => sum + day.noShows, 0)} no-shows</span>
          </div>
          <div className="upcoming-section">
            <h4><Clock3 size={15} /> Upcoming appointments</h4>
            {stats.upcomingAppointments.length ? (
              <ul className="upcoming-list">
                {stats.upcomingAppointments.map((appointment) => (
                  <li key={appointment._id}>
                    <span>{formatAppointmentDate(appointment.date)}</span>
                    <small>Dr. {appointment.doctorName}</small>
                  </li>
                ))}
              </ul>
            ) : <p className="dashboard-empty">No upcoming scheduled appointments.</p>}
          </div>
        </section>

        <section className="panel dashboard-panel insights-panel">
          <div className="panel-title">
            <div>
              <span className="kicker">Operational intelligence</span>
              <h3>Signals & recommendations</h3>
            </div>
            <Activity aria-hidden="true" />
          </div>
          <ul className="insight-list">
            {stats.alerts.map((alert) => {
              const Icon = alertIcons[alert.level] || Info;
              return (
                <li className={`insight-item ${alert.level}`} key={alert.title}>
                  <Icon size={18} aria-hidden="true" />
                  <div><strong>{alert.title}</strong><p>{alert.detail}</p></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
