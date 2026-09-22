import { Activity, BedDouble, CalendarCheck, Stethoscope, Users, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((response) => setStats(response.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading operational metrics…" />;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live overview"
        title="Today at a glance"
        description="Operational indicators aggregated from MongoDB."
        action={<StatusBadge>API online</StatusBadge>}
      />

      <div className="stats-grid">
        <StatCard label="Patients" value={stats.patients} hint="registered records" icon={Users} />
        <StatCard label="Doctors" value={stats.doctors} hint="active staff" icon={Stethoscope} />
        <StatCard label="Beds" value={`${stats.availableBeds}/${stats.totalBeds}`} hint="available / total" icon={BedDouble} />
        <StatCard label="Appointments" value={stats.todayAppointments} hint="scheduled today" icon={CalendarCheck} />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-title">
            <div>
              <span className="kicker">Capacity</span>
              <h3>Bed utilization</h3>
            </div>
            <Activity />
          </div>
          <div className="meter"><div style={{ width: `${stats.bedUtilization}%` }} /></div>
          <div className="metric-row"><strong>{stats.bedUtilization}%</strong><span>{stats.occupiedBeds} occupied beds</span></div>
        </div>

        <div className="panel warning-panel">
          <AlertTriangle />
          <div>
            <span className="kicker">Next milestone</span>
            <h3>Build operational intelligence</h3>
            <p>CRUD, relationships, authentication and JWT authorization are now wired as the capstone foundation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
